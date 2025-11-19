const express = require('express');
const router = express.Router();
const {
  scrapeLatest,
  scrapePopular,
  scrapeDetail,
  scrapeChapter,
  scrapeSearch
} = require('../utils/scraper');

/**
 * GET /api
 * API info
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Manhwaindo API',
    version: '1.0.0',
    endpoints: {
      latest: '/api/latest?page=1',
      popular: '/api/popular',
      detail: '/api/series/:slug',
      chapter: '/api/chapter/:slug',
      search: '/api/search?q=query'
    }
  });
});

/**
 * GET /api/latest
 * Get latest manhwa updates
 */
router.get('/latest', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scrapeLatest(page);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/popular
 * Get popular manhwa
 */
router.get('/popular', async (req, res) => {
  try {
    const result = await scrapePopular();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/series/:slug
 * Get manhwa detail by slug
 */
router.get('/series/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await scrapeDetail(slug);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/chapter/:slug
 * Get chapter images
 */
router.get('/chapter/:slug(*)', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await scrapeChapter(slug);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/search
 * Search manhwa
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required'
      });
    }

    const result = await scrapeSearch(q);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
