import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface JobPayload {
  brand_id: string;
  run_id: string;
  confidence_report_ref: string;
  evidence_pack_ref: string;
  cycle_mode: '7d' | '14d' | '28d';
  synthesis_mode: 'insights' | 'tasks' | 'content' | 'all';
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Health check
    if (req.method === "GET") {
      return new Response(JSON.stringify({ status: "healthy", service: "strategic-synthesis-engine" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Pick next queued job
    const { data: job, error: jobError } = await supabase
      .from("gv_jobs")
      .select("*")
      .eq("job_type", "strategic_synthesis")
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

    // 3. Load evidence pack
    const { data: evidencePack, error: evidenceError } = await supabase
      .from("gv_artifacts")
      .select("*")
      .eq("id", payload.evidence_pack_ref)
      .eq("artifact_type", "perplexity_evidence_pack")
      .single();

    if (evidenceError || !evidencePack) {
      await failJob(supabase, job.id, "Evidence pack not found");
      return new Response(JSON.stringify({ error: "Missing evidence" }), { status: 200 });
    }

    // 4. Load confidence report
    const { data: confidenceReport, error: confidenceError } = await supabase
      .from("gv_artifacts")
      .select("*")
      .eq("id", payload.confidence_report_ref)
      .eq("artifact_type", "confidence_report")
      .single();

    if (confidenceError || !confidenceReport) {
      await failJob(supabase, job.id, "Confidence report not found");
      return new Response(JSON.stringify({ error: "Missing confidence" }), { status: 200 });
    }

    // 5. Build synthesis context
    const synthesisContext = {
      evidence: evidencePack.content.evidence_items || [],
      confidence_bounds: confidenceReport.content.pillar_confidence || {},
      confidence_gaps: confidenceReport.content.confidence_gaps || [],
      cycle_window: payload.cycle_mode,
    };

    // 6. Construct OpenAI prompt
    const systemPrompt = `You are the Strategic Synthesis Engine for GeoVera Brand Research OS.

ABSOLUTE RULES:
- Use ONLY the provided evidence (no external research)
- Respect confidence bounds (low confidence = explicit uncertainty)
- Maintain full evidence lineage (every claim traces to evidence)
- DO NOT invent facts or speculate beyond evidence
- DO NOT make strong recommendations when confidence < 0.5

Your inputs:
1. Evidence Pack (from Perplexity, validated)
2. Confidence Scores (from deterministic engine)
3. Cycle Mode: ${payload.cycle_mode}

Your outputs MUST include:
1. Strategic Insights (evidence-backed, confidence-tagged)
2. Prioritized Tasks (actionable, confidence-gated)
3. Authority Content (storytelling with audit trail)
4. Learning Note (subscription value proof)

EVIDENCE:
${JSON.stringify(synthesisContext.evidence, null, 2)}

CONFIDENCE BOUNDS:
${JSON.stringify(synthesisContext.confidence_bounds, null, 2)}

CONFIDENCE GAPS:
${JSON.stringify(synthesisContext.confidence_gaps, null, 2)}

SYNTHESIS MODE: ${payload.synthesis_mode}

Generate synthesis output as JSON with these exact fields:
{
  "strategic_insights": [
    {
      "insight_id": "string",
      "pillar": "visibility|discovery|authority|trust",
      "insight_text": "string",
      "evidence_refs": ["0", "1"],
      "confidence_level": number,
      "uncertainty_note": "string (if confidence < 0.7)",
      "business_impact": "high|medium|low",
      "recommendation": "string"
    }
  ],
  "prioritized_tasks": [
    {
      "task_id": "string",
      "title": "string",
      "description": "string",
      "priority": number,
      "pillar": "visibility|discovery|authority|trust",
      "confidence_required": number,
      "estimated_effort": "low|medium|high",
      "expected_outcome": "string",
      "evidence_basis": ["0", "1"]
    }
  ],
  "authority_content": [
    {
      "content_id": "string",
      "content_type": "blog_post|guide|faq|case_study",
      "title": "string",
      "body": "string",
      "pillar": "visibility|discovery|authority|trust",
      "evidence_trail": ["0", "1"],
      "confidence_disclosure": "string (if confidence < 0.8)",
      "target_audience": "string",
      "call_to_action": "string"
    }
  ],
  "learning_note": {
    "cycle_summary": "string",
    "market_movement": "string",
    "compounding_value": "string",
    "next_cycle_focus": "string"
  }
}

For insights with confidence < 0.7, ALWAYS include uncertainty_note.
For tasks requiring confidence > available, mark as "deferred pending evidence".
`;

    const openaiPayload = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: systemPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    };

    // 7. Call OpenAI API
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      await failJob(supabase, job.id, "OpenAI API key not configured");
      return new Response(JSON.stringify({ error: "API key missing" }), { status: 200 });
    }

    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify(openaiPayload),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      await failJob(supabase, job.id, `OpenAI API error: ${errorText}`);
      return new Response(JSON.stringify({ error: "API call failed" }), { status: 200 });
    }

    const openaiData = await openaiResponse.json();
    const rawSynthesis = JSON.parse(openaiData.choices[0].message.content);

    // 8. Validate synthesis structure
    if (!validateSynthesisStructure(rawSynthesis, payload.synthesis_mode)) {
      await failJob(supabase, job.id, "Synthesis structure validation failed");
      return new Response(JSON.stringify({ error: "Invalid synthesis structure" }), { status: 200 });
    }

    // 9. Enrich with metadata
    const synthesisReport = {
      cycle_mode: payload.cycle_mode,
      generated_at: new Date().toISOString(),
      ...rawSynthesis,
      synthesis_metadata: calculateMetadata(rawSynthesis, synthesisContext),
    };

    // 10. Store synthesis artifact
    const { data: artifact, error: artifactError } = await supabase
      .from("gv_artifacts")
      .insert({
        brand_id: payload.brand_id,
        run_id: payload.run_id,
        job_id: job.id,
        artifact_type: "synthesis_report",
        content: synthesisReport,
      })
      .select()
      .single();

    if (artifactError) {
      await failJob(supabase, job.id, `Failed to store artifact: ${artifactError.message}`);
      return new Response(JSON.stringify({ error: "Storage failed" }), { status: 200 });
    }

    // 11. Mark job as completed
    await supabase
      .from("gv_jobs")
      .update({
        status: "completed",
        result: {
          artifact_id: artifact.id,
          summary: {
            insights: rawSynthesis.strategic_insights?.length || 0,
            tasks: rawSynthesis.prioritized_tasks?.length || 0,
            content: rawSynthesis.authority_content?.length || 0,
          },
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return new Response(
      JSON.stringify({
        success: true,
        artifact_id: artifact.id,
        summary: synthesisReport.synthesis_metadata,
      }),
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

function validateSynthesisStructure(synthesis: any, mode: string): boolean {
  const hasInsights = synthesis.strategic_insights && Array.isArray(synthesis.strategic_insights);
  const hasTasks = synthesis.prioritized_tasks && Array.isArray(synthesis.prioritized_tasks);
  const hasContent = synthesis.authority_content && Array.isArray(synthesis.authority_content);
  const hasLearningNote = synthesis.learning_note && typeof synthesis.learning_note === 'object';

  if (mode === 'all') {
    return hasInsights && hasTasks && hasContent && hasLearningNote;
  }
  if (mode === 'insights') return hasInsights;
  if (mode === 'tasks') return hasTasks;
  if (mode === 'content') return hasContent;
  return false;
}

function calculateMetadata(synthesis: any, context: any): any {
  const totalInsights = synthesis.strategic_insights?.length || 0;
  const highConfidenceInsights = (synthesis.strategic_insights || []).filter(
    (i: any) => i.confidence_level >= 0.7
  ).length;

  const avgConfidence =
    Object.values(context.confidence_bounds).reduce((sum: number, val: any) => sum + val, 0) / 4;

  const evidenceRefs = new Set();
  for (const insight of synthesis.strategic_insights || []) {
    for (const ref of insight.evidence_refs || []) {
      evidenceRefs.add(ref);
    }
  }
  const evidenceCoverage = evidenceRefs.size / (context.evidence.length || 1);

  return {
    total_insights: totalInsights,
    high_confidence_insights: highConfidenceInsights,
    total_tasks: synthesis.prioritized_tasks?.length || 0,
    total_content_pieces: synthesis.authority_content?.length || 0,
    avg_confidence_score: avgConfidence,
    evidence_coverage: evidenceCoverage,
  };
}

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