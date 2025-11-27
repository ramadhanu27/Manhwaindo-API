const express = require("express");
const router = express.Router();
const axios = require("axios");
const { scrapeOngoing, scrapeComplete, scrapeDetail, scrapeEpisode, scrapeSearch, scrapeSchedule, scrapeGenres } = require("./scraper");

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
      },
      complete: {
        path: "/api/anime/complete?page=1",
        description: "Get complete anime (same as ongoing for Anoboy)",
        example: "/api/anime/complete?page=1",
      },
      search: {
        path: "/api/anime/search?q=query",
        description: "Search anime episodes by title",
        example: "/api/anime/search?q=naruto",
        note: "Use this to get all episodes of an anime",
      },
      detail: {
        path: "/api/anime/detail/:slug",
        description: "Get episode detail with streaming & download links",
        example: "/api/anime/detail/one-piece-episode-1151-subtitle-indonesia/",
        note: "Slug must be from search/ongoing response",
      },
      episode: {
        path: "/api/anime/episode/:slug",
        description: "Alias for detail endpoint",
        example: "/api/anime/episode/naruto-episode-1-subtitle-indonesia/",
      },
      schedule: {
        path: "/api/anime/schedule",
        description: "Get anime schedule (not available for Anoboy)",
        note: "Returns empty data",
      },
      genres: {
        path: "/api/anime/genres",
        description: "Get all genres (not available for Anoboy)",
        note: "Returns empty data",
      },
    },
    usage: {
      workflow: ["1. Search anime: GET /api/anime/search?q=naruto", "2. Get slug from search results", "3. Get episode detail: GET /api/anime/detail/{slug}", "4. Use streamingLinks or downloadLinks from response"],
      slugFormat: "title-episode-X-subtitle-indonesia",
      exampleSlug: "/one-piece-episode-1151-subtitle-indonesia/",
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
