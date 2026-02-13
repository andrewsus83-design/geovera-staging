{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf7 \strokec7 HTML\cf4 \strokec4  \strokec6 =\strokec4  \cf5 \strokec5 `<!DOCTYPE html>\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf5 \cb3 \strokec5 <html lang="en">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 <head>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <meta charset="UTF-8">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <meta name="viewport" content="width=device-width, initial-scale=1.0">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <title>GeoVera - Welcome</title>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <style>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     :root \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       --sage: #5f7a6b;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       --sage-dark: #4a6057;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       --sage-light: #7a9588;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       --sage-pale: #e8f0ed;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       --cream: #faf8f4;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       --charcoal: #2d2d2d;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     * \{ margin: 0; padding: 0; box-sizing: border-box; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     body \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-family: 'DM Sans', -apple-system, sans-serif;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: var(--cream);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       color: var(--charcoal);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       overflow-x: hidden;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       min-height: 100vh;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: flex;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       align-items: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       justify-content: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .container \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       max-width: 500px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       width: 100%;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 48px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: white;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 24px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       box-shadow: 0 20px 60px rgba(95, 122, 107, 0.1);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     h1 \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-family: 'Playfair Display', serif;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-size: 32px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin-bottom: 32px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       text-align: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .btn \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       width: 100%;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       padding: 16px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-radius: 12px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border: 2px solid #e8e8e8;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       background: white;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-size: 15px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       font-weight: 600;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       cursor: pointer;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       display: flex;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       align-items: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       justify-content: center;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       gap: 12px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       margin-bottom: 16px;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       transition: all 0.3s;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .btn:hover \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       border-color: var(--sage);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       transform: translateY(-2px);\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     .loading \{ opacity: 0.6; cursor: not-allowed; \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </style>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </head>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 <body>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <div class="container">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <h1>\uc0\u55357 \u56960  GeoVera Auth</h1>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <button id="googleBtn" class="btn">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       <svg width="20" height="20" viewBox="0 0 24 24">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       </svg>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       Continue with Google\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     </button>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     <p style="text-align: center; font-size: 14px; color: #666;">\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       \uc0\u9989  Deployed via Supabase Edge Functions!\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     </p>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </div>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   <script>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     const \{ createClient \} = supabase;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     const client = createClient('https://vozjwptzutolvkvfpknk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvenp3cHR6dXRvbHZrdmZwa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTE2OTgsImV4cCI6MjA1NDA2NzY5OH0.nMqKNmHgNb5N_LV1ZJdqZzWoBZXVD_AXkZs9VPxT1B8');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     document.getElementById('googleBtn').addEventListener('click', async () => \{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       const btn = event.target;\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       btn.classList.add('loading');\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       await client.auth.signInWithOAuth(\{\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         provider: 'google',\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5         options: \{ redirectTo: window.location.origin + '/home-page' \}\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5       \});\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5     \});\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5   </script>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </body>\cf4 \cb1 \strokec4 \
\cf5 \cb3 \strokec5 </html>`\cf4 \strokec6 ;\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 (()\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf7 \strokec7 HTML\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'text/html; charset=utf-8'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       \cf5 \strokec5 'Cache-Control'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'public, max-age=3600'\cf4 \cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\cb3   \strokec6 \});\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
}