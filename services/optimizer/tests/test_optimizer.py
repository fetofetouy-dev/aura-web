"""Tests for the budget optimizer (SciPy SLSQP)."""

import numpy as np

from app.models.power_law import FitResult
from app.pipeline.optimize import optimize_budget
from app.pipeline.sample import CampaignModel
from app.schemas.request import OptimizeConfig


def _make_campaign_model(
    campaign_id: str,
    w1: float,
    current_budget: float,
    n_features: int = 3,
) -> CampaignModel:
    """Create a mock CampaignModel for testing."""
    rng = np.random.default_rng(hash(campaign_id) % (2**32))
    wa = rng.uniform(-0.1, 0.1, n_features)

    return CampaignModel(
        campaign_id=campaign_id,
        campaign_name=f"Campaign {campaign_id}",
        platform="google_ads",
        fit=FitResult(
            w0=10.0,
            w1=w1,
            wa=wa,
            r_squared=0.85,
            rmse=0.1,
            method="ols",
            confidence=0.85,
        ),
        current_budget=current_budget,
        current_roas=5.0,
        current_target_roas=8.0,
        latest_features=rng.standard_normal(n_features),
        n_days=30,
    )


def test_optimize_budget_sum():
    """Test that optimized budgets sum to approximately total_budget."""
    models = [
        _make_campaign_model("a", w1=0.7, current_budget=3000),
        _make_campaign_model("b", w1=0.5, current_budget=4000),
        _make_campaign_model("c", w1=0.8, current_budget=3000),
    ]
    config = OptimizeConfig(total_budget=10000)

    solutions = optimize_budget(models, config)

    assert len(solutions) == 3

    for solution in solutions:
        total = sum(c.suggested_daily_budget for c in solution.campaigns)
        # Must be between 95% and 100% of total budget
        assert total >= 9500, f"Total {total} below 95% of budget"
        assert total <= 10000, f"Total {total} exceeds budget"


def test_optimize_bounds_respected():
    """Test that no campaign budget exceeds its change bounds."""
    models = [
        _make_campaign_model("a", w1=0.7, current_budget=3000),
        _make_campaign_model("b", w1=0.5, current_budget=4000),
        _make_campaign_model("c", w1=0.8, current_budget=3000),
    ]
    config = OptimizeConfig(total_budget=10000)

    solutions = optimize_budget(models, config)

    strategy_bounds = {"conservative": 0.15, "moderate": 0.25, "aggressive": 0.35}

    for solution in solutions:
        max_change = strategy_bounds[solution.type]
        for cs in solution.campaigns:
            assert abs(cs.delta_pct) <= max_change + 0.01, (
                f"Campaign {cs.campaign_id} in {solution.type}: "
                f"delta {cs.delta_pct:.4f} exceeds max {max_change}"
            )


def test_optimize_strategies_ordering():
    """Test that aggressive allows more change than conservative."""
    models = [
        _make_campaign_model("a", w1=0.7, current_budget=3000),
        _make_campaign_model("b", w1=0.3, current_budget=5000),
        _make_campaign_model("c", w1=0.9, current_budget=2000),
    ]
    config = OptimizeConfig(total_budget=10000)

    solutions = optimize_budget(models, config)

    # Sort by strategy name
    by_type = {s.type: s for s in solutions}

    # Aggressive should have >= total change magnitude vs conservative
    conservative_change = sum(abs(c.delta_pct) for c in by_type["conservative"].campaigns)
    aggressive_change = sum(abs(c.delta_pct) for c in by_type["aggressive"].campaigns)

    # Aggressive should allow at least as much change (or more)
    assert aggressive_change >= conservative_change - 0.01


def test_optimize_single_campaign():
    """Test optimization with a single campaign — budget stays the same."""
    models = [_make_campaign_model("only", w1=0.7, current_budget=5000)]
    config = OptimizeConfig(total_budget=5000)

    solutions = optimize_budget(models, config)

    for solution in solutions:
        assert len(solution.campaigns) == 1
        # Single campaign should get all the budget
        cs = solution.campaigns[0]
        assert abs(cs.suggested_daily_budget - 5000) < 100


def test_optimize_returns_three_solutions():
    """Test that exactly 3 solutions are returned."""
    models = [
        _make_campaign_model("x", w1=0.6, current_budget=2000),
        _make_campaign_model("y", w1=0.8, current_budget=3000),
    ]
    config = OptimizeConfig(total_budget=5000)

    solutions = optimize_budget(models, config)

    assert len(solutions) == 3
    types = {s.type for s in solutions}
    assert types == {"conservative", "moderate", "aggressive"}
