"""Budget optimizer using SciPy SLSQP.

Redistributes total budget across campaigns to maximize total volume,
subject to per-campaign change constraints. Generates 3 solutions:
- Conservative: ±15% max change
- Moderate: ±25% max change
- Aggressive: ±35% max change
"""

import logging

import numpy as np
from scipy.optimize import minimize

from app.config import MIN_SPEND_RATIO, STRATEGIES
from app.models.power_law import predict
from app.pipeline.sample import CampaignModel
from app.schemas.request import OptimizeConfig
from app.schemas.response import CampaignSolution, Solution

logger = logging.getLogger(__name__)


def optimize_budget(
    models: list[CampaignModel],
    config: OptimizeConfig,
) -> list[Solution]:
    """Run budget optimization for all 3 strategies.

    Args:
        models: Fitted campaign models with current budgets
        config: Optimization configuration

    Returns:
        List of 3 Solution objects (conservative, moderate, aggressive)
    """
    if not models:
        return []

    n = len(models)
    current_budgets = np.array([m.current_budget for m in models])
    total_budget = config.total_budget

    # Compute current total volume for delta calculation
    current_volumes = np.array([
        float(predict(m.current_budget, m.latest_features, m.fit.w0, m.fit.w1, m.fit.wa))
        for m in models
    ])
    current_total_volume = float(np.sum(current_volumes))

    solutions: list[Solution] = []

    for strategy_name, strategy_cfg in STRATEGIES.items():
        max_change = strategy_cfg["max_change"]
        risk_level = strategy_cfg["risk_level"]

        # Bounds per campaign
        bounds = []
        for i, current in enumerate(current_budgets):
            lower = max(current * (1 - max_change), current * config.budget_min_pct)
            upper = min(current * (1 + max_change), current * config.budget_max_pct)
            # Ensure lower <= upper
            lower = min(lower, upper)
            bounds.append((float(lower), float(upper)))

        # Objective: maximize total volume (minimize negative)
        def objective(budgets: np.ndarray) -> float:
            total_vol = 0.0
            for i in range(n):
                vol = float(predict(
                    budgets[i],
                    models[i].latest_features,
                    models[i].fit.w0,
                    models[i].fit.w1,
                    models[i].fit.wa,
                ))
                total_vol += vol
            return -total_vol

        # Constraints: total spend must be between 95% and 100% of total_budget
        constraints = [
            {"type": "ineq", "fun": lambda b: total_budget - np.sum(b)},
            {"type": "ineq", "fun": lambda b: np.sum(b) - total_budget * MIN_SPEND_RATIO},
        ]

        # Initial guess: scale current budgets to match total_budget
        x0 = current_budgets * (total_budget / np.sum(current_budgets)) if np.sum(current_budgets) > 0 else np.full(n, total_budget / n)

        # Clip x0 to bounds
        for i, (lo, hi) in enumerate(bounds):
            x0[i] = np.clip(x0[i], lo, hi)

        result = minimize(
            objective,
            x0=x0,
            method="SLSQP",
            bounds=bounds,
            constraints=constraints,
            options={"maxiter": 500, "ftol": 1e-9},
        )

        if not result.success:
            logger.warning(
                f"Strategy {strategy_name}: optimization did not converge: {result.message}"
            )

        optimized_budgets = result.x

        # Build per-campaign solutions
        campaign_solutions: list[CampaignSolution] = []
        total_predicted_volume = 0.0

        for i, model in enumerate(models):
            suggested = float(optimized_budgets[i])
            current = float(current_budgets[i])
            delta_pct = (suggested - current) / current if current > 0 else 0.0

            predicted_vol = float(predict(
                suggested,
                model.latest_features,
                model.fit.w0,
                model.fit.w1,
                model.fit.wa,
            ))
            total_predicted_volume += predicted_vol

            predicted_roas = predicted_vol / suggested if suggested > 0 else 0.0

            campaign_solutions.append(CampaignSolution(
                campaign_id=model.campaign_id,
                campaign_name=model.campaign_name,
                platform=model.platform,
                current_daily_budget=round(current, 2),
                suggested_daily_budget=round(suggested, 2),
                delta_pct=round(delta_pct, 4),
                current_target_roas=model.current_target_roas,
                suggested_target_roas=None,  # filled by translate step
                current_roas=round(model.current_roas, 4),
                predicted_roas=round(predicted_roas, 4),
                predicted_volume=round(predicted_vol, 2),
                model_confidence=round(model.fit.confidence, 4),
                elasticity=round(model.fit.w1, 4),
            ))

        volume_delta_pct = (
            (total_predicted_volume - current_total_volume) / current_total_volume
            if current_total_volume > 0
            else 0.0
        )

        solutions.append(Solution(
            type=strategy_name,
            risk_level=risk_level,
            expected_volume_delta_pct=round(volume_delta_pct, 4),
            total_budget=round(float(np.sum(optimized_budgets)), 2),
            campaigns=campaign_solutions,
        ))

    return solutions
