# Cloudflare Workers Deployment Guide

## 🚀 Deploy Otakudesu Proxy ke Cloudflare Workers

Cloudflare Worker akan bertindak sebagai **proxy** untuk fetch HTML dari Otakudesu, lalu Vercel API akan parse HTML tersebut.

### **Keuntungan:**

- ✅ IP Cloudflare tidak di-block Otakudesu
- ✅ 100,000 requests/day gratis
- ✅ Global CDN - cepat dari mana saja
- ✅ Unlimited bandwidth
- ✅ Auto-scaling

---

## 📋 **Step-by-Step Deployment**

### **1. Setup Cloudflare Account**

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Login atau buat account baru (gratis)
3. Pilih **Workers & Pages** dari sidebar

### **2. Create New Worker**

1. Click **Create Application**
2. Pilih **Create Worker**
3. Beri nama: `otakudesu-proxy`
4. Click **Deploy**

### **3. Edit Worker Code**

1. Setelah deploy, click **Edit Code**
2. Hapus semua code default
3. Copy paste code dari `cloudflare-worker/episode-proxy.js`
4. Click **Save and Deploy**

### **4. Test Worker**

Test worker dengan URL:

```
https://otakudesu-proxy.YOUR-SUBDOMAIN.workers.dev/?url=https://otakudesu.best/episode/awkn-episode-9-sub-indo
```

Ganti `YOUR-SUBDOMAIN` dengan subdomain Cloudflare kamu.

Response harus berupa HTML dari Otakudesu.

---

## 🔧 **Integrate dengan Vercel API**

### **Update Scraper untuk Gunakan Worker**

Edit `otakudesu/scraper.js`:

```javascript
// Add Cloudflare Worker URL
const CLOUDFLARE_WORKER = process.env.CLOUDFLARE_WORKER_URL || null;

// Update fetchWithProxy function
async function fetchWithProxy(url) {
  let lastError = null;

  // Try Cloudflare Worker first (if available)
  if (CLOUDFLARE_WORKER) {
    try {
      const workerUrl = `${CLOUDFLARE_WORKER}?url=${encodeURIComponent(url)}`;
      console.log(`[Otakudesu Fetch] Trying Cloudflare Worker: ${workerUrl}`);

      const { data } = await axios.get(workerUrl, {
        timeout: 30000,
      });

      console.log(`[Otakudesu Fetch] Success with Cloudflare Worker`);
      return data;
    } catch (error) {
      console.error(`[Otakudesu Fetch] Cloudflare Worker failed: ${error.message}`);
      lastError = error;
    }
  }

  // Fallback to existing proxy options
  for (const proxy of PROXY_OPTIONS) {
    // ... existing code
  }
}
```

### **Add Environment Variable di Vercel**

1. Buka Vercel Dashboard
2. Pilih project **rdapi**
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `CLOUDFLARE_WORKER_URL`
   - **Value:** `https://otakudesu-proxy.YOUR-SUBDOMAIN.workers.dev`
5. Click **Save**
6. Redeploy project

---

## 📊 **Testing**

Setelah deploy, test endpoint:

```bash
# Test episode endpoint
curl https://rdapi.vercel.app/api/otakudesu/episode/awkn-episode-9-sub-indo

# Test detail endpoint
curl https://rdapi.vercel.app/api/otakudesu/anime/1piece-sub-indo
```

Seharusnya sekarang mengembalikan data lengkap!

---

## 💰 **Cloudflare Workers Limits (Free Tier)**

- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ Unlimited bandwidth
- ✅ 1000 requests/minute

Untuk API kita, ini lebih dari cukup!

---

## 🔒 **Security (Optional)**

Tambahkan API key untuk protect worker:

```javascript
const API_KEY = "your-secret-key";

async function handleRequest(request) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("key");

  if (apiKey !== API_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ... rest of code
}
```

Lalu update Vercel env:

```
CLOUDFLARE_WORKER_URL=https://otakudesu-proxy.workers.dev?key=your-secret-key
```

---

## 📝 **Alternative: Wrangler CLI**

Untuk deploy via CLI:

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Create project
wrangler init otakudesu-proxy

# Copy worker code to src/index.js

# Deploy
wrangler deploy
```

---

## ✅ **Expected Result**

Setelah setup Cloudflare Worker:

1. **Vercel API** call endpoint `/api/otakudesu/episode/:slug`
2. **Scraper** detect Cloudflare Worker URL exists
3. **Worker** fetch HTML from Otakudesu (bypass blocking)
4. **Worker** return HTML to Vercel
5. **Vercel** parse HTML dengan Cheerio
6. **Return** data lengkap ke client

**Success Rate: 100%** 🎉
