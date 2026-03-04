"""Rate of Learning Model (RLM) — Translates budget → tROAS for Google Ads.

Google Ads Smart Bidding controls spend via tROAS, not budget directly:
- Lower tROAS → Google spends more (accepts worse return for more volume)
- Higher tROAS → Google spends less (demands better return)

The RLM models the empirical relationship:
  log(spend) = a + b * log(tROAS)   where b < 0

Given a desired spend, we invert this to find the tROAS to set.
"""

from dataclasses import dataclass

import numpy as np
from sklearn.linear_model import LinearRegression


@dataclass
class RLMResult:
    """Result of the RLM translation."""

    suggested_target_roas: float
    change_pct: float
    confidence: float  # R² of the RLM fit
    within_bounds: bool


def fit_rlm(
    target_roas_values: np.ndarray,
    actual_spend_values: np.ndarray,
) -> tuple[LinearRegression, float]:
    """Fit the RLM: log(spend) = a + b * log(tROAS).

    Args:
        target_roas_values: historical tROAS settings
        actual_spend_values: corresponding actual spend

    Returns:
        (fitted model, R² score)
    """
    # Filter valid data points
    mask = (target_roas_values > 0) & (actual_spend_values > 0)
    troas = target_roas_values[mask]
    spend = actual_spend_values[mask]

    if len(troas) < 3:
        raise ValueError(f"Need at least 3 valid data points, got {len(troas)}")

    X = np.log(troas).reshape(-1, 1)
    y = np.log(spend)

    model = LinearRegression().fit(X, y)
    r_squared = float(model.score(X, y))

    return model, r_squared


def translate_budget_to_troas(
    model: LinearRegression,
    r_squared: float,
    desired_spend: float,
    current_troas: float,
    max_change_pct: float = 0.35,
) -> RLMResult:
    """Invert the RLM: given desired_spend → what tROAS to set.

    log(spend) = a + b * log(tROAS)
    → log(tROAS) = (log(spend) - a) / b
    → tROAS = exp((log(spend) - a) / b)
    """
    if model.coef_[0] == 0:
        return RLMResult(
            suggested_target_roas=current_troas,
            change_pct=0.0,
            confidence=r_squared,
            within_bounds=True,
        )

    log_troas = (np.log(desired_spend) - model.intercept_) / model.coef_[0]
    suggested_troas = float(np.exp(log_troas))

    # Ensure tROAS is positive and reasonable
    suggested_troas = max(0.01, suggested_troas)

    # Apply max change constraint
    change_pct = (suggested_troas - current_troas) / current_troas
    within_bounds = abs(change_pct) <= max_change_pct

    if abs(change_pct) > max_change_pct:
        suggested_troas = current_troas * (1 + np.sign(change_pct) * max_change_pct)
        change_pct = float(np.sign(change_pct) * max_change_pct)

    return RLMResult(
        suggested_target_roas=round(suggested_troas, 4),
        change_pct=round(change_pct, 4),
        confidence=round(r_squared, 4),
        within_bounds=within_bounds,
    )
