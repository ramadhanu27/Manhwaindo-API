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
    message: "Otakudesu Anime API",
    version: "1.0.0",
    source: "https://otakudesu.best",
    endpoints: {
      ongoing: "/api/anime/ongoing?page=1 (Get ongoing anime)",
      complete: "/api/anime/complete?page=1 (Get complete anime)",
      detail: "/api/anime/detail/:slug (Get anime detail)",
      episode: "/api/anime/episode/:slug (Get episode download links)",
      search: "/api/anime/search?q=query (Search anime)",
      schedule: "/api/anime/schedule (Get anime schedule)",
      genres: "/api/anime/genres (Get all genres)",
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      timeout: 30000,
    });

    res.json(response.data);
  } catch (error) {
    console.error(`[Rust Proxy] Error:`, error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message,
      source: "Rust API Proxy",
    });
  }
});

module.exports = router;
