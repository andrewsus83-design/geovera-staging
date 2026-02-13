import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type',
  'Content-Type': 'application/json'
};

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ─── Supabase helpers ───
async function sbQuery(query: string) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return r;
}

async function sbGet(table: string, select = '*', filter = '') {
  const url = `${SB_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}${filter ? '&' + filter : ''}`;
  const r = await fetch(url, { headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` } });
  return r.json();
}

async function sbInsert(table: string, data: any) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify(data)
  });
  return r.json();
}

async function sbUpdate(table: string, data: any, filter: string) {
  await fetch(`${SB_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// ─── OpenAI call ───
async function callOpenAI(systemPrompt: string, userPrompt: string, model = 'gpt-4o') {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) throw new Error('OPENAI_API_KEY not set. Run: supabase secrets set OPENAI_API_KEY=sk-...');
  
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
  });
  
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`OpenAI ${r.status}: ${err.substring(0, 500)}`);
  }
  
  const data = await r.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  const usage = data.usage || {};
  const cost = ((usage.prompt_tokens || 0) * 2.5 / 1e6) + ((usage.completion_tokens || 0) * 10 / 1e6);
  
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
  
  return { result: parsed, tokens: usage, cost: Math.round(cost * 10000) / 10000 };
}

// ─── STAGE 1: CODE — Gather all pipeline data ───
async function stageCode(runId: string, brandId: string) {
  const f = `run_id=eq.${runId}`;

  const [pillars, insights, tasks, playbook, confidence, foundation, assets, learning, timeline, signals] = await Promise.all([
    sbGet('gv_pillar_scores', 'pillar,score,confidence,score_breakdown', `brand_id=eq.${brandId}&${f}`),
    sbGet('gv_insights', 'pillar,severity,confidence,title,summary,insight_body', `brand_id=eq.${brandId}&${f}`),
    sbGet('gv_tasks', 'title,priority,category,priority_score,urgency_score,owner_type,description,due_window', `brand_id=eq.${brandId}&${f}&order=priority_score.desc`),
    sbGet('gv_playbook_actions', 'action_name,pillar,time_horizon,confidence_level,effort,rationale,validation_metric,kill_criteria,sequence_order', `brand_id=eq.${brandId}&${f}&order=sequence_order`),
    sbGet('gv_confidence_scores', '*', `brand_id=eq.${brandId}&${f}`),
    sbGet('gv_foundation_validations', '*', `brand_id=eq.${brandId}&${f}`),
    sbGet('gv_authority_assets', 'title,asset_type,status,confidence,summary,content_body', `brand_id=eq.${brandId}&${f}`),
    sbGet('gv_learning_notes', 'status,what_changed,what_learned,uncertainties', `brand_id=eq.${brandId}&${f}`),
    sbGet('gv_timelines', 'cards', `brand_id=eq.${brandId}&${f}`),
    sbGet('gv_signal_layer_registry', 'data_point_name,signal_layer,impact_level,change_rate,check_frequency,eligible_for_perplexity', '')
  ]);
  
  return {
    stage: 'code',
    status: 'completed',
    data: { pillars, insights, tasks, playbook, confidence: confidence?.[0], foundation: foundation?.[0], assets, learning: learning?.[0], timeline: timeline?.[0], signals },
    counts: {
      pillar_scores: pillars?.length || 0,
      insights: insights?.length || 0,
      tasks: tasks?.length || 0,
      playbook_actions: playbook?.length || 0,
      authority_assets: assets?.length || 0,
      signal_registry: signals?.length || 0
    }
  };
}

