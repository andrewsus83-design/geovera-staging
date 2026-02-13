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
\cf2 \cb3 \strokec2 interface\cf4 \strokec4  \cf7 \strokec7 AuthorityCalculationRequest\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   brand_id\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   recalculate?: \cf2 \strokec2 boolean\cf4 \strokec5 ;\cb1 \strokec4 \
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
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  brand_id\strokec5 ,\strokec4  recalculate \strokec5 =\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \}:\strokec4  \cf7 \strokec7 AuthorityCalculationRequest\cf4 \strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brand_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'brand_id required'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf8 \strokec8 400\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabase \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )!,\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 )!,\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  auth\strokec5 :\strokec4  \strokec5 \{\strokec4  autoRefreshToken\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec5 ,\strokec4  persistSession\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Get brand info\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  brand \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'brands'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'id, brand_name, category'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 brand\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Brand not found'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf8 \strokec8 404\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // STEP 1: Sync citations from existing data sources\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 await\cf4 \strokec4  syncCitationsFromSocial\strokec5 (\strokec4 supabase\strokec5 ,\strokec4  brand_id\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 await\cf4 \strokec4  syncCitationsFromAI\strokec5 (\strokec4 supabase\strokec5 ,\strokec4  brand_id\strokec5 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf9 \strokec9 // STEP 2: Calculate dimensional authority scores\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  socialAuthority \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  calculateSocialAuthority\strokec5 (\strokec4 supabase\strokec5 ,\strokec4  brand_id\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  aiAuthority \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  calculateAIAuthority\strokec5 (\strokec4 supabase\strokec5 ,\strokec4  brand_id\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  expertAuthority \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  calculateExpertAuthority\strokec5 (\strokec4 supabase\strokec5 ,\strokec4  brand_id\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  mediaAuthority \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  calculateMediaAuthority\strokec5 (\strokec4 supabase\strokec5 ,\strokec4  brand_id\strokec5 );\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // STEP 3: Calculate overall authority (weighted composite)\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  overallAuthority \strokec5 =\strokec4  \strokec5 (\cb1 \strokec4 \
\cb3       socialAuthority \strokec5 *\strokec4  \cf8 \strokec8 0.25\cf4 \strokec4  \strokec5 +\cb1 \strokec4 \
\cb3       aiAuthority \strokec5 *\strokec4  \cf8 \strokec8 0.35\cf4 \strokec4  \strokec5 +\strokec4       \cf9 \strokec9 // AI gets highest weight\cf4 \cb1 \strokec4 \
\cb3       expertAuthority \strokec5 *\strokec4  \cf8 \strokec8 0.25\cf4 \strokec4  \strokec5 +\cb1 \strokec4 \
\cb3       mediaAuthority \strokec5 *\strokec4  \cf8 \strokec8 0.15\cf4 \cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // STEP 4: Get previous score for trend analysis\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  previousScore \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_authority_scores'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'overall_authority'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brand_id\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'calculated_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 limit\strokec5 (\cf8 \strokec8 1\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  prevScore \strokec5 =\strokec4  previousScore\strokec5 ?.\strokec4 overall_authority \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  monthlyChange \strokec5 =\strokec4  overallAuthority \strokec5 -\strokec4  prevScore\strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  trendingDirection \strokec5 =\strokec4  monthlyChange \strokec5 >\strokec4  \cf8 \strokec8 2\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'up'\cf4 \strokec4  \strokec5 :\strokec4  monthlyChange \strokec5 <\strokec4  \strokec5 -\cf8 \strokec8 2\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'down'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'stable'\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // STEP 5: Industry benchmarking\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  industryStats \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  calculateIndustryBenchmark\strokec5 (\cb1 \strokec4 \
\cb3       supabase\strokec5 ,\cb1 \strokec4 \
\cb3       brand\strokec5 .\strokec4 category \strokec5 ||\strokec4  \cf6 \strokec6 'general'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       overallAuthority\cb1 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // STEP 6: Identify and update top influencers\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 await\cf4 \strokec4  identifyTopInfluencers\strokec5 (\strokec4 supabase\strokec5 ,\strokec4  brand_id\strokec5 );\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // STEP 7: Store authority score\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  savedScore\strokec5 ,\strokec4  error\strokec5 :\strokec4  saveError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3       \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_authority_scores'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 insert\strokec5 (\{\cb1 \strokec4 \
\cb3         brand_id\strokec5 ,\cb1 \strokec4 \
\cb3         overall_authority\strokec5 :\strokec4  overallAuthority\strokec5 ,\cb1 \strokec4 \
\cb3         social_authority\strokec5 :\strokec4  socialAuthority\strokec5 ,\cb1 \strokec4 \
\cb3         ai_authority\strokec5 :\strokec4  aiAuthority\strokec5 ,\cb1 \strokec4 \
\cb3         expert_authority\strokec5 :\strokec4  expertAuthority\strokec5 ,\cb1 \strokec4 \
\cb3         media_authority\strokec5 :\strokec4  mediaAuthority\strokec5 ,\cb1 \strokec4 \
\cb3         calculation_method\strokec5 :\strokec4  \cf6 \strokec6 'pagerank_v1'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         industry_category\strokec5 :\strokec4  brand\strokec5 .\strokec4 category \strokec5 ||\strokec4  \cf6 \strokec6 'general'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         industry_percentile\strokec5 :\strokec4  industryStats\strokec5 .\strokec4 percentile\strokec5 ,\cb1 \strokec4 \
\cb3         industry_rank\strokec5 :\strokec4  industryStats\strokec5 .\strokec4 rank\strokec5 ,\cb1 \strokec4 \
\cb3         total_brands_in_industry\strokec5 :\strokec4  industryStats\strokec5 .\strokec4 total\strokec5 ,\cb1 \strokec4 \
\cb3         previous_score\strokec5 :\strokec4  prevScore\strokec5 ,\cb1 \strokec4 \
\cb3         monthly_change\strokec5 :\strokec4  monthlyChange\strokec5 ,\cb1 \strokec4 \
\cb3         trending_direction\strokec5 :\strokec4  trendingDirection\cb1 \
\cb3       \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 select\strokec5 ()\cb1 \strokec4 \
\cb3       \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 saveError\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Error saving authority score:'\cf4 \strokec5 ,\strokec4  saveError\strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  calculationTime \strokec5 =\strokec4  \cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  startTime\strokec5 ;\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3         success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         brand_name\strokec5 :\strokec4  brand\strokec5 .\strokec4 brand_name\strokec5 ,\cb1 \strokec4 \
\cb3         authority_score\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           overall\strokec5 :\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 overallAuthority \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           social\strokec5 :\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 socialAuthority \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           ai\strokec5 :\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 aiAuthority \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           expert\strokec5 :\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 expertAuthority \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           media\strokec5 :\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 mediaAuthority \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         benchmarking\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           industry\strokec5 :\strokec4  brand\strokec5 .\strokec4 category \strokec5 ||\strokec4  \cf6 \strokec6 'general'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           rank\strokec5 :\strokec4  industryStats\strokec5 .\strokec4 rank\strokec5 ,\cb1 \strokec4 \
\cb3           percentile\strokec5 :\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 industryStats\strokec5 .\strokec4 percentile \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           total_brands\strokec5 :\strokec4  industryStats\strokec5 .\strokec4 total\cb1 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         trend\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           direction\strokec5 :\strokec4  trendingDirection\strokec5 ,\cb1 \strokec4 \
\cb3           monthly_change\strokec5 :\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\strokec4 monthlyChange \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         calculation_time_ms\strokec5 :\strokec4  calculationTime\cb1 \
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
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 'Authority calculation error:'\cf4 \strokec5 ,\strokec4  error\strokec5 );\cb1 \strokec4 \
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
\cf9 \cb3 \strokec9 // Sync social mentions to citation network\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  syncCitationsFromSocial\strokec5 (\strokec4 supabase\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  brandId\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  mentions \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3     \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_pulse_signals'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'posted_at'\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  \cf8 \strokec8 90\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 24\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 1000\cf4 \strokec5 ).\strokec4 toISOString\strokec5 ())\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 limit\strokec5 (\cf8 \strokec8 100\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 mentions \strokec5 ||\strokec4  mentions\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  citations \strokec5 =\strokec4  mentions\strokec5 .\strokec4 map\strokec5 ((\strokec4 m\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3     to_brand_id\strokec5 :\strokec4  brandId\strokec5 ,\cb1 \strokec4 \
\cb3     citation_source\strokec5 :\strokec4  m\strokec5 .\strokec4 platform\strokec5 ,\cb1 \strokec4 \
\cb3     citation_type\strokec5 :\strokec4  \cf6 \strokec6 'mention'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     source_author\strokec5 :\strokec4  m\strokec5 .\strokec4 author_username\strokec5 ,\cb1 \strokec4 \
\cb3     source_author_id\strokec5 :\strokec4  m\strokec5 .\strokec4 author_username\strokec5 ,\cb1 \strokec4 \
\cb3     source_url\strokec5 :\strokec4  m\strokec5 .\strokec4 post_url\strokec5 ,\cb1 \strokec4 \
\cb3     source_content\strokec5 :\strokec4  m\strokec5 .\strokec4 content_text\strokec5 ?.\strokec4 substring\strokec5 (\cf8 \strokec8 0\cf4 \strokec5 ,\strokec4  \cf8 \strokec8 500\cf4 \strokec5 ),\cb1 \strokec4 \
\cb3     source_authority_score\strokec5 :\strokec4  calculateAuthorAuthority\strokec5 (\strokec4 m\strokec5 ),\cb1 \strokec4 \
\cb3     sentiment_score\strokec5 :\strokec4  m\strokec5 .\strokec4 sentiment \strokec5 ===\strokec4  \cf6 \strokec6 'positive'\cf4 \strokec4  \strokec5 ?\strokec4  \cf8 \strokec8 0.8\cf4 \strokec4  \strokec5 :\strokec4  m\strokec5 .\strokec4 sentiment \strokec5 ===\strokec4  \cf6 \strokec6 'negative'\cf4 \strokec4  \strokec5 ?\strokec4  \strokec5 -\cf8 \strokec8 0.5\cf4 \strokec4  \strokec5 :\strokec4  \cf8 \strokec8 0.3\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     prominence_score\strokec5 :\strokec4  m\strokec5 .\strokec4 viral_score \strokec5 ?\strokec4  m\strokec5 .\strokec4 viral_score \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \strokec4  \strokec5 :\strokec4  \cf8 \strokec8 0.5\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     exclusivity_score\strokec5 :\strokec4  \cf8 \strokec8 1.0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     engagement_score\strokec5 :\strokec4  m\strokec5 .\strokec4 engagement_rate \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     reach_score\strokec5 :\strokec4  m\strokec5 .\strokec4 author_followers \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     virality_score\strokec5 :\strokec4  m\strokec5 .\strokec4 viral_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     cited_at\strokec5 :\strokec4  m\strokec5 .\strokec4 posted_at\cb1 \
\cb3   \strokec5 \}));\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 await\cf4 \strokec4  supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_citation_network'\cf4 \strokec5 ).\strokec4 upsert\strokec5 (\strokec4 citations\strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     onConflict\strokec5 :\strokec4  \cf6 \strokec6 'to_brand_id,citation_source,source_author_id,cited_at'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     ignoreDuplicates\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \cb1 \strokec4 \
\cb3   \strokec5 \});\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf9 \cb3 \strokec9 // Sync AI mentions to citation network\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  syncCitationsFromAI\strokec5 (\strokec4 supabase\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  brandId\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  aiMentions \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3     \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_multi_ai_answers'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*, gv_question_sets!inner(brand_id)'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'gv_question_sets.brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_mentioned'\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 true\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'created_at'\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  \cf8 \strokec8 90\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 24\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 1000\cf4 \strokec5 ).\strokec4 toISOString\strokec5 ())\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 limit\strokec5 (\cf8 \strokec8 100\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 aiMentions \strokec5 ||\strokec4  aiMentions\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  citations \strokec5 =\strokec4  aiMentions\strokec5 .\strokec4 map\strokec5 ((\strokec4 m\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3     to_brand_id\strokec5 :\strokec4  brandId\strokec5 ,\cb1 \strokec4 \
\cb3     citation_source\strokec5 :\strokec4  m\strokec5 .\strokec4 model_name\strokec5 ,\cb1 \strokec4 \
\cb3     citation_type\strokec5 :\strokec4  m\strokec5 .\strokec4 is_recommendation \strokec5 ?\strokec4  \cf6 \strokec6 'recommendation'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'mention'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     source_author\strokec5 :\strokec4  m\strokec5 .\strokec4 model_name\strokec5 ,\cb1 \strokec4 \
\cb3     source_author_id\strokec5 :\strokec4  m\strokec5 .\strokec4 model_name\strokec5 ,\cb1 \strokec4 \
\cb3     source_authority_score\strokec5 :\strokec4  getAIPlatformAuthority\strokec5 (\strokec4 m\strokec5 .\strokec4 model_name\strokec5 ),\cb1 \strokec4 \
\cb3     sentiment_score\strokec5 :\strokec4  m\strokec5 .\strokec4 sentiment_score \strokec5 ||\strokec4  \cf8 \strokec8 0.5\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     prominence_score\strokec5 :\strokec4  m\strokec5 .\strokec4 mention_position \strokec5 ?\strokec4  \strokec5 (\cf8 \strokec8 1.0\cf4 \strokec4  \strokec5 /\strokec4  m\strokec5 .\strokec4 mention_position\strokec5 )\strokec4  \strokec5 :\strokec4  \cf8 \strokec8 0.5\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     exclusivity_score\strokec5 :\strokec4  m\strokec5 .\strokec4 competitors_mentioned\strokec5 ?.\strokec4 length \strokec5 >\strokec4  \cf8 \strokec8 0\cf4 \strokec4  \strokec5 ?\strokec4  \strokec5 (\cf8 \strokec8 1.0\cf4 \strokec4  \strokec5 /\strokec4  \strokec5 (\strokec4 m\strokec5 .\strokec4 competitors_mentioned\strokec5 .\strokec4 length \strokec5 +\strokec4  \cf8 \strokec8 1\cf4 \strokec5 ))\strokec4  \strokec5 :\strokec4  \cf8 \strokec8 1.0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     cited_at\strokec5 :\strokec4  m\strokec5 .\strokec4 created_at\cb1 \
\cb3   \strokec5 \}));\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 await\cf4 \strokec4  supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_citation_network'\cf4 \strokec5 ).\strokec4 upsert\strokec5 (\strokec4 citations\strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     ignoreDuplicates\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \cb1 \strokec4 \
\cb3   \strokec5 \});\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  calculateAuthorAuthority\strokec5 (\strokec4 mention\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 number\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  followers \strokec5 =\strokec4  mention\strokec5 .\strokec4 author_followers \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  verified \strokec5 =\strokec4  mention\strokec5 .\strokec4 author_verified \strokec5 ?\strokec4  \cf8 \strokec8 1.5\cf4 \strokec4  \strokec5 :\strokec4  \cf8 \strokec8 1.0\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  engagement \strokec5 =\strokec4  mention\strokec5 .\strokec4 engagement_rate \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  followerScore \strokec5 =\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 min\strokec5 (\cf8 \strokec8 50\cf4 \strokec5 ,\strokec4  \strokec5 (\strokec4 followers \strokec5 /\strokec4  \cf8 \strokec8 50000\cf4 \strokec5 )\strokec4  \strokec5 *\strokec4  \cf8 \strokec8 50\cf4 \strokec5 );\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  engagementScore \strokec5 =\strokec4  engagement \strokec5 *\strokec4  \cf8 \strokec8 30\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  verifiedBonus \strokec5 =\strokec4  verified \strokec5 ===\strokec4  \cf8 \strokec8 1.5\cf4 \strokec4  \strokec5 ?\strokec4  \cf8 \strokec8 20\cf4 \strokec4  \strokec5 :\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 min\strokec5 (\cf8 \strokec8 100\cf4 \strokec5 ,\strokec4  followerScore \strokec5 +\strokec4  engagementScore \strokec5 +\strokec4  verifiedBonus\strokec5 );\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  getAIPlatformAuthority\strokec5 (\strokec4 platform\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 number\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  scores\strokec5 :\strokec4  \cf7 \strokec7 Record\cf4 \strokec5 <\cf2 \strokec2 string\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 number\cf4 \strokec5 >\strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'chatgpt'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 95\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'claude'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 92\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'gemini'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 90\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'perplexity'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 88\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'grok'\cf4 \strokec5 :\strokec4  \cf8 \strokec8 85\cf4 \cb1 \strokec4 \
\cb3   \strokec5 \};\cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  scores\strokec5 [\strokec4 platform\strokec5 .\strokec4 toLowerCase\strokec5 ()]\strokec4  \strokec5 ||\strokec4  \cf8 \strokec8 80\cf4 \strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  calculateSocialAuthority\strokec5 (\strokec4 supabase\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  brandId\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf7 \strokec7 Promise\cf4 \strokec5 <\cf2 \strokec2 number\cf4 \strokec5 >\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  citations \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3     \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_citation_network'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'source_authority_score, sentiment_score, engagement_score'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'to_brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\cf2 \strokec2 in\cf4 \strokec5 (\cf6 \strokec6 'citation_source'\cf4 \strokec5 ,\strokec4  \strokec5 [\cf6 \strokec6 'tiktok'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'reddit'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'discord'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'twitter'\cf4 \strokec5 ])\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'cited_at'\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  \cf8 \strokec8 30\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 24\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 1000\cf4 \strokec5 ).\strokec4 toISOString\strokec5 ());\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 citations \strokec5 ||\strokec4  citations\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 let\cf4 \strokec4  score \strokec5 =\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  c \cf2 \strokec2 of\cf4 \strokec4  citations\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  authorityWeight \strokec5 =\strokec4  \strokec5 (\strokec4 c\strokec5 .\strokec4 source_authority_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  sentimentBonus \strokec5 =\strokec4  \strokec5 ((\strokec4 c\strokec5 .\strokec4 sentiment_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  \cf8 \strokec8 1\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 2\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  engagementBonus \strokec5 =\strokec4  \strokec5 (\strokec4 c\strokec5 .\strokec4 engagement_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     score \strokec5 +=\strokec4  authorityWeight \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 +\strokec4  sentimentBonus \strokec5 *\strokec4  \cf8 \strokec8 30\cf4 \strokec4  \strokec5 +\strokec4  engagementBonus \strokec5 *\strokec4  \cf8 \strokec8 10\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 min\strokec5 (\cf8 \strokec8 100\cf4 \strokec5 ,\strokec4  score \strokec5 /\strokec4  citations\strokec5 .\strokec4 length\strokec5 );\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  calculateAIAuthority\strokec5 (\strokec4 supabase\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  brandId\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf7 \strokec7 Promise\cf4 \strokec5 <\cf2 \strokec2 number\cf4 \strokec5 >\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  rankings \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3     \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_llm_seo_rankings'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'visibility_score, recommendation_pct, citation_frequency, avg_sentiment'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'test_date'\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  \cf8 \strokec8 30\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 24\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 1000\cf4 \strokec5 ).\strokec4 toISOString\strokec5 ());\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 rankings \strokec5 ||\strokec4  rankings\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 let\cf4 \strokec4  score \strokec5 =\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  r \cf2 \strokec2 of\cf4 \strokec4  rankings\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     score \strokec5 +=\strokec4  \strokec5 (\strokec4 r\strokec5 .\strokec4 visibility_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 *\strokec4  \cf8 \strokec8 0.4\cf4 \strokec4  \strokec5 +\cb1 \strokec4 \
\cb3              \strokec5 (\strokec4 r\strokec5 .\strokec4 recommendation_pct \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 *\strokec4  \cf8 \strokec8 0.3\cf4 \strokec4  \strokec5 +\cb1 \strokec4 \
\cb3              \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 min\strokec5 (\cf8 \strokec8 20\cf4 \strokec5 ,\strokec4  \strokec5 (\strokec4 r\strokec5 .\strokec4 citation_frequency \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 5\cf4 \strokec5 )\strokec4  \strokec5 +\cb1 \strokec4 \
\cb3              \strokec5 ((\strokec4 r\strokec5 .\strokec4 avg_sentiment \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  \cf8 \strokec8 1\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 2\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 10\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 min\strokec5 (\cf8 \strokec8 100\cf4 \strokec5 ,\strokec4  score \strokec5 /\strokec4  rankings\strokec5 .\strokec4 length\strokec5 );\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  calculateExpertAuthority\strokec5 (\strokec4 supabase\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  brandId\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf7 \strokec7 Promise\cf4 \strokec5 <\cf2 \strokec2 number\cf4 \strokec5 >\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  citations \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3     \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_citation_network'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'source_authority_score, sentiment_score'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'to_brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'source_authority_score'\cf4 \strokec5 ,\strokec4  \cf8 \strokec8 70\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'cited_at'\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 (\cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  \cf8 \strokec8 30\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 24\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 60\cf4 \strokec4  \strokec5 *\strokec4  \cf8 \strokec8 1000\cf4 \strokec5 ).\strokec4 toISOString\strokec5 ());\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 citations \strokec5 ||\strokec4  citations\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 let\cf4 \strokec4  score \strokec5 =\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  c \cf2 \strokec2 of\cf4 \strokec4  citations\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  expertWeight \strokec5 =\strokec4  \strokec5 (\strokec4 c\strokec5 .\strokec4 source_authority_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  sentimentBonus \strokec5 =\strokec4  \strokec5 ((\strokec4 c\strokec5 .\strokec4 sentiment_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 +\strokec4  \cf8 \strokec8 1\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 2\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     score \strokec5 +=\strokec4  expertWeight \strokec5 *\strokec4  \cf8 \strokec8 70\cf4 \strokec4  \strokec5 +\strokec4  sentimentBonus \strokec5 *\strokec4  \cf8 \strokec8 30\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 min\strokec5 (\cf8 \strokec8 100\cf4 \strokec5 ,\strokec4  score \strokec5 /\strokec4  citations\strokec5 .\strokec4 length\strokec5 );\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  calculateMediaAuthority\strokec5 (\strokec4 supabase\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  brandId\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf7 \strokec7 Promise\cf4 \strokec5 <\cf2 \strokec2 number\cf4 \strokec5 >\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf9 \strokec9 // Placeholder - would integrate with media monitoring\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf8 \strokec8 50\cf4 \strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  calculateIndustryBenchmark\strokec5 (\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   supabase\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3   category\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3   currentScore\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 ):\strokec4  \cf7 \strokec7 Promise\cf4 \strokec5 <\{\strokec4  rank\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\strokec4  percentile\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\strokec4  total\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec4  \strokec5 \}>\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  scores \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3     \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_current_authority'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'overall_authority'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'industry_category'\cf4 \strokec5 ,\strokec4  category\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'overall_authority'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \});\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 scores \strokec5 ||\strokec4  scores\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\strokec4  rank\strokec5 :\strokec4  \cf8 \strokec8 1\cf4 \strokec5 ,\strokec4  percentile\strokec5 :\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ,\strokec4  total\strokec5 :\strokec4  \cf8 \strokec8 1\cf4 \strokec4  \strokec5 \};\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  betterScores \strokec5 =\strokec4  scores\strokec5 .\strokec4 filter\strokec5 (\strokec4 s \strokec5 =>\strokec4  s\strokec5 .\strokec4 overall_authority \strokec5 >\strokec4  currentScore\strokec5 ).\strokec4 length\strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  rank \strokec5 =\strokec4  betterScores \strokec5 +\strokec4  \cf8 \strokec8 1\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  percentile \strokec5 =\strokec4  \strokec5 ((\strokec4 scores\strokec5 .\strokec4 length \strokec5 -\strokec4  betterScores\strokec5 )\strokec4  \strokec5 /\strokec4  scores\strokec5 .\strokec4 length\strokec5 )\strokec4  \strokec5 *\strokec4  \cf8 \strokec8 100\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec5 \{\strokec4  rank\strokec5 ,\strokec4  percentile\strokec5 ,\strokec4  total\strokec5 :\strokec4  scores\strokec5 .\strokec4 length \strokec5 \};\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  identifyTopInfluencers\strokec5 (\strokec4 supabase\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 ,\strokec4  brandId\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  citations \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3     \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_citation_network'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'to_brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 gte\strokec5 (\cf6 \strokec6 'source_authority_score'\cf4 \strokec5 ,\strokec4  \cf8 \strokec8 60\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'source_authority_score'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3     \strokec5 .\strokec4 limit\strokec5 (\cf8 \strokec8 50\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 citations \strokec5 ||\strokec4  citations\strokec5 .\strokec4 length \strokec5 ===\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  influencerMap\strokec5 :\strokec4  \cf7 \strokec7 Record\cf4 \strokec5 <\cf2 \strokec2 string\cf4 \strokec5 ,\strokec4  \cf2 \strokec2 any\cf4 \strokec5 >\strokec4  \strokec5 =\strokec4  \strokec5 \{\};\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  c \cf2 \strokec2 of\cf4 \strokec4  citations\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  key \strokec5 =\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 c\strokec5 .\strokec4 source_author\strokec5 \}\cf6 \strokec6 -\cf4 \strokec5 $\{\strokec4 c\strokec5 .\strokec4 citation_source\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 influencerMap\strokec5 [\strokec4 key\strokec5 ])\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       influencerMap\strokec5 [\strokec4 key\strokec5 ]\strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         brand_id\strokec5 :\strokec4  brandId\strokec5 ,\cb1 \strokec4 \
\cb3         influencer_username\strokec5 :\strokec4  c\strokec5 .\strokec4 source_author\strokec5 ,\cb1 \strokec4 \
\cb3         influencer_platform\strokec5 :\strokec4  c\strokec5 .\strokec4 citation_source\strokec5 ,\cb1 \strokec4 \
\cb3         influencer_external_id\strokec5 :\strokec4  c\strokec5 .\strokec4 source_author_id\strokec5 ,\cb1 \strokec4 \
\cb3         follower_count\strokec5 :\strokec4  c\strokec5 .\strokec4 reach_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         influencer_authority_score\strokec5 :\strokec4  c\strokec5 .\strokec4 source_authority_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         mention_count\strokec5 :\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         sentiments\strokec5 :\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3         engagements\strokec5 :\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3         first_mention_at\strokec5 :\strokec4  c\strokec5 .\strokec4 cited_at\strokec5 ,\cb1 \strokec4 \
\cb3         last_mention_at\strokec5 :\strokec4  c\strokec5 .\strokec4 cited_at\cb1 \
\cb3       \strokec5 \};\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     influencerMap\strokec5 [\strokec4 key\strokec5 ].\strokec4 mention_count\strokec5 ++;\cb1 \strokec4 \
\cb3     influencerMap\strokec5 [\strokec4 key\strokec5 ].\strokec4 sentiments\strokec5 .\strokec4 push\strokec5 (\strokec4 c\strokec5 .\strokec4 sentiment_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     influencerMap\strokec5 [\strokec4 key\strokec5 ].\strokec4 engagements\strokec5 .\strokec4 push\strokec5 (\strokec4 c\strokec5 .\strokec4 engagement_score \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     influencerMap\strokec5 [\strokec4 key\strokec5 ].\strokec4 last_mention_at \strokec5 =\strokec4  c\strokec5 .\strokec4 cited_at\strokec5 ;\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  influencers \strokec5 =\strokec4  \cf7 \strokec7 Object\cf4 \strokec5 .\strokec4 values\strokec5 (\strokec4 influencerMap\strokec5 ).\strokec4 map\strokec5 ((\strokec4 inf\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 (\{\cb1 \strokec4 \
\cb3     brand_id\strokec5 :\strokec4  inf\strokec5 .\strokec4 brand_id\strokec5 ,\cb1 \strokec4 \
\cb3     influencer_username\strokec5 :\strokec4  inf\strokec5 .\strokec4 influencer_username\strokec5 ,\cb1 \strokec4 \
\cb3     influencer_platform\strokec5 :\strokec4  inf\strokec5 .\strokec4 influencer_platform\strokec5 ,\cb1 \strokec4 \
\cb3     influencer_external_id\strokec5 :\strokec4  inf\strokec5 .\strokec4 influencer_external_id\strokec5 ,\cb1 \strokec4 \
\cb3     follower_count\strokec5 :\strokec4  inf\strokec5 .\strokec4 follower_count\strokec5 ,\cb1 \strokec4 \
\cb3     influencer_authority_score\strokec5 :\strokec4  inf\strokec5 .\strokec4 influencer_authority_score\strokec5 ,\cb1 \strokec4 \
\cb3     mention_count\strokec5 :\strokec4  inf\strokec5 .\strokec4 mention_count\strokec5 ,\cb1 \strokec4 \
\cb3     first_mention_at\strokec5 :\strokec4  inf\strokec5 .\strokec4 first_mention_at\strokec5 ,\cb1 \strokec4 \
\cb3     last_mention_at\strokec5 :\strokec4  inf\strokec5 .\strokec4 last_mention_at\strokec5 ,\cb1 \strokec4 \
\cb3     avg_sentiment\strokec5 :\strokec4  inf\strokec5 .\strokec4 sentiments\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 a\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ,\strokec4  b\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  a \strokec5 +\strokec4  b\strokec5 ,\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  inf\strokec5 .\strokec4 sentiments\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3     avg_engagement_rate\strokec5 :\strokec4  inf\strokec5 .\strokec4 engagements\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 a\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ,\strokec4  b\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  a \strokec5 +\strokec4  b\strokec5 ,\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  inf\strokec5 .\strokec4 engagements\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3     authority_contribution\strokec5 :\strokec4  \strokec5 (\strokec4 inf\strokec5 .\strokec4 influencer_authority_score \strokec5 /\strokec4  \cf8 \strokec8 100\cf4 \strokec5 )\strokec4  \strokec5 *\strokec4  inf\strokec5 .\strokec4 mention_count \strokec5 *\strokec4  \cf8 \strokec8 2\cf4 \cb1 \strokec4 \
\cb3   \strokec5 \}));\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 await\cf4 \strokec4  supabase\strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_authority_influencers'\cf4 \strokec5 ).\strokec4 upsert\strokec5 (\strokec4 influencers\strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     onConflict\strokec5 :\strokec4  \cf6 \strokec6 'brand_id,influencer_username,influencer_platform'\cf4 \cb1 \strokec4 \
\cb3   \strokec5 \});\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
}