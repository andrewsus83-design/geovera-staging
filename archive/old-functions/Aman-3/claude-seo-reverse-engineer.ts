{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue0;\red144\green1\blue18;\red14\green110\blue109;\red83\green83\blue83;\red107\green0\blue1;
\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c40000\c40000\c40000;\cssrgb\c50196\c0\c0;
\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \strokec5 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2'\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \strokec4  \cf7 \strokec7 ReverseEngineerRequest\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   brand_id\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   target_url\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   target_type\strokec5 :\strokec4  \cf6 \strokec6 'top_ranking_page'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'competitor_content'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'viral_content'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'featured_snippet'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'high_converting_page'\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   gemini_crawl_id?: \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   analysis_depth?: \cf6 \strokec6 'quick'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'standard'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'comprehensive'\cf4 \strokec5 ;\cb1 \strokec4 \
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
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       brand_id\strokec5 ,\strokec4  \cb1 \
\cb3       target_url\strokec5 ,\strokec4  \cb1 \
\cb3       target_type\strokec5 ,\strokec4  \cb1 \
\cb3       gemini_crawl_id\strokec5 ,\cb1 \strokec4 \
\cb3       analysis_depth \strokec5 =\strokec4  \cf6 \strokec6 'comprehensive'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}:\strokec4  \cf7 \strokec7 ReverseEngineerRequest\cf4 \strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabase \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )!,\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 )!,\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  auth\strokec5 :\strokec4  \strokec5 \{\strokec4  autoRefreshToken\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec5 ,\strokec4  persistSession\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  targetDomain \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 URL\cf4 \strokec5 (\strokec4 target_url\strokec5 ).\strokec4 hostname\strokec5 ;\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Get Gemini crawl data if provided\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  geminiData\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 gemini_crawl_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_gemini_crawl_sessions'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  gemini_crawl_id\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\cb3       geminiData \strokec5 =\strokec4  data\strokec5 ;\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Fetch page content if not from Gemini\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  pageContent \strokec5 =\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  pageHtml \strokec5 =\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 geminiData\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  response \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\strokec4 target_url\strokec5 );\cb1 \strokec4 \
\cb3       pageHtml \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  response\strokec5 .\strokec4 text\strokec5 ();\cb1 \strokec4 \
\cb3       pageContent \strokec5 =\strokec4  pageHtml\strokec5 .\strokec4 replace\strokec5 (\cf9 \cb3 \strokec9 /<[^>]*>/\cf2 \cb3 \strokec2 g\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 ' '\cf4 \strokec5 ).\strokec4 replace\strokec5 (\cf9 \cb3 \strokec9 /\\s+/\cf2 \cb3 \strokec2 g\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 ' '\cf4 \strokec5 ).\strokec4 trim\strokec5 ();\cb1 \strokec4 \
\cb3     \strokec5 \}\strokec4  \cf2 \strokec2 else\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       pageContent \strokec5 =\strokec4  \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 geminiData\strokec5 .\strokec4 content_patterns\strokec5 );\cb1 \strokec4 \
\cb3       pageHtml \strokec5 =\strokec4  geminiData\strokec5 .\strokec4 pages_data\strokec5 ?.[\cf10 \strokec10 0\cf4 \strokec5 ]?.\strokec4 html \strokec5 ||\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Build Claude analysis prompt\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  analysisPrompt \strokec5 =\strokec4  \cf6 \strokec6 `You are an expert SEO reverse engineer. Analyze this \cf4 \strokec5 $\{\strokec4 target_type\strokec5 \}\cf6 \strokec6  and decode its success strategy.\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 Target URL: \cf4 \strokec5 $\{\strokec4 target_url\strokec5 \}\cb1 \strokec4 \
\cf6 \cb3 \strokec6 Target Type: \cf4 \strokec5 $\{\strokec4 target_type\strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\strokec4 geminiData \strokec5 ?\strokec4  \cf6 \strokec6 'Gemini Crawl Data:\\n'\cf4 \strokec4  \strokec5 +\strokec4  \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 geminiData\strokec5 .\strokec4 structured_data\strokec5 ,\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\strokec4  \cf10 \strokec10 2\cf4 \strokec5 )\strokec4  \strokec5 :\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 Page Content Preview:\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 $\{\strokec4 pageContent\strokec5 .\strokec4 substring\strokec5 (\cf10 \strokec10 0\cf4 \strokec5 ,\strokec4  \cf10 \strokec10 8000\cf4 \strokec5 )\}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf6 \cb3 \strokec6 Perform comprehensive reverse engineering:\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 1. SEO STRATEGY DECODED:\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - What is their primary keyword strategy?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - How do they structure content for ranking?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - What on-page SEO patterns do you see?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - How do they optimize for user intent?\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 2. CONTENT FRAMEWORK:\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - What is the content structure?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - How is information organized?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - What content format works for them?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - How do they use headers and sections?\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 3. KEYWORD PLACEMENT STRATEGY:\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - Where do primary keywords appear?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - How are keywords distributed?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - What is the keyword density?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - LSI and semantic keyword usage?\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 4. INTERNAL LINKING STRATEGY:\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - How do they link internally?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - What anchor text patterns?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - Link placement strategies?\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 5. CONVERSION OPTIMIZATION:\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - What CTAs do they use?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - How do they guide user journey?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - Trust signals present?\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 6. COMPETITIVE ADVANTAGES:\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - What makes this page unique?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - What patterns lead to success?\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - Any weaknesses or gaps?\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 7. REPLICATION BLUEPRINT:\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - Step-by-step: how to replicate their success\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - Improvements we can make\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - Resources needed\cf4 \cb1 \strokec4 \
\cf6 \cb3 \strokec6    - Timeline estimate\cf4 \cb1 \strokec4 \
\
\cf6 \cb3 \strokec6 Provide detailed, actionable insights in structured JSON format.`\cf4 \strokec5 ;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3     \cf8 \strokec8 // Create reverse engineering task\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  task\strokec5 ,\strokec4  error\strokec5 :\strokec4  taskError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_claude_reverse_engineering'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 insert\strokec5 (\{\cb1 \strokec4 \
\cb3         brand_id\strokec5 ,\cb1 \strokec4 \
\cb3         target_url\strokec5 ,\cb1 \strokec4 \
\cb3         target_domain\strokec5 :\strokec4  targetDomain\strokec5 ,\cb1 \strokec4 \
\cb3         target_type\strokec5 ,\cb1 \strokec4 \
\cb3         gemini_crawl_id\strokec5 ,\cb1 \strokec4 \
\cb3         page_content\strokec5 :\strokec4  pageContent\strokec5 .\strokec4 substring\strokec5 (\cf10 \strokec10 0\cf4 \strokec5 ,\strokec4  \cf10 \strokec10 10000\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3         analysis_prompt\strokec5 :\strokec4  analysisPrompt\strokec5 ,\cb1 \strokec4 \
\cb3         analysis_depth\strokec5 ,\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf6 \strokec6 'analyzing'\cf4 \cb1 \strokec4 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 taskError\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  taskError\strokec5 ;\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Call Claude API\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  anthropicApiKey \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'ANTHROPIC_API_KEY'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  claudeResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cf6 \strokec6 'https://api.anthropic.com/v1/messages'\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf6 \strokec6 'x-api-key'\cf4 \strokec5 :\strokec4  anthropicApiKey\strokec5 !,\cb1 \strokec4 \
\cb3         \cf6 \strokec6 'anthropic-version'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '2023-06-01'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \cb1 \strokec4 \
\cb3       \strokec5 \},\cb1 \strokec4 \
\cb3       body\strokec5 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3         model\strokec5 :\strokec4  \cf6 \strokec6 'claude-sonnet-4-20250514'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         max_tokens\strokec5 :\strokec4  \cf10 \strokec10 4000\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         temperature\strokec5 :\strokec4  \cf10 \strokec10 0.3\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         messages\strokec5 :\strokec4  \strokec5 [\cb1 \strokec4 \
\cb3           \strokec5 \{\cb1 \strokec4 \
\cb3             role\strokec5 :\strokec4  \cf6 \strokec6 'user'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3             content\strokec5 :\strokec4  analysisPrompt\cb1 \
\cb3           \strokec5 \}\cb1 \strokec4 \
\cb3         \strokec5 ]\cb1 \strokec4 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3     \strokec5 \});\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  claudeData \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  claudeResponse\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  claudeAnalysis \strokec5 =\strokec4  claudeData\strokec5 .\strokec4 content\strokec5 ?.[\cf10 \strokec10 0\cf4 \strokec5 ]?.\strokec4 text \strokec5 ||\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Parse Claude's structured analysis\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  seoStrategyDecoded \strokec5 =\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  contentFramework \strokec5 =\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  keywordStrategy \strokec5 =\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  replicationBlueprint \strokec5 =\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  improvementRecommendations \strokec5 =\strokec4  \strokec5 [];\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf8 \strokec8 // Try to extract JSON sections from Claude's response\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  jsonMatch \strokec5 =\strokec4  claudeAnalysis\strokec5 .\strokec4 match\strokec5 (\cf9 \cb3 \strokec9 /\\\{[\\s\\S]*\\\}/\cf4 \cb3 \strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 jsonMatch\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 const\cf4 \strokec4  parsed \strokec5 =\strokec4  \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 parse\strokec5 (\strokec4 jsonMatch\strokec5 [\cf10 \strokec10 0\cf4 \strokec5 ]);\cb1 \strokec4 \
\cb3         seoStrategyDecoded \strokec5 =\strokec4  parsed\strokec5 .\strokec4 seo_strategy \strokec5 ||\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\cb3         contentFramework \strokec5 =\strokec4  parsed\strokec5 .\strokec4 content_framework \strokec5 ||\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\cb3         keywordStrategy \strokec5 =\strokec4  parsed\strokec5 .\strokec4 keyword_strategy \strokec5 ||\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\cb3         replicationBlueprint \strokec5 =\strokec4  parsed\strokec5 .\strokec4 replication_blueprint \strokec5 ||\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 e\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf8 \strokec8 // Extract insights from text\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  sections \strokec5 =\strokec4  claudeAnalysis\strokec5 .\strokec4 split\strokec5 (\cf9 \cb3 \strokec9 /\\n(?=\\d+\\.)/\cf4 \cb3 \strokec5 );\strokec4  \cf8 \strokec8 // Split by numbered sections\cf4 \cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  section \cf2 \strokec2 of\cf4 \strokec4  sections\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 section\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'SEO STRATEGY'\cf4 \strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           seoStrategyDecoded \strokec5 =\strokec4  \strokec5 \{\strokec4  analysis\strokec5 :\strokec4  section \strokec5 \};\cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3         \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 section\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'CONTENT FRAMEWORK'\cf4 \strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           contentFramework \strokec5 =\strokec4  \strokec5 \{\strokec4  analysis\strokec5 :\strokec4  section \strokec5 \};\cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3         \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 section\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 'REPLICATION'\cf4 \strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           replicationBlueprint \strokec5 =\strokec4  \strokec5 \{\strokec4  steps\strokec5 :\strokec4  section \strokec5 \};\cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Extract actionable recommendations\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  recommendationMatches \strokec5 =\strokec4  claudeAnalysis\strokec5 .\strokec4 match\strokec5 (\cf9 \cb3 \strokec9 /(?:^|\\n)(?:\\d+\\.|[-\'95])\\s*(.\{20,200\})(?=\\n|$)/\cf2 \cb3 \strokec2 g\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  \strokec5 [];\cb1 \strokec4 \
\cb3     improvementRecommendations \strokec5 =\strokec4  recommendationMatches\strokec5 .\strokec4 slice\strokec5 (\cf10 \strokec10 0\cf4 \strokec5 ,\strokec4  \cf10 \strokec10 10\cf4 \strokec5 ).\strokec4 map\strokec5 (\strokec4 rec \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3       recommendation\strokec5 :\strokec4  rec\strokec5 .\strokec4 trim\strokec5 ().\strokec4 replace\strokec5 (\cf9 \cb3 \strokec9 /^[\\d\\.\\-\'95]\\s*/\cf4 \cb3 \strokec5 ,\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3       priority\strokec5 :\strokec4  \cf6 \strokec6 'high'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       category\strokec5 :\strokec4  \cf6 \strokec6 'seo_optimization'\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \}));\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Calculate scores\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  analysisConfidence \strokec5 =\strokec4  claudeAnalysis\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf10 \strokec10 1000\cf4 \strokec4  \strokec5 ?\strokec4  \cf10 \strokec10 0.9\cf4 \strokec4  \strokec5 :\strokec4  \cf10 \strokec10 0.7\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  actionabilityScore \strokec5 =\strokec4  improvementRecommendations\strokec5 .\strokec4 length \strokec5 >=\strokec4  \cf10 \strokec10 5\cf4 \strokec4  \strokec5 ?\strokec4  \cf10 \strokec10 0.9\cf4 \strokec4  \strokec5 :\strokec4  \cf10 \strokec10 0.6\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Update task with results\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_claude_reverse_engineering'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf6 \strokec6 'completed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         analysis_result\strokec5 :\strokec4  \strokec5 \{\strokec4  full_analysis\strokec5 :\strokec4  claudeAnalysis \strokec5 \},\cb1 \strokec4 \
\cb3         seo_strategy_decoded\strokec5 :\strokec4  seoStrategyDecoded\strokec5 ,\cb1 \strokec4 \
\cb3         content_framework\strokec5 :\strokec4  contentFramework\strokec5 ,\cb1 \strokec4 \
\cb3         keyword_placement_strategy\strokec5 :\strokec4  keywordStrategy\strokec5 ,\cb1 \strokec4 \
\cb3         replication_blueprint\strokec5 :\strokec4  replicationBlueprint\strokec5 ,\cb1 \strokec4 \
\cb3         improvement_recommendations\strokec5 :\strokec4  improvementRecommendations\strokec5 ,\cb1 \strokec4 \
\cb3         analysis_confidence\strokec5 :\strokec4  analysisConfidence\strokec5 ,\cb1 \strokec4 \
\cb3         actionability_score\strokec5 :\strokec4  actionabilityScore\strokec5 ,\cb1 \strokec4 \
\cb3         implementation_difficulty\strokec5 :\strokec4  \cf6 \strokec6 'medium'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         tokens_used\strokec5 :\strokec4  claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 input_tokens \strokec5 +\strokec4  claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 output_tokens \strokec5 ||\strokec4  \cf10 \strokec10 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         analyzed_at\strokec5 :\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 ()\cb1 \strokec4 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  task\strokec5 .\strokec4 id\strokec5 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3         success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         task_id\strokec5 :\strokec4  task\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3         analysis_summary\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           target_url\strokec5 ,\cb1 \strokec4 \
\cb3           target_type\strokec5 ,\cb1 \strokec4 \
\cb3           analysis_length\strokec5 :\strokec4  claudeAnalysis\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           recommendations_found\strokec5 :\strokec4  improvementRecommendations\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           confidence\strokec5 :\strokec4  analysisConfidence\strokec5 ,\cb1 \strokec4 \
\cb3           actionability\strokec5 :\strokec4  actionabilityScore\cb1 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         key_insights\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           seo_strategy\strokec5 :\strokec4  seoStrategyDecoded\strokec5 ,\cb1 \strokec4 \
\cb3           content_framework\strokec5 :\strokec4  contentFramework\strokec5 ,\cb1 \strokec4 \
\cb3           replication_blueprint\strokec5 :\strokec4  replicationBlueprint\cb1 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         top_recommendations\strokec5 :\strokec4  improvementRecommendations\strokec5 .\strokec4 slice\strokec5 (\cf10 \strokec10 0\cf4 \strokec5 ,\strokec4  \cf10 \strokec10 5\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3         tokens_used\strokec5 :\strokec4  claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 input_tokens \strokec5 +\strokec4  claudeData\strokec5 .\strokec4 usage\strokec5 ?.\strokec4 output_tokens \strokec5 ||\strokec4  \cf10 \strokec10 0\cf4 \cb1 \strokec4 \
\cb3       \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf10 \strokec10 200\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Claude reverse engineering error:'\cf4 \strokec5 ,\strokec4  error\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf10 \strokec10 500\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \});\cb1 \strokec4 \
}