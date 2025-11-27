const axios = require("axios");
const cheerio = require("cheerio");
const chromium = require("@sparticuz/chromium");
const puppeteerCore = require("puppeteer-core");

const BASE_URL = "https://otakudesu.best";

// Helper function to get realistic browser headers (for axios requests)
const getBrowserHeaders = (referer = BASE_URL) => ({
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: referer,
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
});

// Global browser instance (reused across requests)
let browserInstance = null;
let browserLastUsed = Date.now();
const BROWSER_TIMEOUT = 5 * 60 * 1000; // Close browser after 5 minutes of inactivity

// Helper to launch browser (Puppeteer) - with reuse
async function getBrowser() {
  const isLocal = process.env.NODE_ENV === "development" || !process.env.AWS_REGION;

  // Check if browser exists and is still connected
  if (browserInstance && browserInstance.isConnected()) {
    browserLastUsed = Date.now();
    return browserInstance;
  }

  // Launch new browser
  if (isLocal) {
    // Local development: use full puppeteer
    const puppeteer = require("puppeteer");
    browserInstance = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Reduce memory usage
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });
  } else {
    // Production (Vercel/Netlify): use puppeteer-core + chromium
    browserInstance = await puppeteerCore.launch({
      args: [...chromium.args, "--disable-dev-shm-usage"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }

  browserLastUsed = Date.now();

  // Auto-close browser after timeout
  setTimeout(() => {
    if (browserInstance && Date.now() - browserLastUsed > BROWSER_TIMEOUT) {
      console.log("Closing idle browser...");
      browserInstance.close();
      browserInstance = null;
    }
  }, BROWSER_TIMEOUT);

  return browserInstance;
}

// Helper to fetch content using Puppeteer (for protected pages)
async function fetchWithPuppeteer(url) {
  let page = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort(); // Block images, CSS, fonts to load faster
      } else {
        req.continue();
      }
    });

    // Set User-Agent
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // Navigate to URL with faster settings
    await page.goto(url, {
      waitUntil: "domcontentloaded", // Changed from networkidle2 (faster)
      timeout: 30000, // Reduced timeout
    });

    // Wait for critical element
    try {
      await page.waitForSelector(".jdlrx, .venutama", { timeout: 5000 });
    } catch (e) {
      console.log("Timeout waiting for selector, continuing...");
    }

    // Get HTML content
    const content = await page.content();
    return content;
  } catch (error) {
    console.error(`Puppeteer error for ${url}:`, error.message);
    throw error;
  } finally {
    if (page) {
      await page.close(); // Close page but keep browser alive
    }
  }
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
 * Scrape anime detail by slug (Uses Puppeteer)
 */
async function scrapeDetail(slug) {
  try {
    const url = `${BASE_URL}${slug}`;

    // Use Puppeteer instead of Axios
    const html = await fetchWithPuppeteer(url);
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
 * Scrape episode download and streaming links (Uses Puppeteer)
 */
async function scrapeEpisode(slug) {
  try {
    const url = `${BASE_URL}${slug}`;

    // Use Puppeteer instead of Axios
    const html = await fetchWithPuppeteer(url);
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
