// Test endpoint to verify environment variables
const express = require("express");
const router = express.Router();

router.get("/test-env", (req, res) => {
  res.json({
    success: true,
    cloudflare_worker_url: process.env.CLOUDFLARE_WORKER_URL || "NOT SET",
    node_env: process.env.NODE_ENV || "NOT SET",
    vercel_env: process.env.VERCEL_ENV || "NOT SET",
  });
});

module.exports = router;
