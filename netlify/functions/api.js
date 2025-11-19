const serverless = require('serverless-http');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const apiRoutes = require('../../routes/api');

const app = express();

// Initialize Cache (Standard TTL: 10 minutes, Check period: 2 minutes)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Cache Middleware
const cacheMiddleware = (duration) => (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
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
      if (body.success) { // Only cache successful responses
        cache.set(key, body, duration);
      }
      originalJson.call(res, body);
    };
    next();
  }
};

// Routes with Cache
// Cache duration: 10 minutes (600 seconds)
app.use('/api', cacheMiddleware(600), apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports.handler = serverless(app);
