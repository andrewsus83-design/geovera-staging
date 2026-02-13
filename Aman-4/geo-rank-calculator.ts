{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue0;\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;\red83\green83\blue83;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;\cssrgb\c40000\c40000\c40000;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \strokec5 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2'\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \cb3 \strokec4  \cf7 \strokec7 GEOMetrics\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   citation_frequency\strokec5 :\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\cb3   avg_sentiment\strokec5 :\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\cb3   recommendation_rate\strokec5 :\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\cb3   competitor_share\strokec5 :\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 interface\cf4 \cb3 \strokec4  \cf7 \strokec7 GEOScore\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   visibility_score\strokec5 :\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\cb3   rank_vs_competitors\strokec5 :\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\cb3   metrics_breakdown\strokec5 :\strokec4  \cf7 \strokec7 GEOMetrics\cf4 \strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \cb3 \strokec2 async\cf4 \cb3 \strokec4  \strokec5 (\strokec4 req\strokec5 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 try\cf4 \cb3 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'OPTIONS'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf6 \strokec6 'ok'\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Methods'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'POST, OPTIONS'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Headers'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'authorization, content-type'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  test_ids \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  req\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (!\strokec4 test_ids \strokec5 ||\strokec4  \strokec5 !\cf7 \strokec7 Array\cf4 \strokec5 .\strokec4 isArray\strokec5 (\strokec4 test_ids\strokec5 )\strokec4  \strokec5 ||\strokec4  test_ids\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'test_ids array required'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf8 \strokec8 400\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  supabase \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )!,\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 )!,\cb1 \strokec4 \
\cb3       \strokec5 \{\cb1 \strokec4 \
\cb3         auth\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           autoRefreshToken\strokec5 :\strokec4  \cf2 \cb3 \strokec2 false\cf4 \cb3 \strokec5 ,\cb1 \strokec4 \
\cb3           persistSession\strokec5 :\strokec4  \cf2 \cb3 \strokec2 false\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  rankings\strokec5 :\strokec4  \cf7 \strokec7 GEOScore\cf4 \strokec5 []\strokec4  \strokec5 =\strokec4  \strokec5 [];\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Process each test\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 for\cf4 \cb3 \strokec4  \strokec5 (\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  test_id \cf2 \cb3 \strokec2 of\cf4 \cb3 \strokec4  test_ids\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf9 \cb3 \strokec9 // Fetch all responses for this test\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  responses\strokec5 ,\strokec4  error \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_llm_responses'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'test_id'\cf4 \strokec5 ,\strokec4  test_id\strokec5 );\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 error \strokec5 ||\strokec4  \strokec5 !\strokec4 responses \strokec5 ||\strokec4  responses\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `No responses found for test \cf4 \strokec5 $\{\strokec4 test_id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 );\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 continue\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf9 \cb3 \strokec9 // Calculate metrics\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  totalQuestions \strokec5 =\strokec4  responses\strokec5 .\strokec4 length\strokec5 ;\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  brandMentions \strokec5 =\strokec4  responses\strokec5 .\strokec4 filter\strokec5 (\strokec4 r \strokec5 =>\strokec4  r\strokec5 .\strokec4 brand_mentioned\strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  recommendations \strokec5 =\strokec4  responses\strokec5 .\strokec4 filter\strokec5 (\strokec4 r \strokec5 =>\strokec4  r\strokec5 .\strokec4 is_recommendation\strokec5 );\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  metrics\strokec5 :\strokec4  \cf7 \strokec7 GEOMetrics\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         citation_frequency\strokec5 :\strokec4  brandMentions\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3         avg_sentiment\strokec5 :\strokec4  brandMentions\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf8 \strokec8 0\cf4 \cb1 \strokec4 \
\cb3           \strokec5 ?\strokec4  brandMentions\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  r\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  \strokec5 (\strokec4 r\strokec5 .\strokec4 sentiment \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ),\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  brandMentions\strokec5 .\strokec4 length\cb1 \
\cb3           \strokec5 :\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         recommendation_rate\strokec5 :\strokec4  totalQuestions \strokec5 >\strokec4  \cf8 \strokec8 0\cf4 \cb1 \strokec4 \
\cb3           \strokec5 ?\strokec4  \strokec5 (\strokec4 recommendations\strokec5 .\strokec4 length \strokec5 /\strokec4  totalQuestions\strokec5 )\strokec4  \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \cb1 \strokec4 \
\cb3           \strokec5 :\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         competitor_share\strokec5 :\strokec4  calculateCompetitorShare\strokec5 (\strokec4 responses\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \};\cb1 \strokec4 \
\
\cb3       \cf9 \cb3 \strokec9 // Calculate visibility score\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  visibility_score \strokec5 =\strokec4  calculateVisibilityScore\strokec5 (\strokec4 metrics\strokec5 ,\strokec4  totalQuestions\strokec5 );\cb1 \strokec4 \
\
\cb3       \cf9 \cb3 \strokec9 // Update the ranking record\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_geo_rankings'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3           citation_frequency\strokec5 :\strokec4  metrics\strokec5 .\strokec4 citation_frequency\strokec5 ,\cb1 \strokec4 \
\cb3           avg_sentiment\strokec5 :\strokec4  metrics\strokec5 .\strokec4 avg_sentiment\strokec5 ,\cb1 \strokec4 \
\cb3           recommendation_pct\strokec5 :\strokec4  metrics\strokec5 .\strokec4 recommendation_rate\strokec5 ,\cb1 \strokec4 \
\cb3           competitor_mention_count\strokec5 :\strokec4  responses\strokec5 .\strokec4 reduce\strokec5 (\cb1 \strokec4 \
\cb3             \strokec5 (\strokec4 sum\strokec5 ,\strokec4  r\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  \strokec5 (\strokec4 r\strokec5 .\strokec4 competitors_mentioned\strokec5 ?.\strokec4 length \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3             \cf8 \strokec8 0\cf4 \cb1 \strokec4 \
\cb3           \strokec5 ),\cb1 \strokec4 \
\cb3           visibility_score\strokec5 :\strokec4  visibility_score\strokec5 ,\cb1 \strokec4 \
\cb3           test_status\strokec5 :\strokec4  \cf6 \strokec6 'completed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           updated_at\strokec5 :\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 ()\cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  test_id\strokec5 );\cb1 \strokec4 \
\
\cb3       rankings\strokec5 .\strokec4 push\strokec5 (\{\cb1 \strokec4 \
\cb3         visibility_score\strokec5 ,\cb1 \strokec4 \
\cb3         rank_vs_competitors\strokec5 :\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\strokec4  \cf9 \cb3 \strokec9 // Will be calculated after all platforms\cf4 \cb1 \strokec4 \
\cb3         metrics_breakdown\strokec5 :\strokec4  metrics\cb1 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Calculate ranks (sorted by visibility score)\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  sortedRankings \strokec5 =\strokec4  rankings\strokec5 .\strokec4 sort\strokec5 ((\strokec4 a\strokec5 ,\strokec4  b\strokec5 )\strokec4  \strokec5 =>\strokec4  b\strokec5 .\strokec4 visibility_score \strokec5 -\strokec4  a\strokec5 .\strokec4 visibility_score\strokec5 );\cb1 \strokec4 \
\cb3     sortedRankings\strokec5 .\strokec4 forEach\strokec5 ((\strokec4 ranking\strokec5 ,\strokec4  index\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       ranking\strokec5 .\strokec4 rank_vs_competitors \strokec5 =\strokec4  index \strokec5 +\strokec4  \cf8 \strokec8 1\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \strokec5 \});\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Update ranks in database\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 for\cf4 \cb3 \strokec4  \strokec5 (\cf2 \cb3 \strokec2 let\cf4 \cb3 \strokec4  i \strokec5 =\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\strokec4  i \strokec5 <\strokec4  test_ids\strokec5 .\strokec4 length\strokec5 ;\strokec4  i\strokec5 ++)\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_geo_rankings'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 update\strokec5 (\{\strokec4  rank_vs_competitors\strokec5 :\strokec4  rankings\strokec5 [\strokec4 i\strokec5 ].\strokec4 rank_vs_competitors \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  test_ids\strokec5 [\strokec4 i\strokec5 ]);\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3         success\strokec5 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec5 ,\cb1 \strokec4 \
\cb3         rankings\strokec5 :\strokec4  rankings\cb1 \
\cb3       \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf8 \strokec8 200\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 catch\cf4 \cb3 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'GEO calculation error:'\cf4 \strokec5 ,\strokec4  error\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf8 \strokec8 500\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \});\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \cb3 \strokec4  calculateVisibilityScore\strokec5 (\strokec4 metrics\strokec5 :\strokec4  \cf7 \strokec7 GEOMetrics\cf4 \strokec5 ,\strokec4  totalQuestions\strokec5 :\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec5 ):\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf9 \cb3 \strokec9 // Weights for each metric\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  weights \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     citation\strokec5 :\strokec4  \cf8 \strokec8 0.30\cf4 \strokec5 ,\strokec4       \cf9 \cb3 \strokec9 // 30% - How often mentioned\cf4 \cb1 \strokec4 \
\cb3     sentiment\strokec5 :\strokec4  \cf8 \strokec8 0.25\cf4 \strokec5 ,\strokec4      \cf9 \cb3 \strokec9 // 25% - How positively mentioned\cf4 \cb1 \strokec4 \
\cb3     recommendation\strokec5 :\strokec4  \cf8 \strokec8 0.25\cf4 \strokec5 ,\strokec4  \cf9 \cb3 \strokec9 // 25% - How often recommended\cf4 \cb1 \strokec4 \
\cb3     competitorShare\strokec5 :\strokec4  \cf8 \strokec8 0.20\cf4 \strokec4  \cf9 \cb3 \strokec9 // 20% - Market share of voice\cf4 \cb1 \strokec4 \
\cb3   \strokec5 \};\cb1 \strokec4 \
\
\cb3   \cf9 \cb3 \strokec9 // Normalize metrics to 0-100 scale\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  normalizedCitation \strokec5 =\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 min\strokec5 ((\strokec4 metrics\strokec5 .\strokec4 citation_frequency \strokec5 /\strokec4  totalQuestions\strokec5 )\strokec4  \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ,\strokec4  \cf8 \strokec8 100\cf4 \strokec5 );\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  normalizedSentiment \strokec5 =\strokec4  \strokec5 ((\strokec4 metrics\strokec5 .\strokec4 avg_sentiment \strokec5 +\strokec4  \cf8 \strokec8 1\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 2\cf4 \strokec5 )\strokec4  \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ;\strokec4  \cf9 \cb3 \strokec9 // -1 to 1 \uc0\u8594  0 to 100\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  normalizedRecommendation \strokec5 =\strokec4  metrics\strokec5 .\strokec4 recommendation_rate\strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  normalizedShare \strokec5 =\strokec4  metrics\strokec5 .\strokec4 competitor_share \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf9 \cb3 \strokec9 // Calculate weighted score\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  score \strokec5 =\strokec4  \strokec5 (\cb1 \strokec4 \
\cb3     normalizedCitation \strokec5 *\strokec4  weights\strokec5 .\strokec4 citation \strokec5 +\cb1 \strokec4 \
\cb3     normalizedSentiment \strokec5 *\strokec4  weights\strokec5 .\strokec4 sentiment \strokec5 +\cb1 \strokec4 \
\cb3     normalizedRecommendation \strokec5 *\strokec4  weights\strokec5 .\strokec4 recommendation \strokec5 +\cb1 \strokec4 \
\cb3     normalizedShare \strokec5 *\strokec4  weights\strokec5 .\strokec4 competitorShare\cb1 \
\cb3   \strokec5 );\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 score \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ;\strokec4  \cf9 \cb3 \strokec9 // Round to 2 decimals\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \cb3 \strokec4  calculateCompetitorShare\strokec5 (\strokec4 responses\strokec5 :\strokec4  \cf2 \cb3 \strokec2 any\cf4 \cb3 \strokec5 []):\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  brandMentions \strokec5 =\strokec4  responses\strokec5 .\strokec4 filter\strokec5 (\strokec4 r \strokec5 =>\strokec4  r\strokec5 .\strokec4 brand_mentioned\strokec5 ).\strokec4 length\strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  competitorMentions \strokec5 =\strokec4  responses\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  r\strokec5 )\strokec4  \strokec5 =>\strokec4  \cb1 \
\cb3     sum \strokec5 +\strokec4  \strokec5 (\strokec4 r\strokec5 .\strokec4 competitors_mentioned\strokec5 ?.\strokec4 length \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ),\strokec4  \cf8 \strokec8 0\cf4 \cb1 \strokec4 \
\cb3   \strokec5 );\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  totalMentions \strokec5 =\strokec4  brandMentions \strokec5 +\strokec4  competitorMentions\strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  totalMentions \strokec5 >\strokec4  \cf8 \strokec8 0\cf4 \strokec4  \strokec5 ?\strokec4  brandMentions \strokec5 /\strokec4  totalMentions \strokec5 :\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
}