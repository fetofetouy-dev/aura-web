"""Pydantic schemas for the /analyze endpoint."""

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.request import CampaignInput, OptimizeConfig


class BudgetRange(BaseModel):
    """Range for generating the response curve."""

    min_budget: float = Field(gt=0)
    max_budget: float = Field(gt=0)
    points: int = Field(default=50, ge=10, le=200)


class AnalyzeRequest(BaseModel):
    """Request body for POST /analyze."""

    campaigns: list[CampaignInput] = Field(min_length=1)
    config: OptimizeConfig
    budget_range: BudgetRange | None = None  # If None, auto-detect from data


class CurvePoint(BaseModel):
    """A single point on the Power Law curve."""

    cost: float
    volume: float
    volume_lower: float
    volume_upper: float


class CampaignCurve(BaseModel):
    """Response curve and model diagnostics for a single campaign."""

    campaign_id: str
    campaign_name: str
    platform: str
    w0: float
    w1: float
    w1_std: float | None = None
    r_squared: float
    rmse: float
    method: str
    data_points: int
    current_budget: float
    curve: list[CurvePoint]


class ExcludedCampaignInfo(BaseModel):
    """Campaign excluded from analysis."""

    campaign_id: str
    campaign_name: str
    reason: str


class AnalyzeResponse(BaseModel):
    """Response body for POST /analyze."""

    status: Literal["success", "error"]
    error: str | None = None
    curves: list[CampaignCurve] | None = None
    excluded: list[ExcludedCampaignInfo] | None = None
