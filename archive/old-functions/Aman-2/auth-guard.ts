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
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2.39.3'\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \strokec4  corsHeaders \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3   \cf6 \strokec6 'Access-Control-Allow-Headers'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'authorization, x-client-info, apikey, content-type'\cf4 \strokec5 ,\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \};\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec5 .\strokec4 serve\strokec5 (\cf2 \strokec2 async\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'OPTIONS'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf6 \strokec6 'ok'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  corsHeaders \strokec5 \});\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf8 \strokec8 // Get JWT from Authorization header\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  authHeader \strokec5 =\strokec4  req\strokec5 .\strokec4 headers\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'Authorization'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 authHeader\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'No authorization header'\cf4 \strokec5 ,\strokec4  requires_login\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 401\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabaseClient \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_ANON_KEY'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 global\cf4 \strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf7 \strokec7 Authorization\cf4 \strokec5 :\strokec4  authHeader \strokec5 \},\cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Get authenticated user\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  \strokec5 \{\strokec4  user \strokec5 \},\strokec4  error\strokec5 :\strokec4  authError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\strokec5 .\strokec4 auth\strokec5 .\strokec4 getUser\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 authError \strokec5 ||\strokec4  \strokec5 !\strokec4 user\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Unauthorized'\cf4 \strokec5 ,\strokec4  requires_login\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 401\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Check onboarding status\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  onboardingCheck\strokec5 ,\strokec4  error\strokec5 :\strokec4  checkError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3       \strokec5 .\strokec4 rpc\strokec5 (\cf6 \strokec6 'check_onboarding_required'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  p_user_id\strokec5 :\strokec4  user\strokec5 .\strokec4 id \strokec5 \});\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 checkError\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Error checking onboarding:'\cf4 \strokec5 ,\strokec4  checkError\strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Failed to check onboarding status'\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  result \strokec5 =\strokec4  onboardingCheck\strokec5 ?.[\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ||\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Return response\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3         user_id\strokec5 :\strokec4  user\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3         email\strokec5 :\strokec4  user\strokec5 .\strokec4 email\strokec5 ,\cb1 \strokec4 \
\cb3         requires_onboarding\strokec5 :\strokec4  result\strokec5 .\strokec4 requires_onboarding \strokec5 ??\strokec4  \cf2 \strokec2 false\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         brand_id\strokec5 :\strokec4  result\strokec5 .\strokec4 brand_id\strokec5 ,\cb1 \strokec4 \
\cb3         wizard_step\strokec5 :\strokec4  result\strokec5 .\strokec4 wizard_step \strokec5 ??\strokec4  \cf9 \strokec9 1\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         wizard_status\strokec5 :\strokec4  result\strokec5 .\strokec4 wizard_status \strokec5 ??\strokec4  \cf6 \strokec6 'pending'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         redirect_to\strokec5 :\strokec4  result\strokec5 .\strokec4 redirect_to\strokec5 ,\cb1 \strokec4 \
\cb3         allowed_routes\strokec5 :\strokec4  result\strokec5 .\strokec4 requires_onboarding \cb1 \
\cb3           \strokec5 ?\strokec4  \strokec5 [\cf6 \strokec6 '/onboarding'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 '/profile'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 '/logout'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 '/api/*'\cf4 \strokec5 ]\cb1 \strokec4 \
\cb3           \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Auth guard error:'\cf4 \strokec5 ,\strokec4  error\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \});\cb1 \strokec4 \
}