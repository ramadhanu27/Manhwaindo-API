const express = require("express");
const router = express.Router();
const axios = require("axios");
const { scrapeOngoing, scrapeComplete, scrapeBrowse, scrapeDetail, scrapeEpisode, scrapeSearch, scrapeSchedule, scrapeGenres, scrapePopular, scrapeAnimeDetail } = require("./scraper");

/**
 * GET /api/anime
 * Anime API info
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Anoboy Anime API",
    version: "2.0.0",
    source: "https://anoboy.gg/",
    note: "⚠️ Anoboy structure is different from Otakudesu. Each episode is a separate page. Use search to find episodes.",
    endpoints: {
      ongoing: {
        path: "/api/anime/ongoing?page=1",
        description: "Get latest anime episodes",
        example: "/api/anime/ongoing?page=1",
        available: true,
      },
      popular: {
        path: "/api/anime/popular?period=all",
        description: "Get popular anime (weekly, monthly, or all time)",
        example: "/api/anime/popular?period=weekly",
        params: "period: weekly | monthly | all (default: all)",
        available: true,
      },
      series: {
        path: "/api/anime/series/:slug",
        description: "Get anime series detail with synopsis, metadata, and episode list",
        example: "/api/anime/series/anime/fujimoto-tatsuki-17-26/",
        note: "Returns series info, synopsis, genres, cast, and all episodes",
        available: true,
      },
      search: {
        path: "/api/anime/search?q=query",
        description: "Search anime episodes by title",
        example: "/api/anime/search?q=naruto",
        note: "Use this to get all episodes of an anime",
        available: true,
      },
      detail: {
        path: "/api/anime/detail/:slug",
        description: "Get episode detail with streaming, download links, and episode list",
        example: "/api/anime/detail/one-piece-episode-1151-subtitle-indonesia/",
        note: "Returns complete info: streaming links, download links, episode list, genres, rating, etc.",
        available: true,
      },
    },
    unavailableEndpoints: {
      complete: "Anoboy doesn't separate complete/ongoing - use /ongoing instead",
      schedule: "Anoboy doesn't have schedule page",
      genres: "Anoboy doesn't have genre list page",
    },
    usage: {
      workflow: [
        "1. Get latest episodes: GET /api/anime/ongoing",
        "2. Or search anime: GET /api/anime/search?q=naruto",
        "3. Get slug from results",
        "4. Get episode detail: GET /api/anime/detail/{slug}",
        "5. Use streamingLinks, downloadLinks, or episodeList from response",
      ],
      slugFormat: "title-episode-X-subtitle-indonesia",
      exampleSlug: "/one-piece-episode-1151-subtitle-indonesia/",
    },
    responseExample: {
      detail: {
        title: "One Piece Episode 1151 Subtitle Indonesia",
        seriesName: "One Piece",
        alternativeTitle: "ワンピース",
        rating: "8.5",
        episode: "1151",
        type: "TV",
        status: "Ongoing",
        genres: ["Action", "Adventure", "Comedy"],
        streamingLinks: [{ source: "Blogger", url: "...", quality: "Auto" }],
        downloadLinks: [{ quality: "720p", host: "Gofile", url: "..." }],
        episodeList: [
          { episode: "1151", title: "...", slug: "...", date: "...", isCurrent: true },
          { episode: "1150", title: "...", slug: "...", date: "...", isCurrent: false },
        ],
      },
    },
  });
});

/**
 * GET /api/anime/ongoing
 * Get ongoing anime
 */
router.get("/ongoing", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scrapeOngoing(page);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/anime/complete
 * Get complete anime
 */
router.get("/complete", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scrapeComplete(page);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/anime/browse
 * Browse anime with filters
 * Query params: genre, status, type, order, page
 * Example: /api/anime/browse?genre=action&status=ongoing&page=1
 */
router.get("/browse", async (req, res) => {
  try {
    const filters = {
      genre: req.query.genre || "",
      status: req.query.status || "",
      type: req.query.type || "",
      order: req.query.order || "",
      page: parseInt(req.query.page) || 1,
    };
    const result = await scrapeBrowse(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/anime/detail/:slug
 * Get anime detail by slug
 * Example: /api/anime/detail/anime/kimi-koete-koi-naru-sub-indo/
 */
router.get("/detail/*", async (req, res) => {
  try {
    const slug = "/" + req.params[0];
    const result = await scrapeDetail(slug);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/anime/episode/:slug
 * Get episode download links
 * Example: /api/anime/episode/episode/kimi-koete-koi-naru-episode-7-sub-indo/
 */
router.get("/episode/*", async (req, res) => {
  try {
    const slug = "/" + req.params[0];
    const result = await scrapeEpisode(slug);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/anime/search
 * Search anime
 */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required',
      });
    }

    const result = await scrapeSearch(q);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/anime/schedule
 * Get anime schedule
 */
router.get("/schedule", async (req, res) => {
  try {
    const result = await scrapeSchedule();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/anime/genres
 * Get all genres
 */
router.get("/genres", async (req, res) => {
  try {
    const result = await scrapeGenres();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/anime/popular
 * Get popular anime
 * Query params: period (weekly, monthly, all)
 * Example: /api/anime/popular?period=weekly
 */
router.get("/popular", async (req, res) => {
  try {
    const period = req.query.period || "all";

    // Validate period
    if (!["weekly", "monthly", "all"].includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Use: weekly, monthly, or all",
      });
    }

    const result = await scrapePopular(period);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/anime/series/*
 * Get anime series detail with episode list
 * Example: /api/anime/series/anime/fujimoto-tatsuki-17-26/
 */
router.get("/series/*", async (req, res) => {
  try {
    const slug = "/" + req.params[0];
    const result = await scrapeAnimeDetail(slug);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/anime/rust/*
 * Proxy to Manhwaindo API Rust (server-to-server request to bypass CORS/403)
 * Example: /api/anime/rust/detail/anime/kimi-koete-koi-naru-sub-indo/
 */
router.get("/rust/*", async (req, res) => {
  try {
    const path = req.params[0];
    const rustApiUrl = `https://manhwaindo-api-rust.vercel.app/api/${path}`;

    console.log(`[Rust Proxy] Forwarding request to: ${rustApiUrl}`);

    const response = await axios.get(rustApiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://manhwaindo-api-rust.vercel.app/",
        Origin: "https://manhwaindo-api-rust.vercel.app",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      timeout: 30000,
    });

    res.json(response.data);
  } catch (error) {
    console.error(`[Rust Proxy] Error:`, error.message);
    console.error(`[Rust Proxy] Status:`, error.response?.status);
    console.error(`[Rust Proxy] Data:`, error.response?.data);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message,
      source: "Rust API Proxy",
      details: error.response?.data,
    });
  }
});

module.exports = router;
