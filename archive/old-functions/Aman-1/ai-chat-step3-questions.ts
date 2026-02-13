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
\cf7 \cb3 \strokec7  * STEP 3: Smart Question Generator\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Claude generates 30-50 platform-weighted questions with priority scoring\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  */\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf8 \strokec8 CLAUDE_API_KEY\cf4 \strokec4  \strokec5 =\strokec4  \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'ANTHROPIC_API_KEY'\cf4 \strokec5 )\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf8 \strokec8 CLAUDE_MODEL\cf4 \strokec4  \strokec5 =\strokec4  \cf6 \strokec6 'claude-sonnet-4-20250514'\cf4 \cb1 \strokec4 \
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
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  brand_id\strokec5 ,\strokec4  chronicle_id\strokec5 ,\strokec4  platform_research_id\strokec5 ,\strokec4  total_questions \strokec5 =\strokec4  \cf9 \strokec9 40\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brand_id \strokec5 ||\strokec4  \strokec5 !\strokec4 chronicle_id \strokec5 ||\strokec4  \strokec5 !\strokec4 platform_research_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'brand_id, chronicle_id, and platform_research_id required'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Questions] Generating \cf4 \strokec5 $\{\strokec4 total_questions\strokec5 \}\cf6 \strokec6  questions for brand \cf4 \strokec5 $\{\strokec4 brand_id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Get brand data\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  brand \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'brands'\cf4 \strokec5 ).\strokec4 select\strokec5 (\cf6 \strokec6 'brand_name, category, country'\cf4 \strokec5 ).\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 ).\strokec4 single\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brand\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Brand not found'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Get chronicle\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  chronicle \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_brand_chronicle'\cf4 \strokec5 ).\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 ).\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  chronicle_id\strokec5 ).\strokec4 single\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 chronicle\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Chronicle not found'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Get platform research\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  platformResearch \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_platform_research'\cf4 \strokec5 ).\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 ).\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  platform_research_id\strokec5 ).\strokec4 single\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 platformResearch\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Platform research not found'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Questions] Platform distribution:`\cf4 \strokec5 ,\strokec4  platformResearch\strokec5 .\strokec4 platform_distribution\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Build question generation prompt\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  prompt \strokec5 =\strokec4  buildQuestionPrompt\strokec5 (\strokec4 brand\strokec5 ,\strokec4  chronicle\strokec5 ,\strokec4  platformResearch\strokec5 ,\strokec4  total_questions\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Call Claude API\cf4 \cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Questions] Calling Claude API...'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  claudeResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cf6 \strokec6 'https://api.anthropic.com/v1/messages'\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         \cf6 \strokec6 'x-api-key'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 CLAUDE_API_KEY\cf4 \strokec5 !,\cb1 \strokec4 \
\cb3         \cf6 \strokec6 'anthropic-version'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '2023-06-01'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \strokec5 \},\cb1 \strokec4 \
\cb3       body\strokec5 :\strokec4  \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3         model\strokec5 :\strokec4  \cf8 \strokec8 CLAUDE_MODEL\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         max_tokens\strokec5 :\strokec4  \cf9 \strokec9 16000\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         temperature\strokec5 :\strokec4  \cf9 \strokec9 0.4\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         messages\strokec5 :\strokec4  \strokec5 [\{\strokec4  role\strokec5 :\strokec4  \cf6 \strokec6 'user'\cf4 \strokec5 ,\strokec4  content\strokec5 :\strokec4  prompt \strokec5 \}]\cb1 \strokec4 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 claudeResponse\strokec5 .\strokec4 ok\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 `Claude API error: \cf4 \strokec5 $\{\cf2 \strokec2 await\cf4 \strokec4  claudeResponse\strokec5 .\strokec4 text\strokec5 ()\}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  claudeData \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  claudeResponse\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  questionsText \strokec5 =\strokec4  claudeData\strokec5 .\strokec4 content\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ].\strokec4 text\cb1 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Questions] Claude response received (\cf4 \strokec5 $\{\strokec4 claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 total_tokens\strokec5 \}\cf6 \strokec6  tokens)`\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Parse questions JSON\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  parsedQuestions\cb1 \
\cb3     \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  jsonMatch \strokec5 =\strokec4  questionsText\strokec5 .\strokec4 match\strokec5 (\cf10 \cb3 \strokec10 /```json\\n?([\\s\\S]*?)\\n?```/\cf4 \cb3 \strokec5 )\strokec4  \strokec5 ||\strokec4  questionsText\strokec5 .\strokec4 match\strokec5 (\cf10 \cb3 \strokec10 /\\\{[\\s\\S]*\\\}/\cf4 \cb3 \strokec5 )\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  jsonText \strokec5 =\strokec4  jsonMatch \strokec5 ?\strokec4  \strokec5 (\strokec4 jsonMatch\strokec5 [\cf9 \strokec9 1\cf4 \strokec5 ]\strokec4  \strokec5 ||\strokec4  jsonMatch\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ])\strokec4  \strokec5 :\strokec4  questionsText\cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  parsed \strokec5 =\strokec4  \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 parse\strokec5 (\strokec4 jsonText\strokec5 )\cb1 \strokec4 \
\cb3       parsedQuestions \strokec5 =\strokec4  parsed\strokec5 .\strokec4 questions \strokec5 ||\strokec4  parsed\cb1 \
\cb3     \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 e\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[Questions] JSON parse error:'\cf4 \strokec5 ,\strokec4  e\strokec5 )\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Failed to parse questions from Claude response'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\cf8 \strokec8 Array\cf4 \strokec5 .\strokec4 isArray\strokec5 (\strokec4 parsedQuestions\strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Expected array of questions'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Questions] Parsed \cf4 \strokec5 $\{\strokec4 parsedQuestions\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  questions`\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Insert questions into database\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  questionRecords \strokec5 =\strokec4  parsedQuestions\strokec5 .\strokec4 map\strokec5 ((\strokec4 q\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3       brand_id\strokec5 ,\cb1 \strokec4 \
\cb3       chronicle_id\strokec5 ,\cb1 \strokec4 \
\cb3       platform_research_id\strokec5 ,\cb1 \strokec4 \
\cb3       question_text\strokec5 :\strokec4  q\strokec5 .\strokec4 question_text \strokec5 ||\strokec4  q\strokec5 .\strokec4 question\strokec5 ,\cb1 \strokec4 \
\cb3       question_category\strokec5 :\strokec4  q\strokec5 .\strokec4 category \strokec5 ||\strokec4  \cf6 \strokec6 'other'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       primary_platform\strokec5 :\strokec4  q\strokec5 .\strokec4 platform \strokec5 ||\strokec4  q\strokec5 .\strokec4 primary_platform \strokec5 ||\strokec4  \cf6 \strokec6 'google'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       platform_weight\strokec5 :\strokec4  parseFloat\strokec5 (\strokec4 q\strokec5 .\strokec4 platform_weight \strokec5 ||\strokec4  q\strokec5 .\strokec4 weight \strokec5 ||\strokec4  \cf9 \strokec9 0.5\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3       urgency_score\strokec5 :\strokec4  parseInt\strokec5 (\strokec4 q\strokec5 .\strokec4 urgency_score \strokec5 ||\strokec4  q\strokec5 .\strokec4 urgency \strokec5 ||\strokec4  \cf9 \strokec9 50\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3       impact_score\strokec5 :\strokec4  parseInt\strokec5 (\strokec4 q\strokec5 .\strokec4 impact_score \strokec5 ||\strokec4  q\strokec5 .\strokec4 impact \strokec5 ||\strokec4  \cf9 \strokec9 50\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3       is_frequently_asked\strokec5 :\strokec4  q\strokec5 .\strokec4 is_frequently_asked \strokec5 ||\strokec4  q\strokec5 .\strokec4 frequent \strokec5 ||\strokec4  \cf2 \strokec2 false\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       is_competitor_related\strokec5 :\strokec4  q\strokec5 .\strokec4 is_competitor_related \strokec5 ||\strokec4  q\strokec5 .\strokec4 competitor \strokec5 ||\strokec4  \cf2 \strokec2 false\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       question_intent\strokec5 :\strokec4  q\strokec5 .\strokec4 intent \strokec5 ||\strokec4  \cf6 \strokec6 'informational'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       user_persona\strokec5 :\strokec4  q\strokec5 .\strokec4 user_persona \strokec5 ||\strokec4  q\strokec5 .\strokec4 persona \strokec5 ||\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       search_keywords\strokec5 :\strokec4  q\strokec5 .\strokec4 keywords \strokec5 ||\strokec4  q\strokec5 .\strokec4 search_keywords \strokec5 ||\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3       related_questions\strokec5 :\strokec4  q\strokec5 .\strokec4 related_questions \strokec5 ||\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3       suggested_answer\strokec5 :\strokec4  q\strokec5 .\strokec4 answer_outline \strokec5 ||\strokec4  q\strokec5 .\strokec4 answer \strokec5 ||\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       answer_tone\strokec5 :\strokec4  q\strokec5 .\strokec4 tone \strokec5 ||\strokec4  \cf6 \strokec6 'friendly'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       answer_length\strokec5 :\strokec4  q\strokec5 .\strokec4 answer_length \strokec5 ||\strokec4  \cf6 \strokec6 'medium'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}))\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  insertedQuestions\strokec5 ,\strokec4  error\strokec5 :\strokec4  insertError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_smart_questions'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 insert\strokec5 (\strokec4 questionRecords\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 insertError\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[Questions] Insert error:'\cf4 \strokec5 ,\strokec4  insertError\strokec5 )\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  insertError\cb1 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Questions] Inserted \cf4 \strokec5 $\{\strokec4 insertedQuestions\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  questions into database`\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Calculate statistics\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  stats \strokec5 =\strokec4  calculateQuestionStats\strokec5 (\strokec4 insertedQuestions\strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  costUsd \strokec5 =\strokec4  \strokec5 ((\strokec4 claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 input_tokens \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 *\strokec4  \cf9 \strokec9 0.000003\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  \strokec5 ((\strokec4 claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 output_tokens \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 *\strokec4  \cf9 \strokec9 0.000015\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3       success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       brand_name\strokec5 :\strokec4  brand\strokec5 .\strokec4 brand_name\strokec5 ,\cb1 \strokec4 \
\cb3       questions_generated\strokec5 :\strokec4  insertedQuestions\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3       question_ids\strokec5 :\strokec4  insertedQuestions\strokec5 .\strokec4 map\strokec5 (\strokec4 q \strokec5 =>\strokec4  q\strokec5 .\strokec4 id\strokec5 ),\cb1 \strokec4 \
\cb3       statistics\strokec5 :\strokec4  stats\strokec5 ,\cb1 \strokec4 \
\cb3       cost_summary\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         tokens_used\strokec5 :\strokec4  claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 total_tokens \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         cost_usd\strokec5 :\strokec4  costUsd\strokec5 .\strokec4 toFixed\strokec5 (\cf9 \strokec9 4\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \},\cb1 \strokec4 \
\cb3       next_step\strokec5 :\strokec4  \cf6 \strokec6 'Step 4: Chat Activation'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \})\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[Questions] Error:'\cf4 \strokec5 ,\strokec4  error\strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  \cb1 \
\cb3       error\strokec5 :\strokec4  error\strokec5 .\strokec4 message\strokec5 ,\cb1 \strokec4 \
\cb3       step\strokec5 :\strokec4  \cf6 \strokec6 'question_generation'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  \cb1 \
\cb3       headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \cb1 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  buildQuestionPrompt\strokec5 (\strokec4 brand\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  chronicle\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  platformResearch\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  totalQuestions\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 string\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf7 \strokec7 // Calculate question allocation per platform\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  distribution \strokec5 =\strokec4  platformResearch\strokec5 .\strokec4 platform_distribution \strokec5 ||\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  platforms \strokec5 =\strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 keys\strokec5 (\strokec4 distribution\strokec5 ).\strokec4 filter\strokec5 (\strokec4 p \strokec5 =>\strokec4  distribution\strokec5 [\strokec4 p\strokec5 ].\strokec4 percentage\strokec5 )\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 `You are generating smart, high-value questions for \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6 's AI chat assistant.\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 # BRAND CONTEXT\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 **Name:** \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 **Category:** \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 category\strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 **Country:** \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 country\strokec5 \}\cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 # BRAND DNA (from Chronicle)\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 chronicle\strokec5 .\strokec4 brand_dna\strokec5 ,\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 # COMPETITIVE POSITION\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 chronicle\strokec5 .\strokec4 competitive_position\strokec5 ,\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 # KEY THEMES\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 chronicle\strokec5 .\strokec4 key_themes\strokec5 ,\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 # PLATFORM ACTIVITY DISTRIBUTION\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 platformResearch\strokec5 .\strokec4 platform_distribution\strokec5 ,\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 **Top Platform:** \cf4 \strokec5 $\{\strokec4 platformResearch\strokec5 .\strokec4 top_platform\strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 **Platform Priority:** \cf4 \strokec5 $\{\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 platformResearch\strokec5 .\strokec4 platform_priority_order\strokec5 )\}\cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 # YOUR TASK\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 Generate \cf4 \strokec5 $\{\strokec4 totalQuestions\strokec5 \}\cf6 \strokec6  high-priority questions that customers/users ask about \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6 .\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 **Question Distribution by Platform:**\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\strokec4 platforms\strokec5 .\strokec4 map\strokec5 (\strokec4 p \strokec5 =>\strokec4  \cf6 \strokec6 `- \cf4 \strokec5 $\{\strokec4 p\strokec5 \}\cf6 \strokec6 : \cf4 \strokec5 $\{\cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 parseFloat\strokec5 (\strokec4 distribution\strokec5 [\strokec4 p\strokec5 ].\strokec4 percentage \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf9 \strokec9 100\cf4 \strokec4  \strokec5 *\strokec4  totalQuestions\strokec5 )\}\cf6 \strokec6  questions`\cf4 \strokec5 ).\strokec4 join\strokec5 (\cf6 \strokec6 '\\n'\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 **Question Categories to Cover:**\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - brand_identity (who are you, what do you stand for)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - product_features (menu, services, offerings)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - pricing (costs, value, deals)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - competition (vs competitors, comparisons)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - customer_service (support, complaints, feedback)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - availability (locations, hours, delivery)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - reviews (ratings, testimonials, reputation)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - sustainability (ethics, environment, social)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - partnerships (collaborations, affiliations)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - innovation (new products, technology)\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 **Priority Scoring Rules:**\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - urgency_score (1-100): How time-sensitive is this question?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   - 90-100: Critical (needs immediate answer)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   - 70-89: High (important, affects decisions)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   - 50-69: Medium (standard importance)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   - 1-49: Low (nice to have)\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 - impact_score (1-100): How many users does this affect?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   - 90-100: Very high (most users ask this)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   - 70-89: High (common question)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   - 50-69: Medium (moderate frequency)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   - 1-49: Low (niche question)\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 **Platform-Specific Adaptations:**\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - **tiktok**: Casual, short, Indonesian language, trendy, emoji-friendly\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - **instagram**: Lifestyle-focused, visual references, aspirational, friendly\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - **google**: Informational, detailed, SEO-optimized, formal\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - **twitter**: Concise, responsive, empathetic, 280-char friendly\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - **linkedin**: Professional, business-focused, data-driven, corporate\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 **Output Format (JSON array):**\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 \{\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   "questions": [\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     \{\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "question_text": "Dimana outlet terdekat?",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "category": "availability",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "platform": "tiktok",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "platform_weight": 0.7,\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "urgency_score": 95,\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "impact_score": 90,\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "frequent": true,\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "competitor": false,\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "intent": "transactional",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "persona": "young urban professional, immediate need",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "keywords": ["location", "near me", "outlet"],\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "answer_outline": "Show 3 nearest locations with distance, hours, directions",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "tone": "casual",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6       "answer_length": "short"\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     \}\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   ]\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 \}\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 Generate EXACTLY \cf4 \strokec5 $\{\strokec4 totalQuestions\strokec5 \}\cf6 \strokec6  questions. Be thorough, insightful, and platform-aware.\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 Output ONLY the JSON, no preamble.`\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  calculateQuestionStats\strokec5 (\strokec4 questions\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 [])\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  byPlatform\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  byCategory\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  byUrgency\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\strokec4  critical\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  high\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  medium\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  low\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  q \cf2 \strokec2 of\cf4 \strokec4  questions\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf7 \strokec7 // By platform\cf4 \cb1 \strokec4 \
\cb3     byPlatform\strokec5 [\strokec4 q\strokec5 .\strokec4 primary_platform\strokec5 ]\strokec4  \strokec5 =\strokec4  \strokec5 (\strokec4 byPlatform\strokec5 [\strokec4 q\strokec5 .\strokec4 primary_platform\strokec5 ]\strokec4  \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  \cf9 \strokec9 1\cf4 \cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf7 \strokec7 // By category\cf4 \cb1 \strokec4 \
\cb3     byCategory\strokec5 [\strokec4 q\strokec5 .\strokec4 question_category\strokec5 ]\strokec4  \strokec5 =\strokec4  \strokec5 (\strokec4 byCategory\strokec5 [\strokec4 q\strokec5 .\strokec4 question_category\strokec5 ]\strokec4  \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  \cf9 \strokec9 1\cf4 \cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf7 \strokec7 // By urgency\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 q\strokec5 .\strokec4 urgency_score \strokec5 >=\strokec4  \cf9 \strokec9 90\cf4 \strokec5 )\strokec4  byUrgency\strokec5 .\strokec4 critical\strokec5 ++\cb1 \strokec4 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 q\strokec5 .\strokec4 urgency_score \strokec5 >=\strokec4  \cf9 \strokec9 70\cf4 \strokec5 )\strokec4  byUrgency\strokec5 .\strokec4 high\strokec5 ++\cb1 \strokec4 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 q\strokec5 .\strokec4 urgency_score \strokec5 >=\strokec4  \cf9 \strokec9 50\cf4 \strokec5 )\strokec4  byUrgency\strokec5 .\strokec4 medium\strokec5 ++\cb1 \strokec4 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  byUrgency\strokec5 .\strokec4 low\strokec5 ++\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf7 \strokec7 // Top questions by priority\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  topQuestions \strokec5 =\strokec4  questions\cb1 \
\cb3     \strokec5 .\strokec4 sort\strokec5 ((\strokec4 a\strokec5 ,\strokec4  b\strokec5 )\strokec4  \strokec5 =>\strokec4  b\strokec5 .\strokec4 priority_score \strokec5 -\strokec4  a\strokec5 .\strokec4 priority_score\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 10\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 map\strokec5 (\strokec4 q \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3       question\strokec5 :\strokec4  q\strokec5 .\strokec4 question_text\strokec5 ,\cb1 \strokec4 \
\cb3       platform\strokec5 :\strokec4  q\strokec5 .\strokec4 primary_platform\strokec5 ,\cb1 \strokec4 \
\cb3       priority\strokec5 :\strokec4  q\strokec5 .\strokec4 priority_score\strokec5 ,\cb1 \strokec4 \
\cb3       urgency\strokec5 :\strokec4  q\strokec5 .\strokec4 urgency_score\strokec5 ,\cb1 \strokec4 \
\cb3       impact\strokec5 :\strokec4  q\strokec5 .\strokec4 impact_score\cb1 \
\cb3     \strokec5 \}))\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     total\strokec5 :\strokec4  questions\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3     by_platform\strokec5 :\strokec4  byPlatform\strokec5 ,\cb1 \strokec4 \
\cb3     by_category\strokec5 :\strokec4  byCategory\strokec5 ,\cb1 \strokec4 \
\cb3     by_urgency\strokec5 :\strokec4  byUrgency\strokec5 ,\cb1 \strokec4 \
\cb3     top_10_questions\strokec5 :\strokec4  topQuestions\strokec5 ,\cb1 \strokec4 \
\cb3     avg_priority\strokec5 :\strokec4  \strokec5 (\strokec4 questions\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  q\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  q\strokec5 .\strokec4 priority_score\strokec5 ,\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  questions\strokec5 .\strokec4 length\strokec5 ).\strokec4 toFixed\strokec5 (\cf9 \strokec9 2\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3     avg_urgency\strokec5 :\strokec4  \strokec5 (\strokec4 questions\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  q\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  q\strokec5 .\strokec4 urgency_score\strokec5 ,\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  questions\strokec5 .\strokec4 length\strokec5 ).\strokec4 toFixed\strokec5 (\cf9 \strokec9 2\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3     avg_impact\strokec5 :\strokec4  \strokec5 (\strokec4 questions\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  q\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  q\strokec5 .\strokec4 impact_score\strokec5 ,\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  questions\strokec5 .\strokec4 length\strokec5 ).\strokec4 toFixed\strokec5 (\cf9 \strokec9 2\cf4 \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
}