{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;\red19\green118\blue70;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 ((\strokec4 req\strokec6 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  html \strokec6 =\strokec4  \cf5 \strokec5 `<!DOCTYPE html>\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 <html lang="id">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 <head>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <meta charset="UTF-8">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <meta name="viewport" content="width=device-width, initial-scale=1.0">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <title>GeoTimeline - Kopi Kenangan</title>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <style>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     * \{ margin: 0; padding: 0; box-sizing: border-box; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     body \{ font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f7f5f2; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .hero \{ position: relative; min-height: 100vh; display: flex; align-items: flex-end; overflow: hidden; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .hero img \{ position: absolute; width: 100%; height: 100%; object-fit: cover; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .hero-overlay \{ position: absolute; width: 100%; height: 100%; background: linear-gradient(to top, rgba(31,31,31,0.92) 0%, transparent 100%); \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .hero-content \{ position: relative; z-index: 3; color: white; padding: 42px 28px; max-width: 840px; margin: 0 auto; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .badge \{ display: inline-flex; gap: 8px; padding: 8px 16px; background: rgba(255,255,255,0.15); backdrop-filter: blur(12px); border-radius: 999px; font-size: 18px; margin-bottom: 16px; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     h1 \{ font-size: 2.8rem; line-height: 1.15; margin-bottom: 16px; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .excerpt \{ font-size: 1.05rem; line-height: 1.7; opacity: 0.95; max-width: 800px; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .scroll-hint \{ position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); font-size: 24px; animation: bounce 2s infinite; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     @keyframes bounce \{ 0%, 100% \{ transform: translateX(-50%) translateY(0); \} 50% \{ transform: translateX(-50%) translateY(8px); \} \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     @media (max-width: 768px) \{ h1 \{ font-size: 1.85rem; \} .hero-content \{ padding: 28px 14px; \} \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </style>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </head>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 <body>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <div class="hero">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&h=900&fit=crop&q=85" alt="Kopi Kenangan">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <div class="hero-overlay"></div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <div class="hero-content">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <div class="badge">\uc0\u9749  Brand Chronicle</div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <h1>Dari Warung Kopi Jakarta<br>ke Unicorn Asia Tenggara</h1>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <p class="excerpt">Perjalanan Kopi Kenangan mengubah lanskap industri kopi Indonesia dalam waktu kurang dari satu dekade. Dari modal \\$15,000 di tahun 2017, menjadi brand bernilai \\$1 miliar dengan 900+ outlet di 5 negara.</p>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <div class="scroll-hint">\uc0\u8595 </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <div style="text-align: center; padding: 60px 20px; max-width: 800px; margin: 0 auto;">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <h2 style="color: #5f7a6b; margin-bottom: 20px;">\uc0\u55356 \u57225  GeoTimeline Edge Function Active!</h2>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <p style="line-height: 1.8; color: #4a4a4a; margin-bottom: 30px;">Full GeoTimeline dengan 15 milestones, timeline interaktif, dan mobile graphics sedang loading...</p>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <div style="background: #f5f8f6; padding: 30px; border-radius: 18px; margin: 30px 0;">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <h3 style="color: #5f7a6b; margin-bottom: 15px;">\uc0\u55357 \u56523  Untuk melihat full version:</h3>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <ol style="text-align: left; line-height: 2; color: #1f1f1f; padding-left: 40px;">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <li>Download file HTML dari Claude</li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <li>Upload ke Supabase Storage (bucket: geotimeline-assets)</li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <li>Edge Function akan auto-load full content</li>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       </ol>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <p style="color: #767676; font-size: 14px;">Edge Function: <code style="background: #eeebe6; padding: 4px 8px; border-radius: 4px;">geotimeline-live</code></p>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </body>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </html>`\cf4 \strokec6 ;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\strokec4 html\strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     status\strokec6 :\strokec4  \cf8 \strokec8 200\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3     headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'text/html; charset=utf-8'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       \cf5 \strokec5 'Cache-Control'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'public, max-age=60'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3     \strokec6 \},\cb1 \strokec4 \
\cb3   \strokec6 \});\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
}