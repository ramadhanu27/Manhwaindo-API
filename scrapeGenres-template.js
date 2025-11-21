const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const BASE_URL = process.env.BASE_URL || "https://manhwaindo.app";

/**
 * Fetch HTML from URL
 */
async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    return cheerio.load(data);
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: HTTP ${error.response?.status} ${error.response?.statusText || error.message}`);
  }
}

// ... (rest of existing functions - scrapeLatest, scrapePopular, etc.)

/**
 * Scrape available genres list
 */
async function scrapeGenres() {
  try {
    const url = `${BASE_URL}/series/`;
    const $ = await fetchHTML(url);
    const genres = [];

    // Scrape from genre checkboxes
    $('input.genre-item[type="checkbox"]').each((i, elem) => {
      const id = $(elem).attr("value") || "";
      const label = $(`label[for="${$(elem).attr("id")}"]`)
        .text()
        .trim();

      if (id && label) {
        genres.push({
          id,
          name: label,
          slug: label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        });
      }
    });

    // Sort alphabetically by name
    genres.sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      totalGenres: genres.length,
      data: genres,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

module.exports = {
  scrapeLatest,
  scrapePopular,
  scrapeDetail,
  scrapeChapter,
  scrapeSearch,
  scrapeProjectUpdates,
  scrapeLastUpdate,
  scrapeSeriesList,
  scrapeGenres, // Add this
};
