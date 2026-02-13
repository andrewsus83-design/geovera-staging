# GeoVera Frontend

Frontend untuk GeoVera Brand Intelligence Platform.

## 🚀 Deploy ke Vercel

### **Opsi 1: Deploy via Vercel CLI (Recommended)**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login ke Vercel**
```bash
vercel login
```

3. **Deploy dari folder frontend**
```bash
cd frontend
vercel
```

4. **Deploy ke production**
```bash
vercel --prod
```

### **Opsi 2: Deploy via Vercel Dashboard**

1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub/GitLab/Bitbucket
3. Click **"Add New Project"**
4. Import repository atau upload folder `frontend`
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (atau leave blank)
   - **Build Command**: (leave blank)
   - **Output Directory**: `./` (atau leave blank)
6. Click **"Deploy"**

### **Opsi 3: Connect GitHub Repository**

1. Push folder `frontend` ke GitHub repository
2. Di Vercel Dashboard, click **"Import Project"**
3. Connect GitHub repository
4. Vercel akan auto-deploy setiap kali ada push ke `main` branch

## 📁 Structure

```
frontend/
├── login.html          # Login/Signup page
├── onboarding.html     # Typeform-style onboarding wizard
├── pricing.html        # Subscription plans (belum dibuat)
├── dashboard.html      # Main dashboard (belum dibuat)
├── vercel.json         # Vercel configuration
├── package.json        # NPM metadata
└── README.md           # Documentation
```

## 🔧 Configuration

### **Environment Variables di Vercel**

Tidak perlu environment variables karena Supabase URL dan Anon Key sudah ada di HTML files. Tapi jika ingin lebih secure, bisa menggunakan Vercel environment variables:

1. Di Vercel Dashboard → Project Settings → Environment Variables
2. Tambahkan:
   - `VITE_SUPABASE_URL` = `https://vozjwptzutolvkvfpknk.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGci...` (anon key)

### **Custom Domain**

Setelah deploy, tambahkan custom domain:

1. Vercel Dashboard → Project → Settings → Domains
2. Tambahkan domain (e.g., `geovera.com`, `app.geovera.com`)
3. Update DNS records sesuai instruksi Vercel
4. SSL certificate akan auto-generated oleh Vercel

## 🌐 Routes

- `/` → Login page (default)
- `/login` → Login page
- `/onboarding` → Onboarding wizard
- `/pricing` → Pricing page (belum dibuat)
- `/dashboard` → Dashboard (belum dibuat)

## 🔐 Security Headers

Vercel config sudah include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📊 Analytics

Vercel menyediakan analytics gratis untuk monitoring:
- Page views
- Unique visitors
- Top pages
- Real-time traffic

Aktifkan di: Project Settings → Analytics

## ⚡ Performance

- **Edge Network**: Deploy di 100+ edge locations worldwide
- **CDN**: Static assets auto-cached
- **Compression**: Gzip/Brotli enabled by default
- **HTTP/2**: Enabled by default

## 🔄 Continuous Deployment

Jika connect dengan GitHub:
- Push ke `main` branch → Auto deploy ke production
- Push ke branch lain → Auto deploy ke preview URL
- Pull Request → Auto generate preview URL

## 📝 Notes

- Semua HTML files menggunakan **Tailwind CDN** (no build step needed)
- Supabase Client JS loaded via CDN
- Pure static site (no server-side rendering)
- Fast deployment (< 30 detik)

## 🆘 Troubleshooting

### Deploy gagal?
- Pastikan `vercel.json` ada di root folder `frontend`
- Pastikan semua `.html` files ada
- Check Vercel deployment logs

### Routes tidak bekerja?
- Check `vercel.json` routes configuration
- Vercel akan redirect `/onboarding` → `/onboarding.html`

### CORS error?
- Supabase Edge Functions sudah enable CORS
- Check Supabase Function logs jika masih error

## 📞 Support

Jika ada issue dengan deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- Vercel deployment logs di dashboard
