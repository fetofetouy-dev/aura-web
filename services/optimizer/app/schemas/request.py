"""Pydantic request models for the optimizer API."""

from typing import Literal

from pydantic import BaseModel, Field


class DailyData(BaseModel):
    """Daily performance data for a single campaign."""

    date: str
    cost: float
    conversions: float
    conversion_value: float
    impressions: int
    clicks: int
    target_roas: float | None = None
    campaign_budget: float | None = None


class CampaignInput(BaseModel):
    """Input data for a single campaign to optimize."""

    campaign_id: str
    campaign_name: str
    platform: Literal["google_ads", "meta_ads", "tiktok_ads"]
    daily_data: list[DailyData]


class OptimizeConfig(BaseModel):
    """Configuration for the optimization run."""

    total_budget: float = Field(gt=0)
    objective: Literal["conversion_value", "conversions"] = "conversion_value"
    dataset_length: int = Field(default=60, ge=7)
    minimum_dates: int = Field(default=15, ge=5)
    max_change_pct: float = Field(default=0.35, gt=0, le=1.0)
    budget_min_pct: float = Field(default=0.10, gt=0)
    budget_max_pct: float = Field(default=3.0, ge=1.0)
    error_dist: Literal["student", "normal"] = "student"
    sampling_method: Literal["MEDIAN", "THOMPSON"] = "MEDIAN"
    harmonics: int = Field(default=2, ge=0, le=5)
    trend_days: int = Field(default=15, ge=3)
    lags: list[int] = Field(default=[1, 2, 7])
    exclude_dates: list[str] = Field(default=[])


class OptimizeRequest(BaseModel):
    """Request body for POST /optimize."""

    campaigns: list[CampaignInput] = Field(min_length=1)
    config: OptimizeConfig


class HistoricalTroasData(BaseModel):
    """Historical tROAS → spend data point for RLM."""

    date: str
    target_roas: float
    actual_spend: float


class TranslateRequest(BaseModel):
    """Request body for POST /translate (RLM budget → tROAS)."""

    campaign_id: str
    historical_data: list[HistoricalTroasData] = Field(min_length=3)
    desired_spend: float = Field(gt=0)
    current_target_roas: float = Field(gt=0)
    max_change_pct: float = Field(default=0.35, gt=0, le=1.0)
