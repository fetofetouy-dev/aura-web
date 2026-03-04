"""Aura Media Optimizer — FastAPI microservice.

Stateless service that receives campaign performance data and returns
budget redistribution recommendations using Power Law GAM models.

Endpoints:
  GET  /health    → Service health check
  POST /optimize  → Full optimization pipeline
  POST /analyze   → Response curves + model diagnostics
  POST /translate → Standalone RLM budget → tROAS translation
"""

import logging
import time

import numpy as np
from fastapi import FastAPI, HTTPException

from app.config import VERSION
from app.models.power_law import predict
from app.models.rlm import fit_rlm, translate_budget_to_troas
from app.pipeline.optimize import optimize_budget
from app.pipeline.preprocess import ExclusionResult, preprocess_all
from app.pipeline.sample import fit_all
from app.pipeline.translate import translate_solutions
from app.schemas.analyze import (
    AnalyzeRequest,
    AnalyzeResponse,
    CampaignCurve,
    CurvePoint,
    ExcludedCampaignInfo,
)
from app.schemas.request import OptimizeRequest, TranslateRequest
from app.schemas.response import (
    CampaignParameters,
    ExcludedCampaign,
    ModelMetrics,
    OptimizeResponse,
    TranslateResponse,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Aura Media Optimizer",
    version=VERSION,
    description="Budget optimization service based on Power Law GAM (Opti/LISA).",
)


