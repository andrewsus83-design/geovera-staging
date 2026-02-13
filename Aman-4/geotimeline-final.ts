{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red14\green110\blue109;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue0;\red0\green0\blue255;\red144\green1\blue18;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c0\c50196\c50196;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c0;\cssrgb\c0\c0\c100000;\cssrgb\c63922\c8235\c8235;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 Deno\cf4 \strokec5 .\strokec4 serve\strokec5 ((\strokec4 req\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf6 \cb3 \strokec6 return\cf4 \cb3 \strokec4  \cf6 \cb3 \strokec6 new\cf4 \cb3 \strokec4  \cf2 \strokec2 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3     \cf7 \strokec7 `<!DOCTYPE html>\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 <html lang="id">\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 <head>\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7   <meta charset="UTF-8">\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7   <meta name="viewport" content="width=device-width, initial-scale=1.0">\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7   <title>GeoTimeline Test</title>\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 </head>\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 <body style="font-family: -apple-system; padding: 40px; background: #f7f5f2;">\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7   <h1 style="color: #5f7a6b;">\uc0\u9989  Success!</h1>\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7   <p>HTML rendering works properly!</p>\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7   <p>Your browser: <code>\cf4 \strokec5 $\{\strokec4 req\strokec5 .\strokec4 headers\strokec5 .\cf6 \cb3 \strokec6 get\cf4 \cb3 \strokec5 (\cf7 \strokec7 'user-agent'\cf4 \strokec5 )?.\strokec4 slice\strokec5 (\cf8 \strokec8 0\cf4 \strokec5 ,\strokec4  \cf8 \strokec8 50\cf4 \strokec5 )\}\cf7 \strokec7 </code></p>\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 </body>\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7 </html>`\cf4 \strokec5 ,\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3     \strokec5 \{\cb1 \strokec4 \
\cb3       status\strokec5 :\strokec4  \cf8 \strokec8 200\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       headers\strokec5 :\strokec4  \cf6 \cb3 \strokec6 new\cf4 \cb3 \strokec4  \cf2 \strokec2 Headers\cf4 \strokec5 (\{\cb1 \strokec4 \
\cb3         \cf7 \strokec7 'Content-Type'\cf4 \strokec5 :\strokec4  \cf7 \strokec7 'text/html; charset=utf-8'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         \cf7 \strokec7 'X-Content-Type-Options'\cf4 \strokec5 :\strokec4  \cf7 \strokec7 'nosniff'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \strokec5 \}),\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3   \strokec5 );\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \});\cb1 \strokec4 \
}