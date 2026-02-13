{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;\red83\green83\blue83;\red19\green118\blue70;
\red107\green0\blue1;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c40000\c40000\c40000;\cssrgb\c3529\c52549\c34510;
\cssrgb\c50196\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 (\cf2 \cb3 \strokec2 async\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  url \strokec6 =\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 URL\cf4 \strokec6 (\strokec4 req\strokec6 .\strokec4 url\strokec6 );\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf8 \cb3 \strokec8 // CORS headers\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  corsHeaders \strokec6 =\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3     \cf5 \strokec5 'Access-Control-Allow-Methods'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'GET, POST, OPTIONS'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3     \cf5 \strokec5 'Access-Control-Allow-Headers'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'Content-Type, Authorization'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3   \strokec6 \};\cb1 \strokec4 \
\
\cb3   \cf8 \cb3 \strokec8 // Handle CORS preflight\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 .\strokec4 method \strokec6 ===\strokec4  \cf5 \strokec5 'OPTIONS'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf2 \cb3 \strokec2 null\cf4 \cb3 \strokec6 ,\strokec4  \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf9 \strokec9 204\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  corsHeaders \strokec6 \});\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf8 \cb3 \strokec8 // Proxy hero image from Storage\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 url\strokec6 .\strokec4 pathname \strokec6 ===\strokec4  \cf5 \strokec5 '/hero-image'\cf4 \strokec4  \strokec6 ||\strokec4  url\strokec6 .\strokec4 searchParams\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'asset'\cf4 \strokec6 )\strokec4  \strokec6 ===\strokec4  \cf5 \strokec5 'hero'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 try\cf4 \cb3 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  storageUrl \strokec6 =\strokec4  \cf5 \strokec5 'https://vozjwptzutolvkvfpknk.supabase.co/storage/v1/object/public/geotimeline-assets/kopi-kenangan-hero.jpeg'\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  response \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  fetch\strokec6 (\strokec4 storageUrl\strokec6 );\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (!\strokec4 response\strokec6 .\strokec4 ok\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf8 \cb3 \strokec8 // Fallback to Unsplash if storage image not found\cf4 \cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  fallbackUrl \strokec6 =\strokec4  \cf5 \strokec5 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&h=900&fit=crop&q=85'\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  fallbackResponse \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  fetch\strokec6 (\strokec4 fallbackUrl\strokec6 );\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\strokec4 fallbackResponse\strokec6 .\strokec4 body\strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3             \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'image/jpeg'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3             \cf5 \strokec5 'Cache-Control'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'public, max-age=31536000'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3             \strokec6 ...\strokec4 corsHeaders\strokec6 ,\cb1 \strokec4 \
\cb3           \strokec6 \},\cb1 \strokec4 \
\cb3         \strokec6 \});\cb1 \strokec4 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\strokec4 response\strokec6 .\strokec4 body\strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'image/jpeg'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Cache-Control'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'public, max-age=31536000, immutable'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \strokec6 ...\strokec4 corsHeaders\strokec6 ,\cb1 \strokec4 \
\cb3         \strokec6 \},\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\cb3     \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 catch\cf4 \cb3 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       console\strokec6 .\strokec4 error\strokec6 (\cf5 \strokec5 'Image proxy error:'\cf4 \strokec6 ,\strokec4  error\strokec6 );\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf5 \strokec5 'Image unavailable'\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf9 \strokec9 500\cf4 \strokec4  \strokec6 \});\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf8 \cb3 \strokec8 // Serve GeoTimeline HTML\cf4 \cb1 \strokec4 \
\cb3   \cf8 \cb3 \strokec8 // Using Storage URL as source to keep function small\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 try\cf4 \cb3 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  htmlUrl \strokec6 =\strokec4  \cf5 \strokec5 'https://vozjwptzutolvkvfpknk.supabase.co/storage/v1/object/public/geotimeline-assets/geotimeline-kopi-kenangan.html'\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  htmlResponse \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  fetch\strokec6 (\strokec4 htmlUrl\strokec6 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 htmlResponse\strokec6 .\strokec4 ok\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 let\cf4 \cb3 \strokec4  html \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  htmlResponse\strokec6 .\strokec4 text\strokec6 ();\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf8 \cb3 \strokec8 // Replace hero image URL to use Edge Function proxy (for better caching)\cf4 \cb1 \strokec4 \
\cb3       html \strokec6 =\strokec4  html\strokec6 .\strokec4 replace\strokec6 (\cb1 \strokec4 \
\cb3         \cf10 \cb3 \strokec10 /https:\\/\\/vozjwptzutolvkvfpknk\\.supabase\\.co\\/storage\\/v1\\/object\\/public\\/geotimeline-assets\\/kopi-kenangan-hero\\.jpeg/\cf2 \cb3 \strokec2 g\cf4 \cb3 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 URL\cf4 \strokec6 (\cf5 \strokec5 '/hero-image'\cf4 \strokec6 ,\strokec4  url\strokec6 .\strokec4 origin\strokec6 ).\strokec4 toString\strokec6 ()\cb1 \strokec4 \
\cb3       \strokec6 );\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\strokec4 html\strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'text/html; charset=utf-8'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Cache-Control'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'public, max-age=300, s-maxage=3600'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'X-Content-Type-Options'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'nosniff'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'X-Frame-Options'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'SAMEORIGIN'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \strokec6 ...\strokec4 corsHeaders\strokec6 ,\cb1 \strokec4 \
\cb3         \strokec6 \},\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\cb3   \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 catch\cf4 \cb3 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 error\strokec6 (\cf5 \strokec5 'HTML fetch error:'\cf4 \strokec6 ,\strokec4  error\strokec6 );\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf8 \cb3 \strokec8 // Fallback: Return minimal HTML with instructions\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  fallbackHtml \strokec6 =\strokec4  \cf5 \strokec5 `<!DOCTYPE html>\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 <html lang="id">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 <head>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <meta charset="UTF-8">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <meta name="viewport" content="width=device-width, initial-scale=1.0">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <title>GeoTimeline - Setup Required</title>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <style>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     body \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-family: -apple-system, BlinkMacSystemFont, sans-serif;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       max-width: 800px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin: 80px auto;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 40px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       line-height: 1.6;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: #1f1f1f;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     h1 \{ color: #5f7a6b; margin-bottom: 20px; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .info \{ background: #f5f8f6; padding: 20px; border-radius: 12px; margin: 20px 0; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     code \{ background: #eeebe6; padding: 2px 8px; border-radius: 4px; font-size: 14px; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     a \{ color: #5f7a6b; text-decoration: none; border-bottom: 1px solid #5f7a6b; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </style>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </head>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 <body>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <h1>\uc0\u9749  GeoTimeline - Kopi Kenangan</h1>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   \cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <div class="info">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <h2>\uc0\u55357 \u56523  Setup Instructions</h2>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <p>To view the GeoTimeline, please upload the HTML file to Supabase Storage:</p>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <ol>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <li>Go to <a href="https://supabase.com/dashboard/project/vozjwptzutolvkvfpknk/storage/buckets/geotimeline-assets" target="_blank">Supabase Storage Dashboard</a></li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <li>Upload <code>geotimeline-kopi-kenangan.html</code></li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <li>Upload <code>kopi-kenangan-hero.jpeg</code></li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <li>Refresh this page</li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     </ol>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   \cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <div class="info">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <h2>\uc0\u55357 \u56599  Alternative Access</h2>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <p>Direct Storage URL (after upload):</p>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <p><code>https://vozjwptzutolvkvfpknk.supabase.co/storage/v1/object/public/geotimeline-assets/geotimeline-kopi-kenangan.html</code></p>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   \cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <div class="info">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <h2>\uc0\u10024  What You'll See</h2>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <ul>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <li>Full-screen hero with Kopi Kenangan interior</li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <li>15 timeline milestones (2007-2026)</li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <li>Interactive animations and graphics</li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <li>Mobile-optimized design (100vh hero)</li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <li>Brand DNA analysis</li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <li>Distributed testimonials</li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     </ul>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </body>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </html>`\cf4 \strokec6 ;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\strokec4 fallbackHtml\strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'text/html; charset=utf-8'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       \strokec6 ...\strokec4 corsHeaders\strokec6 ,\cb1 \strokec4 \
\cb3     \strokec6 \},\cb1 \strokec4 \
\cb3   \strokec6 \});\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
}