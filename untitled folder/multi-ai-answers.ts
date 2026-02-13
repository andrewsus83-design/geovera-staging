{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red83\green83\blue83;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue255;\red0\green0\blue0;\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;
}
{\*\expandedcolortbl;;\cssrgb\c40000\c40000\c40000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c100000;\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 // supabase/functions/multi-ai-answers/index.ts\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  serve \strokec6 \}\strokec4  \cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec4  \cf7 \strokec7 "https://deno.land/std@0.168.0/http/server.ts"\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  createClient \strokec6 \}\strokec4  \cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec4  \cf7 \strokec7 'https://esm.sh/@supabase/supabase-js@2'\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  corsHeaders \strokec6 =\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf7 \strokec7 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 '*'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3   \cf7 \strokec7 'Access-Control-Allow-Headers'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'authorization, x-client-info, apikey, content-type'\cf4 \strokec6 ,\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec6 (\cf5 \cb3 \strokec5 async\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3   \cf5 \cb3 \strokec5 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 .\strokec4 method \strokec6 ===\strokec4  \cf7 \strokec7 'OPTIONS'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 return\cf4 \cb3 \strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cf7 \strokec7 'ok'\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  headers\strokec6 :\strokec4  corsHeaders \strokec6 \})\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf5 \cb3 \strokec5 try\cf4 \cb3 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  supabase \strokec6 =\strokec4  createClient\strokec6 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf5 \cb3 \strokec5 get\cf4 \cb3 \strokec6 (\cf7 \strokec7 'SUPABASE_URL'\cf4 \strokec6 )\strokec4  \strokec6 ??\strokec4  \cf7 \strokec7 ''\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf5 \cb3 \strokec5 get\cf4 \cb3 \strokec6 (\cf7 \strokec7 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec6 )\strokec4  \strokec6 ??\strokec4  \cf7 \strokec7 ''\cf4 \cb1 \strokec4 \
\cb3     \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  run_id\strokec6 ,\strokec4  brand_id\strokec6 ,\strokec4  question_set_ref \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf5 \cb3 \strokec5 await\cf4 \cb3 \strokec4  req\strokec6 .\strokec4 json\strokec6 ()\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 `\uc0\u55358 \u56598  Collecting multi-AI answers for run \cf4 \strokec6 $\{\strokec4 run_id\strokec6 \}\cf7 \strokec7 `\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // 1. Load 300 questions\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  questionSet\strokec6 ,\strokec4  error\strokec6 :\strokec4  qError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf5 \cb3 \strokec5 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec6 (\cf7 \strokec7 'gv_question_sets'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 (\cf7 \strokec7 'questions'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf7 \strokec7 'run_id'\cf4 \strokec6 ,\strokec4  run_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 single\strokec6 ()\cb1 \strokec4 \
\
\cb3     \cf5 \cb3 \strokec5 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 qError \strokec6 ||\strokec4  \strokec6 !\strokec4 questionSet\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \cb3 \strokec5 throw\cf4 \cb3 \strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Error\cf4 \strokec6 (\cf7 \strokec7 'Questions not found'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  questions \strokec6 =\strokec4  questionSet\strokec6 .\strokec4 questions\cb1 \
\
\cb3     \cf2 \cb3 \strokec2 // 2. Route questions by type\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  routing \strokec6 =\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       perplexity\strokec6 :\strokec4  questions\strokec6 .\strokec4 filter\strokec6 ((\strokec4 q\strokec6 :\strokec4  \cf5 \cb3 \strokec5 any\cf4 \cb3 \strokec6 )\strokec4  \strokec6 =>\strokec4  \cb1 \
\cb3         \strokec6 [\cf7 \strokec7 'Clarifying'\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 'Comparative'\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 'Trust-Critical'\cf4 \strokec6 ].\strokec4 includes\strokec6 (\strokec4 q\strokec6 .\cf5 \cb3 \strokec5 type\cf4 \cb3 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 ),\cb1 \strokec4 \
\cb3       claude\strokec6 :\strokec4  questions\strokec6 .\strokec4 filter\strokec6 ((\strokec4 q\strokec6 :\strokec4  \cf5 \cb3 \strokec5 any\cf4 \cb3 \strokec6 )\strokec4  \strokec6 =>\strokec4  \cb1 \
\cb3         \strokec6 [\cf7 \strokec7 'Causal'\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 'Second-Order Impact'\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 'Trade-off'\cf4 \strokec6 ].\strokec4 includes\strokec6 (\strokec4 q\strokec6 .\cf5 \cb3 \strokec5 type\cf4 \cb3 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 ),\cb1 \strokec4 \
\cb3       gemini\strokec6 :\strokec4  questions\strokec6 .\strokec4 filter\strokec6 ((\strokec4 q\strokec6 :\strokec4  \cf5 \cb3 \strokec5 any\cf4 \cb3 \strokec6 )\strokec4  \strokec6 =>\strokec4  \cb1 \
\cb3         \strokec6 [\cf7 \strokec7 'Boundary'\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 'Misconception-Busting'\cf4 \strokec6 ].\strokec4 includes\strokec6 (\strokec4 q\strokec6 .\cf5 \cb3 \strokec5 type\cf4 \cb3 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 `\uc0\u55357 \u56522  Routing: \cf4 \strokec6 $\{\strokec4 routing\strokec6 .\strokec4 perplexity\strokec6 .\strokec4 length\strokec6 \}\cf7 \strokec7  to Perplexity, \cf4 \strokec6 $\{\strokec4 routing\strokec6 .\strokec4 claude\strokec6 .\strokec4 length\strokec6 \}\cf7 \strokec7  to Claude, \cf4 \strokec6 $\{\strokec4 routing\strokec6 .\strokec4 gemini\strokec6 .\strokec4 length\strokec6 \}\cf7 \strokec7  to Gemini`\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // 3. Collect answers (simplified - in production, batch and parallelize)\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  allAnswers \strokec6 =\strokec4  \strokec6 []\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // Answer with Perplexity (mock for now)\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 for\cf4 \cb3 \strokec4  \strokec6 (\cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  q \cf5 \cb3 \strokec5 of\cf4 \cb3 \strokec4  routing\strokec6 .\strokec4 perplexity\strokec6 .\strokec4 slice\strokec6 (\cf9 \strokec9 0\cf4 \strokec6 ,\strokec4  \cf9 \strokec9 10\cf4 \strokec6 ))\strokec4  \strokec6 \{\strokec4  \cf2 \cb3 \strokec2 // Sample 10\cf4 \cb1 \strokec4 \
\cb3       allAnswers\strokec6 .\strokec4 push\strokec6 (\{\cb1 \strokec4 \
\cb3         question_id\strokec6 :\strokec4  q\strokec6 .\strokec4 id\strokec6 ,\cb1 \strokec4 \
\cb3         model_name\strokec6 :\strokec4  \cf7 \strokec7 'perplexity-sonar'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         answer_text\strokec6 :\strokec4  \cf7 \strokec7 `[Perplexity answer to: \cf4 \strokec6 $\{\strokec4 q\strokec6 .\strokec4 question\strokec6 \}\cf7 \strokec7 ]`\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         is_contradiction\strokec6 :\strokec4  \cf5 \cb3 \strokec5 false\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // Answer with Claude (mock for now)\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 for\cf4 \cb3 \strokec4  \strokec6 (\cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  q \cf5 \cb3 \strokec5 of\cf4 \cb3 \strokec4  routing\strokec6 .\strokec4 claude\strokec6 .\strokec4 slice\strokec6 (\cf9 \strokec9 0\cf4 \strokec6 ,\strokec4  \cf9 \strokec9 10\cf4 \strokec6 ))\strokec4  \strokec6 \{\strokec4  \cf2 \cb3 \strokec2 // Sample 10\cf4 \cb1 \strokec4 \
\cb3       allAnswers\strokec6 .\strokec4 push\strokec6 (\{\cb1 \strokec4 \
\cb3         question_id\strokec6 :\strokec4  q\strokec6 .\strokec4 id\strokec6 ,\cb1 \strokec4 \
\cb3         model_name\strokec6 :\strokec4  \cf7 \strokec7 'claude-sonnet-4-5'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         answer_text\strokec6 :\strokec4  \cf7 \strokec7 `[Claude answer to: \cf4 \strokec6 $\{\strokec4 q\strokec6 .\strokec4 question\strokec6 \}\cf7 \strokec7 ]`\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         is_contradiction\strokec6 :\strokec4  \cf5 \cb3 \strokec5 false\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // 4. Save answers\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  error\strokec6 :\strokec4  saveError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf5 \cb3 \strokec5 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec6 (\cf7 \strokec7 'gv_multi_ai_answers'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 insert\strokec6 (\cb1 \strokec4 \
\cb3         allAnswers\strokec6 .\strokec4 map\strokec6 (\strokec4 a \strokec6 =>\strokec4  \strokec6 (\{\cb1 \strokec4 \
\cb3           run_id\strokec6 ,\cb1 \strokec4 \
\cb3           \strokec6 ...\strokec4 a\strokec6 ,\cb1 \strokec4 \
\cb3           created_at\strokec6 :\strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Date\cf4 \strokec6 ().\strokec4 toISOString\strokec6 ()\cb1 \strokec4 \
\cb3         \strokec6 \}))\cb1 \strokec4 \
\cb3       \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf5 \cb3 \strokec5 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 saveError\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \cb3 \strokec5 throw\cf4 \cb3 \strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Error\cf4 \strokec6 (\cf7 \strokec7 `Failed to save answers: \cf4 \strokec6 $\{\strokec4 saveError\strokec6 .\strokec4 message\strokec6 \}\cf7 \strokec7 `\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // 5. Update job\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec6 (\cf7 \strokec7 'gv_jobs'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 update\strokec6 (\{\cb1 \strokec4 \
\cb3         status\strokec6 :\strokec4  \cf7 \strokec7 'completed'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         result\strokec6 :\strokec4  \strokec6 \{\strokec4  total_answers\strokec6 :\strokec4  allAnswers\strokec6 .\strokec4 length \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf7 \strokec7 'run_id'\cf4 \strokec6 ,\strokec4  run_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf7 \strokec7 'job_type'\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 'multi-ai-answers'\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 `\uc0\u9989  Collected \cf4 \strokec6 $\{\strokec4 allAnswers\strokec6 .\strokec4 length\strokec6 \}\cf7 \strokec7  answers`\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf5 \cb3 \strokec5 return\cf4 \cb3 \strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         success\strokec6 :\strokec4  \cf5 \cb3 \strokec5 true\cf4 \cb3 \strokec6 ,\cb1 \strokec4 \
\cb3         total_answers\strokec6 :\strokec4  allAnswers\strokec6 .\strokec4 length\strokec6 ,\cb1 \strokec4 \
\cb3         run_id\cb1 \
\cb3       \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \strokec6 ...\strokec4 corsHeaders\strokec6 ,\strokec4  \cf7 \strokec7 'Content-Type'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'application/json'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 )\cb1 \strokec4 \
\
\cb3   \strokec6 \}\strokec4  \cf5 \cb3 \strokec5 catch\cf4 \cb3 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 error\strokec6 (\cf7 \strokec7 '\uc0\u10060  Multi-AI answers error:'\cf4 \strokec6 ,\strokec4  error\strokec6 )\cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 return\cf4 \cb3 \strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  error\strokec6 :\strokec4  error\strokec6 .\strokec4 message \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf9 \strokec9 500\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \strokec6 ...\strokec4 corsHeaders\strokec6 ,\strokec4  \cf7 \strokec7 'Content-Type'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'application/json'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 )\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \})\cb1 \strokec4 \
}