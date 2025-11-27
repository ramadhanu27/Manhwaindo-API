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

    // Get synopsis/description
    const synopsis = $(".desc .entry-content").text().trim() || $(".entry-content p").first().text().trim();

    // Extract episode number from title
    const episodeMatch = title.match(/Episode (\d+)/i);
    const episodeNumber = episodeMatch ? episodeMatch[1] : "";

    // Get type
    const type = $(".typez").text().trim();

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
        status: animeInfo.status || "",
        genres,
        info: animeInfo,
        streamingLinks,
        downloadLinks,
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
