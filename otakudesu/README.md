# Otakudesu API Scraper

Scraper untuk website [Otakudesu.best](https://otakudesu.best/) - Nonton dan Streaming Anime Subtitle Indonesia

## Features

- ✅ Scrape ongoing anime
- ✅ Scrape complete anime
- ✅ Get anime detail (synopsis, genres, episode list)
- ✅ Get episode detail (streaming & download links)
- ✅ Search anime
- ✅ Get anime release schedule
- ✅ Get genres list
- ✅ Proxy support with automatic fallback
- ✅ Cache support (30 minutes)

## API Endpoints

### Base URL

```
http://localhost:3000/api/otakudesu
```

### 1. Get Ongoing Anime

```
GET /api/otakudesu/ongoing?page=1
```

**Response:**

```json
{
  "success": true,
  "page": 1,
  "data": [
    {
      "title": "One Piece",
      "slug": "/anime/1piece-sub-indo/",
      "thumb": "https://...",
      "episode": "Episode 1151",
      "date": "Minggu01 Des"
    }
  ]
}
```

### 2. Get Complete Anime

```
GET /api/otakudesu/complete?page=1
```

### 3. Get Anime Detail

```
GET /api/otakudesu/anime/:slug
```

**Example:**

```
GET /api/otakudesu/anime/1piece-sub-indo
```

**Response:**

```json
{
  "success": true,
  "data": {
    "title": "One Piece",
    "thumb": "https://...",
    "synopsis": "...",
    "genres": ["Action", "Adventure", "Comedy"],
    "info": {
      "judul": "One Piece",
      "japanese": "ワンピース",
      "skor": "8.72",
      "produser": "Toei Animation",
      "tipe": "TV",
      "status": "Ongoing",
      "total_episode": "1151",
      "durasi": "24 min. per ep.",
      "tanggal_rilis": "Oct 20, 1999"
    },
    "episodeList": [...],
    "totalEpisodes": 1151
  }
}
```

### 4. Get Episode Detail

```
GET /api/otakudesu/episode/:slug
```

**Example:**

```
GET /api/otakudesu/episode/1piece-episode-1151-sub-indo
```

**Response:**

```json
{
  "success": true,
  "data": {
    "title": "One Piece Episode 1151 Subtitle Indonesia",
    "streamingLinks": [
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
    "downloadLinks": [
      {
        "quality": "360p",
        "links": [
          {
            "host": "Google Drive",
            "url": "https://..."
          },
          {
            "host": "Zippyshare",
            "url": "https://..."
          }
        ]
      }
    ]
  }
}
```

### 5. Search Anime

```
GET /api/otakudesu/search?q=one piece
```

**Response:**

```json
{
  "success": true,
  "query": "one piece",
  "data": [
    {
      "title": "One Piece",
      "slug": "/anime/1piece-sub-indo/",
      "thumb": "https://...",
      "genres": "Action, Adventure, Comedy",
      "status": "Ongoing",
      "rating": "8.72"
    }
  ]
}
```

### 6. Get Anime Schedule

```
GET /api/otakudesu/schedule
```

**Response:**

```json
{
  "success": true,
  "data": {
    "Senin": [
      {
        "title": "Kikaijikake no Marie",
        "slug": "/anime/kikaijikake-marie-sub-indo/"
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

### 7. Get Genres List

```
GET /api/otakudesu/genres
```

**Response:**

```json
{
  "success": true,
  "totalGenres": 50,
  "data": [
    {
      "name": "Action",
      "slug": "/genres/action/",
      "url": "https://otakudesu.best/genres/action/"
    }
  ]
}
```

## Proxy Support

Scraper ini menggunakan sistem proxy dengan fallback otomatis untuk mengatasi blocking:

1. **Direct Request** - Coba akses langsung
2. **AllOrigins Proxy** - Proxy gratis & reliable
3. **CORS Proxy** - Backup proxy

Jika direct request gagal dengan error 403/429, sistem otomatis switch ke proxy berikutnya.

## Cache

- Cache duration: **30 minutes**
- Hanya cache response yang sukses
- Cache key: URL endpoint

## Error Handling

Semua endpoint mengembalikan format error yang konsisten:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Notes

- Otakudesu menggunakan struktur HTML yang berbeda dari Anoboy
- Episode slug format: `/episode/anime-name-episode-X-sub-indo`
- Anime slug format: `/anime/anime-name-sub-indo`
- Semua request menggunakan realistic browser headers
- Proxy fallback otomatis jika terkena blocking

## Development

```bash
# Test locally
npm start

# Test endpoint
curl http://localhost:3000/api/otakudesu/ongoing?page=1
```

## Deployment

Otakudesu API sudah terintegrasi dengan:

- ✅ Vercel serverless functions
- ✅ Cache middleware
- ✅ Proxy support
- ✅ Error handling

Deploy akan otomatis saat push ke GitHub.
