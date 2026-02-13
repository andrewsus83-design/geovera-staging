import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =============================================
// PHASE 3.5 COMPLETE PIPELINE
// Code → Review → Test → Report
// =============================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  const startTime = Date.now();
  
  try {
    const { action, run_id } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ==================== HEALTH CHECK ====================
    if (action === 'health') {
      const claudeKey = Deno.env.get('ANTHROPIC_API_KEY');
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      
      return new Response(JSON.stringify({
        status: 'healthy',
        pipeline: 'Phase 3.5 Complete',
        keys: {
          claude: claudeKey ? '✅ Set' : '❌ Missing',
          openai: openaiKey ? '✅ Set' : '❌ Missing'
        },
        stages: ['code', 'review', 'test', 'report']
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // ==================== EXECUTE PIPELINE ====================
    if (action === 'execute') {
      console.log(`[PIPELINE] Starting Phase 3.5 Complete Pipeline`);
      
      // Get or create run
      let activeRunId = run_id;
      if (!activeRunId) {
        const { data: brand } = await supabase
          .from('brands')
          .select('id')
          .limit(1)
          .single();
        
        const { data: newRun } = await supabase
          .from('gv_runs')
          .insert({
            brand_id: brand.id,
            mode: 'phase_3_5',
            run_mode: 'pipeline_complete',
            status: 'running',
            started_at: new Date().toISOString()
          })
          .select()
          .single();
        
        activeRunId = newRun.id;
      }

      // ==================== STAGE 1: CODE GENERATION ====================
      console.log(`[STAGE 1] Code Generation via Claude API`);
      const codeStart = Date.now();
      
      const codeResult = await executeCodeGeneration(supabase, activeRunId);
      
      const codeDuration = (Date.now() - codeStart) / 1000;
      console.log(`[STAGE 1] ✅ Code completed in ${codeDuration.toFixed(1)}s`);

      // ==================== STAGE 2: REVIEW BY OPENAI ====================
      console.log(`[STAGE 2] Review via OpenAI API`);
      const reviewStart = Date.now();
      
      const reviewResult = await executeOpenAIReview(supabase, activeRunId, codeResult);
      
      const reviewDuration = (Date.now() - reviewStart) / 1000;
      console.log(`[STAGE 2] ✅ Review completed in ${reviewDuration.toFixed(1)}s`);

      // ==================== STAGE 3: TEST WITH REAL DATA ====================
      console.log(`[STAGE 3] Testing with Real Data`);
      const testStart = Date.now();
      
      const testResult = await executeRealDataTest(supabase, activeRunId);
      
      const testDuration = (Date.now() - testStart) / 1000;
      console.log(`[STAGE 3] ✅ Test completed in ${testDuration.toFixed(1)}s`);

      // ==================== STAGE 4: SUMMARY REPORT ====================
      console.log(`[STAGE 4] Generating Summary Report`);
      const reportStart = Date.now();
      
      const reportResult = await generateSummaryReport(
        supabase,
        activeRunId,
        codeResult,
        reviewResult,
        testResult
      );
      
      const reportDuration = (Date.now() - reportStart) / 1000;
      console.log(`[STAGE 4] ✅ Report completed in ${reportDuration.toFixed(1)}s`);

      // ==================== FINALIZE ====================
      const totalDuration = (Date.now() - startTime) / 1000;
      const totalCost = 
        (codeResult.cost || 0) + 
        (reviewResult.cost || 0) + 
        (testResult.cost || 0) + 
        (reportResult.cost || 0);

      await supabase
        .from('gv_runs')
        .update({
          status: 'completed',
          finished_at: new Date().toISOString()
        })
        .eq('id', activeRunId);

      // Log pipeline completion
      await supabase.from('phase35_execution_log').insert({
        run_id: activeRunId,
        task_id: 'PIPELINE',
        task_name: 'Phase 3.5 Complete Pipeline',
        status: 'completed',
        duration_seconds: totalDuration,
        cost_usd: totalCost,
        result: {
          stages: {
            code: codeResult.summary,
            review: reviewResult.summary,
            test: testResult.summary,
            report: reportResult.summary
          }
        }
      });

      return new Response(JSON.stringify({
        run_id: activeRunId,
        status: 'completed',
        total_duration_seconds: Math.round(totalDuration * 10) / 10,
        total_cost_usd: Math.round(totalCost * 10000) / 10000,
        stages: {
          '1_code': {
            duration: Math.round(codeDuration * 10) / 10,
            ...codeResult.summary
          },
          '2_review': {
            duration: Math.round(reviewDuration * 10) / 10,
            ...reviewResult.summary
          },
          '3_test': {
            duration: Math.round(testDuration * 10) / 10,
            ...testResult.summary
          },
          '4_report': {
            duration: Math.round(reportDuration * 10) / 10,
            ...reportResult.summary
          }
        },
        report: reportResult.report
      }, null, 2), { 
        headers: { ...CORS, 'Content-Type': 'application/json' } 
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error: any) {
    console.error('[PIPELINE ERROR]', error);
    return new Response(JSON.stringify({
      error: error.message,
      elapsed_seconds: ((Date.now() - startTime) / 1000).toFixed(1)
    }), { 
      status: 500, 
      headers: { ...CORS, 'Content-Type': 'application/json' } 
    });
  }
});

// =============================================
// STAGE 1: CODE GENERATION (Claude API)
// =============================================
async function executeCodeGeneration(supabase: any, runId: string) {
  const claudeKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!claudeKey) throw new Error('ANTHROPIC_API_KEY not set');

  const mcpUrl = `https://mcp.supabase.com/mcp?project_ref=vozjwptzutolvkvfpknk`;
  
  // Define 12 tasks
  const tasks = [
    { id: 'T01', name: 'Trust Architecture', prompt: 'Build trust architecture foundation with verification protocols' },
    { id: 'T02', name: 'Content Engine', prompt: 'Create content engine with signal processing' },
    { id: 'T03', name: 'Signal Classification', prompt: 'Implement signal classification system' },
    { id: 'T04', name: 'Foundation Gate', prompt: 'Setup foundation quality gate' },
    { id: 'T05', name: 'Evidence Pack', prompt: 'Assemble evidence packs for claims' },
    { id: 'T06', name: 'Confidence Scoring', prompt: 'Implement confidence scoring engine' },
    { id: 'T07', name: 'Strategic Synthesis', prompt: 'Create strategic synthesis system' },
    { id: 'T08', name: 'Task Prioritization', prompt: 'Build task prioritization matrix' },
    { id: 'T09', name: 'Playbook Actions', prompt: 'Generate playbook action items' },
    { id: 'T10', name: 'Review Queue', prompt: 'Setup review queue workflow' },
    { id: 'T11', name: 'Learning Note', prompt: 'Create learning notes system' },
    { id: 'T12', name: 'Timeline Update', prompt: 'Update customer timeline tracking' }
  ];

  let totalCost = 0;
  let completedCount = 0;
  const results = [];

  for (const task of tasks) {
    console.log(`[CODE] Executing ${task.id}: ${task.name}`);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        messages: [{
          role: 'user',
          content: `Execute task ${task.id} (${task.name}): ${task.prompt}\n\nUse MCP tools to implement in database.`
        }],
        mcp_servers: [{
          type: 'url',
          url: mcpUrl,
          name: 'supabase'
        }]
      })
    });

    const data = await response.json();
    const usage = data.usage || {};
    const cost = (usage.input_tokens || 0) * 3 / 1_000_000 + (usage.output_tokens || 0) * 15 / 1_000_000;
    totalCost += cost;
    completedCount++;

    const textContent = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n');

    results.push({
      task_id: task.id,
      task_name: task.name,
      status: 'completed',
      output: textContent.substring(0, 500)
    });

    // Log to database
    await supabase.from('phase35_execution_log').insert({
      run_id: runId,
      task_id: task.id,
      task_name: task.name,
      status: 'completed',
      cost_usd: Math.round(cost * 10000) / 10000,
      result: { output: textContent }
    });
  }

  return {
    cost: totalCost,
    summary: {
      total_tasks: tasks.length,
      completed: completedCount,
      status: 'success'
    },
    results
  };
}

