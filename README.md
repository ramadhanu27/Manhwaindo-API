# 🎨 Manhwaindo API

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/136323687?v=4" alt="Ramadhanu Avatar" width="100" height="100" style="border-radius: 50%;" />
  <p><strong>Ramadhanu</strong></p>
</div>

Express.js API scraper untuk [manhwaindo.app](https://manhwaindo.app) dengan caching intelligent dan real-time status monitoring.

[![Netlify Status](https://api.netlify.com/api/v1/badges/274ed6e9-36d4-4ed4-97f1-b24345a5a46a/deploy-status)](https://app.netlify.com/projects/apimanhwa/deploys)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 🚀 Fitur

- ✅ Mendapatkan daftar manhwa terbaru dengan pagination
- ✅ Mendapatkan manhwa populer real-time
- ✅ Mendapatkan detail manhwa lengkap dengan metadata
- ✅ Mendapatkan gambar chapter berkualitas tinggi
- ✅ Pencarian manhwa yang powerful
- ✅ CORS enabled untuk akses cross-origin
- ✅ Error handling yang robust
- ✅ Intelligent caching (10 menit TTL)
- ✅ Real-time status monitoring
- ✅ Deployed di Netlify Functions (Serverless)

## 🌐 Live Demo

API sudah di-deploy di Netlify dan dapat diakses secara publik:

**Base URL:** https://apimanhwa.netlify.app

**Documentation:** https://apimanhwa.netlify.app (dengan live status monitoring)

## 📦 Instalasi Lokal

```bash
# Clone repository
git clone https://github.com/ramadhanu27/Manhwaindo-API.git
cd Manhwaindo-API

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Jalankan server (development)
npm run dev

# Jalankan server (production)
npm start
```

## 🚀 Deployment ke Netlify

1. Push code ke GitHub
2. Connect repository ke Netlify
3. Netlify akan otomatis deploy dengan konfigurasi `netlify.toml`
4. API akan tersedia di `https://your-site.netlify.app/api/*`

## 🔧 Konfigurasi

Edit file `.env`:

```env
PORT=3000
BASE_URL=https://manhwaindo.app
```

## 📚 API Endpoints

### 1. API Info
```
GET /api
```

**Response:**
```json
{
  "success": true,
  "message": "Manhwaindo API",
  "version": "1.0.0",
  "endpoints": {
    "latest": "/api/latest?page=1",
    "popular": "/api/popular",
    "detail": "/api/series/:slug",
    "chapter": "/api/chapter/:slug",
    "search": "/api/search?q=query"
  }
}
```

### 2. Latest Updates
```
GET /api/latest?page=1
```

**Parameters:**
- `page` (optional): Nomor halaman (default: 1)

**Response:**
```json
{
  "success": true,
  "page": 1,
  "data": [
    {
      "title": "Doctor's Rebirth ID",
      "slug": "doctors-rebirth-id",
      "image": "https://...",
      "type": "Manhwa",
      "rating": "8.5",
      "url": "https://manhwaindo.app/series/doctors-rebirth-id/",
      "chapters": [
        {
          "title": "Ch. 210",
          "url": "https://manhwaindo.app/doctors-rebirth-id-chapter-210/",
          "slug": "doctors-rebirth-id-chapter-210"
        }
      ]
    }
  ]
}
```

### 3. Popular Manhwa
```
GET /api/popular
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "title": "Kucing Oren Galak",
      "slug": "kucing-oren-galak",
      "image": "https://...",
      "type": "Manhwa",
      "rating": "8",
      "latestChapter": "Chapter 377",
      "url": "https://manhwaindo.app/series/kucing-oren-galak/"
    }
  ]
}
```

### 4. Series Detail
```
GET /api/series/:slug
```

**Example:**
```
GET /api/series/doctors-rebirth-id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Doctor's Rebirth ID",
    "alternativeTitle": "의사생활",
    "slug": "doctors-rebirth-id",
    "image": "https://...",
    "rating": "8.5",
    "type": "Manhwa",
    "status": "Ongoing",
    "synopsis": "...",
    "genres": ["Action", "Fantasy", "Medical"],
    "url": "https://manhwaindo.app/series/doctors-rebirth-id/",
    "chapters": [
      {
        "title": "Chapter 210",
        "slug": "doctors-rebirth-id-chapter-210",
        "url": "https://manhwaindo.app/doctors-rebirth-id-chapter-210/",
        "releaseDate": "13 menit ago"
      }
    ]
  }
}
```

### 5. Chapter Images
```
GET /api/chapter/:slug
```

**Example:**
```
GET /api/chapter/doctors-rebirth-id-chapter-210
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Doctor's Rebirth ID Chapter 210",
    "slug": "doctors-rebirth-id-chapter-210",
    "images": [
      "https://...",
      "https://..."
    ],
    "prevChapter": "doctors-rebirth-id-chapter-209",
    "nextChapter": null,
    "totalImages": 45
  }
}
```

### 6. Search
```
GET /api/search?q=query
```

**Parameters:**
- `q` (required): Kata kunci pencarian

**Example:**
```
GET /api/search?q=doctor
```

**Response:**
```json
{
  "success": true,
  "query": "doctor",
  "data": [
    {
      "title": "Doctor's Rebirth ID",
      "slug": "doctors-rebirth-id",
      "image": "https://...",
      "type": "Manhwa",
      "rating": "8.5",
      "url": "https://manhwaindo.app/series/doctors-rebirth-id/"
    }
  ]
}
```

## 🛠️ Tech Stack

- **Express.js** - Web framework
- **Axios** - HTTP client
- **Cheerio** - HTML parser
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables
- **Node-Cache** - In-memory caching
- **Serverless-HTTP** - Netlify Functions adapter
- **Netlify Functions** - Serverless deployment

## 📊 Architecture

```
┌─────────────────────────────────────┐
│   Client Request                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Netlify Functions (Serverless)    │
│   /.netlify/functions/api           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Express.js App                    │
│   - CORS Middleware                 │
│   - Cache Middleware (10min TTL)    │
│   - API Routes                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Manhwaindo.app (Target)           │
│   - Web Scraping                    │
│   - Data Extraction                 │
└─────────────────────────────────────┘
```

## 📝 Notes

- API ini melakukan scraping real-time dari manhwaindo.app
- Gunakan dengan bijak dan jangan spam request
- Response time tergantung kecepatan website target
- Caching otomatis 10 menit untuk mengurangi beban server
- Semua request di-log untuk monitoring

## 🔐 Rate Limiting

Untuk production, disarankan menggunakan rate limiting middleware:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // limit 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🐛 Troubleshooting

**Error: "Cannot find module"**
```bash
npm install
```

**Port already in use**
```bash
# Ubah PORT di .env atau gunakan port lain
PORT=3001 npm start
```

**API tidak merespons**
- Pastikan internet connection aktif
- Cek apakah manhwaindo.app masih online
- Lihat console logs untuk error details

## 📞 Support & Contact

- **GitHub:** [ramadhanu27](https://github.com/ramadhanu27)
- **Issues:** [Report Bug](https://github.com/ramadhanu27/Manhwaindo-API/issues)

## ⚠️ Disclaimer

API ini dibuat untuk tujuan edukasi. Pastikan Anda mematuhi Terms of Service dari website yang di-scrape. Penulis tidak bertanggung jawab atas penggunaan yang melanggar hukum.

## 📄 License

ISC License - Silakan gunakan dan modifikasi sesuai kebutuhan Anda.

---

<div align="center">
  <p>Made with ❤️ by Ramadhanu</p>
  <p>⭐ Jika project ini membantu, jangan lupa kasih star! ⭐</p>
</div>
