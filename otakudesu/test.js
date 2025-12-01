// Test endpoint to verify environment variables
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/test-env", (req, res) => {
  res.json({
    success: true,
    cloudflare_worker_url: process.env.CLOUDFLARE_WORKER_URL || "NOT SET",
    node_env: process.env.NODE_ENV || "NOT SET",
    vercel_env: process.env.VERCEL_ENV || "NOT SET",
  });
});

// Debug endpoint to test HTML fetching
router.get("/test-fetch", async (req, res) => {
  try {
    const testUrl = "https://otakudesu.best/episode/awkn-episode-9-sub-indo";
    const workerUrl = `${process.env.CLOUDFLARE_WORKER_URL}?url=${encodeURIComponent(testUrl)}`;

    console.log("Fetching from:", workerUrl);

    const { data } = await axios.get(workerUrl, { timeout: 30000 });

    res.json({
      success: true,
      html_length: data.length,
      html_preview: data.substring(0, 500),
      contains_posttl: data.includes("posttl"),
      contains_mirrorstream: data.includes("mirrorstream"),
      contains_download: data.includes("download"),
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
