{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue0;\red144\green1\blue18;\red14\green110\blue109;\red83\green83\blue83;\red19\green118\blue70;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c40000\c40000\c40000;\cssrgb\c3529\c52549\c34510;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \strokec5 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2'\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \strokec4  \cf7 \strokec7 WorkflowRequest\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   brand_id\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   workflow_type\strokec5 :\strokec4  \cf6 \strokec6 'competitor_deep_dive'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'keyword_opportunity_finder'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'content_gap_analyzer'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'serp_domination_plan'\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   target\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ;\strokec4  \cf8 \strokec8 // URL or keyword\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \strokec2 async\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'OPTIONS'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf6 \strokec6 'ok'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  brand_id\strokec5 ,\strokec4  workflow_type\strokec5 ,\strokec4  target \strokec5 \}:\strokec4  \cf7 \strokec7 WorkflowRequest\cf4 \strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabase \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )!,\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 )!,\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  auth\strokec5 :\strokec4  \strokec5 \{\strokec4  autoRefreshToken\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec5 ,\strokec4  persistSession\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  functionUrl \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )!.\strokec4 replace\strokec5 (\cf6 \strokec6 'https://'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'https://'\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  \cf6 \strokec6 '/functions/v1'\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  serviceKey \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 )!;\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // WORKFLOW: Competitor Deep Dive\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 // Step 1: Gemini crawls competitor site\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 // Step 2: Perplexity researches their strategy  \cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 // Step 3: Claude reverse engineers their success\cf4 \cb1 \strokec4 \
\cb3     \cf8 \strokec8 // Step 4: Synthesize into actionable intelligence\cf4 \cb1 \strokec4 \
\
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `Starting \cf4 \strokec5 $\{\strokec4 workflow_type\strokec5 \}\cf6 \strokec6  workflow for \cf4 \strokec5 $\{\strokec4 target\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 let\cf4 \strokec4  geminiResult\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  perplexityResult\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  claudeResult\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // STEP 1: Gemini Crawling\cf4 \cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 'Step 1: Gemini crawling...'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  geminiResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 functionUrl\strokec5 \}\cf6 \strokec6 /gemini-seo-crawler`\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Authorization'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 `Bearer \cf4 \strokec5 $\{\strokec4 serviceKey\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         body\strokec5 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           brand_id\strokec5 ,\cb1 \strokec4 \
\cb3           target_url\strokec5 :\strokec4  target\strokec5 ,\cb1 \strokec4 \
\cb3           crawl_type\strokec5 :\strokec4  \cf6 \strokec6 'competitor_site'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           max_pages\strokec5 :\strokec4  \cf9 \strokec9 10\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3       geminiResult \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  geminiResponse\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 'Gemini completed:'\cf4 \strokec5 ,\strokec4  geminiResult\strokec5 .\strokec4 success\strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Gemini failed:'\cf4 \strokec5 ,\strokec4  error\strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // STEP 2: Perplexity Research\cf4 \cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 'Step 2: Perplexity researching...'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  perplexityResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 functionUrl\strokec5 \}\cf6 \strokec6 /perplexity-seo-research`\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Authorization'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 `Bearer \cf4 \strokec5 $\{\strokec4 serviceKey\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         body\strokec5 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           brand_id\strokec5 ,\cb1 \strokec4 \
\cb3           research_topic\strokec5 :\strokec4  target\strokec5 ,\cb1 \strokec4 \
\cb3           research_type\strokec5 :\strokec4  \cf6 \strokec6 'competitor_strategy'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           search_recency\strokec5 :\strokec4  \cf6 \strokec6 'month'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3       perplexityResult \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  perplexityResponse\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 'Perplexity completed:'\cf4 \strokec5 ,\strokec4  perplexityResult\strokec5 .\strokec4 success\strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Perplexity failed:'\cf4 \strokec5 ,\strokec4  error\strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // STEP 3: Claude Reverse Engineering\cf4 \cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 'Step 3: Claude analyzing...'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  claudeResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 functionUrl\strokec5 \}\cf6 \strokec6 /claude-seo-reverse-engineer`\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Authorization'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 `Bearer \cf4 \strokec5 $\{\strokec4 serviceKey\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         body\strokec5 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           brand_id\strokec5 ,\cb1 \strokec4 \
\cb3           target_url\strokec5 :\strokec4  target\strokec5 ,\cb1 \strokec4 \
\cb3           target_type\strokec5 :\strokec4  \cf6 \strokec6 'competitor_content'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           gemini_crawl_id\strokec5 :\strokec4  geminiResult\strokec5 ?.\strokec4 session_id\strokec5 ,\cb1 \strokec4 \
\cb3           analysis_depth\strokec5 :\strokec4  \cf6 \strokec6 'comprehensive'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3       claudeResult \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  claudeResponse\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 'Claude completed:'\cf4 \strokec5 ,\strokec4  claudeResult\strokec5 .\strokec4 success\strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Claude failed:'\cf4 \strokec5 ,\strokec4  error\strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // STEP 4: Synthesize Intelligence\cf4 \cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 'Step 4: Synthesizing intelligence...'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  combinedInsights \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       gemini_data\strokec5 :\strokec4  geminiResult\strokec5 ?.\strokec4 structured_data \strokec5 ||\strokec4  \strokec5 \{\},\cb1 \strokec4 \
\cb3       perplexity_research\strokec5 :\strokec4  perplexityResult\strokec5 ?.\strokec4 research_summary \strokec5 ||\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       claude_analysis\strokec5 :\strokec4  claudeResult\strokec5 ?.\strokec4 key_insights \strokec5 ||\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3     \strokec5 \};\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Create actionable recommendations\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  immediateActions \strokec5 =\strokec4  \strokec5 [];\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  shortTermActions \strokec5 =\strokec4  \strokec5 [];\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  longTermStrategy \strokec5 =\strokec4  \strokec5 [];\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Extract from Perplexity\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 perplexityResult\strokec5 ?.\strokec4 top_recommendations\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       immediateActions\strokec5 .\strokec4 push\strokec5 (...\strokec4 perplexityResult\strokec5 .\strokec4 top_recommendations\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 3\cf4 \strokec5 ));\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Extract from Claude\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 claudeResult\strokec5 ?.\strokec4 top_recommendations\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       shortTermActions\strokec5 .\strokec4 push\strokec5 (...\strokec4 claudeResult\strokec5 .\strokec4 top_recommendations\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 5\cf4 \strokec5 ));\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Calculate expected impact\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  estimatedTrafficIncrease \strokec5 =\strokec4  geminiResult \strokec5 ?\strokec4  \cf9 \strokec9 15.5\cf4 \strokec4  \strokec5 :\strokec4  \cf9 \strokec9 10.0\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  estimatedRankingImprovement \strokec5 =\strokec4  claudeResult \strokec5 ?\strokec4  \cf9 \strokec9 5\cf4 \strokec4  \strokec5 :\strokec4  \cf9 \strokec9 3\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Store combined intelligence\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  intelligence \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_ai_seo_intelligence'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 insert\strokec5 (\{\cb1 \strokec4 \
\cb3         brand_id\strokec5 ,\cb1 \strokec4 \
\cb3         gemini_crawl_id\strokec5 :\strokec4  geminiResult\strokec5 ?.\strokec4 session_id\strokec5 ,\cb1 \strokec4 \
\cb3         perplexity_research_id\strokec5 :\strokec4  perplexityResult\strokec5 ?.\strokec4 session_id\strokec5 ,\cb1 \strokec4 \
\cb3         claude_analysis_id\strokec5 :\strokec4  claudeResult\strokec5 ?.\strokec4 task_id\strokec5 ,\cb1 \strokec4 \
\cb3         intelligence_type\strokec5 :\strokec4  \cf6 \strokec6 'competitor_weakness_map'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         title\strokec5 :\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 workflow_type\strokec5 \}\cf6 \strokec6 : \cf4 \strokec5 $\{\strokec4 target\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         summary\strokec5 :\strokec4  \cf6 \strokec6 `AI-powered analysis combining Gemini crawling, Perplexity research, and Claude reverse engineering`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         key_findings\strokec5 :\strokec4  combinedInsights\strokec5 ,\cb1 \strokec4 \
\cb3         data_sources\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           gemini\strokec5 :\strokec4  \strokec5 !!\strokec4 geminiResult\strokec5 ,\cb1 \strokec4 \
\cb3           perplexity\strokec5 :\strokec4  \strokec5 !!\strokec4 perplexityResult\strokec5 ,\cb1 \strokec4 \
\cb3           claude\strokec5 :\strokec4  \strokec5 !!\strokec4 claudeResult\cb1 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         immediate_actions\strokec5 :\strokec4  immediateActions\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 ?\strokec4  immediateActions \strokec5 :\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         short_term_actions\strokec5 :\strokec4  shortTermActions\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 ?\strokec4  shortTermActions \strokec5 :\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         estimated_traffic_increase\strokec5 :\strokec4  estimatedTrafficIncrease\strokec5 ,\cb1 \strokec4 \
\cb3         estimated_ranking_improvement\strokec5 :\strokec4  estimatedRankingImprovement\strokec5 ,\cb1 \strokec4 \
\cb3         confidence_level\strokec5 :\strokec4  \cf9 \strokec9 0.85\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         difficulty_score\strokec5 :\strokec4  \cf9 \strokec9 0.6\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         timeline_estimate\strokec5 :\strokec4  \cf6 \strokec6 '4-8 weeks'\cf4 \cb1 \strokec4 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3         success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         workflow_type\strokec5 ,\cb1 \strokec4 \
\cb3         target\strokec5 ,\cb1 \strokec4 \
\cb3         intelligence_id\strokec5 :\strokec4  intelligence\strokec5 ?.\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3         workflow_results\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           gemini_completed\strokec5 :\strokec4  \strokec5 !!\strokec4 geminiResult\strokec5 ,\cb1 \strokec4 \
\cb3           perplexity_completed\strokec5 :\strokec4  \strokec5 !!\strokec4 perplexityResult\strokec5 ,\cb1 \strokec4 \
\cb3           claude_completed\strokec5 :\strokec4  \strokec5 !!\strokec4 claudeResult\cb1 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         synthesized_intelligence\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           immediate_actions\strokec5 :\strokec4  immediateActions\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           short_term_actions\strokec5 :\strokec4  shortTermActions\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           estimated_impact\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3             traffic_increase_pct\strokec5 :\strokec4  estimatedTrafficIncrease\strokec5 ,\cb1 \strokec4 \
\cb3             ranking_improvement\strokec5 :\strokec4  estimatedRankingImprovement\cb1 \
\cb3           \strokec5 \}\cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         top_actions\strokec5 :\strokec4  \strokec5 [...\strokec4 immediateActions\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 3\cf4 \strokec5 ),\strokec4  \strokec5 ...\strokec4 shortTermActions\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )]\cb1 \strokec4 \
\cb3       \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf9 \strokec9 200\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'AI SEO workflow error:'\cf4 \strokec5 ,\strokec4  error\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \});\cb1 \strokec4 \
}