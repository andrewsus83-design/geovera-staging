{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red83\green83\blue83;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue255;\red0\green0\blue0;\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;
\red191\green28\blue37;\red107\green0\blue1;}
{\*\expandedcolortbl;;\cssrgb\c40000\c40000\c40000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c100000;\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;
\cssrgb\c80392\c19216\c19216;\cssrgb\c50196\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 // supabase/functions/claude-question-gen/index.ts\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf4 \strokec4  \strokec6 \{\strokec4  serve \strokec6 \}\strokec4  \cf5 \strokec5 from\cf4 \strokec4  \cf7 \strokec7 "https://deno.land/std@0.168.0/http/server.ts"\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf4 \strokec4  \strokec6 \{\strokec4  createClient \strokec6 \}\strokec4  \cf5 \strokec5 from\cf4 \strokec4  \cf7 \strokec7 'https://esm.sh/@supabase/supabase-js@2'\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf4 \strokec4  corsHeaders \strokec6 =\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf7 \strokec7 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 '*'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3   \cf7 \strokec7 'Access-Control-Allow-Headers'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'authorization, x-client-info, apikey, content-type'\cf4 \strokec6 ,\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 const\cf4 \strokec4  \cf8 \strokec8 MASTER_PROMPT_V2\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 `You are the Chief Question Officer for a strategic intelligence system.\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Your ONLY job is to generate EXACTLY 300 questions from evidence provided.\cf4 \cb1 \strokec4 \
\
\cf7 \cb3 \strokec7 CRITICAL RULES:\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - Generate EXACTLY 300 questions (no more, no less)\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - NO answers allowed\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - NO action plans\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - NO recommendations\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - ONLY questions\cf4 \cb1 \strokec4 \
\
\cf7 \cb3 \strokec7 Use these 8 taxonomy categories (distribute evenly):\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 1. Clarifying - What exactly does this mean?\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 2. Causal - Why is this happening?\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 3. Comparative - How does this compare?\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 4. Boundary - What are the limits?\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 5. Second-Order Impact - What happens next?\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 6. Trade-off - What's being sacrificed?\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 7. Misconception-Busting - What assumption is wrong?\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 8. Trust-Critical - Why should anyone believe this?\cf4 \cb1 \strokec4 \
\
\cf7 \cb3 \strokec7 Each question must have:\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - Question ID (Q-001 through Q-300)\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - Question text\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - Question Type (one of 8 categories)\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - Why This Matters (3-6 month horizon)\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - Primary Pillar (V=Visibility, D=Discovery, A=Authority, T=Trust)\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - Time Horizon (3 months or 6 months)\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 - Assumptions Challenged\cf4 \cb1 \strokec4 \
\
\cf7 \cb3 \strokec7 Output format (JSON array):\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 [\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7   \{\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7     "id": "Q-001",\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7     "question": "What percentage of customers abandon due to X?",\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7     "type": "Clarifying",\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7     "why_matters": "Helps prioritize which friction points to fix first",\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7     "pillar": "D",\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7     "time_horizon": "3_months",\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7     "assumptions_challenged": ["We know all friction points", "All friction is equal"]\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7   \},\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7   ...\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 ]\cf4 \cb1 \strokec4 \
\
\cf7 \cb3 \strokec7 GENERATE EXACTLY 300 QUESTIONS.`\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec6 (\cf5 \strokec5 async\cf4 \strokec4  \strokec6 (\strokec4 req\strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3   \cf5 \strokec5 if\cf4 \strokec4  \strokec6 (\strokec4 req\strokec6 .\strokec4 method \strokec6 ===\strokec4  \cf7 \strokec7 'OPTIONS'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf5 \strokec5 return\cf4 \strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cf7 \strokec7 'ok'\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  headers\strokec6 :\strokec4  corsHeaders \strokec6 \})\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf5 \strokec5 const\cf4 \strokec4  startTime \strokec6 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec6 .\strokec4 now\strokec6 ()\cb1 \strokec4 \
\
\cb3   \cf5 \strokec5 try\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf5 \strokec5 const\cf4 \strokec4  supabase \strokec6 =\strokec4  createClient\strokec6 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf5 \strokec5 get\cf4 \strokec6 (\cf7 \strokec7 'SUPABASE_URL'\cf4 \strokec6 )\strokec4  \strokec6 ??\strokec4  \cf7 \strokec7 ''\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf5 \strokec5 get\cf4 \strokec6 (\cf7 \strokec7 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec6 )\strokec4  \strokec6 ??\strokec4  \cf7 \strokec7 ''\cf4 \cb1 \strokec4 \
\cb3     \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf5 \strokec5 const\cf4 \strokec4  \strokec6 \{\strokec4  run_id\strokec6 ,\strokec4  brand_id\strokec6 ,\strokec4  evidence_pack_ref \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf5 \strokec5 await\cf4 \strokec4  req\strokec6 .\strokec4 json\strokec6 ()\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 `\uc0\u55358 \u56596  Generating 300 questions for run \cf4 \strokec6 $\{\strokec4 run_id\strokec6 \}\cf7 \strokec7 `\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 // 1. Cost guard check\cf4 \cb1 \strokec4 \
\cb3     \cf5 \strokec5 const\cf4 \strokec4  costCheckResponse \strokec6 =\strokec4  \cf5 \strokec5 await\cf4 \strokec4  fetch\strokec6 (\cf7 \strokec7 `\cf4 \strokec6 $\{\cf8 \strokec8 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf5 \strokec5 get\cf4 \strokec6 (\cf7 \strokec7 'SUPABASE_URL'\cf4 \strokec6 )\}\cf7 \strokec7 /functions/v1/cost-guard`\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       method\strokec6 :\strokec4  \cf7 \strokec7 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf7 \strokec7 'Authorization'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 `Bearer \cf4 \strokec6 $\{\cf8 \strokec8 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf5 \strokec5 get\cf4 \strokec6 (\cf7 \strokec7 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec6 )\}\cf7 \strokec7 `\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf7 \strokec7 'Content-Type'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'application/json'\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \},\cb1 \strokec4 \
\cb3       body\strokec6 :\strokec4  \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         brand_id\strokec6 ,\cb1 \strokec4 \
\cb3         job_type\strokec6 :\strokec4  \cf7 \strokec7 'claude_question_gen'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         estimated_tokens\strokec6 :\strokec4  \cf9 \strokec9 8000\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         model\strokec6 :\strokec4  \cf7 \strokec7 'claude-sonnet-4-5'\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3     \strokec6 \})\cb1 \strokec4 \
\
\cb3     \cf5 \strokec5 const\cf4 \strokec4  costCheck \strokec6 =\strokec4  \cf5 \strokec5 await\cf4 \strokec4  costCheckResponse\strokec6 .\strokec4 json\strokec6 ()\cb1 \strokec4 \
\
\cb3     \cf5 \strokec5 if\cf4 \strokec4  \strokec6 (!\strokec4 costCheck\strokec6 .\strokec4 approved\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 '\uc0\u10060  Budget exceeded'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \cf5 \strokec5 return\cf4 \strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  error\strokec6 :\strokec4  \cf7 \strokec7 'Budget exceeded'\cf4 \strokec6 ,\strokec4  details\strokec6 :\strokec4  costCheck \strokec6 \}),\cb1 \strokec4 \
\cb3         \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf9 \strokec9 403\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \strokec6 ...\strokec4 corsHeaders\strokec6 ,\strokec4  \cf7 \strokec7 'Content-Type'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'application/json'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 `\uc0\u9989  Cost approved: \cf10 \cb3 \strokec10 $\cf4 \cb3 \strokec6 $\{\strokec4 costCheck\strokec6 .\strokec4 cost_estimate\strokec6 .\strokec4 toFixed\strokec6 (\cf9 \strokec9 4\cf4 \strokec6 )\}\cf7 \strokec7 `\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 // 2. Load evidence pack\cf4 \cb1 \strokec4 \
\cb3     \cf5 \strokec5 const\cf4 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  evidence\strokec6 ,\strokec4  error\strokec6 :\strokec4  evidenceError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf5 \strokec5 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf5 \strokec5 from\cf4 \strokec6 (\cf7 \strokec7 'gv_evidence_packs'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 (\cf7 \strokec7 '*'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf7 \strokec7 'id'\cf4 \strokec6 ,\strokec4  evidence_pack_ref\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 single\strokec6 ()\cb1 \strokec4 \
\
\cb3     \cf5 \strokec5 if\cf4 \strokec4  \strokec6 (\strokec4 evidenceError \strokec6 ||\strokec4  \strokec6 !\strokec4 evidence\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \strokec5 throw\cf4 \strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec6 (\cf7 \strokec7 'Evidence pack not found'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 '\uc0\u55357 \u56550  Evidence pack loaded'\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 // 3. Call Claude API\cf4 \cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 '\uc0\u55358 \u56598  Calling Claude API...'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf5 \strokec5 const\cf4 \strokec4  anthropicResponse \strokec6 =\strokec4  \cf5 \strokec5 await\cf4 \strokec4  fetch\strokec6 (\cf7 \strokec7 'https://api.anthropic.com/v1/messages'\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       method\strokec6 :\strokec4  \cf7 \strokec7 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf7 \strokec7 'anthropic-api-key'\cf4 \strokec6 :\strokec4  \cf8 \strokec8 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf5 \strokec5 get\cf4 \strokec6 (\cf7 \strokec7 'ANTHROPIC_API_KEY'\cf4 \strokec6 )\strokec4  \strokec6 ??\strokec4  \cf7 \strokec7 ''\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf7 \strokec7 'anthropic-version'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 '2023-06-01'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf7 \strokec7 'content-type'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'application/json'\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \},\cb1 \strokec4 \
\cb3       body\strokec6 :\strokec4  \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         model\strokec6 :\strokec4  \cf7 \strokec7 'claude-sonnet-4-20250514'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         max_tokens\strokec6 :\strokec4  \cf9 \strokec9 16000\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         system\strokec6 :\strokec4  \cf8 \strokec8 MASTER_PROMPT_V2\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         messages\strokec6 :\strokec4  \strokec6 [\{\cb1 \strokec4 \
\cb3           role\strokec6 :\strokec4  \cf7 \strokec7 'user'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           content\strokec6 :\strokec4  \cf7 \strokec7 `Generate 300 questions from this evidence:\\n\\n\cf4 \strokec6 $\{\cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\strokec4 evidence\strokec6 .\strokec4 data\strokec6 )\}\cf7 \strokec7 `\cf4 \cb1 \strokec4 \
\cb3         \strokec6 \}]\cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3     \strokec6 \})\cb1 \strokec4 \
\
\cb3     \cf5 \strokec5 if\cf4 \strokec4  \strokec6 (!\strokec4 anthropicResponse\strokec6 .\strokec4 ok\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \strokec5 throw\cf4 \strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec6 (\cf7 \strokec7 `Claude API error: \cf4 \strokec6 $\{\strokec4 anthropicResponse\strokec6 .\strokec4 statusText\strokec6 \}\cf7 \strokec7 `\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf5 \strokec5 const\cf4 \strokec4  anthropicData \strokec6 =\strokec4  \cf5 \strokec5 await\cf4 \strokec4  anthropicResponse\strokec6 .\strokec4 json\strokec6 ()\cb1 \strokec4 \
\cb3     \cf5 \strokec5 const\cf4 \strokec4  responseText \strokec6 =\strokec4  anthropicData\strokec6 .\strokec4 content\strokec6 [\cf9 \strokec9 0\cf4 \strokec6 ].\strokec4 text\cb1 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 '\uc0\u55357 \u56541  Response received, parsing questions...'\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 // 4. Parse questions\cf4 \cb1 \strokec4 \
\cb3     \cf5 \strokec5 let\cf4 \strokec4  questions\cb1 \
\cb3     \cf5 \strokec5 try\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 // Try to extract JSON from response\cf4 \cb1 \strokec4 \
\cb3       \cf5 \strokec5 const\cf4 \strokec4  jsonMatch \strokec6 =\strokec4  responseText\strokec6 .\strokec4 match\strokec6 (\cf11 \cb3 \strokec11 /\\[[\\s\\S]*\\]/\cf4 \cb3 \strokec6 )\cb1 \strokec4 \
\cb3       \cf5 \strokec5 if\cf4 \strokec4  \strokec6 (\strokec4 jsonMatch\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         questions \strokec6 =\strokec4  \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 parse\strokec6 (\strokec4 jsonMatch\strokec6 [\cf9 \strokec9 0\cf4 \strokec6 ])\cb1 \strokec4 \
\cb3       \strokec6 \}\strokec4  \cf5 \strokec5 else\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf5 \strokec5 throw\cf4 \strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec6 (\cf7 \strokec7 'No JSON array found in response'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \}\strokec4  \cf5 \strokec5 catch\cf4 \strokec4  \strokec6 (\strokec4 parseError\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       console\strokec6 .\strokec4 error\strokec6 (\cf7 \strokec7 'Failed to parse questions:'\cf4 \strokec6 ,\strokec4  parseError\strokec6 )\cb1 \strokec4 \
\cb3       \cf5 \strokec5 throw\cf4 \strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec6 (\cf7 \strokec7 'Failed to parse questions from Claude response'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 // 5. Validate: Must be exactly 300\cf4 \cb1 \strokec4 \
\cb3     \cf5 \strokec5 if\cf4 \strokec4  \strokec6 (\strokec4 questions\strokec6 .\strokec4 length \strokec6 !==\strokec4  \cf9 \strokec9 300\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 `\uc0\u10060  Invalid question count: \cf4 \strokec6 $\{\strokec4 questions\strokec6 .\strokec4 length\strokec6 \}\cf7 \strokec7 `\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \cf5 \strokec5 return\cf4 \strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3           error\strokec6 :\strokec4  \cf7 \strokec7 'Invalid question count'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           expected\strokec6 :\strokec4  \cf9 \strokec9 300\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           actual\strokec6 :\strokec4  questions\strokec6 .\strokec4 length\cb1 \
\cb3         \strokec6 \}),\cb1 \strokec4 \
\cb3         \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf9 \strokec9 400\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \strokec6 ...\strokec4 corsHeaders\strokec6 ,\strokec4  \cf7 \strokec7 'Content-Type'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'application/json'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 '\uc0\u9989  Exactly 300 questions generated'\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 // 6. Save to database\cf4 \cb1 \strokec4 \
\cb3     \cf5 \strokec5 const\cf4 \strokec4  \strokec6 \{\strokec4  error\strokec6 :\strokec4  saveError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf5 \strokec5 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf5 \strokec5 from\cf4 \strokec6 (\cf7 \strokec7 'gv_question_sets'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 insert\strokec6 (\{\cb1 \strokec4 \
\cb3         run_id\strokec6 ,\cb1 \strokec4 \
\cb3         questions\strokec6 :\strokec4  questions\strokec6 ,\cb1 \strokec4 \
\cb3         version\strokec6 :\strokec4  \cf7 \strokec7 `v\cf4 \strokec6 $\{\cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec6 ().\strokec4 getFullYear\strokec6 ()\}\cf7 \strokec7 .\cf4 \strokec6 $\{\cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec6 ().\strokec4 getMonth\strokec6 ()\strokec4  \strokec6 +\strokec4  \cf9 \strokec9 1\cf4 \strokec6 \}\cf7 \strokec7 .1`\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         created_at\strokec6 :\strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec6 ().\strokec4 toISOString\strokec6 ()\cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\
\cb3     \cf5 \strokec5 if\cf4 \strokec4  \strokec6 (\strokec4 saveError\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \strokec5 throw\cf4 \strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec6 (\cf7 \strokec7 `Failed to save questions: \cf4 \strokec6 $\{\strokec4 saveError\strokec6 .\strokec4 message\strokec6 \}\cf7 \strokec7 `\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf5 \strokec5 const\cf4 \strokec4  duration \strokec6 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec6 .\strokec4 now\strokec6 ()\strokec4  \strokec6 -\strokec4  startTime\cb1 \
\
\cb3     \cf2 \strokec2 // 7. Update job record\cf4 \cb1 \strokec4 \
\cb3     \cf5 \strokec5 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf5 \strokec5 from\cf4 \strokec6 (\cf7 \strokec7 'gv_jobs'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 update\strokec6 (\{\cb1 \strokec4 \
\cb3         status\strokec6 :\strokec4  \cf7 \strokec7 'completed'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         result\strokec6 :\strokec4  \strokec6 \{\strokec4  question_count\strokec6 :\strokec4  \cf9 \strokec9 300\cf4 \strokec4  \strokec6 \},\cb1 \strokec4 \
\cb3         cost_usd\strokec6 :\strokec4  costCheck\strokec6 .\strokec4 cost_estimate\strokec6 ,\cb1 \strokec4 \
\cb3         duration_ms\strokec6 :\strokec4  duration\cb1 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf7 \strokec7 'run_id'\cf4 \strokec6 ,\strokec4  run_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf7 \strokec7 'job_type'\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 'claude-question-gen'\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 `\uc0\u9989  Job completed in \cf4 \strokec6 $\{\strokec4 duration\strokec6 \}\cf7 \strokec7 ms`\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf5 \strokec5 return\cf4 \strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         success\strokec6 :\strokec4  \cf5 \strokec5 true\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         question_count\strokec6 :\strokec4  \cf9 \strokec9 300\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         run_id\strokec6 ,\cb1 \strokec4 \
\cb3         duration_ms\strokec6 :\strokec4  duration\strokec6 ,\cb1 \strokec4 \
\cb3         cost_usd\strokec6 :\strokec4  costCheck\strokec6 .\strokec4 cost_estimate\cb1 \
\cb3       \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \strokec6 ...\strokec4 corsHeaders\strokec6 ,\strokec4  \cf7 \strokec7 'Content-Type'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'application/json'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 )\cb1 \strokec4 \
\
\cb3   \strokec6 \}\strokec4  \cf5 \strokec5 catch\cf4 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 error\strokec6 (\cf7 \strokec7 '\uc0\u10060  Claude question gen error:'\cf4 \strokec6 ,\strokec4  error\strokec6 )\cb1 \strokec4 \
\cb3     \cf5 \strokec5 return\cf4 \strokec4  \cf5 \strokec5 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  error\strokec6 :\strokec4  error\strokec6 .\strokec4 message \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf9 \strokec9 500\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \strokec6 ...\strokec4 corsHeaders\strokec6 ,\strokec4  \cf7 \strokec7 'Content-Type'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'application/json'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 )\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \})\cb1 \strokec4 \
}