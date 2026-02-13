{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;\red83\green83\blue83;\red19\green118\blue70;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c40000\c40000\c40000;\cssrgb\c3529\c52549\c34510;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 CLOUDINARY_CLOUD_NAME\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'CLOUDINARY_CLOUD_NAME'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 CLOUDINARY_API_KEY\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'CLOUDINARY_API_KEY'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 CLOUDINARY_API_SECRET\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'CLOUDINARY_API_SECRET'\cf4 \strokec6 )!;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \strokec4  \cf7 \strokec7 UploadRequest\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   file_url\strokec6 :\strokec4  \cf2 \strokec2 string\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   public_id?: \cf2 \strokec2 string\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   folder?: \cf2 \strokec2 string\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   resource_type\strokec6 :\strokec4  \cf5 \strokec5 'image'\cf4 \strokec4  \strokec6 |\strokec4  \cf5 \strokec5 'video'\cf4 \strokec4  \strokec6 |\strokec4  \cf5 \strokec5 'raw'\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   tags?: \cf2 \strokec2 string\cf4 \strokec6 [];\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 (\cf2 \strokec2 async\cf4 \strokec4  \strokec6 (\strokec4 req\strokec6 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 req\strokec6 .\strokec4 method \strokec6 ===\strokec4  \cf5 \strokec5 'OPTIONS'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf2 \strokec2 null\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  \cb1 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cb1 \
\cb3         \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Access-Control-Allow-Methods'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Access-Control-Allow-Headers'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'authorization, content-type'\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \}\strokec4  \cb1 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec6 \{\strokec4  file_url\strokec6 ,\strokec4  public_id\strokec6 ,\strokec4  folder \strokec6 =\strokec4  \cf5 \strokec5 'geovera'\cf4 \strokec6 ,\strokec4  resource_type\strokec6 ,\strokec4  tags \strokec6 =\strokec4  \strokec6 []\strokec4  \strokec6 \}\strokec4  \strokec6 =\strokec4  \cb1 \
\cb3       \cf2 \strokec2 await\cf4 \strokec4  req\strokec6 .\strokec4 json\strokec6 ()\strokec4  \cf2 \strokec2 as\cf4 \strokec4  \cf7 \strokec7 UploadRequest\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[Cloudinary] Uploading \cf4 \strokec6 $\{\strokec4 resource_type\strokec6 \}\cf5 \strokec5 : \cf4 \strokec6 $\{\strokec4 file_url\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Generate timestamp for signature\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  timestamp \strokec6 =\strokec4  \cf7 \strokec7 Math\cf4 \strokec6 .\strokec4 round\strokec6 (\cf7 \strokec7 Date\cf4 \strokec6 .\strokec4 now\strokec6 ()\strokec4  \strokec6 /\strokec4  \cf9 \strokec9 1000\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf8 \strokec8 // Build parameters for signature\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  params\strokec6 :\strokec4  \cf7 \strokec7 Record\cf4 \strokec6 <\cf2 \strokec2 string\cf4 \strokec6 ,\strokec4  \cf2 \strokec2 any\cf4 \strokec6 >\strokec4  \strokec6 =\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       timestamp\strokec6 ,\cb1 \strokec4 \
\cb3       folder\strokec6 ,\cb1 \strokec4 \
\cb3     \strokec6 \};\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 public_id\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       params\strokec6 .\strokec4 public_id \strokec6 =\strokec4  public_id\strokec6 ;\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 tags\strokec6 .\strokec4 length \strokec6 >\strokec4  \cf9 \strokec9 0\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       params\strokec6 .\strokec4 tags \strokec6 =\strokec4  \strokec6 [\cf5 \strokec5 'geovera'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'ai-generated'\cf4 \strokec6 ,\strokec4  \strokec6 ...\strokec4 tags\strokec6 ].\strokec4 join\strokec6 (\cf5 \strokec5 ','\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Generate signature\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  signature \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  generateSignature\strokec6 (\strokec4 params\strokec6 ,\strokec4  \cf7 \strokec7 CLOUDINARY_API_SECRET\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Build form data\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  formData \strokec6 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 FormData\cf4 \strokec6 ();\cb1 \strokec4 \
\cb3     formData\strokec6 .\strokec4 append\strokec6 (\cf5 \strokec5 'file'\cf4 \strokec6 ,\strokec4  file_url\strokec6 );\cb1 \strokec4 \
\cb3     formData\strokec6 .\strokec4 append\strokec6 (\cf5 \strokec5 'api_key'\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 CLOUDINARY_API_KEY\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     formData\strokec6 .\strokec4 append\strokec6 (\cf5 \strokec5 'timestamp'\cf4 \strokec6 ,\strokec4  timestamp\strokec6 .\strokec4 toString\strokec6 ());\cb1 \strokec4 \
\cb3     formData\strokec6 .\strokec4 append\strokec6 (\cf5 \strokec5 'signature'\cf4 \strokec6 ,\strokec4  signature\strokec6 );\cb1 \strokec4 \
\cb3     formData\strokec6 .\strokec4 append\strokec6 (\cf5 \strokec5 'folder'\cf4 \strokec6 ,\strokec4  folder\strokec6 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 public_id\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       formData\strokec6 .\strokec4 append\strokec6 (\cf5 \strokec5 'public_id'\cf4 \strokec6 ,\strokec4  public_id\strokec6 );\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 tags\strokec6 .\strokec4 length \strokec6 >\strokec4  \cf9 \strokec9 0\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       formData\strokec6 .\strokec4 append\strokec6 (\cf5 \strokec5 'tags'\cf4 \strokec6 ,\strokec4  params\strokec6 .\strokec4 tags\strokec6 );\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Upload to Cloudinary\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  uploadUrl \strokec6 =\strokec4  \cf5 \strokec5 `https://api.cloudinary.com/v1_1/\cf4 \strokec6 $\{\cf7 \strokec7 CLOUDINARY_CLOUD_NAME\cf4 \strokec6 \}\cf5 \strokec5 /\cf4 \strokec6 $\{\strokec4 resource_type\strokec6 \}\cf5 \strokec5 /upload`\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  uploadResponse \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec6 (\strokec4 uploadUrl\strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       method\strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       body\strokec6 :\strokec4  formData\cb1 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (!\strokec4 uploadResponse\strokec6 .\strokec4 ok\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  errorText \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  uploadResponse\strokec6 .\strokec4 text\strokec6 ();\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `Cloudinary upload failed: \cf4 \strokec6 $\{\strokec4 uploadResponse\strokec6 .\strokec4 status\strokec6 \}\cf5 \strokec5  - \cf4 \strokec6 $\{\strokec4 errorText\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  result \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  uploadResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[Cloudinary] Upload successful: \cf4 \strokec6 $\{\strokec4 result\strokec6 .\strokec4 secure_url\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         success\strokec6 :\strokec4  \cf2 \strokec2 true\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         url\strokec6 :\strokec4  result\strokec6 .\strokec4 secure_url\strokec6 ,\cb1 \strokec4 \
\cb3         public_id\strokec6 :\strokec4  result\strokec6 .\strokec4 public_id\strokec6 ,\cb1 \strokec4 \
\cb3         format\strokec6 :\strokec4  result\strokec6 .\strokec4 format\strokec6 ,\cb1 \strokec4 \
\cb3         width\strokec6 :\strokec4  result\strokec6 .\strokec4 width\strokec6 ,\cb1 \strokec4 \
\cb3         height\strokec6 :\strokec4  result\strokec6 .\strokec4 height\strokec6 ,\cb1 \strokec4 \
\cb3         bytes\strokec6 :\strokec4  result\strokec6 .\strokec4 bytes\strokec6 ,\cb1 \strokec4 \
\cb3         resource_type\strokec6 :\strokec4  result\strokec6 .\strokec4 resource_type\strokec6 ,\cb1 \strokec4 \
\cb3         created_at\strokec6 :\strokec4  result\strokec6 .\strokec4 created_at\strokec6 ,\cb1 \strokec4 \
\cb3         version\strokec6 :\strokec4  result\strokec6 .\strokec4 version\cb1 \
\cb3       \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  \cb1 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cb1 \
\cb3           \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \cb1 \strokec4 \
\cb3         \strokec6 \}\strokec4  \cb1 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 );\cb1 \strokec4 \
\
\cb3   \strokec6 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 error\strokec6 (\cf5 \strokec5 '[Cloudinary] Error:'\cf4 \strokec6 ,\strokec4  error\strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  success\strokec6 :\strokec4  \cf2 \strokec2 false\cf4 \strokec6 ,\strokec4  error\strokec6 :\strokec4  error\strokec6 .\strokec4 message \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  \cb1 \
\cb3         status\strokec6 :\strokec4  \cf9 \strokec9 500\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cb1 \
\cb3           \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \cb1 \strokec4 \
\cb3         \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 );\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf8 \cb3 \strokec8 // Helper function to generate Cloudinary signature\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 async\cf4 \strokec4  \cf2 \strokec2 function\cf4 \strokec4  generateSignature\strokec6 (\strokec4 params\strokec6 :\strokec4  \cf7 \strokec7 Record\cf4 \strokec6 <\cf2 \strokec2 string\cf4 \strokec6 ,\strokec4  \cf2 \strokec2 any\cf4 \strokec6 >,\strokec4  apiSecret\strokec6 :\strokec4  \cf2 \strokec2 string\cf4 \strokec6 ):\strokec4  \cf7 \strokec7 Promise\cf4 \strokec6 <\cf2 \strokec2 string\cf4 \strokec6 >\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf8 \strokec8 // Sort parameters alphabetically\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  sortedParams \strokec6 =\strokec4  \cf7 \strokec7 Object\cf4 \strokec6 .\strokec4 keys\strokec6 (\strokec4 params\strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 .\strokec4 filter\strokec6 (\strokec4 key \strokec6 =>\strokec4  params\strokec6 [\strokec4 key\strokec6 ]\strokec4  \strokec6 !==\strokec4  \cf2 \strokec2 undefined\cf4 \strokec4  \strokec6 &&\strokec4  params\strokec6 [\strokec4 key\strokec6 ]\strokec4  \strokec6 !==\strokec4  \cf2 \strokec2 null\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 .\strokec4 sort\strokec6 ()\cb1 \strokec4 \
\cb3     \strokec6 .\strokec4 map\strokec6 (\strokec4 key \strokec6 =>\strokec4  \cf5 \strokec5 `\cf4 \strokec6 $\{\strokec4 key\strokec6 \}\cf5 \strokec5 =\cf4 \strokec6 $\{\strokec4 params\strokec6 [\strokec4 key\strokec6 ]\}\cf5 \strokec5 `\cf4 \strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 .\strokec4 join\strokec6 (\cf5 \strokec5 '&'\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 const\cf4 \strokec4  message \strokec6 =\strokec4  sortedParams \strokec6 +\strokec4  apiSecret\strokec6 ;\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf8 \strokec8 // Generate SHA-1 hash\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  msgBuffer \strokec6 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 TextEncoder\cf4 \strokec6 ().\strokec4 encode\strokec6 (\strokec4 message\strokec6 );\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  hashBuffer \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  crypto\strokec6 .\strokec4 subtle\strokec6 .\strokec4 digest\strokec6 (\cf5 \strokec5 'SHA-1'\cf4 \strokec6 ,\strokec4  msgBuffer\strokec6 );\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  hashArray \strokec6 =\strokec4  \cf7 \strokec7 Array\cf4 \strokec6 .\cf2 \strokec2 from\cf4 \strokec6 (\cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Uint8Array\cf4 \strokec6 (\strokec4 hashBuffer\strokec6 ));\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  hashHex \strokec6 =\strokec4  hashArray\strokec6 .\strokec4 map\strokec6 (\strokec4 b \strokec6 =>\strokec4  b\strokec6 .\strokec4 toString\strokec6 (\cf9 \strokec9 16\cf4 \strokec6 ).\strokec4 padStart\strokec6 (\cf9 \strokec9 2\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 '0'\cf4 \strokec6 )).\strokec4 join\strokec6 (\cf5 \strokec5 ''\cf4 \strokec6 );\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  hashHex\strokec6 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \}\cb1 \strokec4 \
}