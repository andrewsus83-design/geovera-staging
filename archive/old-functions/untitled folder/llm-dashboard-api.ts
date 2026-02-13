{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 HelveticaNeue;\f1\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red18\green18\blue18;\red251\green251\blue251;\red93\green93\blue93;
\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;\red0\green0\blue0;\red144\green1\blue18;
\red14\green110\blue109;\red83\green83\blue83;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c9020\c9020\c9020;\cssrgb\c98824\c98824\c98824;\cssrgb\c43922\c43922\c43922;
\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;
\cssrgb\c0\c50196\c50196;\cssrgb\c40000\c40000\c40000;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs48 \cf2 \cb3 \expnd0\expndtw0\kerning0
learning-note\cb1 \
\pard\pardeftab720\qc\partightenfactor0
{\field{\*\fldinst{HYPERLINK "https://supabase.com/docs/guides/functions"}}{\fldrslt 
\fs24 \cf4 \
}}\pard\pardeftab720\partightenfactor0

\f1\fs26 \cf5 \cb6 \outl0\strokewidth0 \strokec5 import\cf7 \cb6 \strokec7  \strokec8 \{\strokec7  serve \strokec8 \}\strokec7  \cf5 \cb6 \strokec5 from\cf7 \cb6 \strokec7  \cf9 \strokec9 'https://deno.land/std@0.168.0/http/server.ts'\cf7 \strokec8 ;\cb1 \strokec7 \
\cf5 \cb6 \strokec5 import\cf7 \cb6 \strokec7  \strokec8 \{\strokec7  createClient \strokec8 \}\strokec7  \cf5 \cb6 \strokec5 from\cf7 \cb6 \strokec7  \cf9 \strokec9 'https://esm.sh/@supabase/supabase-js@2'\cf7 \strokec8 ;\cb1 \strokec7 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb6 serve\strokec8 (\cf5 \cb6 \strokec5 async\cf7 \cb6 \strokec7  \strokec8 (\strokec7 req\strokec8 :\strokec7  \cf10 \strokec10 Request\cf7 \strokec8 )\strokec7  \strokec8 =>\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 try\cf7 \cb6 \strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf11 \cb6 \strokec11 // CORS\cf7 \cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 req\strokec8 .\strokec7 method \strokec8 ===\strokec7  \cf9 \strokec9 'OPTIONS'\cf7 \strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf9 \strokec9 'ok'\cf7 \strokec8 ,\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6         headers\strokec8 :\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6           \cf9 \strokec9 'Access-Control-Allow-Origin'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 '*'\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6           \cf9 \strokec9 'Access-Control-Allow-Methods'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'GET, POST, OPTIONS'\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6           \cf9 \strokec9 'Access-Control-Allow-Headers'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'authorization, content-type'\cf7 \cb1 \strokec7 \
\cb6         \strokec8 \}\cb1 \strokec7 \
\cb6       \strokec8 \});\cb1 \strokec7 \
\cb6     \strokec8 \}\cb1 \strokec7 \
\
\cb6     \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  url \strokec8 =\strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 URL\cf7 \strokec8 (\strokec7 req\strokec8 .\strokec7 url\strokec8 );\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  path \strokec8 =\strokec7  url\strokec8 .\strokec7 pathname\strokec8 ;\cb1 \strokec7 \
\
\cb6     \cf11 \cb6 \strokec11 // Auth check\cf7 \cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  authHeader \strokec8 =\strokec7  req\strokec8 .\strokec7 headers\strokec8 .\cf5 \cb6 \strokec5 get\cf7 \cb6 \strokec8 (\cf9 \strokec9 'Authorization'\cf7 \strokec8 );\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (!\strokec7 authHeader\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  \cf9 \strokec9 'Unauthorized'\cf7 \strokec7  \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6         status\strokec8 :\strokec7  \cf12 \strokec12 401\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6         headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6       \strokec8 \});\cb1 \strokec7 \
\cb6     \strokec8 \}\cb1 \strokec7 \
\
\cb6     \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  supabase \strokec8 =\strokec7  createClient\strokec8 (\cb1 \strokec7 \
\cb6       \cf10 \strokec10 Deno\cf7 \strokec8 .\strokec7 env\strokec8 .\cf5 \cb6 \strokec5 get\cf7 \cb6 \strokec8 (\cf9 \strokec9 'SUPABASE_URL'\cf7 \strokec8 )!,\cb1 \strokec7 \
\cb6       \cf10 \strokec10 Deno\cf7 \strokec8 .\strokec7 env\strokec8 .\cf5 \cb6 \strokec5 get\cf7 \cb6 \strokec8 (\cf9 \strokec9 'SUPABASE_SERVICE_ROLE_KEY'\cf7 \strokec8 )!,\cb1 \strokec7 \
\cb6       \strokec8 \{\cb1 \strokec7 \
\cb6         auth\strokec8 :\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6           autoRefreshToken\strokec8 :\strokec7  \cf5 \cb6 \strokec5 false\cf7 \cb6 \strokec8 ,\cb1 \strokec7 \
\cb6           persistSession\strokec8 :\strokec7  \cf5 \cb6 \strokec5 false\cf7 \cb1 \strokec7 \
\cb6         \strokec8 \}\cb1 \strokec7 \
\cb6       \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 );\cb1 \strokec7 \
\
\cb6     \cf11 \cb6 \strokec11 // Route to appropriate handler\cf7 \cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 path\strokec8 .\strokec7 includes\strokec8 (\cf9 \strokec9 '/rankings'\cf7 \strokec8 ))\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 await\cf7 \cb6 \strokec7  handleGetRankings\strokec8 (\strokec7 req\strokec8 ,\strokec7  supabase\strokec8 );\cb1 \strokec7 \
\cb6     \strokec8 \}\strokec7  \cf5 \cb6 \strokec5 else\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 path\strokec8 .\strokec7 includes\strokec8 (\cf9 \strokec9 '/trends'\cf7 \strokec8 ))\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 await\cf7 \cb6 \strokec7  handleGetTrends\strokec8 (\strokec7 req\strokec8 ,\strokec7  supabase\strokec8 );\cb1 \strokec7 \
\cb6     \strokec8 \}\strokec7  \cf5 \cb6 \strokec5 else\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 path\strokec8 .\strokec7 includes\strokec8 (\cf9 \strokec9 '/questions'\cf7 \strokec8 ))\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 await\cf7 \cb6 \strokec7  handleGetQuestions\strokec8 (\strokec7 req\strokec8 ,\strokec7  supabase\strokec8 );\cb1 \strokec7 \
\cb6     \strokec8 \}\strokec7  \cf5 \cb6 \strokec5 else\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 path\strokec8 .\strokec7 includes\strokec8 (\cf9 \strokec9 '/responses'\cf7 \strokec8 ))\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 await\cf7 \cb6 \strokec7  handleGetResponses\strokec8 (\strokec7 req\strokec8 ,\strokec7  supabase\strokec8 );\cb1 \strokec7 \
\cb6     \strokec8 \}\strokec7  \cf5 \cb6 \strokec5 else\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 path\strokec8 .\strokec7 includes\strokec8 (\cf9 \strokec9 '/test-status'\cf7 \strokec8 ))\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 await\cf7 \cb6 \strokec7  handleGetTestStatus\strokec8 (\strokec7 req\strokec8 ,\strokec7  supabase\strokec8 );\cb1 \strokec7 \
\cb6     \strokec8 \}\cb1 \strokec7 \
\
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  \cf9 \strokec9 'Not Found'\cf7 \strokec7  \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 404\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\
\cb6   \strokec8 \}\strokec7  \cf5 \cb6 \strokec5 catch\cf7 \cb6 \strokec7  \strokec8 (\strokec7 error\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     console\strokec8 .\strokec7 error\strokec8 (\cf9 \strokec9 'API error:'\cf7 \strokec8 ,\strokec7  error\strokec8 );\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  error\strokec8 .\strokec7 message \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 500\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec8 ,\strokec7  \cf9 \strokec9 'Access-Control-Allow-Origin'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 '*'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6 \strokec8 \});\cb1 \strokec7 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb6 \strokec5 async\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 function\cf7 \cb6 \strokec7  handleGetRankings\strokec8 (\strokec7 req\strokec8 :\strokec7  \cf10 \strokec10 Request\cf7 \strokec8 ,\strokec7  supabase\strokec8 :\strokec7  \cf5 \cb6 \strokec5 any\cf7 \cb6 \strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  url \strokec8 =\strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 URL\cf7 \strokec8 (\strokec7 req\strokec8 .\strokec7 url\strokec8 );\cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  brandId \strokec8 =\strokec7  url\strokec8 .\strokec7 searchParams\strokec8 .\cf5 \cb6 \strokec5 get\cf7 \cb6 \strokec8 (\cf9 \strokec9 'brand_id'\cf7 \strokec8 );\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (!\strokec7 brandId\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  \cf9 \strokec9 'brand_id required'\cf7 \strokec7  \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 400\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf11 \cb6 \strokec11 // Get latest rankings for each LLM\cf7 \cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  \strokec8 \{\strokec7  data\strokec8 ,\strokec7  error \strokec8 \}\strokec7  \strokec8 =\strokec7  \cf5 \cb6 \strokec5 await\cf7 \cb6 \strokec7  supabase\cb1 \
\cb6     \strokec8 .\cf5 \cb6 \strokec5 from\cf7 \cb6 \strokec8 (\cf9 \strokec9 'gv_geo_rankings'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 select\strokec8 (\cf9 \strokec9 '*'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 eq\strokec8 (\cf9 \strokec9 'brand_id'\cf7 \strokec8 ,\strokec7  brandId\strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 eq\strokec8 (\cf9 \strokec9 'test_status'\cf7 \strokec8 ,\strokec7  \cf9 \strokec9 'completed'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 order\strokec8 (\cf9 \strokec9 'test_date'\cf7 \strokec8 ,\strokec7  \strokec8 \{\strokec7  ascending\strokec8 :\strokec7  \cf5 \cb6 \strokec5 false\cf7 \cb6 \strokec7  \strokec8 \})\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 limit\strokec8 (\cf12 \strokec12 10\cf7 \strokec8 );\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 error\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  error\strokec8 .\strokec7 message \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 500\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf11 \cb6 \strokec11 // Group by platform, get latest for each\cf7 \cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  latestByPlatform\strokec8 :\strokec7  \cf10 \strokec10 Record\cf7 \strokec8 <\cf5 \cb6 \strokec5 string\cf7 \cb6 \strokec8 ,\strokec7  \cf5 \cb6 \strokec5 any\cf7 \cb6 \strokec8 >\strokec7  \strokec8 =\strokec7  \strokec8 \{\};\cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 for\cf7 \cb6 \strokec7  \strokec8 (\cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  ranking \cf5 \cb6 \strokec5 of\cf7 \cb6 \strokec7  data \strokec8 ||\strokec7  \strokec8 [])\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (!\strokec7 latestByPlatform\strokec8 [\strokec7 ranking\strokec8 .\strokec7 llm_platform\strokec8 ]\strokec7  \strokec8 ||\strokec7  \cb1 \
\cb6         \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Date\cf7 \strokec8 (\strokec7 ranking\strokec8 .\strokec7 test_date\strokec8 )\strokec7  \strokec8 >\strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Date\cf7 \strokec8 (\strokec7 latestByPlatform\strokec8 [\strokec7 ranking\strokec8 .\strokec7 llm_platform\strokec8 ].\strokec7 test_date\strokec8 ))\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       latestByPlatform\strokec8 [\strokec7 ranking\strokec8 .\strokec7 llm_platform\strokec8 ]\strokec7  \strokec8 =\strokec7  ranking\strokec8 ;\cb1 \strokec7 \
\cb6     \strokec8 \}\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\cb1 \strokec7 \
\cb6     success\strokec8 :\strokec7  \cf5 \cb6 \strokec5 true\cf7 \cb6 \strokec8 ,\cb1 \strokec7 \
\cb6     rankings\strokec8 :\strokec7  \cf10 \strokec10 Object\cf7 \strokec8 .\strokec7 values\strokec8 (\strokec7 latestByPlatform\strokec8 ),\cb1 \strokec7 \
\cb6     last_updated\strokec8 :\strokec7  data \strokec8 &&\strokec7  data\strokec8 .\strokec7 length \strokec8 >\strokec7  \cf12 \strokec12 0\cf7 \strokec7  \strokec8 ?\strokec7  data\strokec8 [\cf12 \strokec12 0\cf7 \strokec8 ].\strokec7 test_date \strokec8 :\strokec7  \cf5 \cb6 \strokec5 null\cf7 \cb1 \strokec7 \
\cb6   \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     status\strokec8 :\strokec7  \cf12 \strokec12 200\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6     headers\strokec8 :\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       \cf9 \strokec9 'Access-Control-Allow-Origin'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 '*'\cf7 \cb1 \strokec7 \
\cb6     \strokec8 \}\cb1 \strokec7 \
\cb6   \strokec8 \});\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6 \strokec8 \}\cb1 \strokec7 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb6 \strokec5 async\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 function\cf7 \cb6 \strokec7  handleGetTrends\strokec8 (\strokec7 req\strokec8 :\strokec7  \cf10 \strokec10 Request\cf7 \strokec8 ,\strokec7  supabase\strokec8 :\strokec7  \cf5 \cb6 \strokec5 any\cf7 \cb6 \strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  url \strokec8 =\strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 URL\cf7 \strokec8 (\strokec7 req\strokec8 .\strokec7 url\strokec8 );\cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  brandId \strokec8 =\strokec7  url\strokec8 .\strokec7 searchParams\strokec8 .\cf5 \cb6 \strokec5 get\cf7 \cb6 \strokec8 (\cf9 \strokec9 'brand_id'\cf7 \strokec8 );\cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  days \strokec8 =\strokec7  parseInt\strokec8 (\strokec7 url\strokec8 .\strokec7 searchParams\strokec8 .\cf5 \cb6 \strokec5 get\cf7 \cb6 \strokec8 (\cf9 \strokec9 'days'\cf7 \strokec8 )\strokec7  \strokec8 ||\strokec7  \cf9 \strokec9 '30'\cf7 \strokec8 );\cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  platform \strokec8 =\strokec7  url\strokec8 .\strokec7 searchParams\strokec8 .\cf5 \cb6 \strokec5 get\cf7 \cb6 \strokec8 (\cf9 \strokec9 'platform'\cf7 \strokec8 )\strokec7  \strokec8 ||\strokec7  \cf9 \strokec9 'all'\cf7 \strokec8 ;\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (!\strokec7 brandId\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  \cf9 \strokec9 'brand_id required'\cf7 \strokec7  \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 400\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  cutoffDate \strokec8 =\strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Date\cf7 \strokec8 ();\cb1 \strokec7 \
\cb6   cutoffDate\strokec8 .\strokec7 setDate\strokec8 (\strokec7 cutoffDate\strokec8 .\strokec7 getDate\strokec8 ()\strokec7  \strokec8 -\strokec7  days\strokec8 );\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 let\cf7 \cb6 \strokec7  query \strokec8 =\strokec7  supabase\cb1 \
\cb6     \strokec8 .\cf5 \cb6 \strokec5 from\cf7 \cb6 \strokec8 (\cf9 \strokec9 'gv_geo_rankings'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 select\strokec8 (\cf9 \strokec9 '*'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 eq\strokec8 (\cf9 \strokec9 'brand_id'\cf7 \strokec8 ,\strokec7  brandId\strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 eq\strokec8 (\cf9 \strokec9 'test_status'\cf7 \strokec8 ,\strokec7  \cf9 \strokec9 'completed'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 gte\strokec8 (\cf9 \strokec9 'test_date'\cf7 \strokec8 ,\strokec7  cutoffDate\strokec8 .\strokec7 toISOString\strokec8 ().\strokec7 split\strokec8 (\cf9 \strokec9 'T'\cf7 \strokec8 )[\cf12 \strokec12 0\cf7 \strokec8 ])\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 order\strokec8 (\cf9 \strokec9 'test_date'\cf7 \strokec8 ,\strokec7  \strokec8 \{\strokec7  ascending\strokec8 :\strokec7  \cf5 \cb6 \strokec5 true\cf7 \cb6 \strokec7  \strokec8 \});\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 platform \strokec8 !==\strokec7  \cf9 \strokec9 'all'\cf7 \strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     query \strokec8 =\strokec7  query\strokec8 .\strokec7 eq\strokec8 (\cf9 \strokec9 'llm_platform'\cf7 \strokec8 ,\strokec7  platform\strokec8 );\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  \strokec8 \{\strokec7  data\strokec8 ,\strokec7  error \strokec8 \}\strokec7  \strokec8 =\strokec7  \cf5 \cb6 \strokec5 await\cf7 \cb6 \strokec7  query\strokec8 ;\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 error\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  error\strokec8 .\strokec7 message \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 500\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf11 \cb6 \strokec11 // Format for charting\cf7 \cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  trendData \strokec8 =\strokec7  \strokec8 (\strokec7 data \strokec8 ||\strokec7  \strokec8 []).\strokec7 map\strokec8 (\strokec7 r \strokec8 =>\strokec7  \strokec8 (\{\cb1 \strokec7 \
\cb6     date\strokec8 :\strokec7  r\strokec8 .\strokec7 test_date\strokec8 ,\cb1 \strokec7 \
\cb6     platform\strokec8 :\strokec7  r\strokec8 .\strokec7 llm_platform\strokec8 ,\cb1 \strokec7 \
\cb6     visibility_score\strokec8 :\strokec7  r\strokec8 .\strokec7 visibility_score\strokec8 ,\cb1 \strokec7 \
\cb6     citation_frequency\strokec8 :\strokec7  r\strokec8 .\strokec7 citation_frequency\strokec8 ,\cb1 \strokec7 \
\cb6     recommendation_pct\strokec8 :\strokec7  r\strokec8 .\strokec7 recommendation_pct\strokec8 ,\cb1 \strokec7 \
\cb6     avg_sentiment\strokec8 :\strokec7  r\strokec8 .\strokec7 avg_sentiment\cb1 \
\cb6   \strokec8 \}));\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\cb1 \strokec7 \
\cb6     success\strokec8 :\strokec7  \cf5 \cb6 \strokec5 true\cf7 \cb6 \strokec8 ,\cb1 \strokec7 \
\cb6     trends\strokec8 :\strokec7  trendData\strokec8 ,\cb1 \strokec7 \
\cb6     period_days\strokec8 :\strokec7  days\cb1 \
\cb6   \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     status\strokec8 :\strokec7  \cf12 \strokec12 200\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6     headers\strokec8 :\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       \cf9 \strokec9 'Access-Control-Allow-Origin'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 '*'\cf7 \cb1 \strokec7 \
\cb6     \strokec8 \}\cb1 \strokec7 \
\cb6   \strokec8 \});\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6 \strokec8 \}\cb1 \strokec7 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb6 \strokec5 async\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 function\cf7 \cb6 \strokec7  handleGetQuestions\strokec8 (\strokec7 req\strokec8 :\strokec7  \cf10 \strokec10 Request\cf7 \strokec8 ,\strokec7  supabase\strokec8 :\strokec7  \cf5 \cb6 \strokec5 any\cf7 \cb6 \strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  url \strokec8 =\strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 URL\cf7 \strokec8 (\strokec7 req\strokec8 .\strokec7 url\strokec8 );\cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  brandId \strokec8 =\strokec7  url\strokec8 .\strokec7 searchParams\strokec8 .\cf5 \cb6 \strokec5 get\cf7 \cb6 \strokec8 (\cf9 \strokec9 'brand_id'\cf7 \strokec8 );\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (!\strokec7 brandId\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  \cf9 \strokec9 'brand_id required'\cf7 \strokec7  \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 400\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  \strokec8 \{\strokec7  data\strokec8 ,\strokec7  error \strokec8 \}\strokec7  \strokec8 =\strokec7  \cf5 \cb6 \strokec5 await\cf7 \cb6 \strokec7  supabase\cb1 \
\cb6     \strokec8 .\cf5 \cb6 \strokec5 from\cf7 \cb6 \strokec8 (\cf9 \strokec9 'gv_llm_test_questions'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 select\strokec8 (\cf9 \strokec9 '*'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 eq\strokec8 (\cf9 \strokec9 'brand_id'\cf7 \strokec8 ,\strokec7  brandId\strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 eq\strokec8 (\cf9 \strokec9 'is_active'\cf7 \strokec8 ,\strokec7  \cf5 \cb6 \strokec5 true\cf7 \cb6 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 order\strokec8 (\cf9 \strokec9 'created_at'\cf7 \strokec8 ,\strokec7  \strokec8 \{\strokec7  ascending\strokec8 :\strokec7  \cf5 \cb6 \strokec5 false\cf7 \cb6 \strokec7  \strokec8 \})\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 limit\strokec8 (\cf12 \strokec12 300\cf7 \strokec8 );\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 error\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  error\strokec8 .\strokec7 message \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 500\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\cb1 \strokec7 \
\cb6     success\strokec8 :\strokec7  \cf5 \cb6 \strokec5 true\cf7 \cb6 \strokec8 ,\cb1 \strokec7 \
\cb6     questions\strokec8 :\strokec7  data \strokec8 ||\strokec7  \strokec8 [],\cb1 \strokec7 \
\cb6     count\strokec8 :\strokec7  data\strokec8 ?.\strokec7 length \strokec8 ||\strokec7  \cf12 \strokec12 0\cf7 \cb1 \strokec7 \
\cb6   \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     status\strokec8 :\strokec7  \cf12 \strokec12 200\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6     headers\strokec8 :\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       \cf9 \strokec9 'Access-Control-Allow-Origin'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 '*'\cf7 \cb1 \strokec7 \
\cb6     \strokec8 \}\cb1 \strokec7 \
\cb6   \strokec8 \});\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6 \strokec8 \}\cb1 \strokec7 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb6 \strokec5 async\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 function\cf7 \cb6 \strokec7  handleGetResponses\strokec8 (\strokec7 req\strokec8 :\strokec7  \cf10 \strokec10 Request\cf7 \strokec8 ,\strokec7  supabase\strokec8 :\strokec7  \cf5 \cb6 \strokec5 any\cf7 \cb6 \strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  url \strokec8 =\strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 URL\cf7 \strokec8 (\strokec7 req\strokec8 .\strokec7 url\strokec8 );\cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  testId \strokec8 =\strokec7  url\strokec8 .\strokec7 searchParams\strokec8 .\cf5 \cb6 \strokec5 get\cf7 \cb6 \strokec8 (\cf9 \strokec9 'test_id'\cf7 \strokec8 );\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (!\strokec7 testId\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  \cf9 \strokec9 'test_id required'\cf7 \strokec7  \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 400\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  \strokec8 \{\strokec7  data\strokec8 ,\strokec7  error \strokec8 \}\strokec7  \strokec8 =\strokec7  \cf5 \cb6 \strokec5 await\cf7 \cb6 \strokec7  supabase\cb1 \
\cb6     \strokec8 .\cf5 \cb6 \strokec5 from\cf7 \cb6 \strokec8 (\cf9 \strokec9 'gv_llm_responses'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 select\strokec8 (\cf9 \strokec9 `\cf7 \cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf9 \cb6 \strokec9       *,\cf7 \cb1 \strokec7 \
\cf9 \cb6 \strokec9       question:gv_llm_test_questions(question_text, question_type)\cf7 \cb1 \strokec7 \
\cf9 \cb6 \strokec9     `\cf7 \strokec8 )\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6     \strokec8 .\strokec7 eq\strokec8 (\cf9 \strokec9 'test_id'\cf7 \strokec8 ,\strokec7  testId\strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 order\strokec8 (\cf9 \strokec9 'created_at'\cf7 \strokec8 ,\strokec7  \strokec8 \{\strokec7  ascending\strokec8 :\strokec7  \cf5 \cb6 \strokec5 true\cf7 \cb6 \strokec7  \strokec8 \});\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 error\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  error\strokec8 .\strokec7 message \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 500\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\cb1 \strokec7 \
\cb6     success\strokec8 :\strokec7  \cf5 \cb6 \strokec5 true\cf7 \cb6 \strokec8 ,\cb1 \strokec7 \
\cb6     responses\strokec8 :\strokec7  data \strokec8 ||\strokec7  \strokec8 [],\cb1 \strokec7 \
\cb6     count\strokec8 :\strokec7  data\strokec8 ?.\strokec7 length \strokec8 ||\strokec7  \cf12 \strokec12 0\cf7 \cb1 \strokec7 \
\cb6   \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     status\strokec8 :\strokec7  \cf12 \strokec12 200\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6     headers\strokec8 :\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       \cf9 \strokec9 'Access-Control-Allow-Origin'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 '*'\cf7 \cb1 \strokec7 \
\cb6     \strokec8 \}\cb1 \strokec7 \
\cb6   \strokec8 \});\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6 \strokec8 \}\cb1 \strokec7 \
\
\pard\pardeftab720\partightenfactor0
\cf5 \cb6 \strokec5 async\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 function\cf7 \cb6 \strokec7  handleGetTestStatus\strokec8 (\strokec7 req\strokec8 :\strokec7  \cf10 \strokec10 Request\cf7 \strokec8 ,\strokec7  supabase\strokec8 :\strokec7  \cf5 \cb6 \strokec5 any\cf7 \cb6 \strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  url \strokec8 =\strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 URL\cf7 \strokec8 (\strokec7 req\strokec8 .\strokec7 url\strokec8 );\cb1 \strokec7 \
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  testIds \strokec8 =\strokec7  url\strokec8 .\strokec7 searchParams\strokec8 .\cf5 \cb6 \strokec5 get\cf7 \cb6 \strokec8 (\cf9 \strokec9 'test_ids'\cf7 \strokec8 )?.\strokec7 split\strokec8 (\cf9 \strokec9 ','\cf7 \strokec8 )\strokec7  \strokec8 ||\strokec7  \strokec8 [];\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 testIds\strokec8 .\strokec7 length \strokec8 ===\strokec7  \cf12 \strokec12 0\cf7 \strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  \cf9 \strokec9 'test_ids required'\cf7 \strokec7  \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 400\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 const\cf7 \cb6 \strokec7  \strokec8 \{\strokec7  data\strokec8 ,\strokec7  error \strokec8 \}\strokec7  \strokec8 =\strokec7  \cf5 \cb6 \strokec5 await\cf7 \cb6 \strokec7  supabase\cb1 \
\cb6     \strokec8 .\cf5 \cb6 \strokec5 from\cf7 \cb6 \strokec8 (\cf9 \strokec9 'gv_geo_rankings'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\strokec7 select\strokec8 (\cf9 \strokec9 'id, test_status, llm_platform, visibility_score, test_date'\cf7 \strokec8 )\cb1 \strokec7 \
\cb6     \strokec8 .\cf5 \cb6 \strokec5 in\cf7 \cb6 \strokec8 (\cf9 \strokec9 'id'\cf7 \strokec8 ,\strokec7  testIds\strokec8 );\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 if\cf7 \cb6 \strokec7  \strokec8 (\strokec7 error\strokec8 )\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\strokec7  error\strokec8 :\strokec7  error\strokec8 .\strokec7 message \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       status\strokec8 :\strokec7  \cf12 \strokec12 500\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       headers\strokec8 :\strokec7  \strokec8 \{\strokec7  \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec7  \strokec8 \}\cb1 \strokec7 \
\cb6     \strokec8 \});\cb1 \strokec7 \
\cb6   \strokec8 \}\cb1 \strokec7 \
\
\cb6   \cf5 \cb6 \strokec5 return\cf7 \cb6 \strokec7  \cf5 \cb6 \strokec5 new\cf7 \cb6 \strokec7  \cf10 \strokec10 Response\cf7 \strokec8 (\cf10 \strokec10 JSON\cf7 \strokec8 .\strokec7 stringify\strokec8 (\{\cb1 \strokec7 \
\cb6     success\strokec8 :\strokec7  \cf5 \cb6 \strokec5 true\cf7 \cb6 \strokec8 ,\cb1 \strokec7 \
\cb6     tests\strokec8 :\strokec7  data \strokec8 ||\strokec7  \strokec8 []\cb1 \strokec7 \
\cb6   \strokec8 \}),\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6     status\strokec8 :\strokec7  \cf12 \strokec12 200\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6     headers\strokec8 :\strokec7  \strokec8 \{\cb1 \strokec7 \
\cb6       \cf9 \strokec9 'Content-Type'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 'application/json'\cf7 \strokec8 ,\cb1 \strokec7 \
\cb6       \cf9 \strokec9 'Access-Control-Allow-Origin'\cf7 \strokec8 :\strokec7  \cf9 \strokec9 '*'\cf7 \cb1 \strokec7 \
\cb6     \strokec8 \}\cb1 \strokec7 \
\cb6   \strokec8 \});\cb1 \strokec7 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb6 \strokec8 \}\cb1 \strokec7 \
\
}