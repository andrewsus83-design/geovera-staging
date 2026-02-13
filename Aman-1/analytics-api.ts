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
\cf7 \cb3 \strokec7  * Analytics & Trends API\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Historical analysis, trend detection, and performance metrics\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  */\cf4 \cb1 \strokec4 \
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
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabaseClient \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_ANON_KEY'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  \cf2 \strokec2 global\cf4 \strokec5 :\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf8 \strokec8 Authorization\cf4 \strokec5 :\strokec4  req\strokec5 .\strokec4 headers\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'Authorization'\cf4 \strokec5 )!\strokec4  \strokec5 \}\strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  url \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 URL\cf4 \strokec5 (\strokec4 req\strokec5 .\strokec4 url\strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  brandId \strokec5 =\strokec4  url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  period \strokec5 =\strokec4  url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'period'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  \cf6 \strokec6 '30'\cf4 \strokec4  \cf7 \strokec7 // days\cf4 \cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brandId\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'brand_id required'\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 400\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  daysAgo \strokec5 =\strokec4  parseInt\strokec5 (\strokec4 period\strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  startDate \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 ()\cb1 \strokec4 \
\cb3     startDate\strokec5 .\strokec4 setDate\strokec5 (\strokec4 startDate\strokec5 .\strokec4 getDate\strokec5 ()\strokec4  \strokec5 -\strokec4  daysAgo\strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // GET /analytics/pillar-trends\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 url\strokec5 .\strokec4 pathname\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 '/pillar-trends'\cf4 \strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  scores \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_pillar_scores'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'pillar, score, confidence, created_at'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'created_at'\cf4 \strokec5 ,\strokec4  startDate\strokec5 .\strokec4 toISOString\strokec5 ())\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'created_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\
\cb3       \cf7 \strokec7 // Group by pillar\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  trends\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         visibility\strokec5 :\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3         discovery\strokec5 :\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3         trust\strokec5 :\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3         revenue\strokec5 :\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       scores\strokec5 ?.\strokec4 forEach\strokec5 (\strokec4 s \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 trends\strokec5 [\strokec4 s\strokec5 .\strokec4 pillar\strokec5 ])\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           trends\strokec5 [\strokec4 s\strokec5 .\strokec4 pillar\strokec5 ].\strokec4 push\strokec5 (\{\cb1 \strokec4 \
\cb3             date\strokec5 :\strokec4  s\strokec5 .\strokec4 created_at\strokec5 ,\cb1 \strokec4 \
\cb3             score\strokec5 :\strokec4  s\strokec5 .\strokec4 score\strokec5 ,\cb1 \strokec4 \
\cb3             confidence\strokec5 :\strokec4  s\strokec5 .\strokec4 confidence\strokec5 ,\cb1 \strokec4 \
\cb3           \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\
\cb3       \cf7 \strokec7 // Calculate trend direction and velocity\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  analysis\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3       \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  pillar \cf2 \strokec2 in\cf4 \strokec4  trends\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 const\cf4 \strokec4  data \strokec5 =\strokec4  trends\strokec5 [\strokec4 pillar\strokec5 ]\cb1 \strokec4 \
\cb3         \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 data\strokec5 .\strokec4 length \strokec5 <\strokec4  \cf9 \strokec9 2\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           analysis\strokec5 [\strokec4 pillar\strokec5 ]\strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3             trend\strokec5 :\strokec4  \cf6 \strokec6 'insufficient_data'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3             velocity\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3             current\strokec5 :\strokec4  data\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]?.\strokec4 score \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3             data_points\strokec5 :\strokec4  data\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           \strokec5 \}\cb1 \strokec4 \
\cb3           \cf2 \strokec2 continue\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\
\cb3         \cf2 \strokec2 const\cf4 \strokec4  first \strokec5 =\strokec4  data\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ].\strokec4 score\cb1 \
\cb3         \cf2 \strokec2 const\cf4 \strokec4  last \strokec5 =\strokec4  data\strokec5 [\strokec4 data\strokec5 .\strokec4 length \strokec5 -\strokec4  \cf9 \strokec9 1\cf4 \strokec5 ].\strokec4 score\cb1 \
\cb3         \cf2 \strokec2 const\cf4 \strokec4  change \strokec5 =\strokec4  last \strokec5 -\strokec4  first\cb1 \
\cb3         \cf2 \strokec2 const\cf4 \strokec4  velocity \strokec5 =\strokec4  change \strokec5 /\strokec4  data\strokec5 .\strokec4 length \cf7 \strokec7 // points per data point\cf4 \cb1 \strokec4 \
\
\cb3         analysis\strokec5 [\strokec4 pillar\strokec5 ]\strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           trend\strokec5 :\strokec4  change \strokec5 >\strokec4  \cf9 \strokec9 5\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'improving'\cf4 \strokec4  \strokec5 :\strokec4  change \strokec5 <\strokec4  \strokec5 -\cf9 \strokec9 5\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'declining'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'stable'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           velocity\strokec5 :\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 velocity \strokec5 *\strokec4  \cf9 \strokec9 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf9 \strokec9 100\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           change\strokec5 :\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 change \strokec5 *\strokec4  \cf9 \strokec9 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf9 \strokec9 100\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           current\strokec5 :\strokec4  last\strokec5 ,\cb1 \strokec4 \
\cb3           previous\strokec5 :\strokec4  first\strokec5 ,\cb1 \strokec4 \
\cb3           data_points\strokec5 :\strokec4  data\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           history\strokec5 :\strokec4  data\strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  period\strokec5 :\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 daysAgo\strokec5 \}\cf6 \strokec6  days`\cf4 \strokec5 ,\strokec4  trends\strokec5 :\strokec4  analysis \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // GET /analytics/insight-summary\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 url\strokec5 .\strokec4 pathname\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 '/insight-summary'\cf4 \strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  insights \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_insights'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'pillar, severity, status, confidence, created_at'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'created_at'\cf4 \strokec5 ,\strokec4  startDate\strokec5 .\strokec4 toISOString\strokec5 ())\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  summary \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         total\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         by_pillar\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           visibility\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 pillar \strokec5 ===\strokec4  \cf6 \strokec6 'visibility'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           discovery\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 pillar \strokec5 ===\strokec4  \cf6 \strokec6 'discovery'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           trust\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 pillar \strokec5 ===\strokec4  \cf6 \strokec6 'trust'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           revenue\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 pillar \strokec5 ===\strokec4  \cf6 \strokec6 'revenue'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         by_severity\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           critical\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 severity \strokec5 ===\strokec4  \cf6 \strokec6 'critical'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           high\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 severity \strokec5 ===\strokec4  \cf6 \strokec6 'high'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           medium\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 severity \strokec5 ===\strokec4  \cf6 \strokec6 'medium'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           low\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 severity \strokec5 ===\strokec4  \cf6 \strokec6 'low'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         by_status\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           draft\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 status \strokec5 ===\strokec4  \cf6 \strokec6 'draft'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           approved\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 status \strokec5 ===\strokec4  \cf6 \strokec6 'approved'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           rejected\strokec5 :\strokec4  insights\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 i \strokec5 =>\strokec4  i\strokec5 .\strokec4 status \strokec5 ===\strokec4  \cf6 \strokec6 'rejected'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         avg_confidence\strokec5 :\strokec4  insights \strokec5 &&\strokec4  insights\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\cb3           \strokec5 ?\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 ((\strokec4 insights\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  i\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  \strokec5 (\strokec4 i\strokec5 .\strokec4 confidence \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ),\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  insights\strokec5 .\strokec4 length\strokec5 )\strokec4  \strokec5 *\strokec4  \cf9 \strokec9 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf9 \strokec9 100\cf4 \cb1 \strokec4 \
\cb3           \strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  period\strokec5 :\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 daysAgo\strokec5 \}\cf6 \strokec6  days`\cf4 \strokec5 ,\strokec4  summary \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // GET /analytics/cost-trends\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 url\strokec5 .\strokec4 pathname\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 '/cost-trends'\cf4 \strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  runs \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_runs'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'cost_usd, perplexity_cost, claude_cost, openai_cost, created_at'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'created_at'\cf4 \strokec5 ,\strokec4  startDate\strokec5 .\strokec4 toISOString\strokec5 ())\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'created_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  totalCost \strokec5 =\strokec4  runs\strokec5 ?.\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  r\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  \strokec5 (\strokec4 r\strokec5 .\strokec4 cost_usd \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ),\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  avgCost \strokec5 =\strokec4  runs \strokec5 &&\strokec4  runs\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 ?\strokec4  totalCost \strokec5 /\strokec4  runs\strokec5 .\strokec4 length \strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  trends \strokec5 =\strokec4  runs\strokec5 ?.\strokec4 map\strokec5 (\strokec4 r \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3         date\strokec5 :\strokec4  r\strokec5 .\strokec4 created_at\strokec5 ,\cb1 \strokec4 \
\cb3         total\strokec5 :\strokec4  r\strokec5 .\strokec4 cost_usd\strokec5 ,\cb1 \strokec4 \
\cb3         perplexity\strokec5 :\strokec4  r\strokec5 .\strokec4 perplexity_cost \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         claude\strokec5 :\strokec4  r\strokec5 .\strokec4 claude_cost \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         openai\strokec5 :\strokec4  r\strokec5 .\strokec4 openai_cost \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \strokec5 \}))\strokec4  \strokec5 ||\strokec4  \strokec5 []\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           period\strokec5 :\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 daysAgo\strokec5 \}\cf6 \strokec6  days`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           total_cost\strokec5 :\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 totalCost \strokec5 *\strokec4  \cf9 \strokec9 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf9 \strokec9 100\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           avg_cost_per_run\strokec5 :\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 avgCost \strokec5 *\strokec4  \cf9 \strokec9 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf9 \strokec9 100\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           runs_count\strokec5 :\strokec4  runs\strokec5 ?.\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           trends\strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // GET /analytics/performance\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 url\strokec5 .\strokec4 pathname\strokec5 .\strokec4 includes\strokec5 (\cf6 \strokec6 '/performance'\cf4 \strokec5 ))\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  runs \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_runs'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'status, duration_seconds, insights_count, tasks_count, created_at'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'created_at'\cf4 \strokec5 ,\strokec4  startDate\strokec5 .\strokec4 toISOString\strokec5 ())\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  completed \strokec5 =\strokec4  runs\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 r \strokec5 =>\strokec4  r\strokec5 .\strokec4 status \strokec5 ===\strokec4  \cf6 \strokec6 'completed'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  failed \strokec5 =\strokec4  runs\strokec5 ?.\strokec4 filter\strokec5 (\strokec4 r \strokec5 =>\strokec4  r\strokec5 .\strokec4 status \strokec5 ===\strokec4  \cf6 \strokec6 'failed'\cf4 \strokec5 ).\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  total \strokec5 =\strokec4  runs\strokec5 ?.\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  avgDuration \strokec5 =\strokec4  runs \strokec5 &&\strokec4  runs\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\cb3         \strokec5 ?\strokec4  runs\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  r\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  \strokec5 (\strokec4 r\strokec5 .\strokec4 duration_seconds \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ),\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  runs\strokec5 .\strokec4 length\cb1 \
\cb3         \strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  avgInsights \strokec5 =\strokec4  runs \strokec5 &&\strokec4  runs\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\cb3         \strokec5 ?\strokec4  runs\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  r\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  \strokec5 (\strokec4 r\strokec5 .\strokec4 insights_count \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ),\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  runs\strokec5 .\strokec4 length\cb1 \
\cb3         \strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  avgTasks \strokec5 =\strokec4  runs \strokec5 &&\strokec4  runs\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\cb3         \strokec5 ?\strokec4  runs\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  r\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  \strokec5 (\strokec4 r\strokec5 .\strokec4 tasks_count \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ),\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  runs\strokec5 .\strokec4 length\cb1 \
\cb3         \strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           period\strokec5 :\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 daysAgo\strokec5 \}\cf6 \strokec6  days`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           runs\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3             total\strokec5 ,\cb1 \strokec4 \
\cb3             completed\strokec5 ,\cb1 \strokec4 \
\cb3             failed\strokec5 ,\cb1 \strokec4 \
\cb3             success_rate\strokec5 :\strokec4  total \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 ?\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 ((\strokec4 completed \strokec5 /\strokec4  total\strokec5 )\strokec4  \strokec5 *\strokec4  \cf9 \strokec9 100\cf4 \strokec5 )\strokec4  \strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \strokec5 \},\cb1 \strokec4 \
\cb3           averages\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3             duration_seconds\strokec5 :\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 avgDuration\strokec5 ),\cb1 \strokec4 \
\cb3             insights_per_run\strokec5 :\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 avgInsights \strokec5 *\strokec4  \cf9 \strokec9 10\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf9 \strokec9 10\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3             tasks_per_run\strokec5 :\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 avgTasks \strokec5 *\strokec4  \cf9 \strokec9 10\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf9 \strokec9 10\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \strokec5 \},\cb1 \strokec4 \
\cb3         \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Endpoint not found'\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 404\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})\cb1 \strokec4 \
}