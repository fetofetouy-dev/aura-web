"""Feature engineering for the Power Law GAM model.

Transforms raw daily campaign data into features:
- Weekday one-hot encoding
- Cyclic month encoding (sin/cos)
- Fourier harmonics for weekly seasonality
- Rolling mean trends
- Lag features for cost and volume
"""

from dataclasses import dataclass

import numpy as np
import pandas as pd

from app.schemas.request import CampaignInput, OptimizeConfig


@dataclass
class PreprocessResult:
    """Result of preprocessing a single campaign."""

    campaign_id: str
    campaign_name: str
    platform: str
    log_cost: np.ndarray
    log_volume: np.ndarray
    X_features: np.ndarray
    feature_names: list[str]
    current_budget: float
    current_roas: float
    current_target_roas: float | None
    latest_features: np.ndarray  # last row of X_features for prediction
    n_days: int


@dataclass
class ExclusionResult:
    """A campaign excluded from modeling."""

    campaign_id: str
    campaign_name: str
    reason: str
    days: int | None = None


def preprocess_campaign(
    campaign: CampaignInput,
    config: OptimizeConfig,
) -> PreprocessResult | ExclusionResult:
    """Preprocess a single campaign's daily data into model-ready features.

    Returns PreprocessResult on success, ExclusionResult if campaign should be excluded.
    """
    objective = config.objective

    # Build DataFrame from daily data
    records = []
    for d in campaign.daily_data:
        volume = d.conversion_value if objective == "conversion_value" else d.conversions
        records.append({
            "date": pd.to_datetime(d.date),
            "cost": d.cost,
            "volume": volume,
            "impressions": d.impressions,
            "clicks": d.clicks,
            "target_roas": d.target_roas,
            "campaign_budget": d.campaign_budget,
        })

    if not records:
        return ExclusionResult(
            campaign_id=campaign.campaign_id,
            campaign_name=campaign.campaign_name,
            reason="no_data",
            days=0,
        )

    df = pd.DataFrame(records).sort_values("date").reset_index(drop=True)

    # Filter: exclude specified dates
    if config.exclude_dates:
        exclude_set = set(pd.to_datetime(d) for d in config.exclude_dates)
        df = df[~df["date"].isin(exclude_set)]

    # Filter: last N days
    if len(df) > config.dataset_length:
        df = df.tail(config.dataset_length).reset_index(drop=True)

    # Remove days with zero cost or zero volume
    df = df[(df["cost"] > 0) & (df["volume"] > 0)].reset_index(drop=True)

    # Validate minimum data points
    if len(df) < config.minimum_dates:
        return ExclusionResult(
            campaign_id=campaign.campaign_id,
            campaign_name=campaign.campaign_name,
            reason="insufficient_data",
            days=len(df),
        )

    # Current budget and ROAS (from last available data)
    recent = df.tail(7)
    current_budget = recent["campaign_budget"].dropna().iloc[-1] if recent["campaign_budget"].notna().any() else recent["cost"].mean()
    current_roas = recent["volume"].sum() / recent["cost"].sum() if recent["cost"].sum() > 0 else 0
    current_target_roas = recent["target_roas"].dropna().iloc[-1] if recent["target_roas"].notna().any() else None

    # === Feature Engineering ===
    features = pd.DataFrame(index=df.index)

    # 1. Weekday one-hot (drop first to avoid multicollinearity)
    weekdays = pd.get_dummies(df["date"].dt.weekday, prefix="weekday", dtype=float)
    # Keep 6 of 7 (drop weekday_0 = Monday)
    weekday_cols = [c for c in weekdays.columns if c != "weekday_0"]
    features[weekday_cols] = weekdays[weekday_cols]

    # 2. Cyclic month encoding
    month = df["date"].dt.month
    features["month_sin"] = np.sin(2 * np.pi * month / 12)
    features["month_cos"] = np.cos(2 * np.pi * month / 12)

    # 3. Fourier harmonics (weekly seasonality, period=7)
    day_of_week = df["date"].dt.weekday.values.astype(float)
    for h in range(1, config.harmonics + 1):
        features[f"harmonic_sin_{h}"] = np.sin(2 * np.pi * h * day_of_week / 7)
        features[f"harmonic_cos_{h}"] = np.cos(2 * np.pi * h * day_of_week / 7)

    # 4. Rolling mean trends
    features["trend_cost"] = df["cost"].rolling(window=config.trend_days, min_periods=1).mean()
    features["trend_volume"] = df["volume"].rolling(window=config.trend_days, min_periods=1).mean()
    # Normalize trends by overall mean to keep scale reasonable
    cost_mean = df["cost"].mean()
    vol_mean = df["volume"].mean()
    if cost_mean > 0:
        features["trend_cost"] = features["trend_cost"] / cost_mean
    if vol_mean > 0:
        features["trend_volume"] = features["trend_volume"] / vol_mean

    # 5. Lag features
    for lag in config.lags:
        features[f"cost_lag_{lag}"] = np.log(df["cost"].shift(lag).clip(lower=1e-6))
        features[f"volume_lag_{lag}"] = np.log(df["volume"].shift(lag).clip(lower=1e-6))

    # Drop NaN rows (from lags and rolling)
    valid_mask = features.notna().all(axis=1)
    df = df[valid_mask].reset_index(drop=True)
    features = features[valid_mask].reset_index(drop=True)

    # Re-validate after dropping NaN
    if len(df) < config.minimum_dates:
        return ExclusionResult(
            campaign_id=campaign.campaign_id,
            campaign_name=campaign.campaign_name,
            reason="insufficient_data_after_features",
            days=len(df),
        )

    # Build final arrays
    log_cost = np.log(df["cost"].values)
    log_volume = np.log(df["volume"].values)
    X_features = features.values.astype(np.float64)
    feature_names = list(features.columns)

    return PreprocessResult(
        campaign_id=campaign.campaign_id,
        campaign_name=campaign.campaign_name,
        platform=campaign.platform,
        log_cost=log_cost,
        log_volume=log_volume,
        X_features=X_features,
        feature_names=feature_names,
        current_budget=current_budget,
        current_roas=current_roas,
        current_target_roas=current_target_roas,
        latest_features=X_features[-1],
        n_days=len(df),
    )


def preprocess_all(
    campaigns: list[CampaignInput],
    config: OptimizeConfig,
) -> tuple[list[PreprocessResult], list[ExclusionResult]]:
    """Preprocess all campaigns. Returns (successful, excluded) lists."""
    successful: list[PreprocessResult] = []
    excluded: list[ExclusionResult] = []

    for campaign in campaigns:
        result = preprocess_campaign(campaign, config)
        if isinstance(result, PreprocessResult):
            successful.append(result)
        else:
            excluded.append(result)

    return successful, excluded
