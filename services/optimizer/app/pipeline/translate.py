"""Translation layer: converts optimizer budget recommendations to platform-specific parameters.

- Google Ads: budget → tROAS via RLM (Smart Bidding controls spend via tROAS)
- Meta Ads: budget is set directly (no translation needed)
- TikTok Ads: budget is set directly (no translation needed)
"""

import logging

import numpy as np

from app.models.rlm import fit_rlm, translate_budget_to_troas
from app.schemas.request import CampaignInput
from app.schemas.response import CampaignSolution, Solution

logger = logging.getLogger(__name__)


def translate_solutions(
    solutions: list[Solution],
    campaigns_input: list[CampaignInput],
) -> list[Solution]:
    """Add tROAS suggestions to Google Ads campaigns in each solution.

    For Google Ads campaigns with historical tROAS data, fits an RLM model
    and translates suggested budgets to tROAS values.

    Meta and TikTok campaigns use budget directly — no translation needed.
    """
    # Build RLM models for Google Ads campaigns that have tROAS data
    rlm_models: dict[str, tuple] = {}  # campaign_id → (model, r_squared, current_troas)

    for campaign in campaigns_input:
        if campaign.platform != "google_ads":
            continue

        troas_data = [
            (d.target_roas, d.cost)
            for d in campaign.daily_data
            if d.target_roas is not None and d.target_roas > 0 and d.cost > 0
        ]

        if len(troas_data) < 3:
            continue

        troas_arr = np.array([t[0] for t in troas_data])
        spend_arr = np.array([t[1] for t in troas_data])

        try:
            model, r_squared = fit_rlm(troas_arr, spend_arr)
            current_troas = float(troas_arr[-1])
            rlm_models[campaign.campaign_id] = (model, r_squared, current_troas)
        except Exception as e:
            logger.warning(f"RLM fit failed for campaign {campaign.campaign_id}: {e}")

    # Apply translations to each solution
    for solution in solutions:
        for cs in solution.campaigns:
            if cs.platform != "google_ads" or cs.campaign_id not in rlm_models:
                continue

            model, r_squared, current_troas = rlm_models[cs.campaign_id]
            result = translate_budget_to_troas(
                model=model,
                r_squared=r_squared,
                desired_spend=cs.suggested_daily_budget,
                current_troas=current_troas,
            )
            cs.suggested_target_roas = result.suggested_target_roas
            cs.current_target_roas = current_troas

    return solutions
