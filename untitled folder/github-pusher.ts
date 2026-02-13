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
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \cb3 \strokec4  \cf7 \strokec7 PushRequest\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   owner\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   repo\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   path\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   content\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   message\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   branch?: \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   token?: \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 (\cf2 \cb3 \strokec2 async\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 .\strokec4 method \strokec6 !==\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  error\strokec6 :\strokec4  \cf5 \strokec5 'Method not allowed'\cf4 \strokec4  \strokec6 \}),\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       status\strokec6 :\strokec4  \cf8 \strokec8 405\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 try\cf4 \cb3 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  body\strokec6 :\strokec4  \cf7 \strokec7 PushRequest\cf4 \strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  req\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  owner\strokec6 ,\strokec4  repo\strokec6 ,\strokec4  path\strokec6 ,\strokec4  content\strokec6 ,\strokec4  message\strokec6 ,\strokec4  branch \strokec6 =\strokec4  \cf5 \strokec5 'main'\cf4 \strokec6 ,\strokec4  token\strokec6 :\strokec4  requestToken \strokec6 \}\strokec4  \strokec6 =\strokec4  body\strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (!\strokec4 owner \strokec6 ||\strokec4  \strokec6 !\strokec4 repo \strokec6 ||\strokec4  \strokec6 !\strokec4 path \strokec6 ||\strokec4  \strokec6 !\strokec4 content \strokec6 ||\strokec4  \strokec6 !\strokec4 message\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  \cb1 \
\cb3         error\strokec6 :\strokec4  \cf5 \strokec5 'Missing required fields: owner, repo, path, content, message'\cf4 \strokec4  \cb1 \
\cb3       \strokec6 \}),\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         status\strokec6 :\strokec4  \cf8 \strokec8 400\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Get token from request OR Supabase Secrets\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  githubToken \strokec6 =\strokec4  requestToken \strokec6 ||\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'GITHUB_TOKEN'\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (!\strokec4 githubToken\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  \cb1 \
\cb3         error\strokec6 :\strokec4  \cf5 \strokec5 'GitHub token not configured'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         hint\strokec6 :\strokec4  \cf5 \strokec5 'Set GITHUB_TOKEN in Supabase Secrets or provide token in request'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         env_check\strokec6 :\strokec4  \cf5 \strokec5 'GITHUB_TOKEN env var: '\cf4 \strokec4  \strokec6 +\strokec4  \strokec6 (\cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'GITHUB_TOKEN'\cf4 \strokec6 )\strokec4  \strokec6 ?\strokec4  \cf5 \strokec5 'exists'\cf4 \strokec4  \strokec6 :\strokec4  \cf5 \strokec5 'not found'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 \}),\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         status\strokec6 :\strokec4  \cf8 \strokec8 400\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Log token info (first/last 4 chars only for security)\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  tokenPreview \strokec6 =\strokec4  githubToken\strokec6 .\strokec4 substring\strokec6 (\cf8 \strokec8 0\cf4 \strokec6 ,\strokec4  \cf8 \strokec8 4\cf4 \strokec6 )\strokec4  \strokec6 +\strokec4  \cf5 \strokec5 '...'\cf4 \strokec4  \strokec6 +\strokec4  githubToken\strokec6 .\strokec4 substring\strokec6 (\strokec4 githubToken\strokec6 .\strokec4 length \strokec6 -\strokec4  \cf8 \strokec8 4\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 'Using token:'\cf4 \strokec6 ,\strokec4  tokenPreview\strokec6 );\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Encode content to base64\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  contentBase64 \strokec6 =\strokec4  btoa\strokec6 (\strokec4 unescape\strokec6 (\strokec4 encodeURIComponent\strokec6 (\strokec4 content\strokec6 )));\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Check if file exists\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  checkUrl \strokec6 =\strokec4  \cf5 \strokec5 `https://api.github.com/repos/\cf4 \strokec6 $\{\strokec4 owner\strokec6 \}\cf5 \strokec5 /\cf4 \strokec6 $\{\strokec4 repo\strokec6 \}\cf5 \strokec5 /contents/\cf4 \strokec6 $\{\strokec4 path\strokec6 \}\cf5 \strokec5 ?ref=\cf4 \strokec6 $\{\strokec4 branch\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  checkResponse \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  fetch\strokec6 (\strokec4 checkUrl\strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\strokec4 githubToken\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Accept'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/vnd.github.v3+json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'User-Agent'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'GeoVera-Supabase-Function'\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 let\cf4 \cb3 \strokec4  sha\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec4  \strokec6 |\strokec4  \cf2 \cb3 \strokec2 undefined\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 checkResponse\strokec6 .\strokec4 ok\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  existing \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  checkResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3       sha \strokec6 =\strokec4  existing\strokec6 .\strokec4 sha\strokec6 ;\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Create or update file\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  putUrl \strokec6 =\strokec4  \cf5 \strokec5 `https://api.github.com/repos/\cf4 \strokec6 $\{\strokec4 owner\strokec6 \}\cf5 \strokec5 /\cf4 \strokec6 $\{\strokec4 repo\strokec6 \}\cf5 \strokec5 /contents/\cf4 \strokec6 $\{\strokec4 path\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  putBody\strokec6 :\strokec4  \cf2 \cb3 \strokec2 any\cf4 \cb3 \strokec4  \strokec6 =\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       message\strokec6 ,\cb1 \strokec4 \
\cb3       content\strokec6 :\strokec4  contentBase64\strokec6 ,\cb1 \strokec4 \
\cb3       branch\cb1 \
\cb3     \strokec6 \};\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 sha\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       putBody\strokec6 .\strokec4 sha \strokec6 =\strokec4  sha\strokec6 ;\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  putResponse \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  fetch\strokec6 (\strokec4 putUrl\strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       method\strokec6 :\strokec4  \cf5 \strokec5 'PUT'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\strokec4 githubToken\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Accept'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/vnd.github.v3+json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'User-Agent'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'GeoVera-Supabase-Function'\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \},\cb1 \strokec4 \
\cb3       body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\strokec4 putBody\strokec6 )\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (!\strokec4 putResponse\strokec6 .\strokec4 ok\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  error \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  putResponse\strokec6 .\strokec4 text\strokec6 ();\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  \cb1 \
\cb3         error\strokec6 :\strokec4  \cf5 \strokec5 'GitHub API error'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         details\strokec6 :\strokec4  error\strokec6 ,\cb1 \strokec4 \
\cb3         status\strokec6 :\strokec4  putResponse\strokec6 .\strokec4 status\strokec6 ,\cb1 \strokec4 \
\cb3         token_preview\strokec6 :\strokec4  tokenPreview\cb1 \
\cb3       \strokec6 \}),\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         status\strokec6 :\strokec4  putResponse\strokec6 .\strokec4 status\strokec6 ,\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  result \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  putResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3       success\strokec6 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec6 ,\cb1 \strokec4 \
\cb3       message\strokec6 :\strokec4  \cf5 \strokec5 `File \cf4 \strokec6 $\{\strokec4 sha \strokec6 ?\strokec4  \cf5 \strokec5 'updated'\cf4 \strokec4  \strokec6 :\strokec4  \cf5 \strokec5 'created'\cf4 \strokec6 \}\cf5 \strokec5  successfully`\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       url\strokec6 :\strokec4  result\strokec6 .\strokec4 content\strokec6 .\strokec4 html_url\strokec6 ,\cb1 \strokec4 \
\cb3       commit\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         sha\strokec6 :\strokec4  result\strokec6 .\strokec4 commit\strokec6 .\strokec4 sha\strokec6 ,\cb1 \strokec4 \
\cb3         url\strokec6 :\strokec4  result\strokec6 .\strokec4 commit\strokec6 .\strokec4 url\cb1 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \}),\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3   \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 catch\cf4 \cb3 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  \cb1 \
\cb3       error\strokec6 :\strokec4  \cf5 \strokec5 'Internal server error'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       details\strokec6 :\strokec4  error\strokec6 .\strokec4 message \cb1 \
\cb3     \strokec6 \}),\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       status\strokec6 :\strokec4  \cf8 \strokec8 500\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
}