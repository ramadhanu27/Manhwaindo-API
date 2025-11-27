const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://otakudesu.best";

// Helper function to get realistic browser headers
const getBrowserHeaders = (referer = BASE_URL, cookie = "") => ({
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: referer,
  Cookie: cookie,
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Cache-Control": "max-age=0",
  Connection: "keep-alive",
});

// Detect if running locally or in production
const isLocal = () => {
  return process.env.NODE_ENV === "development" || !process.env.VERCEL;
};

// Helper to fetch content with retry logic
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // If local, try to use Puppeteer
      if (isLocal()) {
        try {
          const puppeteer = require("puppeteer");
          const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
          });

          const page = await browser.newPage();
          await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });

          const content = await page.content();
          await browser.close();

          return content;
        } catch (puppeteerError) {
          console.log("Puppeteer failed, falling back to axios:", puppeteerError.message);
          // Fall through to axios
        }
      }

      // Use axios (for production or if Puppeteer fails)
      const response = await axios.get(url, {
        headers: getBrowserHeaders(BASE_URL),
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // Accept 4xx responses
      });

      if (response.status === 403 || response.status === 503) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }

      return response.data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error.message);

      if (i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts`);
}

/**
 * Scrape ongoing anime from homepage (Axios is fine for this usually)
 */
async function scrapeOngoing(page = 1) {
  try {
    const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
    });

    const $ = cheerio.load(data);
    const animeList = [];

    $(".venz ul li").each((i, el) => {
      const title = $(el).find(".jdlflm").text().trim();
      const slug = $(el).find("a").attr("href");
      const thumb = $(el).find("img").attr("src");
      const episode = $(el).find(".epz").text().trim();
      const day = $(el).find(".epztipe").text().trim();
      const date = $(el).find(".newnime").text().trim();

      if (title && slug) {
        animeList.push({
          title,
          slug: slug.replace(BASE_URL, ""),
          thumb,
          episode,
          day,
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
 * Scrape complete anime
 */
async function scrapeComplete(page = 1) {
  try {
    const url = `${BASE_URL}/complete-anime/page/${page}`;
    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
    });

    const $ = cheerio.load(data);
    const animeList = [];

    $(".venz ul li").each((i, el) => {
      const title = $(el).find(".jdlflm").text().trim();
      const slug = $(el).find("a").attr("href");
      const thumb = $(el).find("img").attr("src");
      const episode = $(el).find(".epz").text().trim();
      const rating = $(el).find(".epztipe").text().trim();
      const date = $(el).find(".newnime").text().trim();

      if (title && slug) {
        animeList.push({
          title,
          slug: slug.replace(BASE_URL, ""),
          thumb,
          episode,
          rating,
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
  try {
    const url = `${BASE_URL}${slug}`;

    // Fetch with retry logic
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    // Get basic info
    const title = $(".jdlrx h1").text().trim();
    const japaneseTitle = $(".jdlrx .alter").text().trim();
    const thumb = $(".fotoanime img").attr("src");
    const rating = $(".rtng").text().trim();

    // Get detail info
    const info = {};
    $(".infozingle p").each((i, el) => {
      const text = $(el).text();
      // Parsing logic adjusted for potential span structure
      if (text.includes("Judul:")) info.judul = text.replace("Judul:", "").trim();
      if (text.includes("Japanese:")) info.japanese = text.replace("Japanese:", "").trim();
      if (text.includes("Skor:")) info.skor = text.replace("Skor:", "").trim();
      if (text.includes("Produser:")) info.produser = text.replace("Produser:", "").trim();
      if (text.includes("Tipe:")) info.tipe = text.replace("Tipe:", "").trim();
      if (text.includes("Status:")) info.status = text.replace("Status:", "").trim();
      if (text.includes("Total Episode:")) info.totalEpisode = text.replace("Total Episode:", "").trim();
      if (text.includes("Durasi:")) info.durasi = text.replace("Durasi:", "").trim();
      if (text.includes("Tanggal Rilis:")) info.tanggalRilis = text.replace("Tanggal Rilis:", "").trim();
      if (text.includes("Studio:")) info.studio = text.replace("Studio:", "").trim();
      if (text.includes("Genre:")) {
        info.genre = [];
        $(el)
          .find("a")
          .each((i, a) => {
            info.genre.push($(a).text().trim());
          });
      }
    });

    // Get synopsis
    const synopsis = $(".sinopc p").text().trim() || $(".sinopc").text().trim();

    // Get episode list
    const episodeList = [];
    $(".episodelist ul li").each((i, el) => {
      const episodeTitle = $(el).find("a").text().trim();
      const episodeSlug = $(el).find("a").attr("href");
      const episodeDate = $(el).find(".zeebr").text().trim();

      if (episodeTitle && episodeSlug) {
        episodeList.push({
          episode: episodeTitle,
          slug: episodeSlug.replace(BASE_URL, ""),
          date: episodeDate,
        });
      }
    });

    // Get batch download link if available
    let batchLink = null;
    const batchElement = $("div.download:contains('Batch')").find("a").first();
    if (batchElement.length) {
      batchLink = batchElement.attr("href");
    }

    return {
      success: true,
      data: {
        title,
        japaneseTitle,
        thumb,
        rating,
        info,
        synopsis,
        episodeList: episodeList.reverse(), // Reverse to show from episode 1
        batchLink,
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
 * Scrape episode download and streaming links
 */
async function scrapeEpisode(slug) {
  try {
    const url = `${BASE_URL}${slug}`;

    // Fetch with retry logic
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    const title = $(".venutama h1").text().trim();
    const episodeNumber = title;

    // Get streaming URLs from data-content attribute (base64 encoded JSON)
    const streamingUrls = [];
    $(".mirrorstream ul li").each((i, el) => {
      const host = $(el).find("a").text().trim();
      const dataContent = $(el).find("a").attr("data-content");

      let streamUrl = null;
      if (dataContent) {
        try {
          // Decode base64 data-content
          const decodedData = Buffer.from(dataContent, "base64").toString("utf-8");
          const jsonData = JSON.parse(decodedData);

          // Construct streaming URL based on decoded data
          if (jsonData.id && jsonData.hasOwnProperty("i") && jsonData.q) {
            streamUrl = `https://desustream.us/stream/v5/index.php?id=${jsonData.id}&i=${jsonData.i}&q=${jsonData.q}`;
          }
        } catch (error) {
          console.error(`Error parsing data-content for ${host}:`, error.message);
        }
      }

      if (host && streamUrl) {
        streamingUrls.push({
          host,
          quality: streamUrl.includes("360p") ? "360p" : streamUrl.includes("480p") ? "480p" : streamUrl.includes("720p") ? "720p" : "unknown",
          url: streamUrl,
        });
      }
    });

    // Get download links organized by quality
    const downloads = {};
    $(".download ul li").each((i, el) => {
      const quality = $(el).find("strong").text().trim();
      const links = [];

      $(el)
        .find("a")
        .each((j, a) => {
          const host = $(a).text().trim();
          const url = $(a).attr("href");

          if (host && url) {
            links.push({
              host,
              url,
            });
          }
        });

      if (quality && links.length > 0) {
        downloads[quality] = links;
      }
    });

    // Get previous and next episode links
    const prevEpisode = $(".flir a:contains('← Episode Sebelumnya')").attr("href");
    const nextEpisode = $(".flir a:contains('Episode Selanjutnya →')").attr("href");

    return {
      success: true,
      data: {
        title,
        episode: episodeNumber,
        streamingUrls,
        downloads,
        navigation: {
          prevEpisode: prevEpisode ? prevEpisode.replace(BASE_URL, "") : null,
          nextEpisode: nextEpisode ? nextEpisode.replace(BASE_URL, "") : null,
        },
      },
    };
  } catch (error) {
    console.error("Error scraping episode:", error.message);
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
    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
    });

    const $ = cheerio.load(data);
    const results = [];

    $(".chivsrc li").each((i, el) => {
      const title = $(el).find("h2 a").text().trim();
      const slug = $(el).find("h2 a").attr("href");
      const thumb = $(el).find("img").attr("src");
      const genres = [];

      $(el)
        .find(".set")
        .each((j, genre) => {
          const genreText = $(genre).text().trim();
          if (genreText && !genreText.includes("Status:") && !genreText.includes("Rating:")) {
            genres.push(genreText);
          }
        });

      const status = $(el).find(".set:contains('Status:')").text().replace("Status:", "").trim();
      const rating = $(el).find(".set:contains('Rating:')").text().replace("Rating:", "").trim();

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
    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
    });

    const $ = cheerio.load(data);
    const schedule = {};

    $(".kglist321").each((i, el) => {
      const day = $(el).find("h2").text().trim();
      const animeList = [];

      $(el)
        .find("ul li")
        .each((j, li) => {
          const title = $(li).find("a").text().trim();
          const slug = $(li).find("a").attr("href");

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
    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
    });

    const $ = cheerio.load(data);
    const genres = [];

    $(".genres li").each((i, el) => {
      const name = $(el).find("a").text().trim();
      const slug = $(el).find("a").attr("href");

      if (name && slug) {
        genres.push({
          name,
          slug: slug.replace(BASE_URL, ""),
        });
      }
    });

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
  scrapeDetail,
  scrapeEpisode,
  scrapeSearch,
  scrapeSchedule,
  scrapeGenres,
};
