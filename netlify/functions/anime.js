const serverless = require("serverless-http");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const NodeCache = require("node-cache");
const animeRoutes = require("../../anime/api");

const app = express();

// Initialize Cache (Standard TTL: 10 minutes, Check period: 2 minutes)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[ANIME] [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Cache Middleware
const cacheMiddleware = (duration) => (req, res, next) => {
  if (req.method !== "GET") {
    return next();
  }

  const key = req.originalUrl || req.url;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    console.log(`[ANIME CACHE HIT] ${key}`);
    return res.json(cachedResponse);
  } else {
    console.log(`[ANIME CACHE MISS] ${key}`);
    const originalJson = res.json;
    res.json = (body) => {
      if (body.success) {
        cache.set(key, body, duration);
      }
      originalJson.call(res, body);
    };
    next();
  }
};

// Mount anime routes at root
// Netlify redirects /api/anime/* to /.netlify/functions/anime/:splat
// So request /api/anime/ongoing becomes /ongoing in this function
app.use("/", cacheMiddleware(600), animeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Anime API endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("[ANIME ERROR]", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports.handler = serverless(app);