@app.get("/health")
def health():
    """Service health check."""
    pymc_version = "unknown"
    try:
        import pymc as pm

        pymc_version = pm.__version__
    except ImportError:
        pymc_version = "not_installed"

    return {"status": "ok", "version": VERSION, "pymc_version": pymc_version}


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(request: OptimizeRequest):
    """Run the full optimization pipeline.

    1. Preprocess campaigns (feature engineering)
    2. Fit Power Law GAM per campaign (Bayesian → OLS fallback)
    3. Optimize budget distribution (SciPy SLSQP, 3 strategies)
    4. Translate budgets → tROAS for Google Ads (RLM)
    """
    start = time.time()

    try:
        # 1. Preprocess
        logger.info(f"Preprocessing {len(request.campaigns)} campaigns...")
        preprocessed, excluded_preprocess = preprocess_all(
            request.campaigns, request.config
        )

        if not preprocessed:
            return OptimizeResponse(
                status="error",
                error="No campaigns had sufficient data for modeling",
                model_metrics=ModelMetrics(
                    campaigns_modeled=0,
                    campaigns_excluded=len(excluded_preprocess),
                    excluded_reasons=[
                        ExcludedCampaign(
                            campaign_id=e.campaign_id,
                            campaign_name=e.campaign_name,
                            reason=e.reason,
                            days=e.days,
                        )
                        for e in excluded_preprocess
                    ],
                ),
            )

        # 2. Fit models
        logger.info(f"Fitting models for {len(preprocessed)} campaigns...")
        models, excluded_fit = fit_all(
            preprocessed,
            error_dist=request.config.error_dist,
            sampling_method=request.config.sampling_method,
        )

        all_excluded: list[ExclusionResult] = excluded_preprocess + excluded_fit

        if not models:
            return OptimizeResponse(
                status="error",
                error="No campaigns could be modeled successfully",
                model_metrics=ModelMetrics(
                    campaigns_modeled=0,
                    campaigns_excluded=len(all_excluded),
                    excluded_reasons=[
                        ExcludedCampaign(
                            campaign_id=e.campaign_id,
                            campaign_name=e.campaign_name,
                            reason=e.reason,
                            days=e.days,
                        )
                        for e in all_excluded
                    ],
                ),
            )

        # 3. Optimize
        logger.info(f"Optimizing budget for {len(models)} campaigns...")
        solutions = optimize_budget(models, request.config)

        # 4. Translate (RLM for Google Ads)
        logger.info("Translating budgets to platform parameters...")
        solutions = translate_solutions(solutions, request.campaigns)

        # Build parameters output
        parameters = [
            CampaignParameters(
                campaign_id=m.campaign_id,
                w0=round(m.fit.w0, 6),
                w1=round(m.fit.w1, 6),
                r_squared=round(m.fit.r_squared, 4),
                rmse=round(m.fit.rmse, 4),
                method=m.fit.method,
                posterior_w1_std=(
                    round(m.fit.posterior_w1_std, 4)
                    if m.fit.posterior_w1_std is not None
                    else None
                ),
            )
            for m in models
        ]

        elapsed = time.time() - start
        logger.info(
            f"Optimization complete in {elapsed:.1f}s: "
            f"{len(models)} modeled, {len(all_excluded)} excluded"
        )

        return OptimizeResponse(
            status="success",
            model_metrics=ModelMetrics(
                campaigns_modeled=len(models),
                campaigns_excluded=len(all_excluded),
                excluded_reasons=[
                    ExcludedCampaign(
                        campaign_id=e.campaign_id,
                        campaign_name=e.campaign_name,
                        reason=e.reason,
                        days=e.days,
                    )
                    for e in all_excluded
                ],
            ),
            solutions=solutions,
            parameters=parameters,
        )

    except Exception as e:
        logger.exception("Optimization failed")
        return OptimizeResponse(status="error", error=str(e))


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    """Analyze campaigns: fit models and return response curves with confidence intervals.

    Used for visualization of Power Law curves, model diagnostics, and
    sensitivity analysis without running the full optimization.
    """
    try:
        # Preprocess
        preprocessed, excluded_preprocess = preprocess_all(
            request.campaigns, request.config
        )

        if not preprocessed:
            return AnalyzeResponse(
                status="error",
                error="No campaigns had sufficient data for analysis",
                excluded=[
                    ExcludedCampaignInfo(
                        campaign_id=e.campaign_id,
                        campaign_name=e.campaign_name,
                        reason=e.reason,
                    )
                    for e in excluded_preprocess
                ],
            )

        # Fit models
        models, excluded_fit = fit_all(
            preprocessed,
            error_dist=request.config.error_dist,
            sampling_method=request.config.sampling_method,
        )

        all_excluded = excluded_preprocess + excluded_fit

        if not models:
            return AnalyzeResponse(
                status="error",
                error="No campaigns could be modeled",
                excluded=[
                    ExcludedCampaignInfo(
                        campaign_id=e.campaign_id,
                        campaign_name=e.campaign_name,
                        reason=e.reason,
                    )
                    for e in all_excluded
                ],
            )

        # Generate curves for each campaign
        curves: list[CampaignCurve] = []

        for model in models:
            # Determine budget range
            if request.budget_range:
                min_b = request.budget_range.min_budget
                max_b = request.budget_range.max_budget
                n_points = request.budget_range.points
            else:
                min_b = max(model.current_budget * 0.2, 1.0)
                max_b = model.current_budget * 3.0
                n_points = 50

            costs = np.linspace(min_b, max_b, n_points)

            # Generate curve points with confidence intervals
            curve_points: list[CurvePoint] = []
            w1_std = model.fit.posterior_w1_std

            for cost_val in costs:
                vol = float(predict(
                    cost_val, model.latest_features,
                    model.fit.w0, model.fit.w1, model.fit.wa,
                ))

                # Confidence interval from w1 uncertainty
                if w1_std and w1_std > 0:
                    vol_lower = float(predict(
                        cost_val, model.latest_features,
                        model.fit.w0, max(0.01, model.fit.w1 - 2 * w1_std), model.fit.wa,
                    ))
                    vol_upper = float(predict(
                        cost_val, model.latest_features,
                        model.fit.w0, min(0.99, model.fit.w1 + 2 * w1_std), model.fit.wa,
                    ))
                else:
                    # No uncertainty info — use ±10% as rough band
                    vol_lower = vol * 0.9
                    vol_upper = vol * 1.1

                curve_points.append(CurvePoint(
                    cost=round(cost_val, 2),
                    volume=round(vol, 2),
                    volume_lower=round(min(vol_lower, vol_upper), 2),
                    volume_upper=round(max(vol_lower, vol_upper), 2),
                ))

            curves.append(CampaignCurve(
                campaign_id=model.campaign_id,
                campaign_name=model.campaign_name,
                platform=model.platform,
                w0=round(model.fit.w0, 6),
                w1=round(model.fit.w1, 6),
                w1_std=round(w1_std, 6) if w1_std else None,
                r_squared=round(model.fit.r_squared, 4),
                rmse=round(model.fit.rmse, 4),
                method=model.fit.method,
                data_points=model.n_days,
                current_budget=round(model.current_budget, 2),
                curve=curve_points,
            ))

        return AnalyzeResponse(
            status="success",
            curves=curves,
            excluded=[
                ExcludedCampaignInfo(
                    campaign_id=e.campaign_id,
                    campaign_name=e.campaign_name,
                    reason=e.reason,
                )
                for e in all_excluded
            ] if all_excluded else None,
        )

    except Exception as e:
        logger.exception("Analysis failed")
        return AnalyzeResponse(status="error", error=str(e))


@app.post("/translate", response_model=TranslateResponse)
def translate(request: TranslateRequest):
    """Standalone RLM translation: budget → tROAS.

    For Google Ads campaigns using Smart Bidding where spend is
    controlled via tROAS rather than budget directly.
    """
    troas_values = np.array([d.target_roas for d in request.historical_data])
    spend_values = np.array([d.actual_spend for d in request.historical_data])

    try:
        model, r_squared = fit_rlm(troas_values, spend_values)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    result = translate_budget_to_troas(
        model=model,
        r_squared=r_squared,
        desired_spend=request.desired_spend,
        current_troas=request.current_target_roas,
        max_change_pct=request.max_change_pct,
    )

    return TranslateResponse(
        suggested_target_roas=result.suggested_target_roas,
        change_pct=result.change_pct,
        confidence=result.confidence,
        within_bounds=result.within_bounds,
    )
