{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;\red19\green118\blue70;\red83\green83\blue83;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;\cssrgb\c40000\c40000\c40000;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \strokec4  \strokec6 \{\strokec4  createClient \strokec6 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf5 \strokec5 'jsr:@supabase/supabase-js@2'\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 SUPABASE_URL\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'SUPABASE_URL'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec6 )!;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 (\cf2 \strokec2 async\cf4 \strokec4  \strokec6 (\strokec4 req\strokec6 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 req\strokec6 .\strokec4 method \strokec6 ===\strokec4  \cf5 \strokec5 'OPTIONS'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf2 \strokec2 null\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  \cb1 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cb1 \
\cb3         \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec6 ,\strokec4  \cb1 \
\cb3         \cf5 \strokec5 'Access-Control-Allow-Methods'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'GET, POST'\cf4 \strokec6 ,\strokec4  \cb1 \
\cb3         \cf5 \strokec5 'Access-Control-Allow-Headers'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'authorization, x-client-info, apikey, content-type'\cf4 \strokec4  \cb1 \
\cb3       \strokec6 \}\strokec4  \cb1 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabase \strokec6 =\strokec4  createClient\strokec6 (\cf7 \strokec7 SUPABASE_URL\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  url \strokec6 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 URL\cf4 \strokec6 (\strokec4 req\strokec6 .\strokec4 url\strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  brand_id \strokec6 =\strokec4  url\strokec6 .\strokec4 searchParams\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'brand_id'\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (!\strokec4 brand_id\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3         \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  error\strokec6 :\strokec4  \cf5 \strokec5 'brand_id required'\cf4 \strokec4  \strokec6 \}),\cb1 \strokec4 \
\cb3         \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf8 \strokec8 400\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 );\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Get quota status\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  quotaData\strokec6 ,\strokec4  error\strokec6 :\strokec4  quotaError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\strokec4 rpc\strokec6 (\cf5 \strokec5 'get_quota_status'\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  p_brand_id\strokec6 :\strokec4  brand_id \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 quotaError\strokec6 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  quotaError\strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Get content summary\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  contentData\strokec6 ,\strokec4  error\strokec6 :\strokec4  contentError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf2 \strokec2 from\cf4 \strokec6 (\cf5 \strokec5 'v_content_assets_summary'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 (\cf5 \strokec5 '*'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf5 \strokec5 'brand_id'\cf4 \strokec6 ,\strokec4  brand_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 order\strokec6 (\cf5 \strokec5 'created_at'\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  ascending\strokec6 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 limit\strokec6 (\cf8 \strokec8 20\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 contentError\strokec6 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  contentError\strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Get this month's stats\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  statsData \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf2 \strokec2 from\cf4 \strokec6 (\cf5 \strokec5 'gv_content_assets'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 (\cf5 \strokec5 'content_type, status, created_at'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf5 \strokec5 'brand_id'\cf4 \strokec6 ,\strokec4  brand_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 gte\strokec6 (\cf5 \strokec5 'created_at'\cf4 \strokec6 ,\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec6 (\cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec6 ().\strokec4 getFullYear\strokec6 (),\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec6 ().\strokec4 getMonth\strokec6 (),\strokec4  \cf8 \strokec8 1\cf4 \strokec6 ).\strokec4 toISOString\strokec6 ());\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  stats \strokec6 =\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       total_this_month\strokec6 :\strokec4  statsData\strokec6 ?.\strokec4 length \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       by_type\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         articles\strokec6 :\strokec4  statsData\strokec6 ?.\strokec4 filter\strokec6 (\strokec4 s \strokec6 =>\strokec4  s\strokec6 .\strokec4 content_type \strokec6 ===\strokec4  \cf5 \strokec5 'article'\cf4 \strokec6 ).\strokec4 length \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         images\strokec6 :\strokec4  statsData\strokec6 ?.\strokec4 filter\strokec6 (\strokec4 s \strokec6 =>\strokec4  s\strokec6 .\strokec4 content_type \strokec6 ===\strokec4  \cf5 \strokec5 'image'\cf4 \strokec6 ).\strokec4 length \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         videos\strokec6 :\strokec4  statsData\strokec6 ?.\strokec4 filter\strokec6 (\strokec4 s \strokec6 =>\strokec4  s\strokec6 .\strokec4 content_type \strokec6 ===\strokec4  \cf5 \strokec5 'video'\cf4 \strokec6 ).\strokec4 length \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \},\cb1 \strokec4 \
\cb3       by_status\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         draft\strokec6 :\strokec4  statsData\strokec6 ?.\strokec4 filter\strokec6 (\strokec4 s \strokec6 =>\strokec4  s\strokec6 .\strokec4 status \strokec6 ===\strokec4  \cf5 \strokec5 'draft'\cf4 \strokec6 ).\strokec4 length \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         ready\strokec6 :\strokec4  statsData\strokec6 ?.\strokec4 filter\strokec6 (\strokec4 s \strokec6 =>\strokec4  s\strokec6 .\strokec4 status \strokec6 ===\strokec4  \cf5 \strokec5 'ready'\cf4 \strokec6 ).\strokec4 length \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         published\strokec6 :\strokec4  statsData\strokec6 ?.\strokec4 filter\strokec6 (\strokec4 s \strokec6 =>\strokec4  s\strokec6 .\strokec4 status \strokec6 ===\strokec4  \cf5 \strokec5 'published'\cf4 \strokec6 ).\strokec4 length \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \};\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Get recent jobs\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  jobsData \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf2 \strokec2 from\cf4 \strokec6 (\cf5 \strokec5 'gv_content_jobs'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 (\cf5 \strokec5 '*'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf5 \strokec5 'brand_id'\cf4 \strokec6 ,\strokec4  brand_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 order\strokec6 (\cf5 \strokec5 'created_at'\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  ascending\strokec6 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 limit\strokec6 (\cf8 \strokec8 10\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         success\strokec6 :\strokec4  \cf2 \strokec2 true\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         brand_id\strokec6 ,\cb1 \strokec4 \
\cb3         quota\strokec6 :\strokec4  quotaData\strokec6 ,\cb1 \strokec4 \
\cb3         stats\strokec6 ,\cb1 \strokec4 \
\cb3         recent_content\strokec6 :\strokec4  contentData\strokec6 ,\cb1 \strokec4 \
\cb3         recent_jobs\strokec6 :\strokec4  jobsData\cb1 \
\cb3       \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 );\cb1 \strokec4 \
\
\cb3   \strokec6 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 error\strokec6 (\cf5 \strokec5 'Error:'\cf4 \strokec6 ,\strokec4  error\strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  success\strokec6 :\strokec4  \cf2 \strokec2 false\cf4 \strokec6 ,\strokec4  error\strokec6 :\strokec4  error\strokec6 .\strokec4 message \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf8 \strokec8 500\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 );\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
}