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
\cf7 \cb3 \strokec7  * STEP 1: Brand Chronicle Analyzer\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Claude reverse engineers complete brand DNA from all available data\cf4 \cb1 \strokec4 \
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
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  brand_id \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brand_id\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'brand_id required'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Chronicle] Starting analysis for brand \cf4 \strokec5 $\{\strokec4 brand_id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Gather all available brand data\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  brandData \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  gatherBrandData\strokec5 (\strokec4 supabase\strokec5 ,\strokec4  brand_id\strokec5 )\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brandData\strokec5 .\strokec4 brand\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Brand not found'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Chronicle] Gathered data: \cf4 \strokec5 $\{\strokec4 brandData\strokec5 .\strokec4 insights\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  insights, \cf4 \strokec5 $\{\strokec4 brandData\strokec5 .\strokec4 reviews\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  reviews, \cf4 \strokec5 $\{\strokec4 brandData\strokec5 .\strokec4 social\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  social signals`\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Build comprehensive analysis prompt\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  prompt \strokec5 =\strokec4  buildChroniclePrompt\strokec5 (\strokec4 brandData\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Call Claude API\cf4 \cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Chronicle] Calling Claude API...'\cf4 \strokec5 )\cb1 \strokec4 \
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
\cb3         temperature\strokec5 :\strokec4  \cf9 \strokec9 0.3\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         messages\strokec5 :\strokec4  \strokec5 [\{\strokec4  role\strokec5 :\strokec4  \cf6 \strokec6 'user'\cf4 \strokec5 ,\strokec4  content\strokec5 :\strokec4  prompt \strokec5 \}]\cb1 \strokec4 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 claudeResponse\strokec5 .\strokec4 ok\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  error \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  claudeResponse\strokec5 .\strokec4 text\strokec5 ()\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 `Claude API error: \cf4 \strokec5 $\{\strokec4 error\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  claudeData \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  claudeResponse\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  chronicleText \strokec5 =\strokec4  claudeData\strokec5 .\strokec4 content\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ].\strokec4 text\cb1 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Chronicle] Claude response received (\cf4 \strokec5 $\{\strokec4 claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 total_tokens\strokec5 \}\cf6 \strokec6  tokens)`\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Parse JSON from response\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  parsedChronicle\cb1 \
\cb3     \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf7 \strokec7 // Extract JSON from markdown code blocks if present\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  jsonMatch \strokec5 =\strokec4  chronicleText\strokec5 .\strokec4 match\strokec5 (\cf10 \cb3 \strokec10 /```json\\n?([\\s\\S]*?)\\n?```/\cf4 \cb3 \strokec5 )\strokec4  \strokec5 ||\strokec4  \cb1 \
\cb3                        chronicleText\strokec5 .\strokec4 match\strokec5 (\cf10 \cb3 \strokec10 /\\\{[\\s\\S]*\\\}/\cf4 \cb3 \strokec5 )\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  jsonText \strokec5 =\strokec4  jsonMatch \strokec5 ?\strokec4  \strokec5 (\strokec4 jsonMatch\strokec5 [\cf9 \strokec9 1\cf4 \strokec5 ]\strokec4  \strokec5 ||\strokec4  jsonMatch\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ])\strokec4  \strokec5 :\strokec4  chronicleText\cb1 \
\cb3       parsedChronicle \strokec5 =\strokec4  \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 parse\strokec5 (\strokec4 jsonText\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 e\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[Chronicle] JSON parse error:'\cf4 \strokec5 ,\strokec4  e\strokec5 )\cb1 \strokec4 \
\cb3       parsedChronicle \strokec5 =\strokec4  \strokec5 \{\strokec4  raw\strokec5 :\strokec4  chronicleText \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Calculate cost\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  costUsd \strokec5 =\strokec4  \strokec5 ((\strokec4 claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 input_tokens \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 *\strokec4  \cf9 \strokec9 0.000003\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  \cb1 \
\cb3                     \strokec5 ((\strokec4 claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 output_tokens \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 *\strokec4  \cf9 \strokec9 0.000015\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Save to database\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  chronicle\strokec5 ,\strokec4  error\strokec5 :\strokec4  dbError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_brand_chronicle'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 insert\strokec5 (\{\cb1 \strokec4 \
\cb3         brand_id\strokec5 ,\cb1 \strokec4 \
\cb3         chronicle_version\strokec5 :\strokec4  \cf6 \strokec6 'v1.0'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         brand_dna\strokec5 :\strokec4  parsedChronicle\strokec5 .\strokec4 brand_dna \strokec5 ||\strokec4  \strokec5 \{\},\cb1 \strokec4 \
\cb3         business_model\strokec5 :\strokec4  parsedChronicle\strokec5 .\strokec4 business_model \strokec5 ||\strokec4  \strokec5 \{\},\cb1 \strokec4 \
\cb3         competitive_position\strokec5 :\strokec4  parsedChronicle\strokec5 .\strokec4 competitive_position \strokec5 ||\strokec4  \strokec5 \{\},\cb1 \strokec4 \
\cb3         customer_profile\strokec5 :\strokec4  parsedChronicle\strokec5 .\strokec4 customer_profile \strokec5 ||\strokec4  \strokec5 \{\},\cb1 \strokec4 \
\cb3         brand_narrative\strokec5 :\strokec4  parsedChronicle\strokec5 .\strokec4 brand_narrative \strokec5 ||\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         key_themes\strokec5 :\strokec4  parsedChronicle\strokec5 .\strokec4 key_themes \strokec5 ||\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3         strategic_focus\strokec5 :\strokec4  parsedChronicle\strokec5 .\strokec4 strategic_focus \strokec5 ||\strokec4  \strokec5 \{\},\cb1 \strokec4 \
\cb3         full_document\strokec5 :\strokec4  chronicleText\strokec5 ,\cb1 \strokec4 \
\cb3         analysis_date\strokec5 :\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 (),\cb1 \strokec4 \
\cb3         data_sources_count\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           insights\strokec5 :\strokec4  brandData\strokec5 .\strokec4 insights\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           reviews\strokec5 :\strokec4  brandData\strokec5 .\strokec4 reviews\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           social\strokec5 :\strokec4  brandData\strokec5 .\strokec4 social\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           search\strokec5 :\strokec4  brandData\strokec5 .\strokec4 search\strokec5 .\strokec4 length\cb1 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         tokens_used\strokec5 :\strokec4  claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 total_tokens \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         cost_usd\strokec5 :\strokec4  costUsd\cb1 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 dbError\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  dbError\cb1 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Chronicle] Saved to database with ID \cf4 \strokec5 $\{\strokec4 chronicle\strokec5 .\strokec4 id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3       success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       chronicle_id\strokec5 :\strokec4  chronicle\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3       brand_name\strokec5 :\strokec4  brandData\strokec5 .\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 ,\cb1 \strokec4 \
\cb3       analysis_summary\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         sections_completed\strokec5 :\strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 keys\strokec5 (\strokec4 parsedChronicle\strokec5 ).\strokec4 filter\strokec5 (\strokec4 k \strokec5 =>\strokec4  parsedChronicle\strokec5 [\strokec4 k\strokec5 ]).\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3         key_themes_count\strokec5 :\strokec4  parsedChronicle\strokec5 .\strokec4 key_themes\strokec5 ?.\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         data_sources\strokec5 :\strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 values\strokec5 (\strokec4 chronicle\strokec5 .\strokec4 data_sources_count\strokec5 ).\strokec4 reduce\strokec5 ((\strokec4 a\strokec5 ,\strokec4  b\strokec5 )\strokec4  \strokec5 =>\strokec4  a \strokec5 +\strokec4  b\strokec5 ,\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3         tokens_used\strokec5 :\strokec4  chronicle\strokec5 .\strokec4 tokens_used\strokec5 ,\cb1 \strokec4 \
\cb3         cost_usd\strokec5 :\strokec4  \cf8 \strokec8 Number\cf4 \strokec5 (\strokec4 chronicle\strokec5 .\strokec4 cost_usd\strokec5 ).\strokec4 toFixed\strokec5 (\cf9 \strokec9 4\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \},\cb1 \strokec4 \
\cb3       next_step\strokec5 :\strokec4  \cf6 \strokec6 'Step 2: Platform Activity Research'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \})\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[Chronicle] Error:'\cf4 \strokec5 ,\strokec4  error\strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  \cb1 \
\cb3       error\strokec5 :\strokec4  error\strokec5 .\strokec4 message\strokec5 ,\cb1 \strokec4 \
\cb3       step\strokec5 :\strokec4  \cf6 \strokec6 'brand_chronicle_analysis'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  \cb1 \
\cb3       headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \cb1 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  gatherBrandData\strokec5 (\strokec4 supabase\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  brand_id\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec5 [\strokec4 brand\strokec5 ,\strokec4  insights\strokec5 ,\strokec4  reviews\strokec5 ,\strokec4  social\strokec5 ,\strokec4  search\strokec5 ]\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  \cf8 \strokec8 Promise\cf4 \strokec5 .\strokec4 all\strokec5 ([\cb1 \strokec4 \
\cb3     supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'brands'\cf4 \strokec5 ).\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 ).\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 ).\strokec4 single\strokec5 (),\cb1 \strokec4 \
\cb3     supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_insights'\cf4 \strokec5 ).\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 ).\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 ).\strokec4 order\strokec5 (\cf6 \strokec6 'created_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \}).\strokec4 limit\strokec5 (\cf9 \strokec9 20\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3     supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_strategic_evidence'\cf4 \strokec5 ).\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 ).\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 ).\strokec4 order\strokec5 (\cf6 \strokec6 'scraped_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \}).\strokec4 limit\strokec5 (\cf9 \strokec9 30\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3     supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_pulse_signals'\cf4 \strokec5 ).\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 ).\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 ).\strokec4 order\strokec5 (\cf6 \strokec6 'posted_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \}).\strokec4 limit\strokec5 (\cf9 \strokec9 20\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3     supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_search_visibility'\cf4 \strokec5 ).\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 ).\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 ).\strokec4 order\strokec5 (\cf6 \strokec6 'scraped_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \}).\strokec4 limit\strokec5 (\cf9 \strokec9 10\cf4 \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 ])\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     brand\strokec5 :\strokec4  brand\strokec5 .\strokec4 data\strokec5 ,\cb1 \strokec4 \
\cb3     insights\strokec5 :\strokec4  insights\strokec5 .\strokec4 data \strokec5 ||\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3     reviews\strokec5 :\strokec4  reviews\strokec5 .\strokec4 data \strokec5 ||\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3     social\strokec5 :\strokec4  social\strokec5 .\strokec4 data \strokec5 ||\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3     search\strokec5 :\strokec4  search\strokec5 .\strokec4 data \strokec5 ||\strokec4  \strokec5 []\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  buildChroniclePrompt\strokec5 (\strokec4 data\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 string\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 `You are conducting deep reverse engineering of a brand's complete DNA and identity.\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 # BRAND PROFILE\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 Name: \cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 Category: \cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 brand\strokec5 .\strokec4 category \strokec5 ||\strokec4  \cf6 \strokec6 'Unknown'\cf4 \strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 Country: \cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 brand\strokec5 .\strokec4 country \strokec5 ||\strokec4  \cf6 \strokec6 'Unknown'\cf4 \strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 Website: \cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 brand\strokec5 .\strokec4 web_url \strokec5 ||\strokec4  \cf6 \strokec6 'N/A'\cf4 \strokec5 \}\cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 # AVAILABLE DATA SOURCES\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - \cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 insights\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  strategic insights (AI-generated)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - \cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 reviews\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  customer reviews & competitor mentions\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - \cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 social\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  social media signals (viral content, trends)\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 - \cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 search\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  search visibility data points\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 # YOUR TASK\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 Analyze ALL data below and reverse-engineer comprehensive brand intelligence.\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 Output ONLY valid JSON (no markdown, no preamble):\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 \{\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   "brand_dna": \{\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "core_identity": "What the brand fundamentally represents",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "brand_voice": "Communication style and tone",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "visual_identity": "Design language observed",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "emotional_appeal": "What emotions the brand evokes",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "positioning": "How the brand positions itself in market"\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   \},\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   "business_model": \{\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "revenue_streams": ["stream1", "stream2"],\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "target_customers": "Primary customer segments",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "value_proposition": "Unique value offered",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "distribution_channels": ["channel1", "channel2"]\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   \},\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   "competitive_position": \{\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "main_competitors": ["competitor1", "competitor2"],\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "market_position": "Leader/Challenger/Niche",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "key_differentiators": ["factor1", "factor2"],\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "competitive_strengths": ["strength1", "strength2"],\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "competitive_challenges": ["challenge1", "challenge2"]\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   \},\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   "customer_profile": \{\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "demographics": "Age, income, location patterns",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "psychographics": "Values, lifestyle, motivations",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "pain_points": ["pain1", "pain2"],\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "desires": ["desire1", "desire2"]\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   \},\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   "brand_narrative": "Complete brand story and evolution",\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   "key_themes": ["theme1", "theme2", "theme3"],\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   "strategic_focus": \{\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "immediate_priorities": ["priority1", "priority2"],\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "growth_opportunities": ["opp1", "opp2"],\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6     "innovation_areas": ["area1", "area2"]\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6   \}\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6 \}\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 # DATA TO ANALYZE\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 ## Strategic Insights (\cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 insights\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  total)\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 data\strokec5 .\strokec4 insights\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 10\cf4 \strokec5 ).\strokec4 map\strokec5 ((\strokec4 i\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   title\strokec5 :\strokec4  i\strokec5 .\strokec4 insight_title\strokec5 ,\cb1 \strokec4 \
\cb3   pillar\strokec5 :\strokec4  i\strokec5 .\strokec4 pillar\strokec5 ,\cb1 \strokec4 \
\cb3   summary\strokec5 :\strokec4  i\strokec5 .\strokec4 insight_summary\strokec5 ,\cb1 \strokec4 \
\cb3   confidence\strokec5 :\strokec4  i\strokec5 .\strokec4 confidence\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})),\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 ## Customer Reviews & Evidence (\cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 reviews\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  total)\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 data\strokec5 .\strokec4 reviews\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 15\cf4 \strokec5 ).\strokec4 map\strokec5 ((\strokec4 r\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 type\cf4 \strokec5 :\strokec4  r\strokec5 .\strokec4 evidence_type\strokec5 ,\cb1 \strokec4 \
\cb3   platform\strokec5 :\strokec4  r\strokec5 .\strokec4 source_platform\strokec5 ,\cb1 \strokec4 \
\cb3   content\strokec5 :\strokec4  r\strokec5 .\strokec4 raw_content\strokec5 ?.\strokec4 substring\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 200\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3   sentiment\strokec5 :\strokec4  r\strokec5 .\strokec4 sentiment\strokec5 ,\cb1 \strokec4 \
\cb3   dqs\strokec5 :\strokec4  r\strokec5 .\strokec4 dqs_score\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})),\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 ## Social Media Signals (\cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 social\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  total)\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 data\strokec5 .\strokec4 social\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 10\cf4 \strokec5 ).\strokec4 map\strokec5 ((\strokec4 s\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   platform\strokec5 :\strokec4  s\strokec5 .\strokec4 platform\strokec5 ,\cb1 \strokec4 \
\cb3   content\strokec5 :\strokec4  s\strokec5 .\strokec4 content_text\strokec5 ?.\strokec4 substring\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 150\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3   viral_score\strokec5 :\strokec4  s\strokec5 .\strokec4 viral_score\strokec5 ,\cb1 \strokec4 \
\cb3   engagement_rate\strokec5 :\strokec4  s\strokec5 .\strokec4 engagement_rate\strokec5 ,\cb1 \strokec4 \
\cb3   trending\strokec5 :\strokec4  s\strokec5 .\strokec4 is_trending\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})),\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 ## Search Visibility (\cf4 \strokec5 $\{\strokec4 data\strokec5 .\strokec4 search\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  total)\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 data\strokec5 .\strokec4 search\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 5\cf4 \strokec5 ).\strokec4 map\strokec5 ((\strokec4 s\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   query\strokec5 :\strokec4  s\strokec5 .\strokec4 query\strokec5 ,\cb1 \strokec4 \
\cb3   search_type\strokec5 :\strokec4  s\strokec5 .\strokec4 search_type\strokec5 ,\cb1 \strokec4 \
\cb3   brand_mentions\strokec5 :\strokec4  s\strokec5 .\strokec4 brand_mentions_count\strokec5 ,\cb1 \strokec4 \
\cb3   top_position\strokec5 :\strokec4  s\strokec5 .\strokec4 top_position\strokec5 ,\cb1 \strokec4 \
\cb3   visibility_score\strokec5 :\strokec4  s\strokec5 .\strokec4 visibility_score\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})),\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 Output ONLY the JSON object. Be thorough and insightful.`\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
}