const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://otakudesu.best";

// Helper function to get realistic browser headers
const getBrowserHeaders = (referer = BASE_URL) => ({
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: referer,
  DNT: "1",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Cache-Control": "max-age=0",
});

/**
 * Scrape ongoing anime from homepage
 */
async function scrapeOngoing(page = 1) {
  try {
    const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}`;
    const { data } = await axios.get(url, {
      headers: getBrowserHeaders(),
    });

    const $ = cheerio.load(data);
    const animeList = [];

    // Find ongoing anime section
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
      data: {
        page,
        animeList,
      },
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
      data: {
        page,
        animeList,
      },
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
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);

    // Get basic info
    const title = $(".jdlrx h1").text().trim();
    const japaneseTitle = $(".jdlrx .alter").text().trim();
    const thumb = $(".fotoanime img").attr("src");
    const rating = $(".rtng").text().trim();

    // Get detail info
    const info = {};
    $(".infozingle p").each((i, el) => {
      const text = $(el).text();
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
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);

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
          // Format: https://desustream.us/stream/v5/index.php?id={id}&i={i}&q={q}
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
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
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
      data: {
        query,
        results,
      },
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
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
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
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
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
