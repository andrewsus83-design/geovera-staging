{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red83\green83\blue83;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue255;\red0\green0\blue0;\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;
}
{\*\expandedcolortbl;;\cssrgb\c40000\c40000\c40000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c100000;\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 // supabase/functions/learning-note/index.ts\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 import\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  serve \strokec6 \}\strokec4  \cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec4  \cf7 \strokec7 "https://deno.land/std@0.168.0/http/server.ts"\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 import\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  createClient \strokec6 \}\strokec4  \cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec4  \cf7 \strokec7 'https://esm.sh/@supabase/supabase-js@2'\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  corsHeaders \strokec6 =\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf7 \strokec7 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 '*'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3   \cf7 \strokec7 'Access-Control-Allow-Headers'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'authorization, x-client-info, apikey, content-type'\cf4 \strokec6 ,\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec6 (\cf5 \cb3 \strokec5 async\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3   \cf5 \cb3 \strokec5 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 .\strokec4 method \strokec6 ===\strokec4  \cf7 \strokec7 'OPTIONS'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 return\cf4 \cb3 \strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cf7 \strokec7 'ok'\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  headers\strokec6 :\strokec4  corsHeaders \strokec6 \})\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf5 \cb3 \strokec5 try\cf4 \cb3 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  supabase \strokec6 =\strokec4  createClient\strokec6 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf5 \cb3 \strokec5 get\cf4 \cb3 \strokec6 (\cf7 \strokec7 'SUPABASE_URL'\cf4 \strokec6 )\strokec4  \strokec6 ??\strokec4  \cf7 \strokec7 ''\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf5 \cb3 \strokec5 get\cf4 \cb3 \strokec6 (\cf7 \strokec7 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec6 )\strokec4  \strokec6 ??\strokec4  \cf7 \strokec7 ''\cf4 \cb1 \strokec4 \
\cb3     \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  run_id\strokec6 ,\strokec4  brand_id \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf5 \cb3 \strokec5 await\cf4 \cb3 \strokec4  req\strokec6 .\strokec4 json\strokec6 ()\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 `\uc0\u55357 \u56541  Finalizing learning note for run \cf4 \strokec6 $\{\strokec4 run_id\strokec6 \}\cf7 \strokec7 `\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // 1. Load draft learning note\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  draft\strokec6 ,\strokec4  error\strokec6 :\strokec4  draftError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf5 \cb3 \strokec5 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec6 (\cf7 \strokec7 'gv_authority_drafts'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 (\cf7 \strokec7 'learning_note_draft'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf7 \strokec7 'run_id'\cf4 \strokec6 ,\strokec4  run_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 single\strokec6 ()\cb1 \strokec4 \
\
\cb3     \cf5 \cb3 \strokec5 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 draftError \strokec6 ||\strokec4  \strokec6 !\strokec4 draft\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \cb3 \strokec5 throw\cf4 \cb3 \strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Error\cf4 \strokec6 (\cf7 \strokec7 'Draft learning note not found'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // 2. Load task results\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  tasks\strokec6 ,\strokec4  error\strokec6 :\strokec4  tasksError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf5 \cb3 \strokec5 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec6 (\cf7 \strokec7 'gv_tasks'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 (\cf7 \strokec7 '*'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf7 \strokec7 'run_id'\cf4 \strokec6 ,\strokec4  run_id\strokec6 )\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // 3. Compile final learning note\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  learningNote \strokec6 =\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       what_changed\strokec6 :\strokec4  draft\strokec6 .\strokec4 learning_note_draft\strokec6 .\strokec4 what_changed \strokec6 ||\strokec4  \strokec6 [],\cb1 \strokec4 \
\cb3       what_learned\strokec6 :\strokec4  draft\strokec6 .\strokec4 learning_note_draft\strokec6 .\strokec4 what_learned \strokec6 ||\strokec4  \strokec6 [],\cb1 \strokec4 \
\cb3       uncertainties\strokec6 :\strokec4  draft\strokec6 .\strokec4 learning_note_draft\strokec6 .\strokec4 uncertainties \strokec6 ||\strokec4  \strokec6 [],\cb1 \strokec4 \
\cb3       why_new_insight_needed\strokec6 :\strokec4  draft\strokec6 .\strokec4 learning_note_draft\strokec6 .\strokec4 why_new_insight_needed \strokec6 ||\strokec4  \cf7 \strokec7 ''\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       linked_tasks\strokec6 :\strokec4  tasks\strokec6 ?.\strokec4 map\strokec6 (\strokec4 t \strokec6 =>\strokec4  t\strokec6 .\strokec4 id\strokec6 )\strokec4  \strokec6 ||\strokec4  \strokec6 [],\cb1 \strokec4 \
\cb3       linked_assets\strokec6 :\strokec4  \strokec6 []\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // 4. Save final learning note\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  error\strokec6 :\strokec4  saveError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf5 \cb3 \strokec5 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec6 (\cf7 \strokec7 'gv_learning_notes'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 insert\strokec6 (\{\cb1 \strokec4 \
\cb3         run_id\strokec6 ,\cb1 \strokec4 \
\cb3         brand_id\strokec6 ,\cb1 \strokec4 \
\cb3         status\strokec6 :\strokec4  \cf7 \strokec7 'final'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \strokec6 ...\strokec4 learningNote\strokec6 ,\cb1 \strokec4 \
\cb3         finalized_at\strokec6 :\strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Date\cf4 \strokec6 ().\strokec4 toISOString\strokec6 ()\cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\
\cb3     \cf5 \cb3 \strokec5 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 saveError\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \cb3 \strokec5 throw\cf4 \cb3 \strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Error\cf4 \strokec6 (\cf7 \strokec7 `Failed to save learning note: \cf4 \strokec6 $\{\strokec4 saveError\strokec6 .\strokec4 message\strokec6 \}\cf7 \strokec7 `\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 // 5. Update job\cf4 \cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf5 \cb3 \strokec5 from\cf4 \cb3 \strokec6 (\cf7 \strokec7 'gv_jobs'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 update\strokec6 (\{\cb1 \strokec4 \
\cb3         status\strokec6 :\strokec4  \cf7 \strokec7 'completed'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         result\strokec6 :\strokec4  \strokec6 \{\strokec4  learning_note_status\strokec6 :\strokec4  \cf7 \strokec7 'final'\cf4 \strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf7 \strokec7 'run_id'\cf4 \strokec6 ,\strokec4  run_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf7 \strokec7 'job_type'\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 'learning-note'\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf7 \strokec7 '\uc0\u9989  Learning note finalized'\cf4 \strokec6 )\cb1 \strokec4 \
\
\cb3     \cf5 \cb3 \strokec5 return\cf4 \cb3 \strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         success\strokec6 :\strokec4  \cf5 \cb3 \strokec5 true\cf4 \cb3 \strokec6 ,\cb1 \strokec4 \
\cb3         learning_note_status\strokec6 :\strokec4  \cf7 \strokec7 'final'\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \strokec6 ...\strokec4 corsHeaders\strokec6 ,\strokec4  \cf7 \strokec7 'Content-Type'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'application/json'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 )\cb1 \strokec4 \
\
\cb3   \strokec6 \}\strokec4  \cf5 \cb3 \strokec5 catch\cf4 \cb3 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 error\strokec6 (\cf7 \strokec7 '\uc0\u10060  Learning note error:'\cf4 \strokec6 ,\strokec4  error\strokec6 )\cb1 \strokec4 \
\cb3     \cf5 \cb3 \strokec5 return\cf4 \cb3 \strokec4  \cf5 \cb3 \strokec5 new\cf4 \cb3 \strokec4  \cf8 \strokec8 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  error\strokec6 :\strokec4  error\strokec6 .\strokec4 message \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf9 \strokec9 500\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \strokec6 ...\strokec4 corsHeaders\strokec6 ,\strokec4  \cf7 \strokec7 'Content-Type'\cf4 \strokec6 :\strokec4  \cf7 \strokec7 'application/json'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 )\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \})\cb1 \strokec4 \
}