// ─── STAGE 2: REVIEW — OpenAI reviews all data ───
async function stageReview(codeOutput: any) {
  const systemPrompt = `You are a senior data quality auditor for GeoVera, an AI-powered brand intelligence platform.
Your job is to review Phase 3.5 pipeline output and assess:
1. DATA COMPLETENESS: Are all required tables populated? Any missing fields?
2. DATA CONSISTENCY: Do scores/metrics align logically? Any contradictions?
3. STRATEGIC COHERENCE: Do insights → tasks → playbook actions flow logically?
4. CONFIDENCE CALIBRATION: Are confidence scores justified by evidence?
5. RISK ASSESSMENT: What could go wrong with this strategy?
6. PRIORITY VALIDATION: Is the Eisenhower matrix (DO_FIRST/PLAN_IT/DELEGATE/DEFER) correctly applied?
7. EVIDENCE QUALITY: Is evidence sufficient for the claims made?

Return JSON with this exact structure:
{
  "overall_grade": "A/B/C/D/F",
  "overall_score": 0-100,
  "data_completeness": { "score": 0-100, "missing": [], "notes": "" },
  "data_consistency": { "score": 0-100, "issues": [], "notes": "" },
  "strategic_coherence": { "score": 0-100, "gaps": [], "strengths": [], "notes": "" },
  "confidence_calibration": { "score": 0-100, "over_confident": [], "under_confident": [], "notes": "" },
  "risk_assessment": { "high_risks": [], "medium_risks": [], "mitigations": [] },
  "priority_validation": { "score": 0-100, "corrections": [], "notes": "" },
  "evidence_quality": { "score": 0-100, "weak_claims": [], "strong_claims": [], "notes": "" },
  "recommendations": [{ "priority": "critical/high/medium/low", "action": "", "rationale": "" }],
  "executive_summary": ""
}`;
  
  const userPrompt = `Review this GeoVera Phase 3.5 pipeline output:\n\n${JSON.stringify(codeOutput.data, null, 2)}`;
  
  const { result, tokens, cost } = await callOpenAI(systemPrompt, userPrompt);
  
  return {
    stage: 'review',
    status: 'completed',
    reviewer: 'openai-gpt-4o',
    review: result,
    cost,
    tokens
  };
}

