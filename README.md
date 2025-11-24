# 🎨 Manhwaindo API

<div align="center">
  <img src="https://avatars.githubusercontent.com/u/136323687?v=4" alt="Ramadhanu Avatar" width="100" height="100" style="border-radius: 50%;" />
  <p><strong>Ramadhanu</strong></p>
</div>

Express.js API scraper untuk [manhwaindo.app](https://manhwaindo.app) dengan caching intelligent dan real-time status monitoring.

[![Netlify Status](https://api.netlify.com/api/v1/badges/274ed6e9-36d4-4ed4-97f1-b24345a5a46a/deploy-status)](https://app.netlify.com/projects/apimanhwa/deploys)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## 🚀 Fitur

- ✅ **Project Updates** - Manhwa dengan update terbaru (dengan waktu rilis)
- ✅ **Latest Update** - Daftar manhwa yang baru diupdate
- ✅ **Popular Manhwa** - Manhwa populer real-time
- ✅ **Series List** - Daftar semua series dengan filter (order, type, status)
- ✅ **Genres List** - Daftar semua genre yang tersedia
- ✅ **Series Detail** - Detail lengkap dengan metadata dan dynamic view counter
- ✅ **Chapter Images** - Gambar chapter dengan navigasi prev/next
- ✅ **Download ZIP** - Download chapter sebagai file ZIP
- ✅ **Download PDF** - Download chapter sebagai file PDF
- ✅ **Search** - Pencarian manhwa yang powerful
- ✅ **CORS Enabled** - Akses cross-origin
- ✅ **Intelligent Caching** - 10 menit TTL
- ✅ **Error Handling** - Robust error handling
- ✅ **Serverless Ready** - Deployed di Netlify Functions

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
    "project": "/api/project?page=1 (Project Updates)",
    "lastupdate": "/api/lastupdate?page=1 (Latest Update)",
    "popular": "/api/popular",
    "seriesList": "/api/series-list?page=1 (All Series List)",
    "detail": "/api/series/:slug",
    "chapter": "/api/chapter/:slug",
    "search": "/api/search?q=query"
  }
}
```

### 2. Project Updates

```
GET /api/project?page=1
```

**Parameters:**

- `page` (optional): Nomor halaman (default: 1, max: 1)

**Response:**

```json
{
  "success": true,
  "page": 1,
  "data": [
    {
      "title": "Surviving the Cataclysm",
      "slug": "surviving-the-cataclysm",
      "image": "https://...",
      "type": "Manhwa",
      "rating": "",
      "url": "https://manhwaindo.app/series/surviving-the-cataclysm/",
      "chapters": [
        {
          "title": "Ch. 12",
          "url": "https://manhwaindo.app/surviving-the-cataclysm-chapter-12/",
          "slug": "surviving-the-cataclysm-chapter-12",
          "time": "7 jam ago"
        }
      ]
    }
  ]
}
```

### 3. Latest Update

```
GET /api/lastupdate?page=1
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
      "title": "Momose Akira no Hatsukoi Hatan-chuu",
      "slug": "momose-akira-no-hatsukoi-hatan-chuu",
      "image": "https://...",
      "type": "Manhwa",
      "rating": "",
      "url": "https://manhwaindo.app/series/momose-akira-no-hatsukoi-hatan-chuu/",
      "chapters": [
        {
          "title": "Ch. 24",
          "url": "https://...",
          "slug": "momose-akira-no-hatsukoi-hatan-chuu-chapter-24",
          "time": "2 menit ago"
        }
      ]
    }
  ]
}
```

### 4. Popular Manhwa

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

### 5. Series List (dengan Filter)

```
GET /api/series-list?page=1&order=update&type=manhwa&status=ongoing
```

**Parameters:**

- `page` (optional): Nomor halaman (default: 1, max: 227)
- `order` (optional): Urutan (update, popular, latest, title)
- `type` (optional): Tipe (manhwa, manhua, manga)
- `status` (optional): Status (ongoing, completed, hiatus)

**Note:** Genre filter tidak tersedia di endpoint ini. Gunakan `/api/genres` untuk mendapatkan daftar genre.

**Response:**

```json
{
  "success": true,
  "page": 1,
  "filters": {
    "order": "update",
    "type": "manhwa",
    "status": "ongoing"
  },
  "totalSeries": 24,
  "data": [
    {
      "title": "Solo Leveling",
      "slug": "solo-leveling",
      "image": "https://...",
      "type": "Manhwa",
      "rating": "9.8",
      "latestChapter": "Chapter 179",
      "url": "https://manhwaindo.app/series/solo-leveling/"
    }
  ]
}
```

### 6. Genres List

```
GET /api/genres
```

**Description:** Mendapatkan daftar semua genre yang tersedia beserta ID-nya.

**Response:**

```json
{
  "success": true,
  "totalGenres": 224,
  "data": [
    {
      "id": "2",
      "name": "Action",
      "slug": "action"
    },
    {
      "id": "17",
      "name": "Romance",
      "slug": "romance"
    },
    {
      "id": "23",
      "name": "Fantasy",
      "slug": "fantasy"
    }
  ]
}
```

### 7. Series Detail

```
GET /api/series/:slug
```

**Example:**

```
GET /api/series/solo-leveling
```

**Response:**

```json
{
  "success": true,
  "data": {
    "title": "Solo Leveling",
    "alternativeTitle": "나 혼자만 레벨업",
    "slug": "solo-leveling",
    "image": "https://...",
    "rating": "9.8",
    "status": "Completed",
    "type": "Manhwa",
    "released": "2018",
    "author": "Chugong",
    "artist": "DUBU (REDICE STUDIO)",
    "postedBy": "Ramadhanu",
    "postedOn": "November 19, 2024",
    "updatedOn": "November 19, 2024",
    "views": "1.2M",
    "followers": "15K",
    "synopsis": "...",
    "genres": ["Action", "Adventure", "Fantasy"],
    "url": "https://manhwaindo.app/series/solo-leveling/",
    "totalChapters": 179,
    "chapters": [
      {
        "title": "Chapter 179",
        "slug": "solo-leveling-chapter-179",
        "url": "https://manhwaindo.app/solo-leveling-chapter-179/",
        "releaseDate": "13 menit ago"
      }

- `q` (required): Kata kunci pencarian

**Example:**

```

GET /api/search?q=solo

````

**Response:**

```json
{
  "success": true,
  "query": "solo",
  "data": [
    {
      "title": "Solo Leveling",
      "slug": "solo-leveling",
      "image": "https://...",
      "type": "Manhwa",
      "rating": "9.8",
      "url": "https://manhwaindo.app/series/solo-leveling/"
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables
- **Node-Cache** - In-memory caching (10 menit TTL)
- **Archiver** - ZIP file creation
- **PDFKit** - PDF generation
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
│   - Dynamic View Counter (AJAX)     │
└─────────────────────────────────────┘
```

## ✨ Fitur Unggulan

### 1. Dynamic View Counter

API menggunakan AJAX request ke `admin-ajax.php` untuk mendapatkan view count yang akurat secara real-time.

### 2. Intelligent Chapter Navigation

Triple fallback system untuk mendapatkan prev/next chapter:

- **Method 1:** Breadcrumb link extraction
- **Method 2:** Title parsing (untuk series tanpa breadcrumb)
- **Method 3:** Slug pattern extraction

### 3. Advanced Filtering

Series list mendukung multiple filter:

- Order by: update, popular, latest, title
- Type: manhwa, manhua, manga
- Status: ongoing, completed, hiatus
- Genre: action, romance, fantasy, dll

### 4. Caching Strategy

- Cache duration: 10 menit
- Automatic cache invalidation
- Reduced server load
- Faster response time

## 📝 Notes

- API ini melakukan scraping real-time dari manhwaindo.app
- Gunakan dengan bijak dan jangan spam request
- Response time tergantung kecepatan website target
- Caching otomatis 10 menit untuk mengurangi beban server
- Semua request di-log untuk monitoring
- View counter menggunakan dynamic AJAX request
- Chapter navigation support untuk semua series

## 🔐 Rate Limiting

Untuk production, disarankan menggunakan rate limiting middleware:

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // limit 100 requests per windowMs
});

app.use("/api/", limiter);
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

**Chapter navigation null**

- API menggunakan triple fallback system
- Jika semua method gagal, prev/next akan null
- Biasanya terjadi pada chapter yang baru atau struktur HTML berbeda

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
````
