{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;\red83\green83\blue83;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c40000\c40000\c40000;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 (\cf2 \cb3 \strokec2 async\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf8 \cb3 \strokec8 // Get Supabase URL and anon key from environment\cf4 \cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  supabaseUrl \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'SUPABASE_URL'\cf4 \strokec6 )\strokec4  \strokec6 ||\strokec4  \cf5 \strokec5 ''\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  supabaseAnonKey \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'SUPABASE_ANON_KEY'\cf4 \strokec6 )\strokec4  \strokec6 ||\strokec4  \cf5 \strokec5 ''\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  html \strokec6 =\strokec4  \cf5 \strokec5 `<!DOCTYPE html>\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 <html lang="en">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 <head>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <meta charset="UTF-8">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <meta name="viewport" content="width=device-width, initial-scale=1.0">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <title>GeoVera - Google Sign In</title>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <style>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     * \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin: 0;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 0;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       box-sizing: border-box;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     body \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: linear-gradient(135deg, #f5f7fa 0%, #e8ecef 100%);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       min-height: 100vh;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: flex;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       align-items: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       justify-content: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 20px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .container \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: white;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 24px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       max-width: 480px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       width: 100%;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 48px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .logo \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       width: 64px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       height: 64px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: linear-gradient(135deg, #5f7a6b 0%, #4a6057 100%);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 16px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: flex;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       align-items: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       justify-content: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin: 0 auto 24px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .logo svg \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       width: 40px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       height: 40px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: white;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     h1 \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       text-align: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-size: 32px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: #1a1a1a;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin-bottom: 8px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .subtitle \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       text-align: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: #666;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin-bottom: 40px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-size: 16px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .status \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 16px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 12px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin-bottom: 24px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: none;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .status.success \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: #e8f5e9;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: #2e7d32;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border: 1px solid #81c784;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .status.error \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: #ffebee;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: #c62828;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border: 1px solid #ef5350;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .status.info \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: #e3f2fd;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: #1565c0;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border: 1px solid #90caf9;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .status.show \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: block;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .google-btn \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       width: 100%;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: white;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border: 2px solid #e0e0e0;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 12px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 16px 24px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-size: 16px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-weight: 500;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: #333;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       cursor: pointer;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       transition: all 0.2s;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: flex;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       align-items: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       justify-content: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       gap: 12px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .google-btn:hover \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-color: #5f7a6b;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       box-shadow: 0 4px 12px rgba(95, 122, 107, 0.2);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       transform: translateY(-2px);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .google-btn:disabled \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       opacity: 0.5;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       cursor: not-allowed;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .spinner \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border: 3px solid #f3f3f3;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-top: 3px solid #5f7a6b;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 50%;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       width: 24px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       height: 24px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       animation: spin 1s linear infinite;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: none;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     @keyframes spin \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       0% \{ transform: rotate(0deg); \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       100% \{ transform: rotate(360deg); \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .loading .spinner \{ display: block; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .loading .google-icon \{ display: none; \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .user-info \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: none;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin-top: 32px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 24px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: #f8faf9;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 12px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .user-info.show \{ display: block; \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .user-avatar \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       width: 64px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       height: 64px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 50%;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin: 0 auto 16px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: block;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border: 3px solid #5f7a6b;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .user-info h3 \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       text-align: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-size: 20px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin-bottom: 8px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .user-info p \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       text-align: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: #666;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin-bottom: 16px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .user-details \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: white;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 16px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 8px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-size: 13px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin-bottom: 16px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .user-details div \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: flex;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       justify-content: space-between;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 8px 0;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-bottom: 1px solid #f0f0f0;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .user-details div:last-child \{ border-bottom: none; \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .sign-out-btn \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       width: 100%;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: #ef5350;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: white;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border: none;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 8px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 12px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-size: 14px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       cursor: pointer;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .sign-out-btn:hover \{ background: #e53935; \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     .badge \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: inline-block;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 4px 12px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: #e8f5e9;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: #2e7d32;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 20px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-size: 12px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-weight: 600;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin-bottom: 24px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </style>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </head>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 <body>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <div class="container">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <div class="logo">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       </svg>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     </div>\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     <div style="text-align: center;">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <span class="badge">\uc0\u9989  Auto-Configured</span>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     </div>\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     <h1>GeoVera</h1>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <p class="subtitle">Tinggal klik Continue with Google!</p>\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     <div id="status" class="status"></div>\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     <button id="googleSignIn" class="google-btn">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <svg class="google-icon" width="24" height="24" viewBox="0 0 24 24">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       </svg>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <div class="spinner"></div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <span id="btnText">Continue with Google</span>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     </button>\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     <div id="userInfo" class="user-info">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <img id="userAvatar" class="user-avatar" src="" alt="">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <h3 id="userName"></h3>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <p id="userEmail"></p>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <div class="user-details">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <div><span>User ID:</span><strong id="userId"></strong></div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <div><span>Provider:</span><strong>Google</strong></div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <div><span>Created:</span><strong id="userCreated"></strong></div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <button id="signOut" class="sign-out-btn">Sign Out</button>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </div>\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5   <script>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     // \uc0\u9989  AUTO-CONFIGURED - No manual setup needed!\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     const SUPABASE_URL = '\cf4 \strokec6 $\{\strokec4 supabaseUrl\strokec6 \}\cf5 \strokec5 ';\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     const SUPABASE_ANON_KEY = '\cf4 \strokec6 $\{\strokec4 supabaseAnonKey\strokec6 \}\cf5 \strokec5 ';\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     const \{ createClient \} = supabase;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     const statusEl = document.getElementById('status');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     const googleBtn = document.getElementById('googleSignIn');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     const btnText = document.getElementById('btnText');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     const userInfoEl = document.getElementById('userInfo');\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     function showStatus(msg, type = 'info') \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       statusEl.textContent = msg;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       statusEl.className = \\`status \\$\{type\} show\\`;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       setTimeout(() => statusEl.classList.remove('show'), 5000);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     function setLoading(loading) \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       googleBtn.classList.toggle('loading', loading);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       googleBtn.disabled = loading;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       btnText.textContent = loading ? 'Signing in...' : 'Continue with Google';\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     function displayUser(user) \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       const meta = user.user_metadata || \{\};\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       document.getElementById('userAvatar').src = meta.avatar_url || \\`https://ui-avatars.com/api/?name=\\$\{encodeURIComponent(meta.full_name || user.email)\}\\`;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       document.getElementById('userName').textContent = meta.full_name || 'User';\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       document.getElementById('userEmail').textContent = user.email;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       document.getElementById('userId').textContent = user.id.substring(0, 8) + '...';\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       document.getElementById('userCreated').textContent = new Date(user.created_at).toLocaleDateString();\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       userInfoEl.classList.add('show');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       googleBtn.style.display = 'none';\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     function hideUser() \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       userInfoEl.classList.remove('show');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       googleBtn.style.display = 'flex';\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     googleBtn.addEventListener('click', async () => \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       setLoading(true);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       showStatus('Redirecting to Google...', 'info');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       try \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         const \{ error \} = await supabaseClient.auth.signInWithOAuth(\{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5           provider: 'google',\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5           options: \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5             redirectTo: window.location.href,\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5             queryParams: \{ access_type: 'offline', prompt: 'consent' \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5           \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         \});\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         if (error) throw error;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       \} catch (error) \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         showStatus('\uc0\u10060  ' + error.message, 'error');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         setLoading(false);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \});\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     document.getElementById('signOut').addEventListener('click', async () => \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       try \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         await supabaseClient.auth.signOut();\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         hideUser();\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         showStatus('\uc0\u9989  Signed out', 'success');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       \} catch (error) \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         showStatus('\uc0\u10060  ' + error.message, 'error');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \});\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     supabaseClient.auth.onAuthStateChange((event, session) => \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       if (event === 'SIGNED_IN' && session) \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         displayUser(session.user);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         showStatus('\uc0\u9989  Signed in!', 'success');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         setLoading(false);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       \} else if (event === 'SIGNED_OUT') \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         hideUser();\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \});\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     supabaseClient.auth.getSession().then((\{ data: \{ session \} \}) => \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       if (session?.user) \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         displayUser(session.user);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         showStatus('\uc0\u9989  Already signed in', 'success');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \});\cf4 \cb1 \strokec4 \
\
\cf5 \cb3 \strokec5     console.log('\uc0\u9989  Supabase configured automatically!');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     console.log('\uc0\u55357 \u56599  URL:', SUPABASE_URL);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     console.log('\uc0\u55357 \u56593  Anon key:', SUPABASE_ANON_KEY ? 'Loaded \u9989 ' : 'Missing \u10060 ');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </script>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </body>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </html>`\cf4 \strokec6 ;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\strokec4 html\strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'text/html; charset=utf-8'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       \cf5 \strokec5 'Cache-Control'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'public, max-age=300'\cf4 \cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\cb3   \strokec6 \});\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
}