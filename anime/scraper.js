const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://anoboy.gg";

// Helper function to get realistic browser headers
const getBrowserHeaders = () => ({
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
});

/**
 * Scrape ongoing/latest anime from homepage
 */
async function scrapeOngoing(page = 1) {
  try {
    const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const animeList = [];

    // Anoboy uses article for each anime
    $("article").each((i, el) => {
      const $el = $(el);
      const $link = $el.find("a").first();
      const title = $link.attr("title") || "";
      const slug = $link.attr("href") || "";
      const thumb = $el.find("img").attr("src") || $el.find("img").attr("data-src") || "";

      // Extract episode info from title
      const episodeMatch = title.match(/Episode (\d+)/i);
      const episode = episodeMatch ? `Episode ${episodeMatch[1]}` : title;

      // Get type (TV, Movie, etc)
      const type = $el.find(".typez").text().trim();

      // Get date from time element if available
      const date = $el.find("time").text().trim();

      if (title && slug) {
        animeList.push({
          title,
          slug: slug.replace(BASE_URL, ""),
          thumb,
          episode,
          type,
          date,
        });
      }
    });

    return {
      success: true,
      page,
      data: animeList,
    };
  } catch (error) {
    console.error("Error scraping ongoing:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape complete anime (same as ongoing for Anoboy)
 */
async function scrapeComplete(page = 1) {
  return scrapeOngoing(page);
}

/**
 * Scrape anime detail by slug
 */
async function scrapeDetail(slug) {
  try {
    const url = `${BASE_URL}${slug}`;
    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    // Get basic info
    const title = $("h1.entry-title").text().trim();
    const thumb = $(".entry-content img").first().attr("src") || $(".entry-content img").first().attr("data-src");

    // Get synopsis
    const synopsis = $(".entry-content p").first().text().trim();

    // Get streaming/download links
    const episodeList = [];
    $(".entry-content iframe").each((i, el) => {
      const src = $(el).attr("src");
      if (src) {
        episodeList.push({
          episode: `Stream ${i + 1}`,
          url: src,
        });
      }
    });

    // Get download links
    const downloads = {};
    $(".entry-content a").each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");

      if (href && (text.includes("Download") || text.includes("480p") || text.includes("720p") || text.includes("1080p"))) {
        const quality = text.match(/\d+p/) ? text.match(/\d+p/)[0] : "Unknown";
        if (!downloads[quality]) {
          downloads[quality] = [];
        }
        downloads[quality].push({
          host: text,
          url: href,
        });
      }
    });

    return {
      success: true,
      data: {
        title,
        thumb,
        synopsis,
        episodeList,
        downloads,
      },
    };
  } catch (error) {
    console.error("Error scraping detail:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape episode (for Anoboy, detail and episode are the same)
 */
async function scrapeEpisode(slug) {
  return scrapeDetail(slug);
}

/**
 * Search anime
 */
async function scrapeSearch(query) {
  try {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const results = [];

    $("article.post").each((i, el) => {
      const $el = $(el);
      const title = $el.find("h2.entry-title a").text().trim();
      const slug = $el.find("h2.entry-title a").attr("href");
      const thumb = $el.find("img").attr("src") || $el.find("img").attr("data-src");
      const date = $el.find(".updated").text().trim();

      if (title && slug) {
        results.push({
          title,
          slug: slug.replace(BASE_URL, ""),
          thumb,
          date,
        });
      }
    });

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Error scraping search:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Get anime schedule (Anoboy doesn't have schedule page, return empty)
 */
async function scrapeSchedule() {
  return {
    success: true,
    data: {},
  };
}

/**
 * Get genres list (Anoboy doesn't have genre list, return empty)
 */
async function scrapeGenres() {
  return {
    success: true,
    data: [],
  };
}

module.exports = {
  scrapeOngoing,
  scrapeComplete,
  scrapeDetail,
  scrapeEpisode,
  scrapeSearch,
  scrapeSchedule,
  scrapeGenres,
};
