const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://anoboy.gg";

// OPTIMIZED: Removed proxy fallback to reduce CPU usage
// Proxy options disabled - use direct only

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
 * Fetch HTML - OPTIMIZED: Direct axios only, no proxy fallback
 * @param {string} url - Target URL to fetch
 * @returns {Promise<string>} HTML content
 */
async function fetchWithProxy(url) {
  try {
    console.log(`[Anime Fetch] Fetching: ${url.substring(0, 80)}...`);

    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
      timeout: 15000,
      maxRedirects: 5,
    });

    console.log(`[Anime Fetch] Success`);
    return data;
  } catch (error) {
    const statusCode = error.response?.status || "unknown";
    console.error(`[Anime Fetch] Failed (${statusCode}): ${error.message}`);
    throw new Error(`Failed to fetch: ${error.message}`);
  }
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

    // Get synopsis/description from .desc.mindes
    let synopsis = $(".desc.mindes").text().trim();

    // Clean up synopsis - remove [Written by MAL Rewrite] and extra whitespace
    if (synopsis) {
      synopsis = synopsis.replace(/\[Written by MAL Rewrite\]/gi, "").trim();
      // Remove extra whitespace/newlines
      synopsis = synopsis.replace(/\s+/g, " ").trim();
    }

    // Fallback to other selectors if not found
    if (!synopsis) {
      synopsis = $(".entry-content p").first().text().trim();
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

/**
 * Scrape popular anime
 * @param {string} period - 'weekly', 'monthly', or 'all' (default: 'all')
 */
async function scrapePopular(period = "all") {
  try {
    // Popular anime is on the homepage (right sidebar)
    const url = BASE_URL;
    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);
    const popularList = [];

    // Determine which tab to scrape based on period
    let selector = "";
    if (period === "weekly") {
      selector = ".wpop-weekly li";
    } else if (period === "monthly") {
      selector = ".wpop-monthly li";
    } else {
      // 'all' or default
      selector = ".wpop-alltime li";
    }

    // Scrape popular anime items
    $(selector).each((i, el) => {
      const $el = $(el);

      // Title is in h4 > a.series
      const title = $el.find("h4 a.series").text().trim() || $el.find("h4").text().trim();
      const slug = $el.find("a.series").first().attr("href") || "";
      const thumb = $el.find("img").attr("src") || "";

      // Get genres
      const genres = [];
      $el.find("span a[rel='tag']").each((j, genreEl) => {
        const genre = $(genreEl).text().trim();
        if (genre) genres.push(genre);
      });

      // Get rating from .numscore
      const rating = $el.find(".numscore").text().trim();

      if (title && slug) {
        popularList.push({
          rank: i + 1,
          title,
          slug: slug.replace(BASE_URL, ""),
          thumb,
          genres,
          rating,
          url: slug,
        });
      }
    });

    return {
      success: true,
      period,
      totalAnime: popularList.length,
      data: popularList,
    };
  } catch (error) {
    console.error("Error scraping popular:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape anime series detail
 * @param {string} slug - Anime slug (e.g., "/anime/fujimoto-tatsuki-17-26/")
 */
async function scrapeAnimeDetail(slug) {
  try {
    const url = `${BASE_URL}${slug}`;
    const data = await fetchWithProxy(url);
    const $ = cheerio.load(data);

    // Get basic info
    const title = $("h1.entry-title").text().trim();
    const thumb = $(".thumb img").attr("src") || $(".infox img").first().attr("src") || "";

    // Get alternative title
    const alternativeTitle = $(".alter").text().trim();

    // Get rating (only first one to avoid duplicates)
    const rating = $(".rating .numscore").first().text().trim();

    // Get synopsis
    // Get synopsis from .entry-content[itemprop="description"]
    let synopsis = $(".entry-content[itemprop='description']").text().trim();

    // Fallback to .desc.mindes if not found
    if (!synopsis) {
      synopsis = $(".desc.mindes").text().trim();
    }

    if (synopsis) {
      synopsis = synopsis.replace(/\[Written by MAL Rewrite\]/gi, "").trim();
      synopsis = synopsis.replace(/\s+/g, " ").trim();
    }

    // Get metadata from .spe spans
    let type = "";
    let status = "";
    let released = "";
    let duration = "";
    let season = "";
    let studio = "";
    let totalEpisodesCount = "";

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
        } else if (label === "Episodes") {
          totalEpisodesCount = value;
        }
      }
    });

    // Get genres
    const genres = [];
    $(".genxed a").each((i, el) => {
      const genre = $(el).text().trim();
      if (genre) genres.push(genre);
    });

    // Get additional metadata and cast from .split
    const cast = [];
    let director = "";
    let producers = "";
    let releasedOn = "";
    let updatedOn = "";

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
      } else if (label.startsWith("Director:")) {
        director = $el.text().replace(label, "").trim();
      } else if (label.startsWith("Producers:")) {
        producers = $el.text().replace(label, "").trim();
      } else if (label.startsWith("Released on:")) {
        releasedOn = $el.text().replace(label, "").trim();
      } else if (label.startsWith("Updated on:")) {
        updatedOn = $el.text().replace(label, "").trim();
      }
    });

    // Get episode list
    const episodes = [];
    $(".eplister ul li").each((i, el) => {
      const $el = $(el);
      const $link = $el.find("a");

      const episodeUrl = $link.attr("href") || "";
      const episodeTitle = $el.find(".epl-title").text().trim();
      const episodeNum = $el.find(".epl-num").text().trim();
      const episodeDate = $el.find(".epl-date").text().trim();

      if (episodeUrl && episodeTitle) {
        episodes.push({
          episode: episodeNum,
          title: episodeTitle,
          slug: episodeUrl.replace(BASE_URL, ""),
          date: episodeDate,
          url: episodeUrl,
        });
      }
    });

    return {
      success: true,
      data: {
        title,
        alternativeTitle,
        thumb,
        rating,
        synopsis,
        type,
        status,
        released,
        duration,
        season,
        studio,
        totalEpisodesCount,
        director,
        producers,
        releasedOn,
        updatedOn,
        genres,
        cast,
        totalEpisodes: episodes.length,
        episodes,
      },
    };
  } catch (error) {
    console.error("Error scraping anime detail:", error.message);
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
  scrapePopular,
  scrapeAnimeDetail,
};
