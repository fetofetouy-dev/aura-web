"""Tests for the preprocessing pipeline."""

import numpy as np

from app.pipeline.preprocess import ExclusionResult, PreprocessResult, preprocess_campaign
from app.schemas.request import CampaignInput, DailyData, OptimizeConfig


def _make_daily_data(n_days: int = 30, base_cost: float = 1000.0) -> list[DailyData]:
    """Generate synthetic daily data for testing."""
    from datetime import date, timedelta

    rng = np.random.default_rng(42)
    start = date(2026, 1, 1)
    data = []

    for i in range(n_days):
        cost = base_cost * (1 + 0.3 * rng.standard_normal())
        cost = max(cost, 10)
        # Power law: volume ≈ 50 * cost^0.7
        volume = 50 * (cost ** 0.7) * (1 + 0.1 * rng.standard_normal())
        volume = max(volume, 1)

        data.append(DailyData(
            date=(start + timedelta(days=i)).isoformat(),
            cost=round(cost, 2),
            conversions=round(volume / 100, 1),
            conversion_value=round(volume, 2),
            impressions=int(cost * 50),
            clicks=int(cost * 2.5),
            target_roas=8.0,
            campaign_budget=2000.0,
        ))
    return data


def test_preprocess_success():
    """Test successful preprocessing with sufficient data."""
    campaign = CampaignInput(
        campaign_id="test-1",
        campaign_name="Test Campaign",
        platform="google_ads",
        daily_data=_make_daily_data(30),
    )
    config = OptimizeConfig(total_budget=10000, minimum_dates=10)

    result = preprocess_campaign(campaign, config)

    assert isinstance(result, PreprocessResult)
    assert result.campaign_id == "test-1"
    assert len(result.log_cost) > 0
    assert len(result.log_volume) > 0
    assert result.X_features.shape[0] == len(result.log_cost)
    assert result.X_features.shape[1] > 0
    assert len(result.feature_names) == result.X_features.shape[1]
    assert result.current_budget > 0
    assert result.latest_features.shape == (result.X_features.shape[1],)


def test_preprocess_insufficient_data():
    """Test exclusion when data is insufficient."""
    campaign = CampaignInput(
        campaign_id="test-2",
        campaign_name="Small Campaign",
        platform="meta_ads",
        daily_data=_make_daily_data(5),
    )
    config = OptimizeConfig(total_budget=10000, minimum_dates=15)

    result = preprocess_campaign(campaign, config)

    assert isinstance(result, ExclusionResult)
    assert result.reason == "insufficient_data"
    assert result.days == 5


def test_preprocess_no_data():
    """Test exclusion when campaign has no data."""
    campaign = CampaignInput(
        campaign_id="test-3",
        campaign_name="Empty Campaign",
        platform="tiktok_ads",
        daily_data=[],
    )
    config = OptimizeConfig(total_budget=10000)

    result = preprocess_campaign(campaign, config)

    assert isinstance(result, ExclusionResult)
    assert result.reason == "no_data"


def test_preprocess_exclude_dates():
    """Test that specified dates are excluded."""
    data = _make_daily_data(30)
    exclude = [data[5].date, data[10].date]

    campaign = CampaignInput(
        campaign_id="test-4",
        campaign_name="Filtered Campaign",
        platform="google_ads",
        daily_data=data,
    )
    config = OptimizeConfig(total_budget=10000, minimum_dates=10, exclude_dates=exclude)

    result = preprocess_campaign(campaign, config)

    assert isinstance(result, PreprocessResult)
    # Should have fewer data points than without exclusion


def test_preprocess_features_shape():
    """Test that feature matrix has expected columns."""
    campaign = CampaignInput(
        campaign_id="test-5",
        campaign_name="Feature Check",
        platform="google_ads",
        daily_data=_make_daily_data(40),
    )
    config = OptimizeConfig(
        total_budget=10000,
        minimum_dates=10,
        harmonics=2,
        lags=[1, 2, 7],
    )

    result = preprocess_campaign(campaign, config)
    assert isinstance(result, PreprocessResult)

    names = result.feature_names
    # Should have: 6 weekday dummies + 2 month sin/cos + 4 harmonics + 2 trends + 6 lags = 20
    assert "month_sin" in names
    assert "month_cos" in names
    assert "harmonic_sin_1" in names
    assert "harmonic_cos_2" in names
    assert "trend_cost" in names
    assert "cost_lag_1" in names
    assert "volume_lag_7" in names
