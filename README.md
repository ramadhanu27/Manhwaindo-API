# Manhwaindo API

Express.js API scraper untuk [manhwaindo.app](https://manhwaindo.app)

## 🚀 Fitur

- ✅ Mendapatkan daftar manhwa terbaru
- ✅ Mendapatkan manhwa populer
- ✅ Mendapatkan detail manhwa
- ✅ Mendapatkan gambar chapter
- ✅ Pencarian manhwa
- ✅ CORS enabled
- ✅ Error handling

## 📦 Instalasi

```bash
# Install dependencies
npm install

# Jalankan server (development)
npm run dev

# Jalankan server (production)
npm start
```

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

## 📝 Notes

- API ini melakukan scraping real-time dari manhwaindo.app
- Gunakan dengan bijak dan jangan spam request
- Response time tergantung kecepatan website target

## ⚠️ Disclaimer

API ini dibuat untuk tujuan edukasi. Pastikan Anda mematuhi Terms of Service dari website yang di-scrape.

## 📄 License

ISC
