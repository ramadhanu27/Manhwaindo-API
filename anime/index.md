# Anime API - Otakudesu Scraper

Folder ini berisi implementasi API scraper untuk website **Otakudesu** (https://otakudesu.best).

## 📁 Struktur File

```
anime/
├── api.js          # Express router untuk endpoint anime
├── scraper.js      # Fungsi scraper untuk Otakudesu
├── README.md       # Dokumentasi lengkap API
├── demo.html       # Demo page untuk testing API
└── index.md        # File ini
```

## 🚀 Quick Start

1. **Jalankan server:**

   ```bash
   npm start
   ```

2. **Akses API di:**

   ```
   http://localhost:3000/api/anime
   ```

3. **Lihat demo:**
   - Buka file `demo.html` di browser
   - Atau akses: `http://localhost:3000/anime/demo.html`

## 📚 Dokumentasi

Untuk dokumentasi lengkap, lihat file [README.md](./README.md).

## 🔗 Endpoint Utama

- `GET /api/anime` - Info API
- `GET /api/anime/ongoing` - Anime ongoing
- `GET /api/anime/complete` - Anime complete
- `GET /api/anime/detail/:slug` - Detail anime
- `GET /api/anime/episode/:slug` - Episode download links
- `GET /api/anime/search?q=query` - Search anime
- `GET /api/anime/schedule` - Jadwal rilis
- `GET /api/anime/genres` - Daftar genre

## 🎯 Contoh Penggunaan

### JavaScript

```javascript
// Get ongoing anime
fetch("http://localhost:3000/api/anime/ongoing?page=1")
  .then((res) => res.json())
  .then((data) => console.log(data));

// Search anime
fetch("http://localhost:3000/api/anime/search?q=naruto")
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### cURL

```bash
# Get ongoing anime
curl http://localhost:3000/api/anime/ongoing?page=1

# Search anime
curl "http://localhost:3000/api/anime/search?q=naruto"

# Get anime detail
curl http://localhost:3000/api/anime/detail/anime/punch-man-s3-sub-indo/
```

## 🔧 Teknologi

- **Axios** - HTTP client
- **Cheerio** - HTML parsing
- **Express** - Web framework
- **NodeCache** - Caching

## 📝 Notes

- Semua endpoint menggunakan cache 10 menit
- Website target: https://otakudesu.best
- Response format: JSON

## 🐛 Troubleshooting

**API tidak merespons:**

- Pastikan server sudah running (`npm start`)
- Cek apakah port 3000 sudah digunakan
- Pastikan otakudesu.best dapat diakses

**Data tidak lengkap:**

- Kemungkinan struktur HTML website berubah
- Cek console log untuk error detail
- Update selector di `scraper.js`

---

Made with ❤️ by Ramadhanu
