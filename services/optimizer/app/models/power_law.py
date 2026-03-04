"""Power Law GAM model for cost → volume response curves.

Model: log(volume) = log(w0) + w1 * log(cost) + wa @ features + ε
Where:
  - w1 < 1 → diminishing returns (power law)
  - ε ~ Student-t (robust to outliers) or Normal
  - Estimated via MCMC (PyMC5) with OLS fallback
"""

import logging
from dataclasses import dataclass

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

from app.config import MCMC_CHAINS, MCMC_DRAWS, MCMC_TARGET_ACCEPT, MCMC_TUNE

logger = logging.getLogger(__name__)


@dataclass
class FitResult:
    """Result of fitting the Power Law GAM to a campaign."""

    w0: float
    w1: float  # elasticity
    wa: np.ndarray
    r_squared: float
    rmse: float
    method: str  # "bayesian_student", "bayesian_normal", "ols"
    posterior_w1_std: float | None = None
    confidence: float = 0.0


def fit_bayesian(
    log_cost: np.ndarray,
    log_volume: np.ndarray,
    X_features: np.ndarray,
    error_dist: str = "student",
) -> FitResult:
    """Fit Power Law GAM using PyMC5 MCMC sampling.

    Args:
        log_cost: log of daily cost values
        log_volume: log of daily volume values
        X_features: feature matrix (n_days × n_features)
        error_dist: "student" for Student-t (robust) or "normal"

    Returns:
        FitResult with posterior median parameters

    Raises:
        RuntimeError: if sampling fails or doesn't converge
    """
    import pymc as pm

    n_features = X_features.shape[1]

    with pm.Model():
        # Priors
        log_w0 = pm.Normal("log_w0", mu=0, sigma=5)
        w1 = pm.Beta("w1", alpha=2, beta=2)  # elasticity constrained to (0, 1)
        wa = pm.Normal("wa", mu=0, sigma=1, shape=n_features)
        sigma = pm.HalfCauchy("sigma", beta=1)

        # Model: log(volume) = log(w0) + w1 * log(cost) + X @ wa
        mu = log_w0 + w1 * log_cost + pm.math.dot(X_features, wa)

        # Likelihood
        if error_dist == "student":
            nu = pm.Gamma("nu", alpha=2, beta=0.1)
            pm.StudentT("obs", nu=nu, mu=mu, sigma=sigma, observed=log_volume)
        else:
            pm.Normal("obs", mu=mu, sigma=sigma, observed=log_volume)

        # Sample
        trace = pm.sample(
            draws=MCMC_DRAWS,
            chains=MCMC_CHAINS,
            tune=MCMC_TUNE,
            target_accept=MCMC_TARGET_ACCEPT,
            progressbar=False,
            return_inferencedata=True,
        )

    # Extract posterior medians
    w0_est = float(np.exp(np.median(trace.posterior["log_w0"].values)))
    w1_est = float(np.median(trace.posterior["w1"].values))
    wa_est = np.median(trace.posterior["wa"].values, axis=(0, 1))
    w1_std = float(np.std(trace.posterior["w1"].values))

    # Compute R² and RMSE on training data
    predicted = np.log(w0_est) + w1_est * log_cost + X_features @ wa_est
    ss_res = np.sum((log_volume - predicted) ** 2)
    ss_tot = np.sum((log_volume - np.mean(log_volume)) ** 2)
    r_squared = float(1 - ss_res / ss_tot) if ss_tot > 0 else 0.0
    rmse = float(np.sqrt(mean_squared_error(log_volume, predicted)))

    # Confidence based on R² and w1 certainty
    confidence = min(1.0, max(0.0, r_squared * (1 - w1_std)))

    method = f"bayesian_{error_dist}"

    return FitResult(
        w0=w0_est,
        w1=w1_est,
        wa=wa_est,
        r_squared=r_squared,
        rmse=rmse,
        method=method,
        posterior_w1_std=w1_std,
        confidence=confidence,
    )


def fit_ols(
    log_cost: np.ndarray,
    log_volume: np.ndarray,
    X_features: np.ndarray,
) -> FitResult:
    """Fit Power Law GAM using OLS (fast fallback, no uncertainty).

    log(volume) = intercept + coef[0] * log(cost) + coef[1:] @ features
    """
    X = np.column_stack([log_cost, X_features])
    model = LinearRegression().fit(X, log_volume)

    w1_est = float(model.coef_[0])
    w0_est = float(np.exp(model.intercept_))
    wa_est = model.coef_[1:]
    r_squared = float(model.score(X, log_volume))

    predicted = model.predict(X)
    rmse = float(np.sqrt(mean_squared_error(log_volume, predicted)))

    # Clamp w1 to (0, 1) for power law interpretation
    w1_est = max(0.01, min(0.99, w1_est))

    return FitResult(
        w0=w0_est,
        w1=w1_est,
        wa=wa_est,
        r_squared=r_squared,
        rmse=rmse,
        method="ols",
        posterior_w1_std=None,
        confidence=max(0.0, min(1.0, r_squared)),
    )


def predict(
    cost: float | np.ndarray,
    features: np.ndarray,
    w0: float,
    w1: float,
    wa: np.ndarray,
) -> float | np.ndarray:
    """Predict volume given cost and features using fitted parameters.

    volume = w0 * cost^w1 * exp(features @ wa)
    """
    log_vol = np.log(w0) + w1 * np.log(np.maximum(cost, 1e-6)) + features @ wa
    return np.exp(log_vol)
