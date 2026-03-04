"""Tests for the Power Law GAM model (OLS + predict)."""

import numpy as np

from app.models.power_law import fit_ols, predict


def _generate_power_law_data(
    n: int = 50,
    w0: float = 10.0,
    w1: float = 0.7,
    n_features: int = 3,
    noise_std: float = 0.05,
    seed: int = 42,
):
    """Generate synthetic data following the Power Law model."""
    rng = np.random.default_rng(seed)

    cost = rng.uniform(100, 5000, n)
    log_cost = np.log(cost)

    X_features = rng.standard_normal((n, n_features))
    wa_true = rng.uniform(-0.3, 0.3, n_features)

    log_volume = np.log(w0) + w1 * log_cost + X_features @ wa_true
    log_volume += noise_std * rng.standard_normal(n)

    return log_cost, log_volume, X_features, wa_true


def test_ols_fit_recovers_elasticity():
    """Test that OLS recovers the true elasticity (w1) from synthetic data."""
    w1_true = 0.7
    log_cost, log_volume, X_features, _ = _generate_power_law_data(
        n=100, w1=w1_true, noise_std=0.02
    )

    result = fit_ols(log_cost, log_volume, X_features)

    assert abs(result.w1 - w1_true) < 0.1, f"Expected w1≈{w1_true}, got {result.w1}"
    assert result.r_squared > 0.9, f"Expected R²>0.9, got {result.r_squared}"
    assert result.method == "ols"
    assert result.posterior_w1_std is None


def test_ols_fit_r_squared():
    """Test that R² is high for clean power law data and low for noise."""
    # Clean data → high R²
    log_cost, log_volume, X_features, _ = _generate_power_law_data(noise_std=0.01)
    result_clean = fit_ols(log_cost, log_volume, X_features)
    assert result_clean.r_squared > 0.95

    # Noisy data → lower R²
    log_cost2, _, X_features2, _ = _generate_power_law_data(noise_std=0.01, seed=99)
    rng = np.random.default_rng(123)
    log_volume_noisy = rng.standard_normal(len(log_cost2))
    result_noisy = fit_ols(log_cost2, log_volume_noisy, X_features2)
    assert result_noisy.r_squared < 0.5


def test_ols_w1_clamped():
    """Test that w1 is clamped to (0.01, 0.99) for power law interpretation."""
    rng = np.random.default_rng(42)
    n = 50
    log_cost = rng.standard_normal(n)
    # Create data where linear relationship has slope > 1
    log_volume = 2.0 * log_cost + rng.standard_normal(n) * 0.01
    X_features = np.zeros((n, 1))

    result = fit_ols(log_cost, log_volume, X_features)
    assert 0.01 <= result.w1 <= 0.99


def test_predict():
    """Test prediction with known parameters."""
    w0 = 10.0
    w1 = 0.7
    wa = np.array([0.1, -0.2])

    cost = 1000.0
    features = np.array([0.5, 0.3])

    # Manual calculation
    expected = np.exp(np.log(w0) + w1 * np.log(cost) + features @ wa)
    actual = predict(cost, features, w0, w1, wa)

    assert abs(actual - expected) < 1e-6


def test_predict_array():
    """Test prediction with array inputs."""
    w0 = 10.0
    w1 = 0.7
    wa = np.array([0.1])

    costs = np.array([100, 500, 1000, 5000])
    features = np.array([0.5])

    results = [predict(c, features, w0, w1, wa) for c in costs]

    # Volume should increase with cost (power law)
    for i in range(len(results) - 1):
        assert results[i + 1] > results[i], "Volume should increase with cost"

    # Check diminishing returns (volume grows slower than cost)
    ratio_cost = costs[-1] / costs[0]
    ratio_vol = results[-1] / results[0]
    assert ratio_vol < ratio_cost, "Volume growth should be less than cost growth (diminishing returns)"


def test_predict_zero_features():
    """Test prediction when features contribution is zero."""
    w0 = 10.0
    w1 = 0.7
    wa = np.array([0.0, 0.0])

    cost = 1000.0
    features = np.array([1.0, 1.0])

    result = predict(cost, features, w0, w1, wa)
    expected = w0 * (cost ** w1)

    assert abs(result - expected) < 1e-6
