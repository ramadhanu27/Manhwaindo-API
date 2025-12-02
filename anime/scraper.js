const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://anoboy.gg";

// Proxy options (fallback if direct request fails)
const PROXY_OPTIONS = [
  null, // Try direct first
  "https://api.allorigins.win/raw?url=", // AllOrigins (free, reliable)
  "https://corsproxy.io/?", // CORS Proxy (free)
];

// Helper function to get realistic browser headers
const getBrowserHeaders = (referer = BASE_URL) => ({
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
});

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

      console.log(`[Fetch] Trying ${proxy ? "proxy" : "direct"}: ${fetchUrl.substring(0, 100)}...`);

      const { data } = await axios.get(fetchUrl, {
        headers: getBrowserHeaders(),
        timeout: 20000,
        maxRedirects: 5,
      });

      console.log(`[Fetch] Success with ${proxy ? "proxy" : "direct"}`);
      return data;
    } catch (error) {
      lastError = error;
      console.error(`[Fetch] Failed with ${proxy ? "proxy" : "direct"}: ${error.message}`);

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
 * Scrape ongoing/latest anime from homepage
 */
async function scrapeOngoing(page = 1) {
  try {
    const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
    const data = await fetchWithProxy(url);
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
 * Browse anime with filters
 * @param {Object} filters - { genre, status, type, order, page }
 */
async function scrapeBrowse(filters = {}) {
  try {
    const { genre = "", status = "", type = "", order = "", page = 1 } = filters;

    let url;

    // If genre is specified, use /genres/{genre}/ path
    if (genre) {
      url = `${BASE_URL}/genres/${genre}/`;
      // Add other params if needed
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (type) params.append("type", type);
      if (order) params.append("order", order);
      if (page > 1) params.append("page", page);

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    } else {
      // Use /anime/ path with query parameters
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (type) params.append("type", type);
      if (order) params.append("order", order);
      if (page > 1) params.append("page", page);

      url = `${BASE_URL}/anime/?${params.toString()}`;
    }

    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);
    const animeList = [];

    // Scrape anime items
    $("article").each((i, el) => {
      const $el = $(el);
      const $link = $el.find("a").first();
      const title = $link.attr("title") || "";
      const slug = $link.attr("href") || "";
      const thumb = $el.find("img").attr("src") || $el.find("img").attr("data-src") || "";

      // Get status badge
      const statusBadge = $el.find(".status").text().trim();

      // Get type
      const typeText = $el.find(".typez").text().trim();

      // Get rating if available
      const rating = $el.find(".rating").text().trim();

      if (title && slug) {
        animeList.push({
          title,
          slug: slug.replace(BASE_URL, ""),
          thumb,
          status: statusBadge,
          type: typeText,
          rating,
        });
      }
    });

    return {
      success: true,
      page: parseInt(page),
      filters: { genre, status, type, order },
      data: animeList,
    };
  } catch (error) {
    console.error("Error scraping browse:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape anime detail/episode by slug
 */
async function scrapeDetail(slug) {
  try {
    const url = `${BASE_URL}${slug}`;
    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);

    // Get basic info
    const title = $("h1.entry-title").text().trim();
    const thumb = $(".thumb img").attr("src") || $(".entry-content img").first().attr("src") || "";

    // Get series info from .infox section
    const seriesName = $(".infox .spe span[itemprop='name']").text().trim();
    const alternativeTitle = $(".infox .alter").text().trim();
    const ratingText = $(".infox .rating").text().trim();
    const rating = ratingText.replace("Rating", "").trim();

    // Get detailed info from .info-content
    const animeInfo = {};
    $(".info-content .spe").each((i, el) => {
      const $el = $(el);
      const label = $el.find("span").first().text().trim().replace(":", "");
      const value = $el.clone().children().remove().end().text().trim();

      if (label && value) {
        const key = label.toLowerCase().replace(/\s+/g, "_");
        animeInfo[key] = value;
      }
    });

    // Get genres
    const genres = [];
    $(".genxed a").each((i, el) => {
      const genre = $(el).text().trim();
      if (genre) genres.push(genre);
    });

    // Get synopsis/description from .desc.mindes.sliders
    let synopsis = $(".desc.mindes.sliders").text().trim();

    // Fallback to other selectors if not found
    if (!synopsis) {
      synopsis = $(".desc .entry-content").text().trim() || $(".entry-content p").first().text().trim();
    }

    // Extract episode number from title
    const episodeMatch = title.match(/Episode (\d+)/i);
    const episodeNumber = episodeMatch ? episodeMatch[1] : "";

    // Get metadata from .spe spans
    // Structure: <span>Label: Value</span> (all in one span)
    let type = "";
    let status = "";
    let released = "";
    let duration = "";
    let season = "";
    let studio = "";

    $(".spe span").each((i, el) => {
      const text = $(el).text().trim();

      if (text.includes(":")) {
        const [label, ...valueParts] = text.split(":");
        const value = valueParts.join(":").trim();

        if (label === "Type") {
          type = value;
        } else if (label === "Status") {
          status = value;
        } else if (label === "Released") {
          released = value;
        } else if (label === "Duration") {
          duration = value;
        } else if (label === "Season") {
          season = value;
        } else if (label === "Studio") {
          studio = value;
        }
      }
    });

    // Get cast from .split sections
    const cast = [];

    $(".split").each((i, el) => {
      const $el = $(el);
      const label = $el.find("b").text().trim();

      if (label.startsWith("Casts:")) {
        $el.find("a").each((j, link) => {
          const name = $(link).text().trim();
          const url = $(link).attr("href") || "";
          if (name) {
            cast.push({ name, url });
          }
        });
      }
    });

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
        else if (src.includes("fembed")) source = "Fembed";
        else if (src.includes("streamtape")) source = "Streamtape";

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
        else if (href.includes("solidfiles")) host = "Solidfiles";
        else if (href.includes("uptobox")) host = "Uptobox";
        else if (text.toLowerCase().includes("download")) host = text;

        downloadLinks.push({
          quality,
          host,
          url: href,
        });
      }
    });

    // Get episode list from .episodelist
    const episodeList = [];
    $(".episodelist ul li").each((i, el) => {
      const $el = $(el);
      const $link = $el.find("a");

      const episodeUrl = $link.attr("href") || "";
      const episodeTitle = $el.find(".playinfo h3").text().trim();
      const episodeDate = $el.find(".playinfo span").text().trim();
      const isSelected = $el.hasClass("selected");

      // Extract episode number from date text (e.g., "Eps 9 - November 26, 2025")
      const epsMatch = episodeDate.match(/Eps (\d+)/i);
      const epsNumber = epsMatch ? epsMatch[1] : "";

      if (episodeUrl && episodeTitle) {
        episodeList.push({
          episode: epsNumber,
          title: episodeTitle,
          slug: episodeUrl.replace(BASE_URL, ""),
          date: episodeDate,
          isCurrent: isSelected,
        });
      }
    });

    // Get related episodes from .minder-slides
    const relatedEpisodes = [];
    $(".minder-slides a").each((i, el) => {
      const $el = $(el);
      const episodeTitle = $el.attr("title") || "";
      const episodeUrl = $el.attr("href") || "";
      const episodeThumb = $el.find("img").attr("src") || "";

      if (episodeTitle && episodeUrl) {
        relatedEpisodes.push({
          title: episodeTitle,
          slug: episodeUrl.replace(BASE_URL, ""),
          thumb: episodeThumb,
        });
      }
    });

    return {
      success: true,
      data: {
        title,
        seriesName: seriesName || title.split(" Episode")[0],
        alternativeTitle,
        thumb,
        rating,
        synopsis,
        episode: episodeNumber,
        type,
        status,
        released,
        duration,
        season,
        studio,
        genres,
        cast,
        info: animeInfo,
        streamingLinks,
        downloadLinks,
        episodeList,
        relatedEpisodes,
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
    const data = await fetchWithProxy(url);
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
 * Get genres list from Anoboy
 */
async function scrapeGenres() {
  try {
    // Scrape from search page which displays all genres
    const url = `${BASE_URL}/?s=one`;
    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);
    const genres = [];
    const seenGenres = new Set();

    // Extract all genre links
    $("a").each((i, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();

      if (href.includes("/genres/") && text && !seenGenres.has(text)) {
        seenGenres.add(text);
        genres.push({
          name: text,
          slug: href.replace(BASE_URL, ""),
          url: href,
        });
      }
    });

    // Sort alphabetically
    genres.sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
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
  scrapeBrowse,
  scrapeDetail,
  scrapeEpisode,
  scrapeSearch,
  scrapeSchedule,
  scrapeGenres,
};
