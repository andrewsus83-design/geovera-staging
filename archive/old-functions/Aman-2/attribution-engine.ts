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
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \strokec5 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2'\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \strokec4  \cf7 \strokec7 AttributionRequest\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   conversion_id?: \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   brand_id?: \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   attribution_model?: \cf6 \strokec6 'first_touch'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'last_touch'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'linear'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'time_decay'\cf4 \strokec4  \strokec5 |\strokec4  \cf6 \strokec6 'position_based'\cf4 \strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \strokec2 async\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  startTime \strokec5 =\strokec4  \cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ();\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'OPTIONS'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf6 \strokec6 'ok'\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Methods'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'POST, OPTIONS'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Headers'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'authorization, content-type'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  authHeader \strokec5 =\strokec4  req\strokec5 .\strokec4 headers\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'Authorization'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 authHeader\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Unauthorized'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf8 \strokec8 401\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3       conversion_id\strokec5 ,\strokec4  \cb1 \
\cb3       brand_id\strokec5 ,\cb1 \strokec4 \
\cb3       attribution_model \strokec5 =\strokec4  \cf6 \strokec6 'time_decay'\cf4 \strokec4  \cb1 \
\cb3     \strokec5 \}:\strokec4  \cf7 \strokec7 AttributionRequest\cf4 \strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabase \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )!,\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 )!,\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  auth\strokec5 :\strokec4  \strokec5 \{\strokec4  autoRefreshToken\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec5 ,\strokec4  persistSession\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 let\cf4 \strokec4  conversions \strokec5 =\strokec4  \strokec5 [];\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 conversion_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf9 \strokec9 // Single conversion attribution\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_conversions'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  conversion_id\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 data\strokec5 )\strokec4  conversions \strokec5 =\strokec4  \strokec5 [\strokec4 data\strokec5 ];\cb1 \strokec4 \
\cb3     \strokec5 \}\strokec4  \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 brand_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf9 \strokec9 // All unattributed conversions for brand\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_conversions'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'attribution_completed'\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 false\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'converted_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 limit\strokec5 (\cf8 \strokec8 50\cf4 \strokec5 );\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       conversions \strokec5 =\strokec4  data \strokec5 ||\strokec4  \strokec5 [];\cb1 \strokec4 \
\cb3     \strokec5 \}\strokec4  \cf2 \strokec2 else\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'conversion_id or brand_id required'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf8 \strokec8 400\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  results \strokec5 =\strokec4  \strokec5 [];\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  conversion \cf2 \strokec2 of\cf4 \strokec4  conversions\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf9 \strokec9 // STEP 1: Find matching touchpoints\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  matchedTouchpoints \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  findMatchingTouchpoints\strokec5 (\strokec4 supabase\strokec5 ,\strokec4  conversion\strokec5 );\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 matchedTouchpoints\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `No touchpoints found for conversion \cf4 \strokec5 $\{\strokec4 conversion\strokec5 .\strokec4 id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 );\cb1 \strokec4 \
\cb3         \cf2 \strokec2 continue\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf9 \strokec9 // STEP 2: Calculate attribution weights\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  attributedTouchpoints \strokec5 =\strokec4  calculateAttributionWeights\strokec5 (\cb1 \strokec4 \
\cb3         matchedTouchpoints\strokec5 ,\cb1 \strokec4 \
\cb3         conversion\strokec5 ,\cb1 \strokec4 \
\cb3         attribution_model\cb1 \
\cb3       \strokec5 );\cb1 \strokec4 \
\
\cb3       \cf9 \strokec9 // STEP 3: Update touchpoints with attribution\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  tp \cf2 \strokec2 of\cf4 \strokec4  attributedTouchpoints\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3           \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_dark_funnel_touchpoints'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3           \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3             attributed_to_conversion_id\strokec5 :\strokec4  conversion\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3             attribution_weight\strokec5 :\strokec4  tp\strokec5 .\strokec4 weight\strokec5 ,\cb1 \strokec4 \
\cb3             attribution_model\strokec5 :\strokec4  attribution_model\cb1 \
\cb3           \strokec5 \})\cb1 \strokec4 \
\cb3           \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  tp\strokec5 .\strokec4 id\strokec5 );\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf9 \strokec9 // STEP 4: Create attribution journey\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  channelAttribution \strokec5 =\strokec4  calculateChannelAttribution\strokec5 (\strokec4 attributedTouchpoints\strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  dominantChannel \strokec5 =\strokec4  \cf7 \strokec7 Object\cf4 \strokec5 .\strokec4 entries\strokec5 (\strokec4 channelAttribution\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 sort\strokec5 ((\strokec4 a\strokec5 ,\strokec4  b\strokec5 )\strokec4  \strokec5 =>\strokec4  b\strokec5 [\cf8 \strokec8 1\cf4 \strokec5 ]\strokec4  \strokec5 -\strokec4  a\strokec5 [\cf8 \strokec8 1\cf4 \strokec5 ])[\cf8 \strokec8 0\cf4 \strokec5 ]?.[\cf8 \strokec8 0\cf4 \strokec5 ];\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  journey \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         brand_id\strokec5 :\strokec4  conversion\strokec5 .\strokec4 brand_id\strokec5 ,\cb1 \strokec4 \
\cb3         conversion_id\strokec5 :\strokec4  conversion\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3         total_touchpoints\strokec5 :\strokec4  attributedTouchpoints\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3         journey_duration_days\strokec5 :\strokec4  calculateJourneyDuration\strokec5 (\strokec4 attributedTouchpoints\strokec5 ,\strokec4  conversion\strokec5 ),\cb1 \strokec4 \
\cb3         channels_involved\strokec5 :\strokec4  \strokec5 [...\cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Set\cf4 \strokec5 (\strokec4 attributedTouchpoints\strokec5 .\strokec4 map\strokec5 (\strokec4 t \strokec5 =>\strokec4  t\strokec5 .\strokec4 channel\strokec5 ))],\cb1 \strokec4 \
\cb3         touchpoint_sequence\strokec5 :\strokec4  attributedTouchpoints\strokec5 .\strokec4 map\strokec5 (\strokec4 t \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3           touchpoint_id\strokec5 :\strokec4  t\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3           channel\strokec5 :\strokec4  t\strokec5 .\strokec4 channel\strokec5 ,\cb1 \strokec4 \
\cb3           occurred_at\strokec5 :\strokec4  t\strokec5 .\strokec4 occurred_at\strokec5 ,\cb1 \strokec4 \
\cb3           weight\strokec5 :\strokec4  t\strokec5 .\strokec4 weight\cb1 \
\cb3         \strokec5 \})),\cb1 \strokec4 \
\cb3         attribution_model\strokec5 ,\cb1 \strokec4 \
\cb3         channel_attribution\strokec5 :\strokec4  channelAttribution\strokec5 ,\cb1 \strokec4 \
\cb3         match_confidence\strokec5 :\strokec4  calculateMatchConfidence\strokec5 (\strokec4 matchedTouchpoints\strokec5 ,\strokec4  conversion\strokec5 ),\cb1 \strokec4 \
\cb3         data_completeness\strokec5 :\strokec4  attributedTouchpoints\strokec5 .\strokec4 length \strokec5 /\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 max\strokec5 (\cf8 \strokec8 5\cf4 \strokec5 ,\strokec4  attributedTouchpoints\strokec5 .\strokec4 length\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \};\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 await\cf4 \strokec4  supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_attribution_journeys'\cf4 \strokec5 ).\strokec4 upsert\strokec5 (\strokec4 journey\strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         onConflict\strokec5 :\strokec4  \cf6 \strokec6 'conversion_id,attribution_model'\cf4 \cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\
\cb3       \cf9 \strokec9 // STEP 5: Update conversion with attribution metadata\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_conversions'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3           attribution_completed\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           total_touchpoints\strokec5 :\strokec4  attributedTouchpoints\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           journey_duration_days\strokec5 :\strokec4  journey\strokec5 .\strokec4 journey_duration_days\strokec5 ,\cb1 \strokec4 \
\cb3           first_touchpoint_at\strokec5 :\strokec4  attributedTouchpoints\strokec5 [\cf8 \strokec8 0\cf4 \strokec5 ]?.\strokec4 occurred_at\strokec5 ,\cb1 \strokec4 \
\cb3           dominant_channel\strokec5 :\strokec4  dominantChannel\strokec5 ,\cb1 \strokec4 \
\cb3           attribution_confidence\strokec5 :\strokec4  journey\strokec5 .\strokec4 match_confidence\cb1 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  conversion\strokec5 .\strokec4 id\strokec5 );\cb1 \strokec4 \
\
\cb3       results\strokec5 .\strokec4 push\strokec5 (\{\cb1 \strokec4 \
\cb3         conversion_id\strokec5 :\strokec4  conversion\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3         conversion_type\strokec5 :\strokec4  conversion\strokec5 .\strokec4 conversion_type\strokec5 ,\cb1 \strokec4 \
\cb3         conversion_value\strokec5 :\strokec4  conversion\strokec5 .\strokec4 conversion_value\strokec5 ,\cb1 \strokec4 \
\cb3         touchpoints_found\strokec5 :\strokec4  attributedTouchpoints\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3         journey_duration_days\strokec5 :\strokec4  journey\strokec5 .\strokec4 journey_duration_days\strokec5 ,\cb1 \strokec4 \
\cb3         channel_attribution\strokec5 :\strokec4  channelAttribution\strokec5 ,\cb1 \strokec4 \
\cb3         dominant_channel\strokec5 :\strokec4  dominantChannel\strokec5 ,\cb1 \strokec4 \
\cb3         match_confidence\strokec5 :\strokec4  journey\strokec5 .\strokec4 match_confidence\cb1 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  processingTime \strokec5 =\strokec4  \cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  startTime\strokec5 ;\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3         success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         conversions_processed\strokec5 :\strokec4  results\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3         attribution_model\strokec5 ,\cb1 \strokec4 \
\cb3         results\strokec5 ,\cb1 \strokec4 \
\cb3         processing_time_ms\strokec5 :\strokec4  processingTime\cb1 \
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
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Attribution engine error:'\cf4 \strokec5 ,\strokec4  error\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 ||\strokec4  \cf6 \strokec6 'Internal server error'\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
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
\cf9 \cb3 \strokec9 // Find touchpoints that match conversion signals\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  findMatchingTouchpoints\strokec5 (\strokec4 supabase\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  conversion\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  lookbackDays \strokec5 =\strokec4  \cf8 \strokec8 90\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  minMatchScore \strokec5 =\strokec4  \cf8 \strokec8 0.3\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf9 \strokec9 // Get all touchpoints in lookback window\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  touchpoints \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3     \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_dark_funnel_touchpoints'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  conversion\strokec5 .\strokec4 brand_id\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'occurred_at'\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\strokec4 conversion\strokec5 .\strokec4 converted_at\strokec5 .\strokec4 getTime\strokec5 ()\strokec4  \strokec5 -\strokec4  lookbackDays \strokec5 *\strokec4  \cf8 \strokec8 24\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 1000\cf4 \strokec5 ).\strokec4 toISOString\strokec5 ())\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 lt\strokec5 (\cf6 \strokec6 'occurred_at'\cf4 \strokec5 ,\strokec4  conversion\strokec5 .\strokec4 converted_at\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\cf2 \strokec2 is\cf4 \strokec5 (\cf6 \strokec6 'attributed_to_conversion_id'\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 null\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'occurred_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \strokec5 \});\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 touchpoints \strokec5 ||\strokec4  touchpoints\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \strokec5 [];\cb1 \strokec4 \
\
\cb3   \cf9 \strokec9 // Score each touchpoint for match quality\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  scoredTouchpoints \strokec5 =\strokec4  touchpoints\strokec5 .\strokec4 map\strokec5 (\strokec4 tp \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3     \strokec5 ...\strokec4 tp\strokec5 ,\cb1 \strokec4 \
\cb3     matchScore\strokec5 :\strokec4  calculateMatchScore\strokec5 (\strokec4 tp\strokec5 ,\strokec4  conversion\strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}));\cb1 \strokec4 \
\
\cb3   \cf9 \strokec9 // Filter by minimum match score\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  scoredTouchpoints\cb1 \
\cb3     \strokec5 .\strokec4 filter\strokec5 (\strokec4 tp \strokec5 =>\strokec4  tp\strokec5 .\strokec4 matchScore \strokec5 >=\strokec4  minMatchScore\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 sort\strokec5 ((\strokec4 a\strokec5 ,\strokec4  b\strokec5 )\strokec4  \strokec5 =>\strokec4  a\strokec5 .\strokec4 occurred_at \strokec5 -\strokec4  b\strokec5 .\strokec4 occurred_at\strokec5 );\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  calculateMatchScore\strokec5 (\strokec4 touchpoint\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  conversion\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 number\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 let\cf4 \strokec4  score \strokec5 =\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf9 \strokec9 // 1. Keyword overlap (30%)\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  keywordOverlap \strokec5 =\strokec4  calculateArrayOverlap\strokec5 (\cb1 \strokec4 \
\cb3     touchpoint\strokec5 .\strokec4 topic_tags \strokec5 ||\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3     conversion\strokec5 .\strokec4 mentioned_keywords \strokec5 ||\strokec4  \strokec5 []\cb1 \strokec4 \
\cb3   \strokec5 );\cb1 \strokec4 \
\cb3   score \strokec5 +=\strokec4  keywordOverlap \strokec5 *\strokec4  \cf8 \strokec8 0.30\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf9 \strokec9 // 2. Feature overlap (25%)\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  featureOverlap \strokec5 =\strokec4  calculateArrayOverlap\strokec5 (\cb1 \strokec4 \
\cb3     touchpoint\strokec5 .\strokec4 mentioned_features \strokec5 ||\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3     conversion\strokec5 .\strokec4 features_interested \strokec5 ||\strokec4  \strokec5 []\cb1 \strokec4 \
\cb3   \strokec5 );\cb1 \strokec4 \
\cb3   score \strokec5 +=\strokec4  featureOverlap \strokec5 *\strokec4  \cf8 \strokec8 0.25\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf9 \strokec9 // 3. Pain point overlap (20%)\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  painPointOverlap \strokec5 =\strokec4  calculateArrayOverlap\strokec5 (\cb1 \strokec4 \
\cb3     touchpoint\strokec5 .\strokec4 pain_points_discussed \strokec5 ||\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3     conversion\strokec5 .\strokec4 pain_points_discussed \strokec5 ||\strokec4  \strokec5 []\cb1 \strokec4 \
\cb3   \strokec5 );\cb1 \strokec4 \
\cb3   score \strokec5 +=\strokec4  painPointOverlap \strokec5 *\strokec4  \cf8 \strokec8 0.20\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf9 \strokec9 // 4. Time proximity (15%) - closer to conversion = higher score\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  daysDiff \strokec5 =\strokec4  \strokec5 (\cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\strokec4 conversion\strokec5 .\strokec4 converted_at\strokec5 ).\strokec4 getTime\strokec5 ()\strokec4  \strokec5 -\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\strokec4 touchpoint\strokec5 .\strokec4 occurred_at\strokec5 ).\strokec4 getTime\strokec5 ())\strokec4  \strokec5 /\strokec4  \strokec5 (\cf8 \strokec8 24\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 1000\cf4 \strokec5 );\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  timeScore \strokec5 =\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 max\strokec5 (\cf8 \strokec8 0\cf4 \strokec5 ,\strokec4  \cf8 \strokec8 1\cf4 \strokec4  \strokec5 -\strokec4  \strokec5 (\strokec4 daysDiff \strokec5 /\strokec4  \cf8 \strokec8 90\cf4 \strokec5 ));\cb1 \strokec4 \
\cb3   score \strokec5 +=\strokec4  timeScore \strokec5 *\strokec4  \cf8 \strokec8 0.15\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf9 \strokec9 // 5. Channel credibility (10%)\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  channelScore \strokec5 =\strokec4  getChannelCredibility\strokec5 (\strokec4 touchpoint\strokec5 .\strokec4 channel\strokec5 );\cb1 \strokec4 \
\cb3   score \strokec5 +=\strokec4  channelScore \strokec5 *\strokec4  \cf8 \strokec8 0.10\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 min\strokec5 (\cf8 \strokec8 1\cf4 \strokec5 ,\strokec4  score\strokec5 );\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  calculateArrayOverlap\strokec5 (\strokec4 arr1\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 [],\strokec4  arr2\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 []):\strokec4  \cf2 \strokec2 number\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 arr1 \strokec5 ||\strokec4  \strokec5 !\strokec4 arr2 \strokec5 ||\strokec4  arr1\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec4  \strokec5 ||\strokec4  arr2\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  set1 \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Set\cf4 \strokec5 (\strokec4 arr1\strokec5 .\strokec4 map\strokec5 (\strokec4 s \strokec5 =>\strokec4  s\strokec5 .\strokec4 toLowerCase\strokec5 ()));\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  set2 \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Set\cf4 \strokec5 (\strokec4 arr2\strokec5 .\strokec4 map\strokec5 (\strokec4 s \strokec5 =>\strokec4  s\strokec5 .\strokec4 toLowerCase\strokec5 ()));\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  intersection \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Set\cf4 \strokec5 ([...\strokec4 set1\strokec5 ].\strokec4 filter\strokec5 (\strokec4 x \strokec5 =>\strokec4  set2\strokec5 .\strokec4 has\strokec5 (\strokec4 x\strokec5 )));\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  intersection\strokec5 .\strokec4 size \strokec5 /\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 min\strokec5 (\strokec4 set1\strokec5 .\strokec4 size\strokec5 ,\strokec4  set2\strokec5 .\strokec4 size\strokec5 );\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  getChannelCredibility\strokec5 (\strokec4 channel\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 number\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  credibility\strokec5 :\strokec4  \cf7 \strokec7 Record\cf4 \strokec5 <\cf2 \strokec2 string\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 number\cf4 \strokec5 >\strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'chatgpt'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 0.95\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'claude'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 0.92\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'perplexity'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 0.90\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'gemini'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 0.88\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'reddit'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 0.75\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'discord'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 0.70\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'tiktok'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 0.65\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'twitter'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 0.80\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'linkedin'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 0.85\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'podcast'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 0.90\cf4 \cb1 \strokec4 \
\cb3   \strokec5 \};\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  credibility\strokec5 [\strokec4 channel\strokec5 .\strokec4 toLowerCase\strokec5 ()]\strokec4  \strokec5 ||\strokec4  \cf8 \strokec8 0.50\cf4 \strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  calculateAttributionWeights\strokec5 (\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   touchpoints\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 [],\cb1 \strokec4 \
\cb3   conversion\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3   model\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 ):\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 switch\cf4 \strokec4  \strokec5 (\strokec4 model\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 case\cf4 \strokec4  \cf6 \strokec6 'first_touch'\cf4 \strokec5 :\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  firstTouchAttribution\strokec5 (\strokec4 touchpoints\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 case\cf4 \strokec4  \cf6 \strokec6 'last_touch'\cf4 \strokec5 :\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  lastTouchAttribution\strokec5 (\strokec4 touchpoints\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 case\cf4 \strokec4  \cf6 \strokec6 'linear'\cf4 \strokec5 :\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  linearAttribution\strokec5 (\strokec4 touchpoints\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 case\cf4 \strokec4  \cf6 \strokec6 'time_decay'\cf4 \strokec5 :\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  timeDecayAttribution\strokec5 (\strokec4 touchpoints\strokec5 ,\strokec4  conversion\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 case\cf4 \strokec4  \cf6 \strokec6 'position_based'\cf4 \strokec5 :\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  positionBasedAttribution\strokec5 (\strokec4 touchpoints\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 default\cf4 \strokec5 :\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  timeDecayAttribution\strokec5 (\strokec4 touchpoints\strokec5 ,\strokec4  conversion\strokec5 );\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  firstTouchAttribution\strokec5 (\strokec4 touchpoints\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []):\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 return\cf4 \strokec4  touchpoints\strokec5 .\strokec4 map\strokec5 ((\strokec4 tp\strokec5 ,\strokec4  i\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3     \strokec5 ...\strokec4 tp\strokec5 ,\cb1 \strokec4 \
\cb3     weight\strokec5 :\strokec4  i \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec4  \strokec5 ?\strokec4  \cf8 \strokec8 1.0\cf4 \strokec4  \strokec5 :\strokec4  \cf8 \strokec8 0\cf4 \cb1 \strokec4 \
\cb3   \strokec5 \}));\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  lastTouchAttribution\strokec5 (\strokec4 touchpoints\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []):\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  lastIndex \strokec5 =\strokec4  touchpoints\strokec5 .\strokec4 length \strokec5 -\strokec4  \cf8 \strokec8 1\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  touchpoints\strokec5 .\strokec4 map\strokec5 ((\strokec4 tp\strokec5 ,\strokec4  i\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3     \strokec5 ...\strokec4 tp\strokec5 ,\cb1 \strokec4 \
\cb3     weight\strokec5 :\strokec4  i \strokec5 ===\strokec4  lastIndex \strokec5 ?\strokec4  \cf8 \strokec8 1.0\cf4 \strokec4  \strokec5 :\strokec4  \cf8 \strokec8 0\cf4 \cb1 \strokec4 \
\cb3   \strokec5 \}));\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  linearAttribution\strokec5 (\strokec4 touchpoints\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []):\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  weight \strokec5 =\strokec4  \cf8 \strokec8 1.0\cf4 \strokec4  \strokec5 /\strokec4  touchpoints\strokec5 .\strokec4 length\strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  touchpoints\strokec5 .\strokec4 map\strokec5 (\strokec4 tp \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3     \strokec5 ...\strokec4 tp\strokec5 ,\cb1 \strokec4 \
\cb3     weight\cb1 \
\cb3   \strokec5 \}));\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  timeDecayAttribution\strokec5 (\strokec4 touchpoints\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 [],\strokec4  conversion\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  halfLifeDays \strokec5 =\strokec4  \cf8 \strokec8 7\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  halfLifeMs \strokec5 =\strokec4  halfLifeDays \strokec5 *\strokec4  \cf8 \strokec8 24\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 1000\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  weights \strokec5 =\strokec4  touchpoints\strokec5 .\strokec4 map\strokec5 (\strokec4 tp \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  timeDiff \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\strokec4 conversion\strokec5 .\strokec4 converted_at\strokec5 ).\strokec4 getTime\strokec5 ()\strokec4  \strokec5 -\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\strokec4 tp\strokec5 .\strokec4 occurred_at\strokec5 ).\strokec4 getTime\strokec5 ();\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 exp\strokec5 (-\strokec4 timeDiff \strokec5 /\strokec4  halfLifeMs\strokec5 );\cb1 \strokec4 \
\cb3   \strokec5 \});\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  totalWeight \strokec5 =\strokec4  weights\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  w\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  w\strokec5 ,\strokec4  \cf8 \strokec8 0\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  touchpoints\strokec5 .\strokec4 map\strokec5 ((\strokec4 tp\strokec5 ,\strokec4  i\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3     \strokec5 ...\strokec4 tp\strokec5 ,\cb1 \strokec4 \
\cb3     weight\strokec5 :\strokec4  weights\strokec5 [\strokec4 i\strokec5 ]\strokec4  \strokec5 /\strokec4  totalWeight\cb1 \
\cb3   \strokec5 \}));\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  positionBasedAttribution\strokec5 (\strokec4 touchpoints\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []):\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 touchpoints\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 1\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \strokec5 [\{\strokec4  \strokec5 ...\strokec4 touchpoints\strokec5 [\cf8 \strokec8 0\cf4 \strokec5 ],\strokec4  weight\strokec5 :\strokec4  \cf8 \strokec8 1.0\cf4 \strokec4  \strokec5 \}];\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 touchpoints\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 2\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  touchpoints\strokec5 .\strokec4 map\strokec5 (\strokec4 tp \strokec5 =>\strokec4  \strokec5 (\{\strokec4  \strokec5 ...\strokec4 tp\strokec5 ,\strokec4  weight\strokec5 :\strokec4  \cf8 \strokec8 0.5\cf4 \strokec4  \strokec5 \}));\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  middleWeight \strokec5 =\strokec4  \cf8 \strokec8 0.20\cf4 \strokec4  \strokec5 /\strokec4  \strokec5 (\strokec4 touchpoints\strokec5 .\strokec4 length \strokec5 -\strokec4  \cf8 \strokec8 2\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  touchpoints\strokec5 .\strokec4 map\strokec5 ((\strokec4 tp\strokec5 ,\strokec4  i\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3     \strokec5 ...\strokec4 tp\strokec5 ,\cb1 \strokec4 \
\cb3     weight\strokec5 :\cb1 \strokec4 \
\cb3       i \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec4  \strokec5 ?\strokec4  \cf8 \strokec8 0.40\cf4 \strokec4  \strokec5 :\cb1 \strokec4 \
\cb3       i \strokec5 ===\strokec4  touchpoints\strokec5 .\strokec4 length \strokec5 -\strokec4  \cf8 \strokec8 1\cf4 \strokec4  \strokec5 ?\strokec4  \cf8 \strokec8 0.40\cf4 \strokec4  \strokec5 :\cb1 \strokec4 \
\cb3       middleWeight\cb1 \
\cb3   \strokec5 \}));\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  calculateChannelAttribution\strokec5 (\strokec4 touchpoints\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 []):\strokec4  \cf7 \strokec7 Record\cf4 \strokec5 <\cf2 \strokec2 string\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 number\cf4 \strokec5 >\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  channelWeights\strokec5 :\strokec4  \cf7 \strokec7 Record\cf4 \strokec5 <\cf2 \strokec2 string\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 number\cf4 \strokec5 >\strokec4  \strokec5 =\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  tp \cf2 \strokec2 of\cf4 \strokec4  touchpoints\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     channelWeights\strokec5 [\strokec4 tp\strokec5 .\strokec4 channel\strokec5 ]\strokec4  \strokec5 =\strokec4  \strokec5 (\strokec4 channelWeights\strokec5 [\strokec4 tp\strokec5 .\strokec4 channel\strokec5 ]\strokec4  \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  tp\strokec5 .\strokec4 weight\strokec5 ;\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  channelWeights\strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  calculateJourneyDuration\strokec5 (\strokec4 touchpoints\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 [],\strokec4  conversion\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 number\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 touchpoints\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  firstTouchpoint \strokec5 =\strokec4  touchpoints\strokec5 [\cf8 \strokec8 0\cf4 \strokec5 ].\strokec4 occurred_at\strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  convertedAt \strokec5 =\strokec4  conversion\strokec5 .\strokec4 converted_at\strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  durationMs \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\strokec4 convertedAt\strokec5 ).\strokec4 getTime\strokec5 ()\strokec4  \strokec5 -\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\strokec4 firstTouchpoint\strokec5 ).\strokec4 getTime\strokec5 ();\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 floor\strokec5 (\strokec4 durationMs \strokec5 /\strokec4  \strokec5 (\cf8 \strokec8 24\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 1000\cf4 \strokec5 ));\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  calculateMatchConfidence\strokec5 (\strokec4 touchpoints\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 [],\strokec4  conversion\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 number\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 touchpoints\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  avgMatchScore \strokec5 =\strokec4  touchpoints\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  tp\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  \strokec5 (\strokec4 tp\strokec5 .\strokec4 matchScore \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ),\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  touchpoints\strokec5 .\strokec4 length\strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  touchpointQuality \strokec5 =\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 min\strokec5 (\cf8 \strokec8 1\cf4 \strokec5 ,\strokec4  touchpoints\strokec5 .\strokec4 length \strokec5 /\strokec4  \cf8 \strokec8 5\cf4 \strokec5 );\strokec4  \cf9 \strokec9 // More touchpoints = higher confidence\cf4 \cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 (\strokec4 avgMatchScore \strokec5 *\strokec4  \cf8 \strokec8 0.7\cf4 \strokec4  \strokec5 +\strokec4  touchpointQuality \strokec5 *\strokec4  \cf8 \strokec8 0.3\cf4 \strokec5 );\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
}