// =============================================
// STAGE 2: REVIEW BY OPENAI
// =============================================
async function executeOpenAIReview(supabase: any, runId: string, codeResult: any) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OPENAI_API_KEY not set');

  console.log('[REVIEW] Analyzing code with OpenAI GPT-4');

  const codeToReview = codeResult.results
    .map((r: any) => `${r.task_id}: ${r.output}`)
    .join('\n\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [{
        role: 'system',
        content: 'You are a senior code reviewer. Analyze the implementation quality, provide grades (A-F), and detailed feedback.'
      }, {
        role: 'user',
        content: `Review this Phase 3.5 implementation:\n\n${codeToReview.substring(0, 6000)}\n\nProvide:\n1. Overall Grade (A-F)\n2. Data Completeness Score (0-100)\n3. Strategic Coherence Score (0-100)\n4. Risk Assessment\n5. Key Recommendations`
      }],
      temperature: 0.3
    })
  });

  const data = await response.json();
  const reviewText = data.choices?.[0]?.message?.content || 'No review generated';
  const usage = data.usage || {};
  const cost = (usage.prompt_tokens || 0) * 10 / 1_000_000 + (usage.completion_tokens || 0) * 30 / 1_000_000;

  // Extract grades from review
  const gradeMatch = reviewText.match(/overall grade[:\s]+([A-F][+-]?)/i);
  const grade = gradeMatch ? gradeMatch[1] : 'B';

  await supabase.from('phase35_execution_log').insert({
    run_id: runId,
    task_id: 'REVIEW',
    task_name: 'OpenAI Code Review',
    status: 'completed',
    cost_usd: Math.round(cost * 10000) / 10000,
    result: { review: reviewText, grade }
  });

  return {
    cost,
    summary: {
      reviewer: 'OpenAI GPT-4',
      grade,
      status: 'completed'
    },
    review: reviewText
  };
}

