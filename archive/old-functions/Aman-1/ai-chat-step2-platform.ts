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
\cf7 \cb3 \strokec7 /**\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * STEP 2: Platform Activity Researcher\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Perplexity researches where users are most active + competitor insights\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  */\cf4 \cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf8 \strokec8 PERPLEXITY_API_KEY\cf4 \strokec4  \strokec5 =\strokec4  \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'PERPLEXITY_API_KEY'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3 serve\strokec5 (\cf2 \strokec2 async\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
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
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brand_id\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'brand_id required'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Platform] Starting research for brand \cf4 \strokec5 $\{\strokec4 brand_id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
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
\cb3     \cf7 \strokec7 // Get chronicle for context\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  chronicleData \strokec5 =\strokec4  \cf2 \strokec2 null\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 chronicle_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_brand_chronicle'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'key_themes, competitive_position'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  chronicle_id\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\cb3       chronicleData \strokec5 =\strokec4  data\cb1 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Build platform research queries\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  queries \strokec5 =\strokec4  \strokec5 [\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `Where is \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6  most active on social media? Analyze TikTok, Instagram, YouTube, Twitter, LinkedIn presence. Provide follower counts and engagement rates.`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `What platforms do \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6  customers use most? Where do people talk about \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6 ?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `What are the most common questions people ask about \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6  on different platforms (TikTok comments, Google searches, Instagram, Twitter)?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `How do competitors of \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6  in \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 category\strokec5 \}\cf6 \strokec6  use different social media platforms?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `What are trending topics related to \cf4 \strokec5 $\{\strokec4 brand\strokec5 .\strokec4 brand_name\strokec5 \}\cf6 \strokec6  on TikTok, Instagram, and Google?`\cf4 \cb1 \strokec4 \
\cb3     \strokec5 ]\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Platform] Running \cf4 \strokec5 $\{\strokec4 queries\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6  Perplexity searches...`\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Run Perplexity searches\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  researchResults \strokec5 =\strokec4  \strokec5 []\cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  totalTokens \strokec5 =\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  query \cf2 \strokec2 of\cf4 \strokec4  queries\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  result \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  callPerplexity\strokec5 (\strokec4 query\strokec5 )\cb1 \strokec4 \
\cb3       researchResults\strokec5 .\strokec4 push\strokec5 (\{\cb1 \strokec4 \
\cb3         query\strokec5 ,\cb1 \strokec4 \
\cb3         response\strokec5 :\strokec4  result\strokec5 .\strokec4 content\strokec5 ,\cb1 \strokec4 \
\cb3         citations\strokec5 :\strokec4  result\strokec5 .\strokec4 citations\cb1 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3       totalTokens \strokec5 +=\strokec4  result\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 total_tokens \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf7 \strokec7 // Small delay to avoid rate limits\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 await\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Promise\cf4 \strokec5 (\strokec4 resolve \strokec5 =>\strokec4  setTimeout\strokec5 (\strokec4 resolve\strokec5 ,\strokec4  \cf9 \strokec9 1000\cf4 \strokec5 ))\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Platform] Perplexity research complete (\cf4 \strokec5 $\{\strokec4 totalTokens\strokec5 \}\cf6 \strokec6  tokens)`\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Parse platform distribution from results\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  platformAnalysis \strokec5 =\strokec4  analyzePlatformDistribution\strokec5 (\strokec4 researchResults\strokec5 ,\strokec4  brand\strokec5 .\strokec4 brand_name\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Calculate cost ($0.001 per request for Perplexity Sonar)\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  costUsd \strokec5 =\strokec4  queries\strokec5 .\strokec4 length \strokec5 *\strokec4  \cf9 \strokec9 0.001\cf4 \cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Save to database\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  platformResearch\strokec5 ,\strokec4  error\strokec5 :\strokec4  dbError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_platform_research'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 insert\strokec5 (\{\cb1 \strokec4 \
\cb3         brand_id\strokec5 ,\cb1 \strokec4 \
\cb3         chronicle_id\strokec5 :\strokec4  chronicle_id \strokec5 ||\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         platform_distribution\strokec5 :\strokec4  platformAnalysis\strokec5 .\strokec4 platform_distribution\strokec5 ,\cb1 \strokec4 \
\cb3         top_platform\strokec5 :\strokec4  platformAnalysis\strokec5 .\strokec4 top_platform\strokec5 ,\cb1 \strokec4 \
\cb3         platform_priority_order\strokec5 :\strokec4  platformAnalysis\strokec5 .\strokec4 priority_order\strokec5 ,\cb1 \strokec4 \
\cb3         competitor_platforms\strokec5 :\strokec4  platformAnalysis\strokec5 .\strokec4 competitor_insights\strokec5 ,\cb1 \strokec4 \
\cb3         market_insights\strokec5 :\strokec4  platformAnalysis\strokec5 .\strokec4 market_insights\strokec5 ,\cb1 \strokec4 \
\cb3         user_behavior_patterns\strokec5 :\strokec4  platformAnalysis\strokec5 .\strokec4 user_behavior\strokec5 ,\cb1 \strokec4 \
\cb3         trending_topics\strokec5 :\strokec4  platformAnalysis\strokec5 .\strokec4 trending_topics\strokec5 ,\cb1 \strokec4 \
\cb3         perplexity_response\strokec5 :\strokec4  \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 researchResults\strokec5 ),\cb1 \strokec4 \
\cb3         research_date\strokec5 :\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 (),\cb1 \strokec4 \
\cb3         tokens_used\strokec5 :\strokec4  totalTokens\strokec5 ,\cb1 \strokec4 \
\cb3         cost_usd\strokec5 :\strokec4  costUsd\cb1 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 dbError\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  dbError\cb1 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Platform] Saved to database with ID \cf4 \strokec5 $\{\strokec4 platformResearch\strokec5 .\strokec4 id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3       success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       platform_research_id\strokec5 :\strokec4  platformResearch\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3       platform_distribution\strokec5 :\strokec4  platformAnalysis\strokec5 .\strokec4 platform_distribution\strokec5 ,\cb1 \strokec4 \
\cb3       top_platform\strokec5 :\strokec4  platformAnalysis\strokec5 .\strokec4 top_platform\strokec5 ,\cb1 \strokec4 \
\cb3       priority_order\strokec5 :\strokec4  platformAnalysis\strokec5 .\strokec4 priority_order\strokec5 ,\cb1 \strokec4 \
\cb3       question_allocation\strokec5 :\strokec4  calculateQuestionAllocation\strokec5 (\strokec4 platformAnalysis\strokec5 .\strokec4 platform_distribution\strokec5 ),\cb1 \strokec4 \
\cb3       research_summary\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         queries_executed\strokec5 :\strokec4  queries\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3         tokens_used\strokec5 :\strokec4  totalTokens\strokec5 ,\cb1 \strokec4 \
\cb3         cost_usd\strokec5 :\strokec4  costUsd\strokec5 .\strokec4 toFixed\strokec5 (\cf9 \strokec9 4\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \},\cb1 \strokec4 \
\cb3       next_step\strokec5 :\strokec4  \cf6 \strokec6 'Step 3: Smart Question Generation'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \})\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[Platform] Error:'\cf4 \strokec5 ,\strokec4  error\strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  \cb1 \
\cb3       error\strokec5 :\strokec4  error\strokec5 .\strokec4 message\strokec5 ,\cb1 \strokec4 \
\cb3       step\strokec5 :\strokec4  \cf6 \strokec6 'platform_research'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}),\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  \cb1 \
\cb3       headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \cb1 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3 \strokec5 \})\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  callPerplexity\strokec5 (\strokec4 query\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  response \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cf6 \strokec6 'https://api.perplexity.ai/chat/completions'\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 'Authorization'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 `Bearer \cf4 \strokec5 $\{\cf8 \strokec8 PERPLEXITY_API_KEY\cf4 \strokec5 \}\cf6 \strokec6 `\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \},\cb1 \strokec4 \
\cb3     body\strokec5 :\strokec4  \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3       model\strokec5 :\strokec4  \cf6 \strokec6 'llama-3.1-sonar-small-128k-online'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       messages\strokec5 :\strokec4  \strokec5 [\{\cb1 \strokec4 \
\cb3         role\strokec5 :\strokec4  \cf6 \strokec6 'user'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         content\strokec5 :\strokec4  query\cb1 \
\cb3       \strokec5 \}]\cb1 \strokec4 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \})\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 response\strokec5 .\strokec4 ok\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 `Perplexity API error: \cf4 \strokec5 $\{\cf2 \strokec2 await\cf4 \strokec4  response\strokec5 .\strokec4 text\strokec5 ()\}\cf6 \strokec6 `\cf4 \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  data \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  response\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     content\strokec5 :\strokec4  data\strokec5 .\strokec4 choices\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ].\strokec4 message\strokec5 .\strokec4 content\strokec5 ,\cb1 \strokec4 \
\cb3     citations\strokec5 :\strokec4  data\strokec5 .\strokec4 citations \strokec5 ||\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3     usage\strokec5 :\strokec4  data\strokec5 .\strokec4 usage\cb1 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3 \strokec5 \}\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 function\cf4 \strokec4  analyzePlatformDistribution\strokec5 (\strokec4 results\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 [],\strokec4  brandName\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf7 \strokec7 // Combine all research results\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  fullText \strokec5 =\strokec4  results\strokec5 .\strokec4 map\strokec5 (\strokec4 r \strokec5 =>\strokec4  r\strokec5 .\strokec4 response\strokec5 ).\strokec4 join\strokec5 (\cf6 \strokec6 '\\n\\n'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3   \cf7 \strokec7 // Simple keyword-based platform detection\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  platforms\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     tiktok\strokec5 :\strokec4  \strokec5 \{\strokec4  mentions\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  keywords\strokec5 :\strokec4  \strokec5 [\cf6 \strokec6 'tiktok'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'tik tok'\cf4 \strokec5 ],\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3     instagram\strokec5 :\strokec4  \strokec5 \{\strokec4  mentions\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  keywords\strokec5 :\strokec4  \strokec5 [\cf6 \strokec6 'instagram'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'ig'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'insta'\cf4 \strokec5 ],\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3     youtube\strokec5 :\strokec4  \strokec5 \{\strokec4  mentions\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  keywords\strokec5 :\strokec4  \strokec5 [\cf6 \strokec6 'youtube'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'yt'\cf4 \strokec5 ],\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3     google\strokec5 :\strokec4  \strokec5 \{\strokec4  mentions\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  keywords\strokec5 :\strokec4  \strokec5 [\cf6 \strokec6 'google'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'search'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'seo'\cf4 \strokec5 ],\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3     twitter\strokec5 :\strokec4  \strokec5 \{\strokec4  mentions\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  keywords\strokec5 :\strokec4  \strokec5 [\cf6 \strokec6 'twitter'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'x.com'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'tweet'\cf4 \strokec5 ],\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3     linkedin\strokec5 :\strokec4  \strokec5 \{\strokec4  mentions\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  keywords\strokec5 :\strokec4  \strokec5 [\cf6 \strokec6 'linkedin'\cf4 \strokec5 ],\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3     facebook\strokec5 :\strokec4  \strokec5 \{\strokec4  mentions\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  keywords\strokec5 :\strokec4  \strokec5 [\cf6 \strokec6 'facebook'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'fb'\cf4 \strokec5 ],\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf7 \strokec7 // Count platform mentions\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  lowerText \strokec5 =\strokec4  fullText\strokec5 .\strokec4 toLowerCase\strokec5 ()\cb1 \strokec4 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  \strokec5 [\strokec4 platform\strokec5 ,\strokec4  data\strokec5 ]\strokec4  \cf2 \strokec2 of\cf4 \strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 entries\strokec5 (\strokec4 platforms\strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  keyword \cf2 \strokec2 of\cf4 \strokec4  data\strokec5 .\strokec4 keywords\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  regex \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 RegExp\cf4 \strokec5 (\cf6 \strokec6 `\\\\b\cf4 \strokec5 $\{\strokec4 keyword\strokec5 \}\cf6 \strokec6 \\\\b`\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'gi'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  matches \strokec5 =\strokec4  lowerText\strokec5 .\strokec4 match\strokec5 (\strokec4 regex\strokec5 )\cb1 \strokec4 \
\cb3       data\strokec5 .\strokec4 mentions \strokec5 +=\strokec4  matches \strokec5 ?\strokec4  matches\strokec5 .\strokec4 length \strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf7 \strokec7 // Extract numbers for engagement/followers if available\cf4 \cb1 \strokec4 \
\cb3   \cf7 \strokec7 // This is simplified - in production would use more sophisticated NLP\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  numberPattern \strokec5 =\strokec4  \cf10 \cb3 \strokec10 /(\\d+(?:,\\d+)*(?:\\.\\d+)?\\s*(?:million|M|thousand|K|%)?)/\cf2 \cb3 \strokec2 gi\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  numbers \strokec5 =\strokec4  fullText\strokec5 .\strokec4 match\strokec5 (\strokec4 numberPattern\strokec5 )\strokec4  \strokec5 ||\strokec4  \strokec5 []\cb1 \strokec4 \
\
\cb3   \cf7 \strokec7 // Calculate scores (mentions + engagement signals)\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 let\cf4 \strokec4  totalScore \strokec5 =\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  \strokec5 [\strokec4 platform\strokec5 ,\strokec4  data\strokec5 ]\strokec4  \cf2 \strokec2 of\cf4 \strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 entries\strokec5 (\strokec4 platforms\strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     data\strokec5 .\strokec4 score \strokec5 =\strokec4  data\strokec5 .\strokec4 mentions \strokec5 *\strokec4  \cf9 \strokec9 10\cf4 \strokec4  \strokec5 +\strokec4  \strokec5 (\strokec4 numbers\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 ?\strokec4  \cf9 \strokec9 5\cf4 \strokec4  \strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     totalScore \strokec5 +=\strokec4  data\strokec5 .\strokec4 score\cb1 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf7 \strokec7 // Calculate percentages\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  distribution\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  \strokec5 [\strokec4 platform\strokec5 ,\strokec4  data\strokec5 ]\strokec4  \cf2 \strokec2 of\cf4 \strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 entries\strokec5 (\strokec4 platforms\strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 data\strokec5 .\strokec4 score \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       distribution\strokec5 [\strokec4 platform\strokec5 ]\strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         percentage\strokec5 :\strokec4  totalScore \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 ?\strokec4  \strokec5 (\strokec4 data\strokec5 .\strokec4 score \strokec5 /\strokec4  totalScore \strokec5 *\strokec4  \cf9 \strokec9 100\cf4 \strokec5 ).\strokec4 toFixed\strokec5 (\cf9 \strokec9 1\cf4 \strokec5 )\strokec4  \strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         mentions\strokec5 :\strokec4  data\strokec5 .\strokec4 mentions\strokec5 ,\cb1 \strokec4 \
\cb3         score\strokec5 :\strokec4  data\strokec5 .\strokec4 score\cb1 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf7 \strokec7 // Sort by score\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  sortedPlatforms \strokec5 =\strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 entries\strokec5 (\strokec4 distribution\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 sort\strokec5 (([,\strokec4  a\strokec5 ]:\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  \strokec5 [,\strokec4  b\strokec5 ]:\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  b\strokec5 .\strokec4 score \strokec5 -\strokec4  a\strokec5 .\strokec4 score\strokec5 )\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  topPlatform \strokec5 =\strokec4  sortedPlatforms\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]?.[\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ||\strokec4  \cf6 \strokec6 'tiktok'\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  priorityOrder \strokec5 =\strokec4  sortedPlatforms\strokec5 .\strokec4 map\strokec5 (([\strokec4 platform\strokec5 ])\strokec4  \strokec5 =>\strokec4  platform\strokec5 )\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     platform_distribution\strokec5 :\strokec4  distribution\strokec5 ,\cb1 \strokec4 \
\cb3     top_platform\strokec5 :\strokec4  topPlatform\strokec5 ,\cb1 \strokec4 \
\cb3     priority_order\strokec5 :\strokec4  priorityOrder\strokec5 ,\cb1 \strokec4 \
\cb3     competitor_insights\strokec5 :\strokec4  extractCompetitorInsights\strokec5 (\strokec4 fullText\strokec5 ),\cb1 \strokec4 \
\cb3     market_insights\strokec5 :\strokec4  extractMarketInsights\strokec5 (\strokec4 fullText\strokec5 ),\cb1 \strokec4 \
\cb3     user_behavior\strokec5 :\strokec4  extractUserBehavior\strokec5 (\strokec4 fullText\strokec5 ),\cb1 \strokec4 \
\cb3     trending_topics\strokec5 :\strokec4  extractTrendingTopics\strokec5 (\strokec4 fullText\strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3 \strokec5 \}\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 function\cf4 \strokec4  extractCompetitorInsights\strokec5 (\strokec4 text\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     competitors_mentioned\strokec5 :\strokec4  extractEntities\strokec5 (\strokec4 text\strokec5 ,\strokec4  \strokec5 [\cf6 \strokec6 'competitor'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'rival'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'vs'\cf4 \strokec5 ]),\cb1 \strokec4 \
\cb3     competitive_platforms\strokec5 :\strokec4  \cf6 \strokec6 'Identified from research'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     raw_insights\strokec5 :\strokec4  text\strokec5 .\strokec4 substring\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 500\cf4 \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3 \strokec5 \}\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 function\cf4 \strokec4  extractMarketInsights\strokec5 (\strokec4 text\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     market_trends\strokec5 :\strokec4  extractEntities\strokec5 (\strokec4 text\strokec5 ,\strokec4  \strokec5 [\cf6 \strokec6 'trend'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'growing'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'popular'\cf4 \strokec5 ]),\cb1 \strokec4 \
\cb3     industry_signals\strokec5 :\strokec4  \cf6 \strokec6 'Extracted from research'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     raw_insights\strokec5 :\strokec4  text\strokec5 .\strokec4 substring\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 500\cf4 \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3 \strokec5 \}\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 function\cf4 \strokec4  extractUserBehavior\strokec5 (\strokec4 text\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     engagement_patterns\strokec5 :\strokec4  \cf6 \strokec6 'Analyzed from platform data'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     user_preferences\strokec5 :\strokec4  extractEntities\strokec5 (\strokec4 text\strokec5 ,\strokec4  \strokec5 [\cf6 \strokec6 'prefer'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'like'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'favorite'\cf4 \strokec5 ]),\cb1 \strokec4 \
\cb3     raw_insights\strokec5 :\strokec4  text\strokec5 .\strokec4 substring\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 500\cf4 \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3 \strokec5 \}\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 function\cf4 \strokec4  extractTrendingTopics\strokec5 (\strokec4 text\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     trending_themes\strokec5 :\strokec4  extractEntities\strokec5 (\strokec4 text\strokec5 ,\strokec4  \strokec5 [\cf6 \strokec6 'trending'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'viral'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'popular'\cf4 \strokec5 ]),\cb1 \strokec4 \
\cb3     hot_topics\strokec5 :\strokec4  \cf6 \strokec6 'Identified from research'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     raw_insights\strokec5 :\strokec4  text\strokec5 .\strokec4 substring\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 500\cf4 \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3 \strokec5 \}\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 function\cf4 \strokec4  extractEntities\strokec5 (\strokec4 text\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ,\strokec4  keywords\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 []):\strokec4  \cf2 \strokec2 string\cf4 \strokec5 []\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  entities\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 []\strokec4  \strokec5 =\strokec4  \strokec5 []\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  sentences \strokec5 =\strokec4  text\strokec5 .\strokec4 split\strokec5 (\cf10 \cb3 \strokec10 /[.!?]\\s+/\cf4 \cb3 \strokec5 )\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  sentence \cf2 \strokec2 of\cf4 \strokec4  sentences\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  lower \strokec5 =\strokec4  sentence\strokec5 .\strokec4 toLowerCase\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  keyword \cf2 \strokec2 of\cf4 \strokec4  keywords\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 lower\strokec5 .\strokec4 includes\strokec5 (\strokec4 keyword\strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         entities\strokec5 .\strokec4 push\strokec5 (\strokec4 sentence\strokec5 .\strokec4 trim\strokec5 ().\strokec4 substring\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 100\cf4 \strokec5 ))\cb1 \strokec4 \
\cb3         \cf2 \strokec2 break\cf4 \cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  entities\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 5\cf4 \strokec5 )\cb1 \strokec4 \
\cb3 \strokec5 \}\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 function\cf4 \strokec4  calculateQuestionAllocation\strokec5 (\strokec4 distribution\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  totalQuestions \strokec5 =\strokec4  \cf9 \strokec9 40\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  allocation\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf7 \strokec7 // Sort platforms by percentage\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  sortedPlatforms \strokec5 =\strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 entries\strokec5 (\strokec4 distribution\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 sort\strokec5 (([,\strokec4  a\strokec5 ]:\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  \strokec5 [,\strokec4  b\strokec5 ]:\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  parseFloat\strokec5 (\strokec4 b\strokec5 .\strokec4 percentage\strokec5 )\strokec4  \strokec5 -\strokec4  parseFloat\strokec5 (\strokec4 a\strokec5 .\strokec4 percentage\strokec5 ))\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf7 \strokec7 // Allocate questions proportionally (min 2 per platform)\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 let\cf4 \strokec4  remaining \strokec5 =\strokec4  totalQuestions\cb1 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  \strokec5 [\strokec4 platform\strokec5 ,\strokec4  data\strokec5 ]:\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \cf2 \strokec2 of\cf4 \strokec4  sortedPlatforms\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  percentage \strokec5 =\strokec4  parseFloat\strokec5 (\strokec4 data\strokec5 .\strokec4 percentage\strokec5 )\strokec4  \strokec5 /\strokec4  \cf9 \strokec9 100\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  count \strokec5 =\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 max\strokec5 (\cf9 \strokec9 2\cf4 \strokec5 ,\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 floor\strokec5 (\strokec4 totalQuestions \strokec5 *\strokec4  percentage\strokec5 ))\cb1 \strokec4 \
\cb3     allocation\strokec5 [\strokec4 platform\strokec5 ]\strokec4  \strokec5 =\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 min\strokec5 (\strokec4 count\strokec5 ,\strokec4  remaining \strokec5 -\strokec4  \strokec5 (\strokec4 sortedPlatforms\strokec5 .\strokec4 length \strokec5 -\strokec4  \cf8 \strokec8 Object\cf4 \strokec5 .\strokec4 keys\strokec5 (\strokec4 allocation\strokec5 ).\strokec4 length\strokec5 )\strokec4  \strokec5 *\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     remaining \strokec5 -=\strokec4  allocation\strokec5 [\strokec4 platform\strokec5 ]\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf7 \strokec7 // Give remainder to top platform\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 remaining \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 &&\strokec4  sortedPlatforms\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     allocation\strokec5 [\strokec4 sortedPlatforms\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ][\cf9 \strokec9 0\cf4 \strokec5 ]]\strokec4  \strokec5 +=\strokec4  remaining\cb1 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  allocation\cb1 \
\cb3 \strokec5 \}\cb1 \strokec4 \
}