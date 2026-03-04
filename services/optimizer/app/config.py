"""Default configuration for the Aura Media Optimizer."""

# Dataset
DEFAULT_DATASET_LENGTH = 60  # days of historical data
DEFAULT_MINIMUM_DATES = 15  # min data points to model a campaign

# Budget constraints
DEFAULT_MAX_CHANGE_PCT = 0.35  # max 35% change per iteration (from Opti)
DEFAULT_BUDGET_MIN_PCT = 0.10  # campaign can't go below 10% of current
DEFAULT_BUDGET_MAX_PCT = 3.0  # campaign can't go above 300% of current

# Feature engineering
DEFAULT_HARMONICS = 2  # Fourier harmonics for weekly seasonality
DEFAULT_TREND_DAYS = 15  # rolling mean window
DEFAULT_LAGS = [1, 2, 7]  # lag features in days

# MCMC sampling
MCMC_DRAWS = 1000
MCMC_CHAINS = 4
MCMC_TUNE = 1000
MCMC_TARGET_ACCEPT = 0.9

# OLS fallback
OLS_MIN_R_SQUARED = 0.1  # below this, exclude campaign

# Strategy bounds (max % change per campaign)
STRATEGIES = {
    "conservative": {"max_change": 0.15, "risk_level": "low"},
    "moderate": {"max_change": 0.25, "risk_level": "medium"},
    "aggressive": {"max_change": 0.35, "risk_level": "high"},
}

# Budget allocation constraint: must spend at least 95% of total
MIN_SPEND_RATIO = 0.95

VERSION = "1.0.0"
