"""Model fitting orchestration with fallback chain.

Fallback chain:
1. Bayesian (Student-t) via PyMC5
2. Bayesian (Normal) via PyMC5
3. OLS via scikit-learn
4. Exclude campaign if R² < threshold
"""

import logging
from dataclasses import dataclass

from app.config import OLS_MIN_R_SQUARED
from app.models.power_law import FitResult, fit_bayesian, fit_ols
from app.pipeline.preprocess import ExclusionResult, PreprocessResult

logger = logging.getLogger(__name__)


@dataclass
class CampaignModel:
    """A fitted model for a single campaign."""

    campaign_id: str
    campaign_name: str
    platform: str
    fit: FitResult
    current_budget: float
    current_roas: float
    current_target_roas: float | None
    latest_features: "import numpy; numpy.ndarray"  # type: ignore
    n_days: int


def fit_campaign(
    prep: PreprocessResult,
    error_dist: str = "student",
    sampling_method: str = "MEDIAN",
) -> CampaignModel | ExclusionResult:
    """Fit the Power Law GAM model for a single campaign with fallback chain."""

    # 1. Try Bayesian with Student-t
    if error_dist == "student":
        try:
            result = fit_bayesian(
                prep.log_cost, prep.log_volume, prep.X_features, error_dist="student"
            )
            logger.info(
                f"Campaign {prep.campaign_id}: Bayesian Student-t fit "
                f"(w1={result.w1:.3f}, R²={result.r_squared:.3f})"
            )
            return _build_model(prep, result)
        except Exception as e:
            logger.warning(
                f"Campaign {prep.campaign_id}: Bayesian Student-t failed: {e}"
            )

    # 2. Try Bayesian with Normal
    try:
        result = fit_bayesian(
            prep.log_cost, prep.log_volume, prep.X_features, error_dist="normal"
        )
        logger.info(
            f"Campaign {prep.campaign_id}: Bayesian Normal fit "
            f"(w1={result.w1:.3f}, R²={result.r_squared:.3f})"
        )
        return _build_model(prep, result)
    except Exception as e:
        logger.warning(f"Campaign {prep.campaign_id}: Bayesian Normal failed: {e}")

    # 3. OLS fallback
    try:
        result = fit_ols(prep.log_cost, prep.log_volume, prep.X_features)
        logger.info(
            f"Campaign {prep.campaign_id}: OLS fit "
            f"(w1={result.w1:.3f}, R²={result.r_squared:.3f})"
        )

        # 4. Exclude if R² too low
        if result.r_squared < OLS_MIN_R_SQUARED:
            return ExclusionResult(
                campaign_id=prep.campaign_id,
                campaign_name=prep.campaign_name,
                reason="poor_fit",
                days=prep.n_days,
            )

        return _build_model(prep, result)
    except Exception as e:
        logger.error(f"Campaign {prep.campaign_id}: OLS failed: {e}")
        return ExclusionResult(
            campaign_id=prep.campaign_id,
            campaign_name=prep.campaign_name,
            reason="fit_failed",
            days=prep.n_days,
        )


def fit_all(
    preprocessed: list[PreprocessResult],
    error_dist: str = "student",
    sampling_method: str = "MEDIAN",
) -> tuple[list[CampaignModel], list[ExclusionResult]]:
    """Fit models for all preprocessed campaigns."""
    models: list[CampaignModel] = []
    excluded: list[ExclusionResult] = []

    for prep in preprocessed:
        result = fit_campaign(prep, error_dist, sampling_method)
        if isinstance(result, CampaignModel):
            models.append(result)
        else:
            excluded.append(result)

    return models, excluded


def _build_model(prep: PreprocessResult, fit: FitResult) -> CampaignModel:
    return CampaignModel(
        campaign_id=prep.campaign_id,
        campaign_name=prep.campaign_name,
        platform=prep.platform,
        fit=fit,
        current_budget=prep.current_budget,
        current_roas=prep.current_roas,
        current_target_roas=prep.current_target_roas,
        latest_features=prep.latest_features,
        n_days=prep.n_days,
    )
