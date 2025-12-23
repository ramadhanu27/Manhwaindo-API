// OPTIMIZED: Replaced cloudscraper with axios for lower CPU usage
const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://otakudesu.best";

// Helper function to get realistic browser headers
const getBrowserHeaders = (referer = BASE_URL) => ({
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  Referer: referer,
  "Cache-Control": "max-age=0",
});

/**
 * Fetch HTML - OPTIMIZED: Direct axios only, no proxy fallback, no cloudscraper
 * @param {string} url - Target URL to fetch
 * @returns {Promise<string>} HTML content
 */
async function fetchWithProxy(url) {
  try {
    console.log(`[Otakudesu Fetch] Fetching: ${url.substring(0, 80)}...`);

    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
      timeout: 15000,
    });

    console.log(`[Otakudesu Fetch] Success`);
    return data;
  } catch (error) {
    const statusCode = error.response?.status || "unknown";
    console.error(`[Otakudesu Fetch] Failed (${statusCode}): ${error.message}`);
    throw new Error(`Failed to fetch: ${error.message}`);
  }
}

/**
 * Scrape ongoing anime from ongoing-anime page
 */
async function scrapeOngoing(page = 1) {
  try {
    const url = page === 1 ? `${BASE_URL}/ongoing-anime/` : `${BASE_URL}/ongoing-anime/page/${page}`;
    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);
    const animeList = [];

    // Otakudesu ongoing page uses .detpost for each anime
    $(".detpost").each((i, el) => {
      const $el = $(el);

      // Get thumbnail
      const $thumb = $el.find(".thumb");
      const thumbImg = $thumb.find("img").attr("src") || "";
      const animeLink = $thumb.find("a").attr("href") || "";

      // Get title from h2
      const title = $el.find("h2").text().trim();

      // Get episode info
      const episodeText = $el.find(".epztipe").text().trim();

      // Get release day
      const dayText = $el.find(".newnime").text().trim();

      if (title && animeLink) {
        animeList.push({
          title,
          slug: animeLink.replace(BASE_URL, ""),
          thumb: thumbImg,
          episode: episodeText,
          releaseDay: dayText,
          url: animeLink,
        });
      }
    });

    return {
      success: true,
      page,
      totalAnime: animeList.length,
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
 * Scrape complete anime
 */
async function scrapeComplete(page = 1) {
  try {
    const url = `${BASE_URL}/complete-anime/page/${page}`;
    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);
    const animeList = [];

    // Complete anime uses .venz ul li
    $(".venz ul li").each((i, el) => {
      const $el = $(el);
      const $link = $el.find(".thumb a");
      const title = $link.attr("title") || "";
      const slug = $link.attr("href") || "";
      const thumb = $link.find("img").attr("src") || "";

      // Get episode info
      const episodeText = $el.find(".epz").text().trim();
      const dateText = $el.find(".newnime").text().trim();

      if (title && slug) {
        animeList.push({
          title,
          slug: slug.replace(BASE_URL, ""),
          thumb,
          episode: episodeText,
          date: dateText,
        });
      }
    });

    return {
      success: true,
      page,
      data: animeList,
    };
  } catch (error) {
    console.error("Error scraping complete:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape anime detail by slug
 */
// OPTIMIZED: Removed retry logic (was 3x, now 1x)
async function scrapeDetail(slug) {
  try {
    const url = `${BASE_URL}${slug}`;
    console.log(`[Otakudesu Detail] Fetching: ${url}`);

    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);

    // Get basic info
    const title = $(".jdlrx h1").text().trim();
    const thumb = $(".fotoanime img").attr("src") || "";

    // Get anime info
    const animeInfo = {};
    $(".infozingle p").each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const [key, ...valueParts] = text.split(":");
      const value = valueParts.join(":").trim();

      if (key && value) {
        const cleanKey = key.toLowerCase().replace(/\s+/g, "_");
        animeInfo[cleanKey] = value;
      }
    });

    // Get synopsis
    const synopsis = $(".sinopc").text().trim();

    // Get genres
    const genres = [];
    $(".infozingle .genre-info a").each((i, el) => {
      const genre = $(el).text().trim();
      if (genre) genres.push(genre);
    });

    // Get episode list
    const episodeList = [];
    $(".episodelist ul li").each((i, el) => {
      const $el = $(el);
      const $link = $el.find("a");
      const episodeTitle = $link.text().trim();
      const episodeUrl = $link.attr("href") || "";
      const episodeDate = $el.find(".zeebr").text().trim();

      if (episodeTitle && episodeUrl) {
        episodeList.push({
          title: episodeTitle,
          slug: episodeUrl.replace(BASE_URL, ""),
          url: episodeUrl,
          date: episodeDate,
        });
      }
    });

    return {
      success: true,
      data: {
        title,
        thumb,
        synopsis,
        genres,
        info: animeInfo,
        episodeList,
        totalEpisodes: episodeList.length,
      },
    };
  } catch (error) {
    console.error(`[Otakudesu Detail] Error:`, error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape episode detail (streaming & download links)
 * OPTIMIZED: Removed retry logic (was 3x, now 1x)
 */
async function scrapeEpisode(slug) {
  try {
    const url = `${BASE_URL}${slug}`;
    console.log(`[Otakudesu Episode] Fetching: ${url}`);

    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);

    const title = $(".posttl").text().trim();

    // Get streaming links - they use data-content attribute with base64 encoded JSON
    const streamingLinks = [];
    $(".mirrorstream ul li").each((i, el) => {
      const $el = $(el);
      const $link = $el.find("a");

      // Try data-content first (for iframe embed), then href
      const dataContent = $link.attr("data-content") || "";
      const href = $link.attr("href") || "";

      let quality = "";
      let linkUrl = "";

      if (dataContent && dataContent !== "#") {
        try {
          const decoded = Buffer.from(dataContent, "base64").toString("utf-8");
          const parsed = JSON.parse(decoded);
          quality = parsed.q || parsed.quality || "";
          linkUrl = dataContent;
        } catch (e) {
          quality = $el.find("strong").text().trim();
          linkUrl = dataContent;
        }
      } else if (href && href !== "#") {
        quality = $el.find("strong").text().trim();
        linkUrl = href;
      }

      if (linkUrl) {
        streamingLinks.push({ quality, url: linkUrl });
      }
    });

    // Get iframe src
    const iframeSrc = $("#pembed iframe").attr("src") || "";
    if (iframeSrc) {
      if (streamingLinks.length > 0) {
        streamingLinks[0].iframeSrc = iframeSrc;
      } else {
        streamingLinks.push({ quality: "default", url: iframeSrc, iframeSrc });
      }
    }

    // Get download links
    const downloadLinks = [];
    $(".download ul li").each((i, el) => {
      const $el = $(el);
      const quality = $el.find("strong").text().trim();
      const links = [];

      $el.find("a").each((j, linkEl) => {
        const host = $(linkEl).text().trim();
        const linkUrl = $(linkEl).attr("href") || "";
        if (linkUrl && linkUrl !== "#") {
          links.push({ host, url: linkUrl });
        }
      });

      if (quality && links.length > 0) {
        downloadLinks.push({ quality, links });
      }
    });

    return {
      success: true,
      data: { title, streamingLinks, downloadLinks },
    };
  } catch (error) {
    console.error(`[Otakudesu Episode] Error:`, error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Search anime
 */
async function scrapeSearch(query) {
  try {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=anime`;
    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);
    const results = [];

    $(".chivsrc li").each((i, el) => {
      const $el = $(el);
      const $link = $el.find("h2 a");
      const title = $link.text().trim();
      const slug = $link.attr("href") || "";
      const thumb = $el.find("img").attr("src") || "";
      const genres = $el.find(".set").text().trim();
      const status = $el.find(".set").eq(1).text().trim();
      const rating = $el.find(".set").eq(2).text().trim();

      if (title && slug) {
        results.push({
          title,
          slug: slug.replace(BASE_URL, ""),
          thumb,
          genres,
          status,
          rating,
        });
      }
    });

    return {
      success: true,
      query,
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
 * Get anime schedule
 */
async function scrapeSchedule() {
  try {
    const url = `${BASE_URL}/jadwal-rilis`;
    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);
    const schedule = {};

    $(".kglist321").each((i, el) => {
      const $el = $(el);
      const day = $el.find("h2").text().trim();
      const animeList = [];

      $el.find("ul li").each((j, liEl) => {
        const $li = $(liEl);
        const $link = $li.find("a");
        const title = $link.text().trim();
        const slug = $link.attr("href") || "";

        if (title && slug) {
          animeList.push({
            title,
            slug: slug.replace(BASE_URL, ""),
          });
        }
      });

      if (day && animeList.length > 0) {
        schedule[day] = animeList;
      }
    });

    return {
      success: true,
      data: schedule,
    };
  } catch (error) {
    console.error("Error scraping schedule:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Get genres list
 */
async function scrapeGenres() {
  try {
    const url = `${BASE_URL}/genre-list`;
    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);
    const genres = [];

    $(".genres li a").each((i, el) => {
      const $el = $(el);
      const name = $el.text().trim();
      const slug = $el.attr("href") || "";

      if (name && slug) {
        genres.push({
          name,
          slug: slug.replace(BASE_URL, ""),
          url: slug,
        });
      }
    });

    return {
      success: true,
      totalGenres: genres.length,
      data: genres,
    };
  } catch (error) {
    console.error("Error scraping genres:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
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
