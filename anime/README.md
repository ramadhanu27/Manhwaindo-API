# Otakudesu Anime API

API scraper untuk website **Otakudesu** (https://otakudesu.best) - Website streaming dan download anime subtitle Indonesia.

## Base URL

```
http://localhost:3000/api/anime
```

## Endpoints

### 1. API Info

**GET** `/api/anime`

Mendapatkan informasi API dan daftar semua endpoint.

**Response:**

```json
{
  "success": true,
  "message": "Otakudesu Anime API",
  "version": "1.0.0",
  "source": "https://otakudesu.best",
  "endpoints": {
    "ongoing": "/api/anime/ongoing?page=1",
    "complete": "/api/anime/complete?page=1",
    "detail": "/api/anime/detail/:slug",
    "episode": "/api/anime/episode/:slug",
    "search": "/api/anime/search?q=query",
    "schedule": "/api/anime/schedule",
    "genres": "/api/anime/genres"
  }
}
```

---

### 2. Ongoing Anime

**GET** `/api/anime/ongoing?page=1`

Mendapatkan daftar anime yang sedang ongoing/berjalan.

**Query Parameters:**

- `page` (optional): Halaman yang ingin diakses. Default: 1

**Response:**

```json
{
  "success": true,
  "data": {
    "page": 1,
    "animeList": [
      {
        "title": "Kimi to Koete Koi ni Naru",
        "slug": "/anime/kimi-koete-koi-naru-sub-indo/",
        "thumb": "https://otakudesu.best/wp-content/uploads/2025/10/...",
        "episode": "Episode 7",
        "day": "Rabu",
        "date": "26 Nov"
      }
    ]
  }
}
```

---

### 3. Complete Anime

**GET** `/api/anime/complete?page=1`

Mendapatkan daftar anime yang sudah selesai/complete.

**Query Parameters:**

- `page` (optional): Halaman yang ingin diakses. Default: 1

**Response:**

```json
{
  "success": true,
  "data": {
    "page": 1,
    "animeList": [
      {
        "title": "Jibaku Shounen Hanako-kun Season 2 Part 2",
        "slug": "/anime/jibaku-shounen-hanako-kun-2-part-2-sub-indo/",
        "thumb": "https://otakudesu.best/wp-content/uploads/...",
        "episode": "12 Episode",
        "rating": "8.03",
        "date": "12 Nov"
      }
    ]
  }
}
```

---

### 4. Anime Detail

**GET** `/api/anime/detail/:slug`

Mendapatkan detail lengkap anime termasuk info, sinopsis, dan daftar episode.

**Parameters:**

- `slug`: Slug anime (contoh: `anime/kimi-koete-koi-naru-sub-indo/`)

**Example:**

```
GET /api/anime/detail/anime/punch-man-s3-sub-indo/
```

**Response:**

```json
{
  "success": true,
  "data": {
    "title": "One Punch Man Season 3",
    "japaneseTitle": "ワンパンマン 第3期",
    "thumb": "https://otakudesu.best/wp-content/uploads/...",
    "rating": "7.14",
    "info": {
      "judul": "One Punch Man Season 3",
      "japanese": "ワンパンマン 第3期",
      "skor": "7.14",
      "produser": "TV Tokyo, Shueisha, Bandai Namco Arts",
      "tipe": "TV",
      "status": "Currently Airing",
      "totalEpisode": "Unknown",
      "durasi": "24 min. per ep.",
      "tanggalRilis": "Oct 3, 2025",
      "studio": "J.C.Staff",
      "genre": ["Action", "Comedy", "Parody", "Seinen", "Super Power"]
    },
    "synopsis": "Saitama adalah seorang pahlawan...",
    "episodeList": [
      {
        "episode": "Episode 01",
        "slug": "/episode/punch-man-s3-episode-1-sub-indo/",
        "date": "3 October 2025"
      }
    ],
    "batchLink": null
  }
}
```

---

### 5. Episode Detail

**GET** `/api/anime/episode/:slug`

Mendapatkan informasi episode termasuk link streaming dan download.

**Parameters:**

- `slug`: Slug episode (contoh: `episode/punch-man-s3-episode-1-sub-indo/`)

**Example:**

```
GET /api/anime/episode/episode/punch-man-s3-episode-1-sub-indo/
```

**Response:**

```json
{
  "success": true,
  "data": {
    "title": "One Punch Man Season 3 Episode 01 Subtitle Indonesia",
    "episode": "One Punch Man Season 3 Episode 01 Subtitle Indonesia",
    "streamingUrls": [
      {
        "quality": "360p",
        "url": "https://..."
      },
      {
        "quality": "480p",
        "url": "https://..."
      },
      {
        "quality": "720p",
        "url": "https://..."
      }
    ],
    "downloads": {
      "MKV 360p": [
        {
          "host": "Zippyshare",
          "url": "https://..."
        },
        {
          "host": "Google Drive",
          "url": "https://..."
        }
      ],
      "MKV 480p": [...],
      "MKV 720p": [...]
    },
    "navigation": {
      "prevEpisode": null,
      "nextEpisode": "/episode/punch-man-s3-episode-2-sub-indo/"
    }
  }
}
```

---

### 6. Search Anime

**GET** `/api/anime/search?q=query`

Mencari anime berdasarkan keyword.

**Query Parameters:**

- `q` (required): Kata kunci pencarian

**Example:**

```
GET /api/anime/search?q=one+punch+man
```

**Response:**

```json
{
  "success": true,
  "data": {
    "query": "one punch man",
    "results": [
      {
        "title": "One Punch Man Season 3 Subtitle Indonesia",
        "slug": "/anime/punch-man-s3-sub-indo/",
        "thumb": "https://otakudesu.best/wp-content/uploads/...",
        "genres": ["Action", "Comedy", "Parody", "Seinen", "Super Power"],
        "status": "Ongoing",
        "rating": "7.14"
      }
    ]
  }
}
```

---

### 7. Anime Schedule

**GET** `/api/anime/schedule`

Mendapatkan jadwal rilis anime per hari.

**Response:**

```json
{
  "success": true,
  "data": {
    "Senin": [
      {
        "title": "Mofa Gongzhu de Xiao Fannao",
        "slug": "/anime/mofa-fannaoi-sub-indo/"
      }
    ],
    "Selasa": [...],
    "Rabu": [...],
    "Kamis": [...],
    "Jumat": [...],
    "Sabtu": [...],
    "Minggu": [...]
  }
}
```

---

### 8. Genre List

**GET** `/api/anime/genres`

Mendapatkan daftar semua genre yang tersedia.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "name": "Action",
      "slug": "/genres/action/"
    },
    {
      "name": "Adventure",
      "slug": "/genres/adventure/"
    }
  ]
}
```

---

## Error Response

Jika terjadi kesalahan, API akan mengembalikan response dengan format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Status Codes:**

- `200`: Success
- `400`: Bad Request (missing parameters)
- `404`: Not Found
- `500`: Internal Server Error

---

## Features

✅ **Caching**: Semua endpoint menggunakan cache 10 menit untuk meningkatkan performa  
✅ **Error Handling**: Error handling yang baik dengan pesan yang jelas  
✅ **Clean Response**: Response JSON yang terstruktur dan mudah digunakan  
✅ **Pagination**: Support pagination untuk endpoint yang memerlukan

---

## Tech Stack

- **Node.js** & **Express.js**: Backend framework
- **Axios**: HTTP client untuk request
- **Cheerio**: HTML parsing dan scraping
- **NodeCache**: In-memory caching

---

## Notes

- API ini adalah scraper, jadi performa tergantung pada website Otakudesu
- Menggunakan cache untuk mengurangi load pada server Otakudesu
- Pastikan website Otakudesu dapat diakses
- Untuk production, disarankan menggunakan proxy atau rate limiting

---

## Examples

### JavaScript/Node.js

```javascript
const axios = require("axios");

// Get ongoing anime
const ongoing = await axios.get("http://localhost:3000/api/anime/ongoing?page=1");
console.log(ongoing.data);

// Search anime
const search = await axios.get("http://localhost:3000/api/anime/search?q=naruto");
console.log(search.data);

// Get anime detail
const detail = await axios.get("http://localhost:3000/api/anime/detail/anime/punch-man-s3-sub-indo/");
console.log(detail.data);
```

### Python

```python
import requests

# Get ongoing anime
response = requests.get('http://localhost:3000/api/anime/ongoing?page=1')
data = response.json()
print(data)

# Search anime
response = requests.get('http://localhost:3000/api/anime/search', params={'q': 'naruto'})
data = response.json()
print(data)
```

---

## License

This project is for educational purposes only. Please respect the original website's terms of service.
