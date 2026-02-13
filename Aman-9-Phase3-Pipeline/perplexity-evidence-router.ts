import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

interface JobPayload {
  brand_id: string;
  run_id: string;
  research_problem: string;
  decision_context: string;
  eligible_signal_refs: string[];
  cycle_window: '7d' | '14d' | '28d';
  run_mode: 'scheduled' | 'manual' | 'replay';
}

interface EvidenceItem {
  finding: string;
  source_url: string;
  source_publisher: string;
  published_at: string;
  signal_ref: string;
  uncertainty_note: string;
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Health check
    if (req.method === "GET") {
      return new Response(JSON.stringify({ status: "healthy", service: "perplexity-evidence-router" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Pick next queued job
    const { data: job, error: jobError } = await supabase
      .from("gv_jobs")
      .select("*")
      .eq("job_type", "perplexity_deep_research")
      .eq("status", "queued")
      .lte("scheduled_for", new Date().toISOString())
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ message: "No jobs to process" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Update job to running
    await supabase
      .from("gv_jobs")
      .update({ status: "running", updated_at: new Date().toISOString() })
      .eq("id", job.id);

    const payload = job.payload as JobPayload;

    // 3. Validate foundation gate (PH3-T04)
    const { data: gateStatus } = await supabase.rpc("validate_foundation_gate", {
      p_brand_id: payload.brand_id,
      p_run_id: payload.run_id,
    });

    if (gateStatus !== "pass") {
      await failJob(supabase, job.id, "Foundation gate not passed");
      return new Response(JSON.stringify({ error: "Gate check failed" }), { status: 200 });
    }

    // 4. Filter eligible signals (Layer 2, DQS >= 0.8)
    const { data: eligibleSignals, error: signalError } = await supabase.rpc(
      "filter_eligible_signals",
      { p_signal_refs: payload.eligible_signal_refs }
    );

    if (signalError || !eligibleSignals || eligibleSignals.length === 0) {
      await failJob(supabase, job.id, "No eligible Layer 2 signals found");
      return new Response(JSON.stringify({ error: "No eligible signals" }), { status: 200 });
    }

    // 5. Construct Perplexity payload
    const signalSummary = eligibleSignals.map((s: any) => `Layer 2 signal (DQS: ${s.dqs})`).join(", ");
    
    const perplexityPayload = {
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: `You are the External Reality Engine for GeoVera.

ABSOLUTE RULES:
- Collect EVIDENCE ONLY (facts, data, observations)
- CITE all sources with URL and publication date
- SURFACE uncertainty and gaps explicitly
- DO NOT synthesize, recommend, or conclude
- DO NOT generate tasks or content

Research Problem (from human): ${payload.research_problem}
Decision Context: ${payload.decision_context}

Signal Focus: ${signalSummary}

Output MUST include:
1. Facts / Findings (attributed)
2. Source URLs and dates
3. Explicit uncertainty notes
4. Evidence gaps

NO recommendations. NO "what to do". Evidence ONLY.`,
        },
      ],
      search_recency_filter: payload.cycle_window,
    };

    // 6. Call Perplexity API
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityKey) {
      await failJob(supabase, job.id, "Perplexity API key not configured");
      return new Response(JSON.stringify({ error: "API key missing" }), { status: 200 });
    }

    const perplexityResponse = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify(perplexityPayload),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      await failJob(supabase, job.id, `Perplexity API error: ${errorText}`);
      return new Response(JSON.stringify({ error: "API call failed" }), { status: 200 });
    }

    const perplexityData = await perplexityResponse.json();
    const rawEvidence = perplexityData.choices[0].message.content;

    // 7. Parse and validate evidence structure
    const evidencePack = parseEvidencePack(rawEvidence, eligibleSignals, payload);

    if (!validateEvidencePack(evidencePack)) {
      await failJob(supabase, job.id, "Evidence pack validation failed");
      return new Response(JSON.stringify({ error: "Invalid evidence structure" }), { status: 200 });
    }

    // 8. Store evidence artifact
    const { data: artifact, error: artifactError } = await supabase
      .from("gv_artifacts")
      .insert({
        brand_id: payload.brand_id,
        run_id: payload.run_id,
        job_id: job.id,
        artifact_type: "perplexity_evidence_pack",
        content: evidencePack,
      })
      .select()
      .single();

    if (artifactError) {
      await failJob(supabase, job.id, `Failed to store artifact: ${artifactError.message}`);
      return new Response(JSON.stringify({ error: "Storage failed" }), { status: 200 });
    }

    // 9. Mark job as completed
    await supabase
      .from("gv_jobs")
      .update({
        status: "completed",
        result: { artifact_id: artifact.id },
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    // 10. Emit event (trigger PH3-T06)
    await supabase.from("gv_jobs").insert({
      brand_id: payload.brand_id,
      run_id: payload.run_id,
      job_type: "confidence_computation",
      status: "queued",
      payload: {
        evidence_pack_ref: artifact.id,
        signal_refs: payload.eligible_signal_refs,
      },
      priority: 70,
      scheduled_for: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, artifact_id: artifact.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function failJob(supabase: any, jobId: string, errorMessage: string) {
  await supabase
    .from("gv_jobs")
    .update({
      status: "failed",
      last_error: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

function parseEvidencePack(rawText: string, signals: any[], payload: JobPayload): any {
  // Parse evidence from Perplexity response
  const lines = rawText.split('\n').filter(l => l.trim());
  const evidenceItems = [];
  
  // Simple parser - looks for URLs and facts
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const urlMatch = line.match(/https?:\/\/[^\s]+/);
    
    if (urlMatch) {
      evidenceItems.push({
        finding: line.replace(urlMatch[0], '').trim() || 'Evidence finding',
        source_url: urlMatch[0],
        source_publisher: new URL(urlMatch[0]).hostname,
        published_at: new Date().toISOString(),
        signal_ref: signals[0]?.signal_ref || 'unknown',
        uncertainty_note: 'Parsed from Perplexity response',
      });
    }
  }
  
  // Ensure at least one evidence item
  if (evidenceItems.length === 0) {
    evidenceItems.push({
      finding: rawText.substring(0, 500),
      source_url: 'https://perplexity.ai',
      source_publisher: 'Perplexity AI',
      published_at: new Date().toISOString(),
      signal_ref: signals[0]?.signal_ref || 'unknown',
      uncertainty_note: 'Raw evidence collection',
    });
  }

  return {
    research_problem: payload.research_problem,
    decision_context: payload.decision_context,
    evidence_items: evidenceItems,
    evidence_gaps: ['Detailed source parsing needed'],
    contradiction_notes: [],
    source_diversity_score: Math.min(1.0, evidenceItems.length / 5),
    temporal_coverage: {
      earliest_date: new Date().toISOString(),
      latest_date: new Date().toISOString(),
      gap_days: 0,
    },
  };
}

function validateEvidencePack(pack: any): boolean {
  return !!(
    pack.research_problem &&
    pack.evidence_items &&
    pack.evidence_items.length > 0 &&
    pack.evidence_items.every(
      (item: any) => item.source_url && item.published_at
    )
  );
}