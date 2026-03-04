"""Tests for the RLM translator (budget → tROAS)."""

import numpy as np

from app.models.rlm import RLMResult, fit_rlm, translate_budget_to_troas


def _generate_rlm_data(n: int = 20, seed: int = 42):
    """Generate synthetic tROAS → spend data.

    Relationship: spend = a * tROAS^b where b < 0
    (higher tROAS → lower spend)
    """
    rng = np.random.default_rng(seed)

    # Typical tROAS range: 3-15
    troas = rng.uniform(3, 15, n)
    troas.sort()

    # Power law: spend = 5000 * tROAS^(-0.8) + noise
    a, b = 5000, -0.8
    spend = a * (troas ** b) * (1 + 0.05 * rng.standard_normal(n))
    spend = np.maximum(spend, 10)

    return troas, spend


def test_fit_rlm_basic():
    """Test that RLM fits successfully with valid data."""
    troas, spend = _generate_rlm_data()
    model, r_squared = fit_rlm(troas, spend)

    assert r_squared > 0.7, f"Expected R² > 0.7, got {r_squared}"
    # Coefficient should be negative (higher tROAS → lower spend)
    assert model.coef_[0] < 0, "Expected negative coefficient"


def test_fit_rlm_insufficient_data():
    """Test that RLM raises error with too few data points."""
    troas = np.array([5.0, 8.0])
    spend = np.array([1000.0, 800.0])

    try:
        fit_rlm(troas, spend)
        assert False, "Should have raised ValueError"
    except ValueError as e:
        assert "at least 3" in str(e).lower()


def test_translate_within_bounds():
    """Test translation when result is within max change bounds."""
    troas, spend = _generate_rlm_data()
    model, r_squared = fit_rlm(troas, spend)

    current_troas = 8.0
    # Desired spend slightly higher → tROAS should decrease slightly
    current_idx = np.argmin(np.abs(troas - current_troas))
    desired_spend = spend[current_idx] * 1.1  # 10% more spend

    result = translate_budget_to_troas(
        model, r_squared, desired_spend, current_troas, max_change_pct=0.35
    )

    assert isinstance(result, RLMResult)
    assert result.suggested_target_roas > 0
    # More spend → lower tROAS (since coefficient is negative)
    assert result.suggested_target_roas <= current_troas + 0.5  # some tolerance


def test_translate_max_change_constraint():
    """Test that max change constraint is applied."""
    troas, spend = _generate_rlm_data()
    model, r_squared = fit_rlm(troas, spend)

    current_troas = 8.0
    # Very different desired spend → should be clamped
    desired_spend = spend[0] * 5  # way more than current

    result = translate_budget_to_troas(
        model, r_squared, desired_spend, current_troas, max_change_pct=0.15
    )

    assert abs(result.change_pct) <= 0.15 + 0.001


def test_translate_direction():
    """Test that higher desired spend → lower tROAS."""
    troas, spend = _generate_rlm_data()
    model, r_squared = fit_rlm(troas, spend)

    current_troas = 8.0
    current_idx = np.argmin(np.abs(troas - current_troas))
    current_spend = spend[current_idx]

    # More spend
    result_more = translate_budget_to_troas(
        model, r_squared, current_spend * 1.3, current_troas, max_change_pct=0.50
    )
    # Less spend
    result_less = translate_budget_to_troas(
        model, r_squared, current_spend * 0.7, current_troas, max_change_pct=0.50
    )

    assert result_more.suggested_target_roas < result_less.suggested_target_roas, (
        "More spend should suggest lower tROAS than less spend"
    )
