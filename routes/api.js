const express = require("express");
const router = express.Router();
const { scrapeLatest, scrapePopular, scrapeDetail, scrapeChapter, scrapeSearch, scrapeProjectUpdates, scrapeLastUpdate, scrapeSeriesList, scrapeGenres } = require("../utils/scraper");

/**
 * GET /api
 * API info
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Manhwaindo API",
    version: "1.0.0",
    endpoints: {
      project: "/api/project?page=1 (Project Updates)",
      lastupdate: "/api/lastupdate?page=1 (Latest Update)",
      popular: "/api/popular",
      seriesList: "/api/series-list?page=1 (All Series List)",
      genres: "/api/genres (Get all genres)",
      detail: "/api/series/:slug",
      chapter: "/api/chapter/:slug (Get chapter images for reading/download)",
      search: "/api/search?q=query",
    },
  });
});

/**
 * GET /api/project
 * Get project updates (from homepage Project Update section)
 */
router.get("/project", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scrapeProjectUpdates(page);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/lastupdate
 * Get last updates (from /series/?order=update)
 */
router.get("/lastupdate", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scrapeLastUpdate(page);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/series-list
 * Get all series list with pagination and filters
 * Query params: page, order, type, status
 */
router.get("/series-list", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const filters = {
      order: req.query.order, // update, popular, latest, title
      type: req.query.type, // manhwa, manhua, manga
      status: req.query.status, // ongoing, completed, hiatus
      // genre removed - requires genre ID, not name
    };

    const result = await scrapeSeriesList(page, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/popular
 * Get popular manhwa
 */
router.get("/popular", async (req, res) => {
  try {
    const result = await scrapePopular();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/genres
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

/**
 * GET /api/series/:slug
 * Get manhwa detail by slug
 */
router.get("/series/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
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
 * GET /api/anime/detail/anime/:slug
 * Alternative route for anime detail (compatibility with external API format)
 */
router.get("/anime/detail/anime/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
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
 * GET /api/chapter/:slug
 * Get chapter images
 */
router.get("/chapter/:slug(*)", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await scrapeChapter(slug);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/download/:slug
 * Get download information for a chapter (returns image URLs for client-side download)
 * This avoids Netlify's 6MB serverless function response limit
 */
router.get("/download/:slug(*)", async (req, res) => {
  try {
    const { slug } = req.params;

    // Get chapter data
    const result = await scrapeChapter(slug);

    if (!result.success) {
      return res.status(404).json(result);
    }

    const { title, images } = result.data;

    if (!images || images.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No images found in this chapter",
      });
    }

    console.log(`[Download Info] Returning ${images.length} image URLs for ${slug}`);

    // Return download information
    res.json({
      success: true,
      data: {
        slug,
        title,
        totalImages: images.length,
        images: images.map((url, index) => ({
          url,
          filename: `${String(index + 1).padStart(3, "0")}.jpg`,
          index: index + 1,
        })),
        downloadInstructions: "Use client-side download or the /api/download-zip/:slug endpoint for smaller chapters",
      },
    });
  } catch (error) {
    console.error("[Download Info] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/download-multiple
 * DISABLED: Too CPU-intensive for serverless
 * Use client-side download instead
 */
router.post("/download-multiple", async (req, res) => {
  return res.status(503).json({
    success: false,
    message: "This endpoint is disabled to reduce server CPU usage. Please use client-side download instead.",
    suggestion: "Use the /api/download/:slug endpoint to get image URLs, then download on client-side.",
  });
});

/**
 * GET /api/download-pdf/:slug
 * DISABLED: Too CPU-intensive for serverless (image processing + PDF generation)
 * Use client-side download instead
 */
router.get("/download-pdf/:slug(*)", async (req, res) => {
  return res.status(503).json({
    success: false,
    message: "PDF download is disabled to reduce server CPU usage.",
    suggestion: "Use the /api/download/:slug endpoint to get image URLs, then download on client-side using JSZip or similar.",
  });
});

/**
 * GET /api/search
 * Search manhwa
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

module.exports = router;