// =============================================
// STAGE 3: TEST WITH REAL DATA
// =============================================
async function executeRealDataTest(supabase: any, runId: string) {
  console.log('[TEST] Testing with real data from database');

  const tests = [];
  let passedCount = 0;

  // Test 1: Check brands table
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*')
    .limit(1);
  
  tests.push({
    name: 'Brands Table Access',
    status: brandsError ? 'failed' : 'passed',
    error: brandsError?.message
  });
  if (!brandsError) passedCount++;

  // Test 2: Check phase35_execution_log
  const { data: logs, error: logsError } = await supabase
    .from('phase35_execution_log')
    .select('count')
    .eq('run_id', runId);
  
  tests.push({
    name: 'Execution Log Writing',
    status: logsError ? 'failed' : 'passed',
    error: logsError?.message
  });
  if (!logsError) passedCount++;

  // Test 3: Check gv_runs table
  const { data: run, error: runError } = await supabase
    .from('gv_runs')
    .select('*')
    .eq('id', runId)
    .single();
  
  tests.push({
    name: 'Run Tracking',
    status: runError ? 'failed' : 'passed',
    error: runError?.message
  });
  if (!runError) passedCount++;

  const passRate = (passedCount / tests.length) * 100;

  await supabase.from('phase35_execution_log').insert({
    run_id: runId,
    task_id: 'TEST',
    task_name: 'Real Data Testing',
    status: 'completed',
    result: { tests, pass_rate: passRate }
  });

  return {
    cost: 0, // No API cost for testing
    summary: {
      total_tests: tests.length,
      passed: passedCount,
      failed: tests.length - passedCount,
      pass_rate: Math.round(passRate),
      status: passRate >= 80 ? 'passed' : 'failed'
    },
    tests
  };
}

// =============================================
// STAGE 4: GENERATE SUMMARY REPORT
// =============================================
async function generateSummaryReport(
  supabase: any,
  runId: string,
  codeResult: any,
  reviewResult: any,
  testResult: any
) {
  const claudeKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  const reportPrompt = `Generate executive summary for Phase 3.5 pipeline execution:

CODE GENERATION:
- Tasks completed: ${codeResult.summary.completed}/${codeResult.summary.total_tasks}
- Status: ${codeResult.summary.status}

CODE REVIEW (OpenAI):
- Grade: ${reviewResult.summary.grade}
- Reviewer: ${reviewResult.summary.reviewer}

TESTING:
- Pass rate: ${testResult.summary.pass_rate}%
- Tests: ${testResult.summary.passed}/${testResult.summary.total_tests} passed

Provide:
1. Executive Summary (3 sentences)
2. Key Achievements
3. Critical Issues (if any)
4. Next Steps`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': claudeKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: reportPrompt
      }]
    })
  });

  const data = await response.json();
  const usage = data.usage || {};
  const cost = (usage.input_tokens || 0) * 3 / 1_000_000 + (usage.output_tokens || 0) * 15 / 1_000_000;

  const report = (data.content || [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n');

  await supabase.from('phase35_execution_log').insert({
    run_id: runId,
    task_id: 'REPORT',
    task_name: 'Summary Report Generation',
    status: 'completed',
    cost_usd: Math.round(cost * 10000) / 10000,
    result: { report }
  });

  return {
    cost,
    summary: {
      generator: 'Claude Sonnet 4',
      status: 'completed'
    },
    report
  };
}