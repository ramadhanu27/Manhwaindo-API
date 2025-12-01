const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://otakudesu.best";

// Proxy options (fallback if direct request fails)
const PROXY_OPTIONS = [
  null, // Try direct first
  "https://api.allorigins.win/raw?url=", // AllOrigins (free, reliable)
  "https://corsproxy.io/?", // CORS Proxy (free)
  "https://api.codetabs.com/v1/proxy?quest=", // CodeTabs proxy
];

// Helper function to get realistic browser headers
const getBrowserHeaders = (referer = BASE_URL) => {
  // Rotate user agents to avoid detection
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    Referer: referer,
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
  };
};

// Helper function for random delay (anti-bot)
const randomDelay = (min = 500, max = 1500) => {
  return new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
};

/**
 * Fetch HTML with proxy fallback
 * @param {string} url - Target URL to fetch
 * @returns {Promise<string>} HTML content
 */
async function fetchWithProxy(url) {
  let lastError = null;

  // Try each proxy option
  for (const proxy of PROXY_OPTIONS) {
    try {
      const fetchUrl = proxy ? `${proxy}${encodeURIComponent(url)}` : url;

      console.log(`[Otakudesu Fetch] Trying ${proxy ? "proxy" : "direct"}: ${fetchUrl.substring(0, 100)}...`);

      const { data } = await axios.get(fetchUrl, {
        headers: getBrowserHeaders(),
        timeout: 30000, // Increased for Vercel
        maxRedirects: 5,
      });

      console.log(`[Otakudesu Fetch] Success with ${proxy ? "proxy" : "direct"}`);
      return data;
    } catch (error) {
      lastError = error;
      console.error(`[Otakudesu Fetch] Failed with ${proxy ? "proxy" : "direct"}: ${error.message}`);

      // If it's not a 403/blocking error, don't try other proxies
      if (error.response && error.response.status !== 403 && error.response.status !== 429) {
        throw error;
      }

      // Continue to next proxy
      continue;
    }
  }

  // All proxies failed
  throw lastError || new Error("All proxy attempts failed");
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
async function scrapeDetail(slug) {
  // Retry up to 3 times with delays
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const url = `${BASE_URL}${slug}`;
      console.log(`[Otakudesu Detail] Attempt ${attempt}/3 - Fetching: ${url}`);

      // Add random delay before fetch (anti-bot)
      if (attempt > 1) {
        await randomDelay(1000, 2000);
      }

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
      console.error(`[Otakudesu Detail] Attempt ${attempt}/3 failed:`, error.message);

      // If this was the last attempt, return error
      if (attempt === 3) {
        return {
          success: false,
          message: error.message,
        };
      }

      // Otherwise, continue to next attempt
      continue;
    }
  }

  // Fallback (should never reach here)
  return {
    success: false,
    message: "All retry attempts failed",
  };
}

/**
 * Scrape episode detail (streaming & download links)
 */
async function scrapeEpisode(slug) {
  // Retry up to 3 times with delays
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const url = `${BASE_URL}${slug}`;
      console.log(`[Otakudesu Episode] Attempt ${attempt}/3 - Fetching: ${url}`);

      // Add random delay before fetch (anti-bot)
      if (attempt > 1) {
        await randomDelay(1000, 2000);
      }

      const data = await fetchWithProxy(url);
      const $ = cheerio.load(data);

      const title = $(".posttl").text().trim();
      console.log(`[Otakudesu Episode] Title: ${title}`);
      console.log(`[Otakudesu Episode] HTML length: ${data.length}`);
      console.log(`[Otakudesu Episode] .mirrorstream count: ${$(".mirrorstream ul li").length}`);
      console.log(`[Otakudesu Episode] .download count: ${$(".download ul li").length}`);

      // Get streaming links - they use data-content attribute with base64 encoded JSON
      const streamingLinks = [];
      $(".mirrorstream ul li").each((i, el) => {
        const $el = $(el);
        const $link = $el.find("a");

        // Try data-content first (for iframe embed), then href
        const dataContent = $link.attr("data-content") || "";
        const href = $link.attr("href") || "";

        let quality = "";
        let url = "";

        if (dataContent && dataContent !== "#") {
          // data-content contains base64 encoded JSON with quality info
          try {
            // Decode base64
            const decoded = Buffer.from(dataContent, "base64").toString("utf-8");
            const data = JSON.parse(decoded);

            // Extract quality from decoded data
            quality = data.q || data.quality || "";
            url = dataContent; // Keep the encoded data as URL for the player
          } catch (e) {
            // If decode fails, use as-is
            quality = $el.find("strong").text().trim();
            url = dataContent;
          }
        } else if (href && href !== "#") {
          quality = $el.find("strong").text().trim();
          url = href;
        }

        if (url) {
          streamingLinks.push({
            quality,
            url,
          });
        }
      });

      // Also get the actual iframe src from player-embed
      const iframeSrc = $("#pembed iframe").attr("src") || "";
      if (iframeSrc) {
        // Add iframe URL to first streaming link or create new entry
        if (streamingLinks.length > 0) {
          streamingLinks[0].iframeSrc = iframeSrc;
        } else {
          streamingLinks.push({
            quality: "default",
            url: iframeSrc,
            iframeSrc: iframeSrc,
          });
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
          const url = $(linkEl).attr("href") || "";

          if (url && url !== "#") {
            links.push({
              host,
              url,
            });
          }
        });

        if (quality && links.length > 0) {
          downloadLinks.push({
            quality,
            links,
          });
        }
      });

      return {
        success: true,
        data: {
          title,
          streamingLinks,
          downloadLinks,
        },
      };
    } catch (error) {
      console.error(`[Otakudesu Episode] Attempt ${attempt}/3 failed:`, error.message);

      // If this was the last attempt, return error
      if (attempt === 3) {
        return {
          success: false,
          message: error.message,
        };
      }

      // Otherwise, continue to next attempt
      continue;
    }
  }

  // Fallback (should never reach here)
  return {
    success: false,
    message: "All retry attempts failed",
  };
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
