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
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2.39.3'\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 /**\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Insight Approval Workflow API\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Allows reviewing, approving, or rejecting AI-generated insights\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  */\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \cb3 \strokec2 async\cf4 \cb3 \strokec4  \strokec5 (\strokec4 req\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  corsHeaders \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'Access-Control-Allow-Headers'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'authorization, x-client-info, apikey, content-type'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'Access-Control-Allow-Methods'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'POST, PATCH, OPTIONS'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'OPTIONS'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf6 \strokec6 'ok'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  corsHeaders \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 try\cf4 \cb3 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  supabaseClient \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec5 (\cf6 \strokec6 'SUPABASE_ANON_KEY'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  \cf2 \cb3 \strokec2 global\cf4 \cb3 \strokec5 :\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf8 \strokec8 Authorization\cf4 \strokec5 :\strokec4  req\strokec5 .\strokec4 headers\strokec5 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec5 (\cf6 \strokec6 'Authorization'\cf4 \strokec5 )!\strokec4  \strokec5 \}\strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  url \strokec5 =\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 URL\cf4 \strokec5 (\strokec4 req\strokec5 .\strokec4 url\strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  pathParts \strokec5 =\strokec4  url\strokec5 .\strokec4 pathname\strokec5 .\strokec4 split\strokec5 (\cf6 \strokec6 '/'\cf4 \strokec5 ).\strokec4 filter\strokec5 (\cf8 \strokec8 Boolean\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf7 \cb3 \strokec7 // POST /insights/:id/approve\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'insights'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 2\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'approve'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  insightId \strokec5 =\strokec4  pathParts\strokec5 [\cf9 \strokec9 1\cf4 \strokec5 ]\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  payload \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  req\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 ,\strokec4  error \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_insights'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'approved'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           reviewed_by\strokec5 :\strokec4  payload\strokec5 .\strokec4 reviewed_by\strokec5 ,\cb1 \strokec4 \
\cb3           reviewed_at\strokec5 :\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 (),\cb1 \strokec4 \
\cb3           review_notes\strokec5 :\strokec4  payload\strokec5 .\strokec4 notes\strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  insightId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3           \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3           \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 400\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3         \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf7 \cb3 \strokec7 // Auto-generate tasks from approved insight if requested\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 payload\strokec5 .\strokec4 auto_generate_tasks\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  tasks \strokec5 =\strokec4  generateTasksFromInsight\strokec5 (\strokec4 data\strokec5 )\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 for\cf4 \cb3 \strokec4  \strokec5 (\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  task \cf2 \cb3 \strokec2 of\cf4 \cb3 \strokec4  tasks\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabaseClient\strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_tasks'\cf4 \strokec5 ).\strokec4 insert\strokec5 (\{\cb1 \strokec4 \
\cb3             brand_id\strokec5 :\strokec4  data\strokec5 .\strokec4 brand_id\strokec5 ,\cb1 \strokec4 \
\cb3             run_id\strokec5 :\strokec4  data\strokec5 .\strokec4 run_id\strokec5 ,\cb1 \strokec4 \
\cb3             insight_id\strokec5 :\strokec4  data\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3             \strokec5 ...\strokec4 task\strokec5 ,\cb1 \strokec4 \
\cb3           \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  success\strokec5 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec5 ,\strokec4  insight\strokec5 :\strokec4  data \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf7 \cb3 \strokec7 // POST /insights/:id/reject\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'insights'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 2\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'reject'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  insightId \strokec5 =\strokec4  pathParts\strokec5 [\cf9 \strokec9 1\cf4 \strokec5 ]\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  payload \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  req\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (!\strokec4 payload\strokec5 .\strokec4 reason\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3           \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Rejection reason required'\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3           \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 400\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3         \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 ,\strokec4  error \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_insights'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'rejected'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           reviewed_by\strokec5 :\strokec4  payload\strokec5 .\strokec4 reviewed_by\strokec5 ,\cb1 \strokec4 \
\cb3           reviewed_at\strokec5 :\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 (),\cb1 \strokec4 \
\cb3           review_notes\strokec5 :\strokec4  payload\strokec5 .\strokec4 reason\strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  insightId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3           \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3           \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 400\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3         \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  success\strokec5 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec5 ,\strokec4  insight\strokec5 :\strokec4  data \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf7 \cb3 \strokec7 // POST /insights/:id/edit\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'insights'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 2\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'edit'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  insightId \strokec5 =\strokec4  pathParts\strokec5 [\cf9 \strokec9 1\cf4 \strokec5 ]\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  payload \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  req\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  updates\strokec5 :\strokec4  \cf2 \cb3 \strokec2 any\cf4 \cb3 \strokec4  \strokec5 =\strokec4  \strokec5 \{\}\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 payload\strokec5 .\strokec4 title\strokec5 )\strokec4  updates\strokec5 .\strokec4 title \strokec5 =\strokec4  payload\strokec5 .\strokec4 title\cb1 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 payload\strokec5 .\strokec4 summary\strokec5 )\strokec4  updates\strokec5 .\strokec4 summary \strokec5 =\strokec4  payload\strokec5 .\strokec4 summary\cb1 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 payload\strokec5 .\strokec4 insight_body\strokec5 )\strokec4  updates\strokec5 .\strokec4 insight_body \strokec5 =\strokec4  payload\strokec5 .\strokec4 insight_body\cb1 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 payload\strokec5 .\strokec4 severity\strokec5 )\strokec4  updates\strokec5 .\strokec4 severity \strokec5 =\strokec4  payload\strokec5 .\strokec4 severity\cb1 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 payload\strokec5 .\strokec4 pillar\strokec5 )\strokec4  updates\strokec5 .\strokec4 pillar \strokec5 =\strokec4  payload\strokec5 .\strokec4 pillar\cb1 \
\
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 ,\strokec4  error \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_insights'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3           \strokec5 ...\strokec4 updates\strokec5 ,\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'edited'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           reviewed_by\strokec5 :\strokec4  payload\strokec5 .\strokec4 reviewed_by\strokec5 ,\cb1 \strokec4 \
\cb3           reviewed_at\strokec5 :\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 (),\cb1 \strokec4 \
\cb3           review_notes\strokec5 :\strokec4  \cf6 \strokec6 'Manual edits applied'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  insightId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3           \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3           \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 400\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3         \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  success\strokec5 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec5 ,\strokec4  insight\strokec5 :\strokec4  data \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf7 \cb3 \strokec7 // GET /insights/pending-review\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'GET'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'insights'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 1\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'pending-review'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  brandId \strokec5 =\strokec4  url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (!\strokec4 brandId\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3           \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'brand_id required'\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3           \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 400\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3         \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 ,\strokec4  error \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_insights'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'status'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'draft'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'confidence'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \cb3 \strokec2 false\cf4 \cb3 \strokec4  \strokec5 \})\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3           \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3           \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 400\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3         \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  insights\strokec5 :\strokec4  data\strokec5 ,\strokec4  count\strokec5 :\strokec4  data\strokec5 ?.\strokec4 length \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Not found'\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 404\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 catch\cf4 \cb3 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 // Helper: Generate tasks from approved insight\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \cb3 \strokec4  generateTasksFromInsight\strokec5 (\strokec4 insight\strokec5 :\strokec4  \cf2 \cb3 \strokec2 any\cf4 \cb3 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  tasks \strokec5 =\strokec4  \strokec5 []\cb1 \strokec4 \
\
\cb3   \cf7 \cb3 \strokec7 // High/Critical insights get immediate action tasks\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 insight\strokec5 .\strokec4 severity \strokec5 ===\strokec4  \cf6 \strokec6 'critical'\cf4 \strokec4  \strokec5 ||\strokec4  insight\strokec5 .\strokec4 severity \strokec5 ===\strokec4  \cf6 \strokec6 'high'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     tasks\strokec5 .\strokec4 push\strokec5 (\{\cb1 \strokec4 \
\cb3       title\strokec5 :\strokec4  \cf6 \strokec6 `Address: \cf4 \strokec5 $\{\strokec4 insight\strokec5 .\strokec4 title\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       description\strokec5 :\strokec4  \cf6 \strokec6 `Immediate action required based on insight analysis.\\n\\n\cf4 \strokec5 $\{\strokec4 insight\strokec5 .\strokec4 summary\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       task_type\strokec5 :\strokec4  \cf6 \strokec6 'urgent_action'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       priority\strokec5 :\strokec4  insight\strokec5 .\strokec4 severity \strokec5 ===\strokec4  \cf6 \strokec6 'critical'\cf4 \strokec4  \strokec5 ?\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 :\strokec4  \cf9 \strokec9 25\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       status\strokec5 :\strokec4  \cf6 \strokec6 'todo'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       estimated_effort\strokec5 :\strokec4  \cf6 \strokec6 'high'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf7 \cb3 \strokec7 // All insights get a review task\cf4 \cb1 \strokec4 \
\cb3   tasks\strokec5 .\strokec4 push\strokec5 (\{\cb1 \strokec4 \
\cb3     title\strokec5 :\strokec4  \cf6 \strokec6 `Review: \cf4 \strokec5 $\{\strokec4 insight\strokec5 .\strokec4 pillar\strokec5 \}\cf6 \strokec6  optimization`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     description\strokec5 :\strokec4  \cf6 \strokec6 `Review and implement recommendations from insight analysis.`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     task_type\strokec5 :\strokec4  \cf6 \strokec6 'optimization'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     priority\strokec5 :\strokec4  insight\strokec5 .\strokec4 severity \strokec5 ===\strokec4  \cf6 \strokec6 'critical'\cf4 \strokec4  \strokec5 ?\strokec4  \cf9 \strokec9 25\cf4 \strokec4  \strokec5 :\strokec4  \cf9 \strokec9 50\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     status\strokec5 :\strokec4  \cf6 \strokec6 'todo'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     estimated_effort\strokec5 :\strokec4  \cf6 \strokec6 'medium'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3   \strokec5 \})\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  tasks\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
}