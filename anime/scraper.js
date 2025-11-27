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
 * Scrape anime detail/episode by slug
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
    const thumb = $(".thumb img").attr("src") || $(".entry-content img").first().attr("src") || "";

    // Get synopsis
    const synopsis = $(".entry-content p").first().text().trim();

    // Get anime info from title
    const info = {};
    const titleParts = title.split(" ");
    if (title.includes("Episode")) {
      const episodeMatch = title.match(/Episode (\d+)/i);
      info.episode = episodeMatch ? episodeMatch[1] : "";
    }

    // Get type
    const type = $(".typez").text().trim();
    if (type) info.type = type;

    // Get streaming links
    const streamingLinks = [];
    $("iframe").each((i, el) => {
      const src = $(el).attr("src");
      if (src) {
        // Determine streaming source
        let source = "Unknown";
        if (src.includes("blogger.com")) source = "Blogger";
        else if (src.includes("youtube.com")) source = "YouTube";
        else if (src.includes("drive.google.com")) source = "Google Drive";
        else if (src.includes("mp4upload")) source = "MP4Upload";

        streamingLinks.push({
          source,
          url: src,
          quality: "Auto",
        });
      }
    });

    // Get download links
    const downloadLinks = [];
    $("a").each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");

      if (href && text && (text.toLowerCase().includes("download") || text.includes("480p") || text.includes("720p") || text.includes("1080p") || text.includes("MP4") || text.includes("MKV"))) {
        // Extract quality
        const qualityMatch = text.match(/(\d+p)/i);
        const quality = qualityMatch ? qualityMatch[1] : "Unknown";

        // Determine host
        let host = "Unknown";
        if (href.includes("gofile")) host = "Gofile";
        else if (href.includes("drive.google")) host = "Google Drive";
        else if (href.includes("mega.nz")) host = "Mega";
        else if (href.includes("mediafire")) host = "MediaFire";
        else if (href.includes("zippyshare")) host = "ZippyShare";
        else if (text.toLowerCase().includes("download")) host = text;

        downloadLinks.push({
          quality,
          host,
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
        info,
        streamingLinks,
        downloadLinks,
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
 * NOTE: Anoboy structure is different from Otakudesu:
 * - Each episode is a separate page (no anime detail page)
 * - Search returns individual episodes, not anime series
 * - To get all episodes of an anime, search by anime name
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

    // Anoboy uses article for search results
    $("article").each((i, el) => {
      const $el = $(el);
      const $link = $el.find("a").first();
      const title = $link.attr("title") || "";
      const slug = $link.attr("href") || "";
      const thumb = $el.find("img").attr("src") || $el.find("img").attr("data-src") || "";

      // Extract episode info
      const episodeMatch = title.match(/Episode (\d+)/i);
      const episode = episodeMatch ? `Episode ${episodeMatch[1]}` : "";

      // Get type
      const type = $el.find(".typez").text().trim();

      // Get date
      const date = $el.find("time").text().trim();

      if (title && slug) {
        results.push({
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
