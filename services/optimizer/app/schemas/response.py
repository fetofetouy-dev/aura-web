"""Pydantic response models for the optimizer API."""

from typing import Literal

from pydantic import BaseModel


class CampaignSolution(BaseModel):
    """Optimization result for a single campaign within a strategy."""

    campaign_id: str
    campaign_name: str
    platform: str
    current_daily_budget: float
    suggested_daily_budget: float
    delta_pct: float
    current_target_roas: float | None = None
    suggested_target_roas: float | None = None
    current_roas: float
    predicted_roas: float
    predicted_volume: float
    model_confidence: float
    elasticity: float


class Solution(BaseModel):
    """One of the 3 optimization strategies (conservative/moderate/aggressive)."""

    type: Literal["conservative", "moderate", "aggressive"]
    risk_level: Literal["low", "medium", "high"]
    expected_volume_delta_pct: float
    total_budget: float
    campaigns: list[CampaignSolution]


class ExcludedCampaign(BaseModel):
    """A campaign excluded from optimization with reason."""

    campaign_id: str
    campaign_name: str
    reason: str
    days: int | None = None


class ModelMetrics(BaseModel):
    """Summary metrics about the modeling phase."""

    campaigns_modeled: int
    campaigns_excluded: int
    excluded_reasons: list[ExcludedCampaign]


class CampaignParameters(BaseModel):
    """Fitted model parameters for a single campaign."""

    campaign_id: str
    w0: float
    w1: float  # elasticity
    r_squared: float
    rmse: float
    method: str  # "bayesian_student", "bayesian_normal", "ols"
    posterior_w1_std: float | None = None


class OptimizeResponse(BaseModel):
    """Response body for POST /optimize."""

    status: Literal["success", "error"]
    error: str | None = None
    model_metrics: ModelMetrics | None = None
    solutions: list[Solution] | None = None
    parameters: list[CampaignParameters] | None = None


class TranslateResponse(BaseModel):
    """Response body for POST /translate."""

    suggested_target_roas: float
    change_pct: float
    confidence: float
    within_bounds: bool
