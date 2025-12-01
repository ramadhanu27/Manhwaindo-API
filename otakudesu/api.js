const express = require("express");
const router = express.Router();
const { scrapeOngoing, scrapeComplete, scrapeDetail, scrapeEpisode, scrapeSearch, scrapeSchedule, scrapeGenres } = require("./scraper");

/**
 * GET /api/otakudesu
 * API info
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Otakudesu API",
    version: "1.0.0",
    endpoints: {
      ongoing: "/api/otakudesu/ongoing?page=1 (Ongoing Anime)",
      complete: "/api/otakudesu/complete?page=1 (Complete Anime)",
      detail: "/api/otakudesu/anime/:slug (Anime Detail)",
      episode: "/api/otakudesu/episode/:slug (Episode with streaming & download links)",
      search: "/api/otakudesu/search?q=query (Search Anime)",
      schedule: "/api/otakudesu/schedule (Anime Release Schedule)",
      genres: "/api/otakudesu/genres (Get all genres)",
    },
  });
});

/**
 * GET /api/otakudesu/ongoing
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
 * GET /api/otakudesu/complete
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
 * GET /api/otakudesu/anime/:slug
 * Get anime detail by slug
 */
router.get("/anime/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await scrapeDetail(`/anime/${slug}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/otakudesu/episode/:slug
 * Get episode detail with streaming & download links
 */
router.get("/episode/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await scrapeEpisode(`/episode/${slug}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/otakudesu/search
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
 * GET /api/otakudesu/schedule
 * Get anime release schedule
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
 * GET /api/otakudesu/genres
 * Get all available genres
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

module.exports = router;
