{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue0;\red144\green1\blue18;\red83\green83\blue83;\red14\green110\blue109;\red19\green118\blue70;
\red107\green0\blue1;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c40000\c40000\c40000;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;
\cssrgb\c50196\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2.39.3'\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 /**\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Live Brand Chat API\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Real-time Q&A using trained activation data\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  */\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf8 \strokec8 OPENAI_API_KEY\cf4 \strokec4  \strokec5 =\strokec4  \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'OPENAI_API_KEY'\cf4 \strokec5 )\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \strokec2 async\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  corsHeaders \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'Access-Control-Allow-Headers'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'authorization, x-client-info, apikey, content-type'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'OPTIONS'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf6 \strokec6 'ok'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  corsHeaders \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 !==\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'POST required'\cf4 \strokec4  \strokec5 \}),\strokec4  \cb1 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 405\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabase \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  brand_id\strokec5 ,\strokec4  user_question\strokec5 ,\strokec4  platform\strokec5 ,\strokec4  session_id\strokec5 ,\strokec4  conversation_context \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brand_id \strokec5 ||\strokec4  \strokec5 !\strokec4 user_question\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'brand_id and user_question required'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  startTime \strokec5 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Get chat activation\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  activation \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_chat_activation'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*, brands(brand_name)'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'activation_status'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'active'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'created_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 limit\strokec5 (\cf9 \strokec9 1\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 activation\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'No active chat for this brand. Run 4-step activation first.'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `Chat request for \cf4 \strokec5 $\{\strokec4 activation\strokec5 .\strokec4 brands\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6 : "\cf4 \strokec5 $\{\strokec4 user_question\strokec5 \}\cf6 \strokec6 "`\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Find best matching question from Q&A bank\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  platformQA \strokec5 =\strokec4  activation\strokec5 .\strokec4 qa_bank\strokec5 .\strokec4 filter\strokec5 ((\strokec4 qa\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \cb1 \
\cb3       \strokec5 !\strokec4 platform \strokec5 ||\strokec4  qa\strokec5 .\strokec4 platform \strokec5 ===\strokec4  platform\cb1 \
\cb3     \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  matchedQA \strokec5 =\strokec4  findBestMatch\strokec5 (\strokec4 user_question\strokec5 ,\strokec4  platformQA\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 let\cf4 \strokec4  response\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  confidence\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  matched_question_id \strokec5 =\strokec4  \cf2 \strokec2 null\cf4 \cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 matchedQA \strokec5 &&\strokec4  matchedQA\strokec5 .\strokec4 similarity \strokec5 >\strokec4  \cf9 \strokec9 0.7\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf7 \strokec7 // Use pre-generated answer\cf4 \cb1 \strokec4 \
\cb3       response \strokec5 =\strokec4  matchedQA\strokec5 .\strokec4 qa\strokec5 .\strokec4 answer\cb1 \
\cb3       confidence \strokec5 =\strokec4  matchedQA\strokec5 .\strokec4 similarity\cb1 \
\cb3       console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `Matched: "\cf4 \strokec5 $\{\strokec4 matchedQA\strokec5 .\strokec4 qa\strokec5 .\strokec4 question\strokec5 \}\cf6 \strokec6 " (\cf4 \strokec5 $\{(\strokec4 confidence \strokec5 *\strokec4  \cf9 \strokec9 100\cf4 \strokec5 ).\strokec4 toFixed\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 )\}\cf6 \strokec6 %)`\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\strokec4  \cf2 \strokec2 else\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf7 \strokec7 // Generate new answer using OpenAI with brand context\cf4 \cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 'No match found, generating new answer...'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  systemPrompt \strokec5 =\strokec4  \cf6 \strokec6 `You are the official AI assistant for \cf4 \strokec5 $\{\strokec4 activation\strokec5 .\strokec4 brands\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6 .\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 Brand Persona: \cf4 \strokec5 $\{\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 activation\strokec5 .\strokec4 brand_persona\strokec5 )\}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 Platform: \cf4 \strokec5 $\{\strokec4 platform \strokec5 ||\strokec4  \cf6 \strokec6 'general'\cf4 \strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 Tone: \cf4 \strokec5 $\{\strokec4 activation\strokec5 .\strokec4 platform_configs\strokec5 [\strokec4 platform \strokec5 ||\strokec4  \cf6 \strokec6 'google'\cf4 \strokec5 ]?.\strokec4 tone \strokec5 ||\strokec4  \cf6 \strokec6 'professional'\cf4 \strokec5 \}\cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 Answer user questions accurately, concisely, and on-brand. Use the Q&A bank as reference when relevant.`\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3       \cf2 \strokec2 const\cf4 \strokec4  userPrompt \strokec5 =\strokec4  \cf6 \strokec6 `User question: \cf4 \strokec5 $\{\strokec4 user_question\strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 Provide a helpful, accurate answer based on what you know about \cf4 \strokec5 $\{\strokec4 activation\strokec5 .\strokec4 brands\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6 .`\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3       \cf2 \strokec2 const\cf4 \strokec4  openaiResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cf6 \strokec6 'https://api.openai.com/v1/chat/completions'\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Authorization'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 `Bearer \cf4 \strokec5 $\{\cf8 \strokec8 OPENAI_API_KEY\cf4 \strokec5 \}\cf6 \strokec6 `\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         body\strokec5 :\strokec4  \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           model\strokec5 :\strokec4  \cf6 \strokec6 'gpt-4o-mini'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           messages\strokec5 :\strokec4  \strokec5 [\cb1 \strokec4 \
\cb3             \strokec5 \{\strokec4  role\strokec5 :\strokec4  \cf6 \strokec6 'system'\cf4 \strokec5 ,\strokec4  content\strokec5 :\strokec4  systemPrompt \strokec5 \},\cb1 \strokec4 \
\cb3             \strokec5 ...(\strokec4 conversation_context \strokec5 ||\strokec4  \strokec5 []),\cb1 \strokec4 \
\cb3             \strokec5 \{\strokec4  role\strokec5 :\strokec4  \cf6 \strokec6 'user'\cf4 \strokec5 ,\strokec4  content\strokec5 :\strokec4  userPrompt \strokec5 \}\cb1 \strokec4 \
\cb3           \strokec5 ],\cb1 \strokec4 \
\cb3           max_tokens\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           temperature\strokec5 :\strokec4  \cf9 \strokec9 0.7\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  openaiData \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  openaiResponse\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\cb3       response \strokec5 =\strokec4  openaiData\strokec5 .\strokec4 choices\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ].\strokec4 message\strokec5 .\strokec4 content\cb1 \
\cb3       confidence \strokec5 =\strokec4  \cf9 \strokec9 0.85\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  responseTime \strokec5 =\strokec4  \cf8 \strokec8 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  startTime\cb1 \
\
\cb3     \cf7 \strokec7 // Log interaction\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 await\cf4 \strokec4  supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_chat_interactions'\cf4 \strokec5 ).\strokec4 insert\strokec5 (\{\cb1 \strokec4 \
\cb3       brand_id\strokec5 ,\cb1 \strokec4 \
\cb3       activation_id\strokec5 :\strokec4  activation\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3       user_question\strokec5 ,\cb1 \strokec4 \
\cb3       matched_question_id\strokec5 ,\cb1 \strokec4 \
\cb3       ai_response\strokec5 :\strokec4  response\strokec5 ,\cb1 \strokec4 \
\cb3       platform\strokec5 :\strokec4  platform \strokec5 ||\strokec4  \cf6 \strokec6 'unknown'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       session_id\strokec5 ,\cb1 \strokec4 \
\cb3       conversation_context\strokec5 ,\cb1 \strokec4 \
\cb3       response_time_ms\strokec5 :\strokec4  responseTime\strokec5 ,\cb1 \strokec4 \
\cb3       confidence_score\strokec5 :\strokec4  confidence\strokec5 ,\cb1 \strokec4 \
\cb3       intent_detected\strokec5 :\strokec4  detectIntent\strokec5 (\strokec4 user_question\strokec5 ),\cb1 \strokec4 \
\cb3       entities_extracted\strokec5 :\strokec4  extractEntities\strokec5 (\strokec4 user_question\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Update activation stats\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_chat_activation'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3         questions_answered\strokec5 :\strokec4  \strokec5 (\strokec4 activation\strokec5 .\strokec4 questions_answered \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  \cf9 \strokec9 1\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         last_updated\strokec5 :\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 ()\cb1 \strokec4 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  activation\strokec5 .\strokec4 id\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3       success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       brand_name\strokec5 :\strokec4  activation\strokec5 .\strokec4 brands\strokec5 .\strokec4 brand_name\strokec5 ,\cb1 \strokec4 \
\cb3       question\strokec5 :\strokec4  user_question\strokec5 ,\cb1 \strokec4 \
\cb3       answer\strokec5 :\strokec4  response\strokec5 ,\cb1 \strokec4 \
\cb3       confidence\strokec5 :\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 confidence \strokec5 *\strokec4  \cf9 \strokec9 100\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3       response_time_ms\strokec5 :\strokec4  responseTime\strokec5 ,\cb1 \strokec4 \
\cb3       matched\strokec5 :\strokec4  matchedQA \strokec5 ?\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       platform\strokec5 :\strokec4  platform \strokec5 ||\strokec4  \cf6 \strokec6 'general'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       suggestions\strokec5 :\strokec4  generateSuggestions\strokec5 (\strokec4 user_question\strokec5 ,\strokec4  activation\strokec5 .\strokec4 qa_bank\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \})\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Chat error:'\cf4 \strokec5 ,\strokec4  error\strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\strokec4  \cb1 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  findBestMatch\strokec5 (\strokec4 question\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ,\strokec4  qaBank\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []):\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  qLower \strokec5 =\strokec4  question\strokec5 .\strokec4 toLowerCase\strokec5 ()\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  qWords \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Set\cf4 \strokec5 (\strokec4 qLower\strokec5 .\strokec4 split\strokec5 (\cf10 \cb3 \strokec10 /\\s+/\cf4 \cb3 \strokec5 ))\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 let\cf4 \strokec4  bestMatch\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \cf2 \strokec2 null\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 let\cf4 \strokec4  bestScore \strokec5 =\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  qa \cf2 \strokec2 of\cf4 \strokec4  qaBank\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  qaLower \strokec5 =\strokec4  qa\strokec5 .\strokec4 question\strokec5 .\strokec4 toLowerCase\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  qaWords \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Set\cf4 \strokec5 (\strokec4 qaLower\strokec5 .\strokec4 split\strokec5 (\cf10 \cb3 \strokec10 /\\s+/\cf4 \cb3 \strokec5 ))\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Calculate word overlap similarity\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  intersection \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Set\cf4 \strokec5 ([...\strokec4 qWords\strokec5 ].\strokec4 filter\strokec5 (\strokec4 w \strokec5 =>\strokec4  qaWords\strokec5 .\strokec4 has\strokec5 (\strokec4 w\strokec5 )))\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  union \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Set\cf4 \strokec5 ([...\strokec4 qWords\strokec5 ,\strokec4  \strokec5 ...\strokec4 qaWords\strokec5 ])\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  similarity \strokec5 =\strokec4  intersection\strokec5 .\strokec4 size \strokec5 /\strokec4  union\strokec5 .\strokec4 size\cb1 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 similarity \strokec5 >\strokec4  bestScore\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       bestScore \strokec5 =\strokec4  similarity\cb1 \
\cb3       bestMatch \strokec5 =\strokec4  \strokec5 \{\strokec4  qa\strokec5 ,\strokec4  similarity \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  bestMatch\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  detectIntent\strokec5 (\strokec4 question\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 string\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  q \strokec5 =\strokec4  question\strokec5 .\strokec4 toLowerCase\strokec5 ()\cb1 \strokec4 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'how'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'what'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'why'\cf4 \strokec5 ))\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 'informational'\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'buy'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'price'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'cost'\cf4 \strokec5 ))\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 'transactional'\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'where'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'find'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'location'\cf4 \strokec5 ))\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 'navigational'\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'best'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'better'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  q\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'vs'\cf4 \strokec5 ))\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 'commercial'\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 'general'\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  extractEntities\strokec5 (\strokec4 question\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 string\cf4 \strokec5 []\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  entities\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 []\strokec4  \strokec5 =\strokec4  \strokec5 []\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  words \strokec5 =\strokec4  question\strokec5 .\strokec4 split\strokec5 (\cf10 \cb3 \strokec10 /\\s+/\cf4 \cb3 \strokec5 )\cb1 \strokec4 \
\cb3   words\strokec5 .\strokec4 forEach\strokec5 (\strokec4 word \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 word\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  word\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ].\strokec4 toUpperCase\strokec5 ()\strokec4  \strokec5 &&\strokec4  word\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       entities\strokec5 .\strokec4 push\strokec5 (\strokec4 word\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3   \strokec5 \})\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  entities\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  generateSuggestions\strokec5 (\strokec4 question\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ,\strokec4  qaBank\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []):\strokec4  \cf2 \strokec2 string\cf4 \strokec5 []\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf7 \strokec7 // Return 3 related questions\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  related \strokec5 =\strokec4  qaBank\cb1 \
\cb3     \strokec5 .\strokec4 filter\strokec5 (\strokec4 qa \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  qWords \strokec5 =\strokec4  question\strokec5 .\strokec4 toLowerCase\strokec5 ().\strokec4 split\strokec5 (\cf10 \cb3 \strokec10 /\\s+/\cf4 \cb3 \strokec5 )\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  qaWords \strokec5 =\strokec4  qa\strokec5 .\strokec4 question\strokec5 .\strokec4 toLowerCase\strokec5 ().\strokec4 split\strokec5 (\cf10 \cb3 \strokec10 /\\s+/\cf4 \cb3 \strokec5 )\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  qWords\strokec5 .\strokec4 some\strokec5 ((\strokec4 w\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  qaWords\strokec5 .\strokec4 includes\strokec5 (\strokec4 w\strokec5 ))\cb1 \strokec4 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 3\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 map\strokec5 ((\strokec4 qa\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  qa\strokec5 .\strokec4 question\strokec5 )\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  related\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
}