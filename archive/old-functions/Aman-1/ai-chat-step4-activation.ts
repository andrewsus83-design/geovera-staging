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
\cf7 \cb3 \strokec7  * STEP 4: Chat Activation Engine\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Activates live chat system with platform-aware configurations\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  */\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \strokec2 async\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 !==\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'POST required'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       status\strokec5 :\strokec4  \cf9 \strokec9 405\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \cb1 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabase \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  brand_id\strokec5 ,\strokec4  chronicle_id \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brand_id \strokec5 ||\strokec4  \strokec5 !\strokec4 chronicle_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'brand_id and chronicle_id required'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[ChatActivation] Activating chat for brand \cf4 \strokec5 $\{\strokec4 brand_id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Get brand info\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  brand \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'brands'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'brand_name, category, country'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brand\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Brand not found'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Get chronicle\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  chronicle \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_brand_chronicle'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  chronicle_id\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 chronicle\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Chronicle not found'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Get questions\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  questions \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_smart_questions'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'chronicle_id'\cf4 \strokec5 ,\strokec4  chronicle_id\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'priority_score'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 questions \strokec5 ||\strokec4  questions\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'No questions found. Run Step 3 first.'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[ChatActivation] Found \cf4 \strokec5 $\{\strokec4 questions\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  questions`\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Build system prompt\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  systemPrompt \strokec5 =\strokec4  buildChatSystemPrompt\strokec5 (\strokec4 brand\strokec5 ,\strokec4  chronicle\strokec5 ,\strokec4  questions\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Build platform configs\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  platformConfigs \strokec5 =\strokec4  buildPlatformConfigs\strokec5 (\strokec4 questions\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Calculate question stats\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  questionStats \strokec5 =\strokec4  calculateStats\strokec5 (\strokec4 questions\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Save chat activation\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  chatActivation\strokec5 ,\strokec4  error\strokec5 :\strokec4  insertError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_chat_activation'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 insert\strokec5 (\{\cb1 \strokec4 \
\cb3         brand_id\strokec5 ,\cb1 \strokec4 \
\cb3         chronicle_id\strokec5 ,\cb1 \strokec4 \
\cb3         chat_name\strokec5 :\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6  AI Assistant`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         chat_description\strokec5 :\strokec4  \cf6 \strokec6 `Platform-aware AI chat specialized in \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 category\strokec5 \}\cf6 \strokec6  - \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         system_prompt\strokec5 :\strokec4  systemPrompt\strokec5 ,\cb1 \strokec4 \
\cb3         platform_configs\strokec5 :\strokec4  platformConfigs\strokec5 ,\cb1 \strokec4 \
\cb3         question_ids\strokec5 :\strokec4  questions\strokec5 .\strokec4 map\strokec5 (\strokec4 q \strokec5 =>\strokec4  q\strokec5 .\strokec4 id\strokec5 ),\cb1 \strokec4 \
\cb3         total_questions\strokec5 :\strokec4  questions\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf6 \strokec6 'active'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         activated_at\strokec5 :\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 ()\cb1 \strokec4 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 insertError\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[ChatActivation] Insert error:'\cf4 \strokec5 ,\strokec4  insertError\strokec5 )\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  insertError\cb1 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[ChatActivation] Chat activated with ID \cf4 \strokec5 $\{\strokec4 chatActivation\strokec5 .\strokec4 id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3       success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       chat_activation_id\strokec5 :\strokec4  chatActivation\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3       chat_name\strokec5 :\strokec4  chatActivation\strokec5 .\strokec4 chat_name\strokec5 ,\cb1 \strokec4 \
\cb3       status\strokec5 :\strokec4  \cf6 \strokec6 'active'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       activated_at\strokec5 :\strokec4  chatActivation\strokec5 .\strokec4 activated_at\strokec5 ,\cb1 \strokec4 \
\cb3       question_bank\strokec5 :\strokec4  questionStats\strokec5 ,\cb1 \strokec4 \
\cb3       platform_configs\strokec5 :\strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 keys\strokec5 (\strokec4 platformConfigs\strokec5 ),\cb1 \strokec4 \
\cb3       sample_questions\strokec5 :\strokec4  questions\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 5\cf4 \strokec5 ).\strokec4 map\strokec5 (\strokec4 q \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3         question\strokec5 :\strokec4  q\strokec5 .\strokec4 question_text\strokec5 ,\cb1 \strokec4 \
\cb3         platform\strokec5 :\strokec4  q\strokec5 .\strokec4 primary_platform\strokec5 ,\cb1 \strokec4 \
\cb3         category\strokec5 :\strokec4  q\strokec5 .\strokec4 question_category\strokec5 ,\cb1 \strokec4 \
\cb3         priority\strokec5 :\strokec4  q\strokec5 .\strokec4 priority_score\cb1 \
\cb3       \strokec5 \})),\cb1 \strokec4 \
\cb3       chat_personality\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         brand_voice\strokec5 :\strokec4  chronicle\strokec5 .\strokec4 brand_dna\strokec5 ?.\strokec4 brand_voice \strokec5 ||\strokec4  \cf6 \strokec6 'Friendly and professional'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         tone\strokec5 :\strokec4  \cf6 \strokec6 'Adaptive per platform'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         expertise\strokec5 :\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 category\strokec5 \}\cf6 \strokec6  expert with deep brand knowledge`\cf4 \cb1 \strokec4 \
\cb3       \strokec5 \},\cb1 \strokec4 \
\cb3       ready_for\strokec5 :\strokec4  \cf6 \strokec6 'Live conversations'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       usage\strokec5 :\strokec4  \cf6 \strokec6 `Chat system ready - integrate with frontend or use via API`\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \})\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[ChatActivation] Error:'\cf4 \strokec5 ,\strokec4  error\strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  \cb1 \
\cb3       error\strokec5 :\strokec4  error\strokec5 .\strokec4 message\strokec5 ,\cb1 \strokec4 \
\cb3       step\strokec5 :\strokec4  \cf6 \strokec6 'chat_activation'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  \cb1 \
\cb3       headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \cb1 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  buildChatSystemPrompt\strokec5 (\strokec4 brand\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  chronicle\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  questions\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []):\strokec4  \cf2 \strokec2 string\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  topQuestions \strokec5 =\strokec4  questions\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 20\cf4 \strokec5 )\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 `You are an AI assistant specialized in \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6 , a \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 category\strokec5 \}\cf6 \strokec6  brand\cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 country \strokec5 ?\strokec4  \cf6 \strokec6 ` based in \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 country\strokec5 \}\cf6 \strokec6 `\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 \}\cf6 \strokec6 .\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 # BRAND DNA\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 Core Identity: \cf4 \strokec5 $\{\strokec4 chronicle\strokec5 .\strokec4 brand_dna\strokec5 ?.\strokec4 core_identity \strokec5 ||\strokec4  \cf6 \strokec6 'Brand champion'\cf4 \strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 Brand Voice: \cf4 \strokec5 $\{\strokec4 chronicle\strokec5 .\strokec4 brand_dna\strokec5 ?.\strokec4 brand_voice \strokec5 ||\strokec4  \cf6 \strokec6 'Friendly and professional'\cf4 \strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 Positioning: \cf4 \strokec5 $\{\strokec4 chronicle\strokec5 .\strokec4 brand_dna\strokec5 ?.\strokec4 positioning \strokec5 ||\strokec4  \cf6 \strokec6 'Market leader'\cf4 \strokec5 \}\cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 # KEY THEMES\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{(\strokec4 chronicle\strokec5 .\strokec4 key_themes \strokec5 ||\strokec4  \strokec5 []).\strokec4 map\strokec5 ((\strokec4 t\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ,\strokec4  i\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 i\strokec5 +\cf9 \strokec9 1\cf4 \strokec5 \}\cf6 \strokec6 . \cf4 \strokec5 $\{\strokec4 t\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ).\strokec4 join\strokec5 (\cf6 \strokec6 '\\n'\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 # COMPETITIVE POSITION\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 Main Competitors: \cf4 \strokec5 $\{(\strokec4 chronicle\strokec5 .\strokec4 competitive_position\strokec5 ?.\strokec4 main_competitors \strokec5 ||\strokec4  \strokec5 []).\strokec4 join\strokec5 (\cf6 \strokec6 ', '\cf4 \strokec5 )\}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 Market Position: \cf4 \strokec5 $\{\strokec4 chronicle\strokec5 .\strokec4 competitive_position\strokec5 ?.\strokec4 market_position \strokec5 ||\strokec4  \cf6 \strokec6 'Established player'\cf4 \strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 Key Differentiators: \cf4 \strokec5 $\{(\strokec4 chronicle\strokec5 .\strokec4 competitive_position\strokec5 ?.\strokec4 key_differentiators \strokec5 ||\strokec4  \strokec5 []).\strokec4 join\strokec5 (\cf6 \strokec6 ', '\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 # YOUR ROLE\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - Answer questions about \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6  accurately and helpfully\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - Use brand voice: \cf4 \strokec5 $\{\strokec4 chronicle\strokec5 .\strokec4 brand_dna\strokec5 ?.\strokec4 brand_voice \strokec5 ||\strokec4  \cf6 \strokec6 'friendly and professional'\cf4 \strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 - Adapt tone based on platform:\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   * TikTok: Casual, trendy, emoji-friendly, short responses\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   * Instagram: Lifestyle-focused, visual references, friendly\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   * Google: Informative, detailed, SEO-optimized\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   * Twitter: Concise, responsive, empathetic\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   * LinkedIn: Professional, business-focused, data-driven\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - Cite evidence from brand data when applicable\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - Be honest about limitations - if you don't know, say so\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 # HIGH-PRIORITY QUESTIONS (\cf4 \strokec5 $\{\strokec4 topQuestions\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6 )\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 You have been trained on these frequently asked questions:\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\strokec4 topQuestions\strokec5 .\strokec4 map\strokec5 ((\strokec4 q\strokec5 ,\strokec4  i\strokec5 )\strokec4  \strokec5 =>\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 i\strokec5 +\cf9 \strokec9 1\cf4 \strokec5 \}\cf6 \strokec6 . \cf4 \strokec5 $\{\strokec4 q\strokec5 .\strokec4 question_text\strokec5 \}\cf6 \strokec6  [\cf4 \strokec5 $\{\strokec4 q\strokec5 .\strokec4 primary_platform\strokec5 \}\cf6 \strokec6 ]`\cf4 \strokec5 ).\strokec4 join\strokec5 (\cf6 \strokec6 '\\n'\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 When users ask similar questions, provide accurate, platform-appropriate answers.\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 Always be helpful, authentic, and aligned with \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6 's brand values.`\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  buildPlatformConfigs\strokec5 (\strokec4 questions\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []):\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  configs\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf7 \strokec7 // Group questions by platform\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  platformGroups\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  q \cf2 \strokec2 of\cf4 \strokec4  questions\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 platformGroups\strokec5 [\strokec4 q\strokec5 .\strokec4 primary_platform\strokec5 ])\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       platformGroups\strokec5 [\strokec4 q\strokec5 .\strokec4 primary_platform\strokec5 ]\strokec4  \strokec5 =\strokec4  \strokec5 []\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3     platformGroups\strokec5 [\strokec4 q\strokec5 .\strokec4 primary_platform\strokec5 ].\strokec4 push\strokec5 (\strokec4 q\strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf7 \strokec7 // Build config for each platform\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  \strokec5 [\strokec4 platform\strokec5 ,\strokec4  platformQuestions\strokec5 ]\strokec4  \cf2 \strokec2 of\cf4 \strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 entries\strokec5 (\strokec4 platformGroups\strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  pqs\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  platformQuestions\cb1 \
\cb3     \cb1 \
\cb3     configs\strokec5 [\strokec4 platform\strokec5 ]\strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       question_count\strokec5 :\strokec4  pqs\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3       avg_priority\strokec5 :\strokec4  \strokec5 (\strokec4 pqs\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ,\strokec4  q\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  q\strokec5 .\strokec4 priority_score\strokec5 ,\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  pqs\strokec5 .\strokec4 length\strokec5 ).\strokec4 toFixed\strokec5 (\cf9 \strokec9 1\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3       tone\strokec5 :\strokec4  platform \strokec5 ===\strokec4  \cf6 \strokec6 'tiktok'\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'casual'\cf4 \strokec4  \strokec5 :\strokec4  \cb1 \
\cb3             platform \strokec5 ===\strokec4  \cf6 \strokec6 'instagram'\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'friendly'\cf4 \strokec4  \strokec5 :\cb1 \strokec4 \
\cb3             platform \strokec5 ===\strokec4  \cf6 \strokec6 'linkedin'\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'professional'\cf4 \strokec4  \strokec5 :\strokec4  \cb1 \
\cb3             platform \strokec5 ===\strokec4  \cf6 \strokec6 'twitter'\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'concise'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'informative'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       max_length\strokec5 :\strokec4  platform \strokec5 ===\strokec4  \cf6 \strokec6 'twitter'\cf4 \strokec4  \strokec5 ?\strokec4  \cf9 \strokec9 280\cf4 \strokec4  \strokec5 :\strokec4  \cb1 \
\cb3                   platform \strokec5 ===\strokec4  \cf6 \strokec6 'tiktok'\cf4 \strokec4  \strokec5 ?\strokec4  \cf9 \strokec9 300\cf4 \strokec4  \strokec5 :\strokec4  \cb1 \
\cb3                   platform \strokec5 ===\strokec4  \cf6 \strokec6 'instagram'\cf4 \strokec4  \strokec5 ?\strokec4  \cf9 \strokec9 500\cf4 \strokec4  \strokec5 :\cb1 \strokec4 \
\cb3                   platform \strokec5 ===\strokec4  \cf6 \strokec6 'google'\cf4 \strokec4  \strokec5 ?\strokec4  \cf9 \strokec9 1000\cf4 \strokec4  \strokec5 :\strokec4  \cf9 \strokec9 600\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       emoji_usage\strokec5 :\strokec4  platform \strokec5 ===\strokec4  \cf6 \strokec6 'tiktok'\cf4 \strokec4  \strokec5 ||\strokec4  platform \strokec5 ===\strokec4  \cf6 \strokec6 'instagram'\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'moderate'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'minimal'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       language_preference\strokec5 :\strokec4  platform \strokec5 ===\strokec4  \cf6 \strokec6 'tiktok'\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'casual_indonesian'\cf4 \strokec4  \strokec5 :\strokec4  \cb1 \
\cb3                            platform \strokec5 ===\strokec4  \cf6 \strokec6 'linkedin'\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'formal_english'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'conversational'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  configs\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  calculateStats\strokec5 (\strokec4 questions\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 [])\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  byPlatform\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  byUrgency\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\strokec4  critical\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  high\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  medium\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  low\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  q \cf2 \strokec2 of\cf4 \strokec4  questions\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     byPlatform\strokec5 [\strokec4 q\strokec5 .\strokec4 primary_platform\strokec5 ]\strokec4  \strokec5 =\strokec4  \strokec5 (\strokec4 byPlatform\strokec5 [\strokec4 q\strokec5 .\strokec4 primary_platform\strokec5 ]\strokec4  \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  \cf9 \strokec9 1\cf4 \cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 q\strokec5 .\strokec4 urgency_score \strokec5 >=\strokec4  \cf9 \strokec9 90\cf4 \strokec5 )\strokec4  byUrgency\strokec5 .\strokec4 critical\strokec5 ++\cb1 \strokec4 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 q\strokec5 .\strokec4 urgency_score \strokec5 >=\strokec4  \cf9 \strokec9 70\cf4 \strokec5 )\strokec4  byUrgency\strokec5 .\strokec4 high\strokec5 ++\cb1 \strokec4 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 q\strokec5 .\strokec4 urgency_score \strokec5 >=\strokec4  \cf9 \strokec9 50\cf4 \strokec5 )\strokec4  byUrgency\strokec5 .\strokec4 medium\strokec5 ++\cb1 \strokec4 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  byUrgency\strokec5 .\strokec4 low\strokec5 ++\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     total\strokec5 :\strokec4  questions\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3     by_platform\strokec5 :\strokec4  byPlatform\strokec5 ,\cb1 \strokec4 \
\cb3     by_urgency\strokec5 :\strokec4  byUrgency\strokec5 ,\cb1 \strokec4 \
\cb3     avg_priority\strokec5 :\strokec4  \strokec5 (\strokec4 questions\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  q\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  q\strokec5 .\strokec4 priority_score\strokec5 ,\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  questions\strokec5 .\strokec4 length\strokec5 ).\strokec4 toFixed\strokec5 (\cf9 \strokec9 1\cf4 \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
}