{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;\red19\green118\blue70;\red83\green83\blue83;
\red107\green0\blue1;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;\cssrgb\c40000\c40000\c40000;
\cssrgb\c50196\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 CORS\cf4 \strokec4  \strokec6 =\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3   \cf5 \strokec5 'Access-Control-Allow-Headers'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'authorization, x-client-info, apikey, content-type'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3   \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \};\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  sbHeaders\strokec6 ()\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  k \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec6 \{\strokec4  apikey\strokec6 :\strokec4  k\strokec6 ,\strokec4  \cf7 \strokec7 Authorization\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\strokec4 k\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 Prefer\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'return=representation'\cf4 \strokec4  \strokec6 \};\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 SB\cf4 \strokec4  \strokec6 =\strokec4  \strokec6 ()\strokec4  \strokec6 =>\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'SUPABASE_URL'\cf4 \strokec6 )!;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 (\cf2 \strokec2 async\cf4 \strokec4  \strokec6 (\strokec4 req\strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 req\strokec6 .\strokec4 method \strokec6 ===\strokec4  \cf5 \strokec5 'OPTIONS'\cf4 \strokec6 )\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf2 \strokec2 null\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf8 \strokec8 200\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \cf7 \strokec7 CORS\cf4 \strokec4  \strokec6 \});\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec6 \{\strokec4  code\strokec6 ,\strokec4  context\strokec6 ,\strokec4  function_name \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (!\strokec4 code\strokec6 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 'code field required'\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  apiKey \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'OPENAI_API_KEY'\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (!\strokec4 apiKey\strokec6 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 'OPENAI_API_KEY not set'\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Create pending record\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  insertRes \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec6 (\cf5 \strokec5 `\cf4 \strokec6 $\{\cf7 \strokec7 SB\cf4 \strokec6 ()\}\cf5 \strokec5 /rest/v1/gv_code_reviews`\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       method\strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  sbHeaders\strokec6 (),\cb1 \strokec4 \
\cb3       body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  function_name\strokec6 :\strokec4  function_name \strokec6 ||\strokec4  \cf5 \strokec5 'unknown'\cf4 \strokec6 ,\strokec4  status\strokec6 :\strokec4  \cf5 \strokec5 'processing'\cf4 \strokec6 ,\strokec4  code_hash\strokec6 :\strokec4  \cf7 \strokec7 String\cf4 \strokec6 (\strokec4 code\strokec6 .\strokec4 length\strokec6 )\strokec4  \strokec6 \})\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec6 [\strokec4 record\strokec6 ]\strokec4  \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  insertRes\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  reviewId \strokec6 =\strokec4  record\strokec6 ?.\strokec4 id\strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Call OpenAI\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  response \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec6 (\cf5 \strokec5 'https://api.openai.com/v1/chat/completions'\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       method\strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\strokec4 apiKey\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec4  \strokec6 \},\cb1 \strokec4 \
\cb3       body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         model\strokec6 :\strokec4  \cf5 \strokec5 'gpt-4o'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         messages\strokec6 :\strokec4  \strokec6 [\cb1 \strokec4 \
\cb3           \strokec6 \{\strokec4  role\strokec6 :\strokec4  \cf5 \strokec5 'system'\cf4 \strokec6 ,\strokec4  content\strokec6 :\strokec4  \cf5 \strokec5 `You are a Senior Backend Engineer. Review this Supabase Edge Function code.\\nRate each category 1-10: SECURITY, RELIABILITY, PERFORMANCE, ARCHITECTURE, API_DESIGN, COST_EFFICIENCY.\\nReturn ONLY valid JSON:\\n\{"overall_score":n,"categories":\{"security":\{"score":n,"issues":[],"fixes":[]\},"reliability":\{"score":n,"issues":[],"fixes":[]\},"performance":\{"score":n,"issues":[],"fixes":[]\},"architecture":\{"score":n,"issues":[],"fixes":[]\},"api_design":\{"score":n,"issues":[],"fixes":[]\},"cost_efficiency":\{"score":n,"issues":[],"fixes":[]\}\},"critical_issues":[\{"issue":"","fix":""\}],"improvements":[\{"area":"","suggestion":"","priority":"high|medium|low"\}],"summary":"","production_ready":bool\}`\cf4 \strokec4  \strokec6 \},\cb1 \strokec4 \
\cb3           \strokec6 \{\strokec4  role\strokec6 :\strokec4  \cf5 \strokec5 'user'\cf4 \strokec6 ,\strokec4  content\strokec6 :\strokec4  \cf5 \strokec5 `Context: \cf4 \strokec6 $\{\strokec4 context \strokec6 ||\strokec4  \cf5 \strokec5 'Edge Function'\cf4 \strokec6 \}\cf5 \strokec5 \\n\\nCode:\\n\cf4 \strokec6 $\{\strokec4 code\strokec6 \}\cf5 \strokec5 `\cf4 \strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3         \strokec6 ],\cb1 \strokec4 \
\cb3         temperature\strokec6 :\strokec4  \cf8 \strokec8 0.3\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       \strokec6 \}),\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (!\strokec4 response\strokec6 .\strokec4 ok\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  errText \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  response\strokec6 .\strokec4 text\strokec6 ();\cb1 \strokec4 \
\cb3       \cf9 \strokec9 // Update record with error\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 reviewId\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec6 (\cf5 \strokec5 `\cf4 \strokec6 $\{\cf7 \strokec7 SB\cf4 \strokec6 ()\}\cf5 \strokec5 /rest/v1/gv_code_reviews?id=eq.\cf4 \strokec6 $\{\strokec4 reviewId\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           method\strokec6 :\strokec4  \cf5 \strokec5 'PATCH'\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  sbHeaders\strokec6 (),\cb1 \strokec4 \
\cb3           body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  status\strokec6 :\strokec4  \cf5 \strokec5 'failed'\cf4 \strokec6 ,\strokec4  error\strokec6 :\strokec4  \cf5 \strokec5 `OpenAI \cf4 \strokec6 $\{\strokec4 response\strokec6 .\strokec4 status\strokec6 \}\cf5 \strokec5 : \cf4 \strokec6 $\{\strokec4 errText\strokec6 .\strokec4 substring\strokec6 (\cf8 \strokec8 0\cf4 \strokec6 ,\cf8 \strokec8 500\cf4 \strokec6 )\}\cf5 \strokec5 `\cf4 \strokec6 ,\strokec4  completed_at\strokec6 :\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec6 ().\strokec4 toISOString\strokec6 ()\strokec4  \strokec6 \})\cb1 \strokec4 \
\cb3         \strokec6 \});\cb1 \strokec4 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `OpenAI API \cf4 \strokec6 $\{\strokec4 response\strokec6 .\strokec4 status\strokec6 \}\cf5 \strokec5 : \cf4 \strokec6 $\{\strokec4 errText\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  data \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  response\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  reviewText \strokec6 =\strokec4  data\strokec6 .\strokec4 choices\strokec6 ?.[\cf8 \strokec8 0\cf4 \strokec6 ]?.\strokec4 message\strokec6 ?.\strokec4 content \strokec6 ||\strokec4  \cf5 \strokec5 ''\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  usage \strokec6 =\strokec4  data\strokec6 .\strokec4 usage \strokec6 ||\strokec4  \strokec6 \{\};\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 let\cf4 \strokec4  review\strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 try\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  jsonMatch \strokec6 =\strokec4  reviewText\strokec6 .\strokec4 match\strokec6 (\cf10 \cb3 \strokec10 /\\\{[\\s\\S]*\\\}/\cf4 \cb3 \strokec6 );\cb1 \strokec4 \
\cb3       review \strokec6 =\strokec4  jsonMatch \strokec6 ?\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 parse\strokec6 (\strokec4 jsonMatch\strokec6 [\cf8 \strokec8 0\cf4 \strokec6 ])\strokec4  \strokec6 :\strokec4  \strokec6 \{\strokec4  raw\strokec6 :\strokec4  reviewText \strokec6 \};\cb1 \strokec4 \
\cb3     \strokec6 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec6 \{\strokec4  review \strokec6 =\strokec4  \strokec6 \{\strokec4  raw\strokec6 :\strokec4  reviewText \strokec6 \};\strokec4  \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  costUsd \strokec6 =\strokec4  \strokec6 ((\strokec4 usage\strokec6 .\strokec4 prompt_tokens \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec6 )\strokec4  \strokec6 *\strokec4  \cf8 \strokec8 2.5\cf4 \strokec4  \strokec6 /\strokec4  \cf8 \strokec8 1_000_000\cf4 \strokec6 )\strokec4  \strokec6 +\strokec4  \strokec6 ((\strokec4 usage\strokec6 .\strokec4 completion_tokens \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec6 )\strokec4  \strokec6 *\strokec4  \cf8 \strokec8 10\cf4 \strokec4  \strokec6 /\strokec4  \cf8 \strokec8 1_000_000\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Update record with result\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 reviewId\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec6 (\cf5 \strokec5 `\cf4 \strokec6 $\{\cf7 \strokec7 SB\cf4 \strokec6 ()\}\cf5 \strokec5 /rest/v1/gv_code_reviews?id=eq.\cf4 \strokec6 $\{\strokec4 reviewId\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         method\strokec6 :\strokec4  \cf5 \strokec5 'PATCH'\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  sbHeaders\strokec6 (),\cb1 \strokec4 \
\cb3         body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3           status\strokec6 :\strokec4  \cf5 \strokec5 'completed'\cf4 \strokec6 ,\strokec4  review_result\strokec6 :\strokec4  review\strokec6 ,\strokec4  model\strokec6 :\strokec4  \cf5 \strokec5 'gpt-4o'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           tokens_input\strokec6 :\strokec4  usage\strokec6 .\strokec4 prompt_tokens\strokec6 ,\strokec4  tokens_output\strokec6 :\strokec4  usage\strokec6 .\strokec4 completion_tokens\strokec6 ,\cb1 \strokec4 \
\cb3           cost_usd\strokec6 :\strokec4  \cf7 \strokec7 Math\cf4 \strokec6 .\strokec4 round\strokec6 (\strokec4 costUsd \strokec6 *\strokec4  \cf8 \strokec8 10000\cf4 \strokec6 )\strokec4  \strokec6 /\strokec4  \cf8 \strokec8 10000\cf4 \strokec6 ,\strokec4  completed_at\strokec6 :\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec6 ().\strokec4 toISOString\strokec6 ()\cb1 \strokec4 \
\cb3         \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  id\strokec6 :\strokec4  reviewId\strokec6 ,\strokec4  review\strokec6 ,\strokec4  model\strokec6 :\strokec4  \cf5 \strokec5 'gpt-4o'\cf4 \strokec6 ,\strokec4  tokens\strokec6 :\strokec4  \strokec6 \{\strokec4  input\strokec6 :\strokec4  usage\strokec6 .\strokec4 prompt_tokens\strokec6 ,\strokec4  output\strokec6 :\strokec4  usage\strokec6 .\strokec4 completion_tokens \strokec6 \},\strokec4  cost_usd\strokec6 :\strokec4  \cf7 \strokec7 Math\cf4 \strokec6 .\strokec4 round\strokec6 (\strokec4 costUsd \strokec6 *\strokec4  \cf8 \strokec8 10000\cf4 \strokec6 )\strokec4  \strokec6 /\strokec4  \cf8 \strokec8 10000\cf4 \strokec4  \strokec6 \},\strokec4  \cf2 \strokec2 null\cf4 \strokec6 ,\strokec4  \cf8 \strokec8 2\cf4 \strokec6 ),\strokec4  \strokec6 \{\strokec4  headers\strokec6 :\strokec4  \cf7 \strokec7 CORS\cf4 \strokec4  \strokec6 \});\cb1 \strokec4 \
\
\cb3   \strokec6 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec6 (\strokec4 err\strokec6 :\strokec4  \cf2 \strokec2 any\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  error\strokec6 :\strokec4  err\strokec6 .\strokec4 message \strokec6 \}),\strokec4  \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf8 \strokec8 500\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \cf7 \strokec7 CORS\cf4 \strokec4  \strokec6 \});\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
\
}