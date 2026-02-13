{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue0;\red144\green1\blue18;\red83\green83\blue83;\red14\green110\blue109;\red19\green118\blue70;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c40000\c40000\c40000;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2.39.3'\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 /**\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * AI Chat Pipeline Orchestrator\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Runs all 4 steps sequentially: Chronicle \uc0\u8594  Platform \u8594  Questions \u8594  Activation\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  */\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf8 \strokec8 SUPABASE_URL\cf4 \strokec4  \strokec5 =\strokec4  \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )!\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf8 \strokec8 SUPABASE_SERVICE_ROLE_KEY\cf4 \strokec4  \strokec5 =\strokec4  \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 )!\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \strokec2 async\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 !==\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'POST required'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       status\strokec5 :\strokec4  \cf9 \strokec9 405\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \cb1 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  startTime \strokec5 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  results\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     brand_id\strokec5 :\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     brand_name\strokec5 :\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     steps\strokec5 :\strokec4  \strokec5 \{\},\cb1 \strokec4 \
\cb3     total_cost\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     total_time_ms\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     status\strokec5 :\strokec4  \cf6 \strokec6 'running'\cf4 \cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  brand_id\strokec5 ,\strokec4  total_questions \strokec5 =\strokec4  \cf9 \strokec9 40\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brand_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'brand_id required'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     results\strokec5 .\strokec4 brand_id \strokec5 =\strokec4  brand_id\cb1 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Orchestrator] Starting complete AI Chat pipeline for brand \cf4 \strokec5 $\{\strokec4 brand_id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Get brand name\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabase \strokec5 =\strokec4  createClient\strokec5 (\cf8 \strokec8 SUPABASE_URL\cf4 \strokec5 ,\strokec4  \cf8 \strokec8 SUPABASE_SERVICE_ROLE_KEY\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  brand \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'brands'\cf4 \strokec5 ).\strokec4 select\strokec5 (\cf6 \strokec6 'brand_name'\cf4 \strokec5 ).\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 ).\strokec4 single\strokec5 ()\cb1 \strokec4 \
\cb3     results\strokec5 .\strokec4 brand_name \strokec5 =\strokec4  brand\strokec5 ?.\strokec4 brand_name \strokec5 ||\strokec4  \cf6 \strokec6 'Unknown'\cf4 \cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // STEP 1: Brand Chronicle\cf4 \cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Orchestrator] STEP 1: Brand Chronicle Analysis...'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  step1Start \strokec5 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  step1 \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  callFunction\strokec5 (\cf6 \strokec6 'ai-chat-step1-chronicle'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  brand_id \strokec5 \})\cb1 \strokec4 \
\cb3     results\strokec5 .\strokec4 steps\strokec5 .\strokec4 step1 \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       name\strokec5 :\strokec4  \cf6 \strokec6 'Brand Chronicle Analysis'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       status\strokec5 :\strokec4  step1\strokec5 .\strokec4 success \strokec5 ?\strokec4  \cf6 \strokec6 'success'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'failed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       chronicle_id\strokec5 :\strokec4  step1\strokec5 .\strokec4 chronicle_id\strokec5 ,\cb1 \strokec4 \
\cb3       cost_usd\strokec5 :\strokec4  parseFloat\strokec5 (\strokec4 step1\strokec5 .\strokec4 analysis_summary\strokec5 ?.\strokec4 cost_usd \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3       time_ms\strokec5 :\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  step1Start\strokec5 ,\cb1 \strokec4 \
\cb3       data\strokec5 :\strokec4  step1\cb1 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 step1\strokec5 .\strokec4 success\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Step 1 failed'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // STEP 2: Platform Research\cf4 \cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Orchestrator] STEP 2: Platform Activity Research...'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  step2Start \strokec5 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  step2 \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  callFunction\strokec5 (\cf6 \strokec6 'ai-chat-step2-platform'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       brand_id\strokec5 ,\strokec4  \cb1 \
\cb3       chronicle_id\strokec5 :\strokec4  step1\strokec5 .\strokec4 chronicle_id \cb1 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3     results\strokec5 .\strokec4 steps\strokec5 .\strokec4 step2 \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       name\strokec5 :\strokec4  \cf6 \strokec6 'Platform Activity Research'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       status\strokec5 :\strokec4  step2\strokec5 .\strokec4 success \strokec5 ?\strokec4  \cf6 \strokec6 'success'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'failed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       platform_research_id\strokec5 :\strokec4  step2\strokec5 .\strokec4 platform_research_id\strokec5 ,\cb1 \strokec4 \
\cb3       top_platform\strokec5 :\strokec4  step2\strokec5 .\strokec4 top_platform\strokec5 ,\cb1 \strokec4 \
\cb3       cost_usd\strokec5 :\strokec4  parseFloat\strokec5 (\strokec4 step2\strokec5 .\strokec4 research_summary\strokec5 ?.\strokec4 cost_usd \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3       time_ms\strokec5 :\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  step2Start\strokec5 ,\cb1 \strokec4 \
\cb3       data\strokec5 :\strokec4  step2\cb1 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 step2\strokec5 .\strokec4 success\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Step 2 failed'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // STEP 3: Question Generation\cf4 \cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Orchestrator] STEP 3: Smart Question Generation...'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  step3Start \strokec5 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  step3 \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  callFunction\strokec5 (\cf6 \strokec6 'ai-chat-step3-questions'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       brand_id\strokec5 ,\cb1 \strokec4 \
\cb3       chronicle_id\strokec5 :\strokec4  step1\strokec5 .\strokec4 chronicle_id\strokec5 ,\cb1 \strokec4 \
\cb3       platform_research_id\strokec5 :\strokec4  step2\strokec5 .\strokec4 platform_research_id\strokec5 ,\cb1 \strokec4 \
\cb3       total_questions\cb1 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3     results\strokec5 .\strokec4 steps\strokec5 .\strokec4 step3 \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       name\strokec5 :\strokec4  \cf6 \strokec6 'Smart Question Generation'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       status\strokec5 :\strokec4  step3\strokec5 .\strokec4 success \strokec5 ?\strokec4  \cf6 \strokec6 'success'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'failed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       questions_generated\strokec5 :\strokec4  step3\strokec5 .\strokec4 questions_generated\strokec5 ,\cb1 \strokec4 \
\cb3       cost_usd\strokec5 :\strokec4  parseFloat\strokec5 (\strokec4 step3\strokec5 .\strokec4 cost_summary\strokec5 ?.\strokec4 cost_usd \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3       time_ms\strokec5 :\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  step3Start\strokec5 ,\cb1 \strokec4 \
\cb3       data\strokec5 :\strokec4  step3\cb1 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 step3\strokec5 .\strokec4 success\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Step 3 failed'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // STEP 4: Chat Activation\cf4 \cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Orchestrator] STEP 4: Chat Activation...'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  step4Start \strokec5 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  step4 \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  callFunction\strokec5 (\cf6 \strokec6 'ai-chat-step4-activation'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       brand_id\strokec5 ,\cb1 \strokec4 \
\cb3       chronicle_id\strokec5 :\strokec4  step1\strokec5 .\strokec4 chronicle_id\cb1 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3     results\strokec5 .\strokec4 steps\strokec5 .\strokec4 step4 \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       name\strokec5 :\strokec4  \cf6 \strokec6 'Chat Activation'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       status\strokec5 :\strokec4  step4\strokec5 .\strokec4 success \strokec5 ?\strokec4  \cf6 \strokec6 'success'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'failed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       chat_activation_id\strokec5 :\strokec4  step4\strokec5 .\strokec4 chat_activation_id\strokec5 ,\cb1 \strokec4 \
\cb3       chat_name\strokec5 :\strokec4  step4\strokec5 .\strokec4 chat_name\strokec5 ,\cb1 \strokec4 \
\cb3       cost_usd\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       time_ms\strokec5 :\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  step4Start\strokec5 ,\cb1 \strokec4 \
\cb3       data\strokec5 :\strokec4  step4\cb1 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 step4\strokec5 .\strokec4 success\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Step 4 failed'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Calculate totals\cf4 \cb1 \strokec4 \
\cb3     results\strokec5 .\strokec4 total_cost \strokec5 =\strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 values\strokec5 (\strokec4 results\strokec5 .\strokec4 steps\strokec5 ).\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ,\strokec4  step\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  step\strokec5 .\strokec4 cost_usd\strokec5 ,\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     results\strokec5 .\strokec4 total_time_ms \strokec5 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  startTime\cb1 \
\cb3     results\strokec5 .\strokec4 status \strokec5 =\strokec4  \cf6 \strokec6 'completed'\cf4 \cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Orchestrator] Pipeline complete! Total: \cf4 \strokec5 $\{\strokec4 results\strokec5 .\strokec4 total_cost\strokec5 .\strokec4 toFixed\strokec5 (\cf9 \strokec9 4\cf4 \strokec5 )\}\cf6 \strokec6  USD, \cf4 \strokec5 $\{\strokec4 results\strokec5 .\strokec4 total_time_ms\strokec5 \}\cf6 \strokec6 ms`\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3       success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       brand_id\strokec5 :\strokec4  results\strokec5 .\strokec4 brand_id\strokec5 ,\cb1 \strokec4 \
\cb3       brand_name\strokec5 :\strokec4  results\strokec5 .\strokec4 brand_name\strokec5 ,\cb1 \strokec4 \
\cb3       pipeline_status\strokec5 :\strokec4  \cf6 \strokec6 'completed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       chronicle_id\strokec5 :\strokec4  step1\strokec5 .\strokec4 chronicle_id\strokec5 ,\cb1 \strokec4 \
\cb3       platform_research_id\strokec5 :\strokec4  step2\strokec5 .\strokec4 platform_research_id\strokec5 ,\cb1 \strokec4 \
\cb3       questions_generated\strokec5 :\strokec4  step3\strokec5 .\strokec4 questions_generated\strokec5 ,\cb1 \strokec4 \
\cb3       chat_activation_id\strokec5 :\strokec4  step4\strokec5 .\strokec4 chat_activation_id\strokec5 ,\cb1 \strokec4 \
\cb3       summary\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         total_steps\strokec5 :\strokec4  \cf9 \strokec9 4\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         steps_completed\strokec5 :\strokec4  \cf9 \strokec9 4\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         total_cost_usd\strokec5 :\strokec4  results\strokec5 .\strokec4 total_cost\strokec5 .\strokec4 toFixed\strokec5 (\cf9 \strokec9 4\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3         total_time_seconds\strokec5 :\strokec4  \strokec5 (\strokec4 results\strokec5 .\strokec4 total_time_ms \strokec5 /\strokec4  \cf9 \strokec9 1000\cf4 \strokec5 ).\strokec4 toFixed\strokec5 (\cf9 \strokec9 1\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3         platform_distribution\strokec5 :\strokec4  step2\strokec5 .\strokec4 platform_distribution\strokec5 ,\cb1 \strokec4 \
\cb3         question_stats\strokec5 :\strokec4  step3\strokec5 .\strokec4 statistics\strokec5 ,\cb1 \strokec4 \
\cb3         chat_status\strokec5 :\strokec4  step4\strokec5 .\strokec4 status\cb1 \
\cb3       \strokec5 \},\cb1 \strokec4 \
\cb3       step_details\strokec5 :\strokec4  results\strokec5 .\strokec4 steps\strokec5 ,\cb1 \strokec4 \
\cb3       ready_for_production\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \})\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     results\strokec5 .\strokec4 status \strokec5 =\strokec4  \cf6 \strokec6 'failed'\cf4 \cb1 \strokec4 \
\cb3     results\strokec5 .\strokec4 error \strokec5 =\strokec4  error\strokec5 .\strokec4 message\cb1 \
\cb3     results\strokec5 .\strokec4 total_time_ms \strokec5 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  startTime\cb1 \
\
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[Orchestrator] Pipeline failed:'\cf4 \strokec5 ,\strokec4  error\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3       success\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       error\strokec5 :\strokec4  error\strokec5 .\strokec4 message\strokec5 ,\cb1 \strokec4 \
\cb3       brand_id\strokec5 :\strokec4  results\strokec5 .\strokec4 brand_id\strokec5 ,\cb1 \strokec4 \
\cb3       brand_name\strokec5 :\strokec4  results\strokec5 .\strokec4 brand_name\strokec5 ,\cb1 \strokec4 \
\cb3       steps_completed\strokec5 :\strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 keys\strokec5 (\strokec4 results\strokec5 .\strokec4 steps\strokec5 ).\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3       partial_results\strokec5 :\strokec4  results\cb1 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  \cb1 \
\cb3       headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \cb1 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  callFunction\strokec5 (\strokec4 functionName\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ,\strokec4  payload\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ):\strokec4  \cf8 \strokec8 Promise\cf4 \strokec5 <\cf2 \strokec2 any\cf4 \strokec5 >\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  response \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cf6 \strokec6 `\cf4 \strokec5 $\{\cf8 \strokec8 SUPABASE_URL\cf4 \strokec5 \}\cf6 \strokec6 /functions/v1/\cf4 \strokec5 $\{\strokec4 functionName\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 'Authorization'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 `Bearer \cf4 \strokec5 $\{\cf8 \strokec8 SUPABASE_SERVICE_ROLE_KEY\cf4 \strokec5 \}\cf6 \strokec6 `\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \},\cb1 \strokec4 \
\cb3     body\strokec5 :\strokec4  \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 payload\strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \})\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 response\strokec5 .\strokec4 ok\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  error \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  response\strokec5 .\strokec4 text\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 functionName\strokec5 \}\cf6 \strokec6  failed: \cf4 \strokec5 $\{\strokec4 error\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 await\cf4 \strokec4  response\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
}