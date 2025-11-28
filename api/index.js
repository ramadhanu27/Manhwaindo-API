require("dotenv").config();
const express = require("express");
const cors = require("cors");
const NodeCache = require("node-cache");
const path = require("path");
const serverless = require("serverless-http");
const apiRoutes = require("../routes/api");
const animeRoutes = require("../anime/api");

const app = express();

// Initialize Cache (Standard TTL: 10 minutes, Check period: 2 minutes)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Cache Middleware
const cacheMiddleware = (duration) => (req, res, next) => {
  // Only cache GET requests
  if (req.method !== "GET") {
    return next();
  }

  const key = req.originalUrl || req.url;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    console.log(`[CACHE HIT] ${key}`);
    return res.json(cachedResponse);
  } else {
    console.log(`[CACHE MISS] ${key}`);
    // Override res.json to store response in cache
    const originalJson = res.json;
    res.json = (body) => {
      if (body.success) {
        // Only cache successful responses
        cache.set(key, body, duration);
      }
      originalJson.call(res, body);
    };
    next();
  }
};

// Routes with Cache
// Anime API: 30 minutes cache (data rarely changes, Puppeteer is slow)
app.use("/api/anime", cacheMiddleware(1800), animeRoutes);
// Manhwa API: 10 minutes cache
app.use("/api", cacheMiddleware(600), apiRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Export for Vercel serverless
module.exports = serverless(app);
