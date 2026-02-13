{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh18460\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  createClient \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf5 \strokec5 "npm:@supabase/supabase-js@2"\cf4 \strokec6 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  css \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf5 \strokec5 "./css.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  body \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf5 \strokec5 "./body.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 (\cf2 \cb3 \strokec2 async\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  supabase \strokec6 =\strokec4  createClient\strokec6 (\cb1 \strokec4 \
\cb3     \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'SUPABASE_URL'\cf4 \strokec6 )!,\cb1 \strokec4 \
\cb3     \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec6 )!\cb1 \strokec4 \
\cb3   \strokec6 );\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  html \strokec6 =\strokec4  \cf5 \strokec5 `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>GeoVera Dashboard</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet"><style>\cf4 \strokec6 $\{\strokec4 css\strokec6 \}\cf5 \strokec5 </style></head><body>\cf4 \strokec6 $\{\strokec4 body\strokec6 \}\cf5 \strokec5 </body></html>`\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  blob \strokec6 =\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Blob\cf4 \strokec6 ([\strokec4 html\strokec6 ],\strokec4  \strokec6 \{\strokec4  \cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec6 :\strokec4  \cf5 \strokec5 'text/html'\cf4 \strokec4  \strokec6 \});\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 ,\strokec4  error \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\strokec6 .\strokec4 storage\cb1 \
\cb3     \strokec6 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec6 (\cf5 \strokec5 'pages'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 .\strokec4 upload\strokec6 (\cf5 \strokec5 'dashboard-reference.html'\cf4 \strokec6 ,\strokec4  blob\strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       contentType\strokec6 :\strokec4  \cf5 \strokec5 'text/html'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       cacheControl\strokec6 :\strokec4  \cf5 \strokec5 '300'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       upsert\strokec6 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec6 ,\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  error\strokec6 :\strokec4  error\strokec6 .\strokec4 message \strokec6 \}),\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       status\strokec6 :\strokec4  \cf8 \strokec8 500\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec4  \strokec6 \},\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  projectUrl \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'SUPABASE_URL'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  publicUrl \strokec6 =\strokec4  \cf5 \strokec5 `\cf4 \strokec6 $\{\strokec4 projectUrl\strokec6 \}\cf5 \strokec5 /storage/v1/object/public/pages/dashboard-reference.html`\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3     success\strokec6 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec6 ,\cb1 \strokec4 \
\cb3     url\strokec6 :\strokec4  publicUrl\strokec6 ,\cb1 \strokec4 \
\cb3     size\strokec6 :\strokec4  html\strokec6 .\strokec4 length\strokec6 ,\cb1 \strokec4 \
\cb3   \strokec6 \}),\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec4  \strokec6 \},\cb1 \strokec4 \
\cb3   \strokec6 \});\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
\
}