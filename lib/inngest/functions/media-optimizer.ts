import { inngest } from "@/lib/inngest"
import { supabaseAdmin } from "@/lib/supabase-server"

const OPTIMIZER_URL = process.env.OPTIMIZER_SERVICE_URL || "http://localhost:8000"

/**
 * Event-triggered: Run budget optimization for a tenant's ad campaigns.
 *
 * Pipeline:
 * 1. Create optimization_run (status: running)
 * 2. Fetch campaigns + 60 days of daily stats
 * 3. Transform data → Python service request format
 * 4. POST to Python optimizer service
 * 5. Store 3 solutions in optimization_solutions
 * 6. Update run status
 */
export const mediaOptimizerFunction = inngest.createFunction(
  {
    id: "media-optimizer",
    name: "Media Optimizer — Redistribuir presupuesto publicitario",
    retries: 1,
  },
  { event: "optimizer/run.requested" },
  async ({ event, step }) => {
    const { tenantId, totalBudget, objective } = event.data

    // Step 1: Create optimization run
    const runId = await step.run("create-optimization-run", async () => {
      const { data } = await supabaseAdmin
        .from("optimization_runs")
        .insert({
          tenant_id: tenantId,
          status: "running",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (!data) throw new Error("Failed to create optimization run")
      return data.id
    })

    try {
      // Step 2: Fetch campaigns + daily stats (last 60 days)
      const campaignsData = await step.run("fetch-campaign-data", async () => {
        const dateFrom = new Date()
        dateFrom.setDate(dateFrom.getDate() - 60)
        const dateFromStr = dateFrom.toISOString().split("T")[0]

        // Fetch active campaigns with their ad account (for platform info)
        const { data: campaigns } = await supabaseAdmin
          .from("ad_campaigns")
          .select("*, ad_account:ad_accounts!inner(platform)")
          .eq("tenant_id", tenantId)
          .eq("status", "enabled")

        if (!campaigns || campaigns.length === 0) {
          throw new Error("No active campaigns found")
        }

        // Fetch daily stats for all campaigns
        const campaignIds = campaigns.map((c) => c.id)
        const { data: stats } = await supabaseAdmin
          .from("ad_campaign_daily_stats")
          .select("*")
          .eq("tenant_id", tenantId)
          .in("campaign_id", campaignIds)
          .gte("date", dateFromStr)
          .order("date", { ascending: true })

        return { campaigns, stats: stats ?? [] }
      })

      // Step 2.5: Read tenant optimizer config
      const tenantConfig = await step.run("read-tenant-config", async () => {
        const { data: profile } = await supabaseAdmin
          .from("tenant_profiles")
          .select("settings")
          .eq("id", tenantId)
          .single()

        const settings = (profile?.settings ?? {}) as Record<string, unknown>
        const optimizerConf = (settings.optimizer ?? {}) as Record<string, unknown>
        return {
          sampling_method: (optimizerConf.sampling_method as string) || "MEDIAN",
        }
      })

      // Step 3: Transform to Python service format
      const optimizeRequest = await step.run("build-optimize-request", async () => {
        const { campaigns, stats } = campaignsData

        // Group stats by campaign_id
        const statsByCampaign: Record<string, typeof stats> = {}
        for (const s of stats) {
          if (!statsByCampaign[s.campaign_id]) {
            statsByCampaign[s.campaign_id] = []
          }
          statsByCampaign[s.campaign_id].push(s)
        }

        // Build CampaignInput[] for Python service
        const campaignInputs = campaigns
          .filter((c) => (statsByCampaign[c.id]?.length ?? 0) > 0)
          .map((c) => ({
            campaign_id: c.id,
            campaign_name: c.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            platform: (c.ad_account as any).platform as string,
            daily_data: (statsByCampaign[c.id] ?? []).map((s) => ({
              date: s.date,
              cost: Number(s.cost),
              conversions: Number(s.conversions),
              conversion_value: Number(s.conversion_value),
              impressions: Number(s.impressions),
              clicks: Number(s.clicks),
              target_roas: c.target_roas ? Number(c.target_roas) : null,
              campaign_budget: c.daily_budget ? Number(c.daily_budget) : null,
            })),
          }))

        if (campaignInputs.length === 0) {
          throw new Error("No campaigns with sufficient data found")
        }

        // Calculate total budget if not provided
        const computedBudget =
          totalBudget ??
          campaigns.reduce((sum, c) => sum + (Number(c.daily_budget) || 0), 0)

        return {
          campaigns: campaignInputs,
          config: {
            total_budget: computedBudget,
            objective: objective ?? "conversion_value",
            dataset_length: 60,
            minimum_dates: 15,
            max_change_pct: 0.35,
            budget_min_pct: 0.10,
            budget_max_pct: 3.0,
            error_dist: "student" as const,
            sampling_method: tenantConfig.sampling_method as "MEDIAN" | "THOMPSON",
            harmonics: 2,
            trend_days: 15,
            lags: [1, 2, 7],
            exclude_dates: [],
          },
        }
      })

      // Update run with budget info
      await step.run("update-run-budget", async () => {
        await supabaseAdmin
          .from("optimization_runs")
          .update({
            total_budget: optimizeRequest.config.total_budget,
            campaigns_count: optimizeRequest.campaigns.length,
            date_range_start: optimizeRequest.campaigns[0]?.daily_data[0]?.date ?? null,
            date_range_end:
              optimizeRequest.campaigns[0]?.daily_data[
                optimizeRequest.campaigns[0].daily_data.length - 1
              ]?.date ?? null,
          })
          .eq("id", runId)
      })

      // Step 4: Call Python optimizer service
      const optimizeResponse = await step.run("call-optimizer-service", async () => {
        const response = await fetch(`${OPTIMIZER_URL}/optimize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(optimizeRequest),
          signal: AbortSignal.timeout(120_000), // 2 min timeout for MCMC
        })

        if (!response.ok) {
          const text = await response.text()
          throw new Error(`Optimizer service error ${response.status}: ${text}`)
        }

        return await response.json()
      })

      // Step 5: Store solutions + model parameters
      await step.run("store-solutions", async () => {
        if (optimizeResponse.status !== "success" || !optimizeResponse.solutions) {
          throw new Error(optimizeResponse.error ?? "Optimizer returned no solutions")
        }

        // Build a map of campaign_id → model parameters for enriching allocations
        const paramMap: Record<string, { w1: number; r_squared: number; method: string; confidence?: number }> = {}
        for (const p of optimizeResponse.parameters ?? []) {
          paramMap[p.campaign_id] = {
            w1: p.w1,
            r_squared: p.r_squared,
            method: p.method,
          }
        }

        for (const solution of optimizeResponse.solutions) {
          const totalExpectedVolume = solution.campaigns.reduce(
            (sum: number, c: { predicted_volume: number }) => sum + c.predicted_volume,
            0
          )
          const totalExpectedRoas =
            solution.total_budget > 0 ? totalExpectedVolume / solution.total_budget : null

          await supabaseAdmin.from("optimization_solutions").insert({
            run_id: runId,
            tenant_id: tenantId,
            strategy: solution.type,
            total_budget: solution.total_budget,
            expected_conversions: null,
            expected_conversion_value: totalExpectedVolume,
            expected_roas: totalExpectedRoas,
            allocations: solution.campaigns.map(
              (c: {
                campaign_id: string
                campaign_name: string
                platform: string
                current_daily_budget: number
                suggested_daily_budget: number
                delta_pct: number
                predicted_volume: number
                predicted_roas: number
              }) => {
                const params = paramMap[c.campaign_id]
                return {
                  campaign_id: c.campaign_id,
                  campaign_name: c.campaign_name,
                  platform: c.platform,
                  current_budget: c.current_daily_budget,
                  recommended_budget: c.suggested_daily_budget,
                  change_percent: c.delta_pct,
                  expected_conversions: c.predicted_volume,
                  expected_roas: c.predicted_roas,
                  elasticity: params?.w1,
                  r_squared: params?.r_squared,
                  fit_method: params?.method,
                }
              }
            ),
            is_applied: false,
          })
        }
      })

      // Step 6: Mark run as completed
      await step.run("complete-run", async () => {
        await supabaseAdmin
          .from("optimization_runs")
          .update({
            status: "completed",
            model_version: "1.0",
            completed_at: new Date().toISOString(),
          })
          .eq("id", runId)
      })

      return {
        runId,
        status: "completed",
        campaignsOptimized: optimizeResponse.model_metrics?.campaigns_modeled ?? 0,
        solutionsGenerated: optimizeResponse.solutions?.length ?? 0,
      }
    } catch (err) {
      // Mark run as failed
      await step.run("fail-run", async () => {
        await supabaseAdmin
          .from("optimization_runs")
          .update({
            status: "failed",
            error: err instanceof Error ? err.message : String(err),
            completed_at: new Date().toISOString(),
          })
          .eq("id", runId)
      })

      throw err
    }
  }
)
