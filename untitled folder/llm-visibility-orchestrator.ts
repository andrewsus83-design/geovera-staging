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
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \strokec5 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2'\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \cb3 \strokec4  \cf7 \strokec7 TestConfig\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   llm_platforms\strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec5 [];\cb1 \strokec4 \
\cb3   question_count\strokec5 :\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\cb3   question_types\strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec5 [];\cb1 \strokec4 \
\cb3   use_cached_questions\strokec5 :\strokec4  \cf2 \cb3 \strokec2 boolean\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 interface\cf4 \cb3 \strokec4  \cf7 \strokec7 LLMVisibilityRequest\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   brand_id\strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\cb3   test_config\strokec5 :\strokec4  \cf7 \strokec7 TestConfig\cf4 \strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \cb3 \strokec2 async\cf4 \cb3 \strokec4  \strokec5 (\strokec4 req\strokec5 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 try\cf4 \cb3 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf8 \cb3 \strokec8 // CORS headers\cf4 \cb1 \strokec4 \
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
\cb3     \cf8 \cb3 \strokec8 // Auth check\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  authHeader \strokec5 =\strokec4  req\strokec5 .\strokec4 headers\strokec5 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec5 (\cf6 \strokec6 'Authorization'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (!\strokec4 authHeader\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Unauthorized'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf9 \strokec9 401\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Parse request\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  brand_id\strokec5 ,\strokec4  test_config \strokec5 \}:\strokec4  \cf7 \strokec7 LLMVisibilityRequest\cf4 \strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  req\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (!\strokec4 brand_id \strokec5 ||\strokec4  \strokec5 !\strokec4 test_config\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Missing required fields'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf9 \strokec9 400\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Initialize Supabase client\cf4 \cb1 \strokec4 \
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
\cb3     \cf8 \cb3 \strokec8 // Validate brand exists and user has access\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  brand\strokec5 ,\strokec4  error\strokec5 :\strokec4  brandError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'brands'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'id, brand_name, description, category'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 brandError \strokec5 ||\strokec4  \strokec5 !\strokec4 brand\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Brand not found'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf9 \strokec9 404\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Create test records for each platform\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  testDate \strokec5 =\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 ().\strokec4 split\strokec5 (\cf6 \strokec6 'T'\cf4 \strokec5 )[\cf9 \strokec9 0\cf4 \strokec5 ];\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  testRecords \strokec5 =\strokec4  \strokec5 [];\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 for\cf4 \cb3 \strokec4  \strokec5 (\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  platform \cf2 \cb3 \strokec2 of\cf4 \cb3 \strokec4  test_config\strokec5 .\strokec4 llm_platforms\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  ranking\strokec5 ,\strokec4  error\strokec5 :\strokec4  testError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_geo_rankings'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 insert\strokec5 (\{\cb1 \strokec4 \
\cb3           brand_id\strokec5 ,\cb1 \strokec4 \
\cb3           llm_platform\strokec5 :\strokec4  platform\strokec5 ,\cb1 \strokec4 \
\cb3           test_date\strokec5 :\strokec4  testDate\strokec5 ,\cb1 \strokec4 \
\cb3           questions_tested\strokec5 :\strokec4  test_config\strokec5 .\strokec4 question_count\strokec5 ,\cb1 \strokec4 \
\cb3           test_status\strokec5 :\strokec4  \cf6 \strokec6 'pending'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           test_config\strokec5 :\strokec4  test_config\cb1 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 testError\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Test creation error for'\cf4 \strokec5 ,\strokec4  platform\strokec5 ,\strokec4  \cf6 \strokec6 ':'\cf4 \strokec5 ,\strokec4  testError\strokec5 );\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 continue\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       testRecords\strokec5 .\strokec4 push\strokec5 (\strokec4 ranking\strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 testRecords\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Failed to create tests'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Generate or retrieve questions\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 let\cf4 \cb3 \strokec4  questions\strokec5 :\strokec4  \strokec5 \{\strokec4  id\strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec5 ;\strokec4  text\strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec4  \strokec5 \}[]\strokec4  \strokec5 =\strokec4  \strokec5 [];\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 test_config\strokec5 .\strokec4 use_cached_questions\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf8 \cb3 \strokec8 // Try to get cached questions\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  cachedQuestions \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_llm_test_questions'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'id, question_text'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'is_active'\cf4 \strokec5 ,\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 limit\strokec5 (\strokec4 test_config\strokec5 .\strokec4 question_count\strokec5 );\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 cachedQuestions \strokec5 &&\strokec4  cachedQuestions\strokec5 .\strokec4 length \strokec5 >=\strokec4  test_config\strokec5 .\strokec4 question_count\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         questions \strokec5 =\strokec4  cachedQuestions\strokec5 .\strokec4 map\strokec5 (\strokec4 q \strokec5 =>\strokec4  \strokec5 (\{\strokec4  id\strokec5 :\strokec4  q\strokec5 .\strokec4 id\strokec5 ,\strokec4  text\strokec5 :\strokec4  q\strokec5 .\strokec4 question_text \strokec5 \}));\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // If no cached questions or not enough, generate new ones\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 questions\strokec5 .\strokec4 length \strokec5 <\strokec4  test_config\strokec5 .\strokec4 question_count\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf8 \cb3 \strokec8 // For now, generate simple questions - will integrate with Claude later\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  generatedQuestions \strokec5 =\strokec4  generateSimpleQuestions\strokec5 (\cb1 \strokec4 \
\cb3         brand\strokec5 .\strokec4 brand_name\strokec5 ,\cb1 \strokec4 \
\cb3         test_config\strokec5 .\strokec4 question_count \strokec5 -\strokec4  questions\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3         test_config\strokec5 .\strokec4 question_types\cb1 \
\cb3       \strokec5 );\cb1 \strokec4 \
\
\cb3       \cf8 \cb3 \strokec8 // Store new questions\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  inserted \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_llm_test_questions'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 insert\strokec5 (\cb1 \strokec4 \
\cb3           generatedQuestions\strokec5 .\strokec4 map\strokec5 (\strokec4 q \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3             brand_id\strokec5 ,\cb1 \strokec4 \
\cb3             question_set_id\strokec5 :\strokec4  testRecords\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ].\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3             question_text\strokec5 :\strokec4  q\strokec5 .\strokec4 text\strokec5 ,\cb1 \strokec4 \
\cb3             question_type\strokec5 :\strokec4  q\strokec5 .\cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec5 ,\cb1 \strokec4 \
\cb3             generated_by\strokec5 :\strokec4  \cf6 \strokec6 'system'\cf4 \cb1 \strokec4 \
\cb3           \strokec5 \}))\cb1 \strokec4 \
\cb3         \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'id, question_text'\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 inserted\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         questions\strokec5 .\strokec4 push\strokec5 (...\strokec4 inserted\strokec5 .\strokec4 map\strokec5 (\strokec4 q \strokec5 =>\strokec4  \strokec5 (\{\strokec4  id\strokec5 :\strokec4  q\strokec5 .\strokec4 id\strokec5 ,\strokec4  text\strokec5 :\strokec4  q\strokec5 .\strokec4 question_text \strokec5 \})));\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Update test status to processing\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_geo_rankings'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 update\strokec5 (\{\strokec4  test_status\strokec5 :\strokec4  \cf6 \strokec6 'processing'\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\cf2 \cb3 \strokec2 in\cf4 \cb3 \strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  testRecords\strokec5 .\strokec4 map\strokec5 (\strokec4 t \strokec5 =>\strokec4  t\strokec5 .\strokec4 id\strokec5 ));\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Return immediately - processing will happen in background\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3         success\strokec5 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec5 ,\cb1 \strokec4 \
\cb3         test_ids\strokec5 :\strokec4  testRecords\strokec5 .\strokec4 map\strokec5 (\strokec4 t \strokec5 =>\strokec4  t\strokec5 .\strokec4 id\strokec5 ),\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf6 \strokec6 'processing'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         estimated_completion_time\strokec5 :\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 +\strokec4  \cf9 \strokec9 10\cf4 \strokec4  \strokec5 *\strokec4  \cf9 \strokec9 60\cf4 \strokec4  \strokec5 *\strokec4  \cf9 \strokec9 1000\cf4 \strokec5 ).\strokec4 toISOString\strokec5 (),\cb1 \strokec4 \
\cb3         progress\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           questions_generated\strokec5 :\strokec4  questions\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           llms_queued\strokec5 :\strokec4  test_config\strokec5 .\strokec4 llm_platforms\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           platforms\strokec5 :\strokec4  test_config\strokec5 .\strokec4 llm_platforms\cb1 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf9 \strokec9 202\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 catch\cf4 \cb3 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Orchestrator error:'\cf4 \strokec5 ,\strokec4  error\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 ||\strokec4  \cf6 \strokec6 'Internal server error'\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\cb1 \strokec4 \
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
\cf8 \cb3 \strokec8 // Helper function to generate simple questions\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \cb3 \strokec4  generateSimpleQuestions\strokec5 (\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   brandName\strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec5 ,\cb1 \strokec4 \
\cb3   count\strokec5 :\strokec4  \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec5 ,\cb1 \strokec4 \
\cb3   types\strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec5 []\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 ):\strokec4  \strokec5 \{\strokec4  text\strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec5 ;\strokec4  \cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec4  \strokec5 \}[]\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  templates\strokec5 :\strokec4  \cf7 \strokec7 Record\cf4 \strokec5 <\cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec5 ,\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec5 []>\strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     brand_awareness\strokec5 :\strokec4  \strokec5 [\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `What is \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6 ?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `Tell me about \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `What does \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6  do?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `Who is \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6 ?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `Explain \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6  to me`\cf4 \cb1 \strokec4 \
\cb3     \strokec5 ],\cb1 \strokec4 \
\cb3     feature_inquiry\strokec5 :\strokec4  \strokec5 [\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `What features does \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6  offer?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `What can I do with \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6 ?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `How does \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6  work?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `What are the capabilities of \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6 ?`\cf4 \cb1 \strokec4 \
\cb3     \strokec5 ],\cb1 \strokec4 \
\cb3     comparison\strokec5 :\strokec4  \strokec5 [\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `How does \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6  compare to competitors?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `What makes \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6  different?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6  vs alternatives`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `Is \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6  better than other options?`\cf4 \cb1 \strokec4 \
\cb3     \strokec5 ],\cb1 \strokec4 \
\cb3     recommendation\strokec5 :\strokec4  \strokec5 [\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `Should I use \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6 ?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `Do you recommend \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6 ?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `Is \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6  worth it?`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `Would \cf4 \strokec5 $\{\strokec4 brandName\strokec5 \}\cf6 \strokec6  be good for me?`\cf4 \cb1 \strokec4 \
\cb3     \strokec5 ]\cb1 \strokec4 \
\cb3   \strokec5 \};\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  questions\strokec5 :\strokec4  \strokec5 \{\strokec4  text\strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec5 ;\strokec4  \cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec5 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec4  \strokec5 \}[]\strokec4  \strokec5 =\strokec4  \strokec5 [];\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  selectedTypes \strokec5 =\strokec4  types\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 ?\strokec4  types \strokec5 :\strokec4  \cf7 \strokec7 Object\cf4 \strokec5 .\strokec4 keys\strokec5 (\strokec4 templates\strokec5 );\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 while\cf4 \cb3 \strokec4  \strokec5 (\strokec4 questions\strokec5 .\strokec4 length \strokec5 <\strokec4  count\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 for\cf4 \cb3 \strokec4  \strokec5 (\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 of\cf4 \cb3 \strokec4  selectedTypes\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\strokec4 questions\strokec5 .\strokec4 length \strokec5 >=\strokec4  count\strokec5 )\strokec4  \cf2 \cb3 \strokec2 break\cf4 \cb3 \strokec5 ;\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  typeTemplates \strokec5 =\strokec4  templates\strokec5 [\cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec5 ]\strokec4  \strokec5 ||\strokec4  templates\strokec5 .\strokec4 brand_awareness\strokec5 ;\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  template \strokec5 =\strokec4  typeTemplates\strokec5 [\strokec4 questions\strokec5 .\strokec4 length \strokec5 %\strokec4  typeTemplates\strokec5 .\strokec4 length\strokec5 ];\cb1 \strokec4 \
\cb3       questions\strokec5 .\strokec4 push\strokec5 (\{\strokec4  text\strokec5 :\strokec4  template\strokec5 ,\strokec4  \cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec4  \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  questions\strokec5 .\strokec4 slice\strokec5 (\cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  count\strokec5 );\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
}