// ─── STAGE 3: TEST REAL DATA — Validate against actual DB ───
async function stageTestRealData(runId: string, brandId: string) {
  const tests: any[] = [];
  
  // Test 1: Pillar scores exist and are in range
  const pillars = await sbGet('gv_pillar_scores', 'pillar,score,confidence', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  const allPillars = ['visibility', 'discovery', 'trust', 'revenue'];
  const foundPillars = (pillars || []).map((p: any) => p.pillar);
  tests.push({
    test: 'T1_PILLAR_SCORES_EXIST',
    passed: allPillars.every((p: string) => foundPillars.includes(p)),
    expected: '4 pillars (V,D,T,R)',
    actual: `${foundPillars.length} pillars: ${foundPillars.join(', ')}`,
    details: pillars
  });
  
  // Test 2: Pillar scores in valid range
  const scoresValid = (pillars || []).every((p: any) => p.score >= 0 && p.score <= 100 && p.confidence >= 0 && p.confidence <= 1);
  tests.push({
    test: 'T2_PILLAR_SCORES_VALID_RANGE',
    passed: scoresValid,
    expected: 'score 0-100, confidence 0-1',
    actual: (pillars || []).map((p: any) => `${p.pillar}: ${p.score} (${p.confidence})`).join(', ')
  });
  
  // Test 3: Insights have required fields
  const insights = await sbGet('gv_insights', 'id,pillar,severity,confidence,title,summary,insight_body,status', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  const insightsValid = (insights || []).every((i: any) => i.title && i.summary && i.insight_body && i.pillar && i.severity);
  tests.push({
    test: 'T3_INSIGHTS_COMPLETE',
    passed: insightsValid && (insights || []).length >= 3,
    expected: '>=3 insights with all fields populated',
    actual: `${(insights || []).length} insights, all_fields_ok: ${insightsValid}`
  });
  
  // Test 4: Tasks have priority scores and categories
  const tasks = await sbGet('gv_tasks', 'id,title,priority_score,category,impact,risk,effort', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  const tasksValid = (tasks || []).every((t: any) => t.priority_score !== null && t.category !== null);
  tests.push({
    test: 'T4_TASKS_PRIORITIZED',
    passed: tasksValid && (tasks || []).length >= 4,
    expected: '>=4 tasks with priority_score and category',
    actual: `${(tasks || []).length} tasks, all_scored: ${tasksValid}`
  });
  
  // Test 5: Eisenhower matrix distribution
  const categories = (tasks || []).reduce((acc: any, t: any) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {});
  const hasDistribution = Object.keys(categories).length >= 3;
  tests.push({
    test: 'T5_EISENHOWER_DISTRIBUTION',
    passed: hasDistribution,
    expected: '>=3 different categories',
    actual: JSON.stringify(categories)
  });
  
  // Test 6: Foundation gate passed
  const gates = await sbGet('gv_foundation_validations', 'validation_status,gates_passed,gates_failed,can_proceed_to_ai', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  tests.push({
    test: 'T6_FOUNDATION_GATE_PASS',
    passed: gates?.[0]?.validation_status === 'PASS' && gates?.[0]?.can_proceed_to_ai === true,
    expected: 'PASS with can_proceed_to_ai=true',
    actual: `status=${gates?.[0]?.validation_status}, gates=${gates?.[0]?.gates_passed}/${(gates?.[0]?.gates_passed||0)+(gates?.[0]?.gates_failed||0)}`
  });
  
  // Test 7: Confidence score >= 0.7 (threshold)
  const conf = await sbGet('gv_confidence_scores', 'adjusted_confidence_score,confidence_grade', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  tests.push({
    test: 'T7_CONFIDENCE_THRESHOLD',
    passed: conf?.[0]?.adjusted_confidence_score >= 0.7,
    expected: 'adjusted_confidence >= 0.70',
    actual: `${conf?.[0]?.adjusted_confidence_score} (${conf?.[0]?.confidence_grade})`
  });
  
  // Test 8: Playbook actions have kill criteria
  const playbook = await sbGet('gv_playbook_actions', 'action_name,kill_criteria,validation_metric', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  const pbValid = (playbook || []).every((p: any) => p.kill_criteria && p.validation_metric);
  tests.push({
    test: 'T8_PLAYBOOK_KILL_CRITERIA',
    passed: pbValid && (playbook || []).length >= 3,
    expected: 'All actions have kill_criteria + validation_metric',
    actual: `${(playbook || []).length} actions, all_have_criteria: ${pbValid}`
  });
  
  // Test 9: Authority assets ready
  const assets = await sbGet('gv_authority_assets', 'title,status,confidence', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  const readyAssets = (assets || []).filter((a: any) => a.status === 'ready');
  tests.push({
    test: 'T9_AUTHORITY_ASSETS_READY',
    passed: readyAssets.length >= 2,
    expected: '>=2 assets with status=ready',
    actual: `${readyAssets.length}/${(assets || []).length} ready`
  });
  
  // Test 10: Learning note finalized
  const notes = await sbGet('gv_learning_notes', 'status,what_changed,what_learned,uncertainties', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  tests.push({
    test: 'T10_LEARNING_NOTE_FINAL',
    passed: notes?.[0]?.status === 'final' && notes?.[0]?.what_learned !== null,
    expected: 'status=final with learnings populated',
    actual: `status=${notes?.[0]?.status}, has_learnings=${notes?.[0]?.what_learned !== null}`
  });
  
  // Test 11: Timeline has cards
  const timeline = await sbGet('gv_timelines', 'cards', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  const cards = timeline?.[0]?.cards || [];
  tests.push({
    test: 'T11_TIMELINE_CARDS',
    passed: cards.length >= 4,
    expected: '>=4 timeline cards',
    actual: `${cards.length} cards`
  });
  
  // Test 12: Review queue has items
  const queue = await sbGet('gv_review_queue', 'artifact_type,review_status,priority', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  tests.push({
    test: 'T12_REVIEW_QUEUE_POPULATED',
    passed: (queue || []).length >= 5,
    expected: '>=5 items in review queue',
    actual: `${(queue || []).length} items`
  });
  
  // Test 13: Strategic synthesis completed
  const synth = await sbGet('gv_strategic_synthesis', 'status,insights_generated,tasks_generated,assets_generated,confidence_threshold_met', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  tests.push({
    test: 'T13_SYNTHESIS_COMPLETED',
    passed: synth?.[0]?.status === 'completed' && synth?.[0]?.confidence_threshold_met === true,
    expected: 'status=completed, threshold_met=true',
    actual: `status=${synth?.[0]?.status}, threshold=${synth?.[0]?.confidence_threshold_met}`
  });
  
  // Test 14: Evidence pack validated
  const packs = await sbGet('gv_perplexity_payloads', 'payload_status,layer2_count,avg_dqs_layer2', `brand_id=eq.${brandId}&run_id=eq.${runId}`);
  tests.push({
    test: 'T14_EVIDENCE_PACK_VALIDATED',
    passed: packs?.[0]?.payload_status === 'validated' && packs?.[0]?.layer2_count >= 2,
    expected: 'payload_status=validated, layer2_count>=2',
    actual: `status=${packs?.[0]?.payload_status}, L2=${packs?.[0]?.layer2_count}`
  });
  
  // Test 15: Signal registry coverage
  const registry = await sbGet('gv_signal_layer_registry', 'signal_layer', '');
  const regLayers = (registry || []).reduce((acc: any, s: any) => { acc[`L${s.signal_layer}`] = (acc[`L${s.signal_layer}`] || 0) + 1; return acc; }, {});
  tests.push({
    test: 'T15_SIGNAL_REGISTRY_COVERAGE',
    passed: Object.keys(regLayers).length === 4 && (registry || []).length >= 20,
    expected: 'All 4 layers covered, >=20 data points',
    actual: `${(registry || []).length} points: ${JSON.stringify(regLayers)}`
  });
  
  const passed = tests.filter(t => t.passed).length;
  const failed = tests.filter(t => !t.passed).length;
  
  return {
    stage: 'test_real_data',
    status: failed === 0 ? 'all_passed' : 'has_failures',
    total: tests.length,
    passed,
    failed,
    pass_rate: `${Math.round(passed / tests.length * 100)}%`,
    tests
  };
}

// ─── STAGE 4: SUMMARY REPORT — OpenAI generates executive report ───
async function stageSummaryReport(codeOutput: any, reviewOutput: any, testOutput: any) {
  const systemPrompt = `You are a GeoVera executive report writer. Generate a comprehensive Phase 3.5 Pipeline Summary Report.
Return JSON with:
{
  "report_title": "",
  "generated_at": "",
  "executive_summary": "3-4 paragraphs",
  "pipeline_stages": [
    { "stage": "", "status": "", "key_findings": "" }
  ],
  "data_health": {
    "overall_score": 0-100,
    "completeness": 0-100,
    "consistency": 0-100,
    "test_pass_rate": ""
  },
  "strategic_overview": {
    "current_position": "",
    "critical_gaps": [],
    "top_opportunities": [],
    "immediate_actions": []
  },
  "risk_matrix": [
    { "risk": "", "probability": "high/medium/low", "impact": "high/medium/low", "mitigation": "" }
  ],
  "kpi_dashboard": [
    { "metric": "", "current": "", "target": "", "gap": "", "trend": "up/down/flat" }
  ],
  "next_cycle_priorities": [],
  "budget_estimate": { "api_costs": "", "content_creation": "", "total_monthly": "" },
  "confidence_statement": ""
}`;
  
  const userPrompt = `Generate executive summary report for GeoVera Phase 3.5:\n\nSTAGE 1 - CODE OUTPUT:\nCounts: ${JSON.stringify(codeOutput.counts)}\nPillars: ${JSON.stringify(codeOutput.data.pillars)}\nInsights: ${JSON.stringify(codeOutput.data.insights)}\nTasks: ${JSON.stringify(codeOutput.data.tasks)}\n\nSTAGE 2 - REVIEW (by OpenAI):\nGrade: ${reviewOutput.review?.overall_grade || 'N/A'}\nScore: ${reviewOutput.review?.overall_score || 'N/A'}\nSummary: ${reviewOutput.review?.executive_summary || 'N/A'}\nRecommendations: ${JSON.stringify(reviewOutput.review?.recommendations || [])}\n\nSTAGE 3 - TEST RESULTS:\nPass Rate: ${testOutput.pass_rate}\nPassed: ${testOutput.passed}/${testOutput.total}\nFailed Tests: ${JSON.stringify(testOutput.tests?.filter((t: any) => !t.passed).map((t: any) => t.test) || [])}`;
  
  const { result, tokens, cost } = await callOpenAI(systemPrompt, userPrompt);
  
  return {
    stage: 'summary_report',
    status: 'completed',
    report: result,
    cost,
    tokens
  };
}

// ─── MAIN HANDLER ───
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS });
  
  const startTime = Date.now();
  
  try {
    const body = await req.json().catch(() => ({}));
    const { action = 'run', run_id, brand_id } = body;
    
    if (action === 'health') {
      return new Response(JSON.stringify({
        ok: true,
        version: '1.0',
        openai_key: !!Deno.env.get('OPENAI_API_KEY'),
        stages: ['code', 'review', 'test_real_data', 'summary_report']
      }), { headers: CORS });
    }
    
    if (action === 'run') {
      // Validate required parameters
      if (!run_id) {
        return new Response(JSON.stringify({ error: 'run_id is required' }), {
          status: 400,
          headers: CORS
        });
      }
      if (!brand_id) {
        return new Response(JSON.stringify({ error: 'brand_id is required' }), {
          status: 400,
          headers: CORS
        });
      }

      console.log('[PIPELINE] Starting 4-stage pipeline...');
      console.log(`[PIPELINE] Brand ID: ${brand_id}, Run ID: ${run_id}`);

      // ── Stage 1: Code ──
      console.log('[STAGE 1/4] Code - Gathering data...');
      const codeResult = await stageCode(run_id, brand_id);
      console.log(`[STAGE 1/4] Done. Counts: ${JSON.stringify(codeResult.counts)}`);

      // ── Stage 2: Review (OpenAI) ──
      console.log('[STAGE 2/4] Review - Calling OpenAI GPT-4o...');
      const reviewResult = await stageReview(codeResult);
      console.log(`[STAGE 2/4] Done. Grade: ${reviewResult.review?.overall_grade}, Cost: $${reviewResult.cost}`);

      // ── Stage 3: Test Real Data ──
      console.log('[STAGE 3/4] Test Real Data - Running 15 tests...');
      const testResult = await stageTestRealData(run_id, brand_id);
      console.log(`[STAGE 3/4] Done. ${testResult.passed}/${testResult.total} passed (${testResult.pass_rate})`);

      // ── Stage 4: Summary Report (OpenAI) ──
      console.log('[STAGE 4/4] Summary Report - Generating via OpenAI...');
      const reportResult = await stageSummaryReport(codeResult, reviewResult, testResult);
      console.log(`[STAGE 4/4] Done. Cost: $${reportResult.cost}`);
      
      const totalTime = (Date.now() - startTime) / 1000;
      const totalCost = (reviewResult.cost || 0) + (reportResult.cost || 0);
      
      // Log to execution log
      await sbInsert('phase35_execution_log', {
        action: 'pipeline',
        task_id: 'PIPELINE',
        task_name: 'Code-Review-Test-Report',
        status: 'completed',
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: totalTime,
        cost_usd: totalCost,
        metadata: {
          run_id,
          review_grade: reviewResult.review?.overall_grade,
          review_score: reviewResult.review?.overall_score,
          test_pass_rate: testResult.pass_rate,
          tests_passed: testResult.passed,
          tests_total: testResult.total
        }
      });
      
      const response = {
        pipeline: 'GeoVera Phase 3.5 Pipeline',
        run_id,
        total_time_seconds: Math.round(totalTime * 10) / 10,
        total_cost_usd: Math.round(totalCost * 10000) / 10000,
        stages: {
          '1_code': {
            status: codeResult.status,
            counts: codeResult.counts
          },
          '2_review': {
            status: reviewResult.status,
            reviewer: reviewResult.reviewer,
            grade: reviewResult.review?.overall_grade,
            score: reviewResult.review?.overall_score,
            cost: reviewResult.cost,
            data_completeness: reviewResult.review?.data_completeness,
            strategic_coherence: reviewResult.review?.strategic_coherence,
            risk_assessment: reviewResult.review?.risk_assessment,
            recommendations: reviewResult.review?.recommendations,
            executive_summary: reviewResult.review?.executive_summary
          },
          '3_test': {
            status: testResult.status,
            pass_rate: testResult.pass_rate,
            passed: testResult.passed,
            failed: testResult.failed,
            total: testResult.total,
            tests: testResult.tests
          },
          '4_report': {
            status: reportResult.status,
            cost: reportResult.cost,
            report: reportResult.report
          }
        }
      };
      
      return new Response(JSON.stringify(response, null, 2), { headers: CORS });
    }
    
    throw new Error(`Unknown action: ${action}. Use: health | run`);
    
  } catch (e: any) {
    console.error('[PIPELINE ERROR]', e.message);
    return new Response(JSON.stringify({
      error: e.message,
      hint: 'Set OPENAI_API_KEY: supabase secrets set OPENAI_API_KEY=sk-...',
      elapsed: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
    }), { status: 500, headers: CORS });
  }
});
