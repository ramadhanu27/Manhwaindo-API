const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = process.env.BASE_URL || "https://manhwaindo.app";

/**
 * Fetch HTML content from URL
 */
async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    return cheerio.load(data);
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

/**
 * Scrape latest manhwa updates
 */

async function scrapeLatest(page = 1) {
  try {
    // Use Homepage for Page 1 to get the best "Latest Update" data (with multiple chapters)
    // Use /series/ for Page > 1 (Grid view, usually only 1 chapter)
    const isHomePage = page === 1;
    const url = isHomePage ? BASE_URL : `${BASE_URL}/series/?page=${page}&order=update`;

    const $ = await fetchHTML(url);
    const manhwaList = [];

    if (isHomePage) {
      // Scrape from Homepage (.utao structure)
      $(".utao").each((i, elem) => {
        const uta = $(elem).find(".uta");
        const title = uta.find(".luf h4").text().trim();
        const url = uta.find("a.series").attr("href") || "";
        const slug = url.replace(BASE_URL, "").replace("/series/", "").replace("/", "") || "";
        const image = uta.find(".imgu img").attr("src") || "";
        const type = "Manhwa"; // Default/Assumption for homepage items
        const rating = ""; // Homepage usually doesn't show rating in this view

        // Get chapters
        const chapters = [];
        uta.find(".luf ul li").each((j, li) => {
          const link = $(li).find("a");
          const timeSpan = $(li).find("span");
          chapters.push({
            title: link.text().trim(),
            url: link.attr("href") || "",
            slug: link.attr("href")?.replace(BASE_URL, "").replace("/", "") || "",
            time: timeSpan.text().trim() || "",
          });
        });

        manhwaList.push({
          title,
          slug,
          image,
          type,
          rating,
          url,
          chapters,
        });
      });
    } else {
      // Scrape from Series List (.bsx structure)
      $(".bsx").each((i, elem) => {
        const title = $(elem).find(".tt").text().trim();
        const slug = $(elem).find("a").attr("href")?.replace(BASE_URL, "").replace("/series/", "").replace("/", "") || "";
        const image = $(elem).find("img").attr("src") || "";
        const type = $(elem).find(".type").text().trim();
        const rating = $(elem).find(".numscore").text().trim();

        // Get latest chapters (Usually only 1 in grid view)
        const chapters = [];
        // Try .epxs (single chapter text)
        const epxs = $(elem).find(".epxs").text().trim();
        if (epxs) {
          chapters.push({
            title: epxs,
            url: "", // No direct link usually
            slug: "",
          });
        }
        // Try .eph-num (if exists)
        $(elem)
          .find(".eph-num a")
          .each((j, chap) => {
            chapters.push({
              title: $(chap).text().trim(),
              url: $(chap).attr("href") || "",
              slug: $(chap).attr("href")?.replace(BASE_URL, "").replace("/", "") || "",
            });
          });

        manhwaList.push({
          title,
          slug,
          image,
          type,
          rating,
          url: `${BASE_URL}/series/${slug}/`,
          chapters,
        });
      });
    }

    return {
      success: true,
      page,
      data: manhwaList,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape popular manhwa
 */
async function scrapePopular() {
  try {
    const $ = await fetchHTML(BASE_URL);
    const manhwaList = [];

    $(".popularslider .bsx").each((i, elem) => {
      const title = $(elem).find(".tt").text().trim();
      const slug = $(elem).find("a").attr("href")?.replace(BASE_URL, "").replace("/series/", "").replace("/", "") || "";
      const image = $(elem).find("img").attr("src") || "";
      const type = $(elem).find(".type").text().trim();
      const rating = $(elem).find(".numscore").text().trim();
      const latestChapter = $(elem).find(".epxs").text().trim();

      manhwaList.push({
        title,
        slug,
        image,
        type,
        rating,
        latestChapter,
        url: `${BASE_URL}/series/${slug}/`,
      });
    });

    return {
      success: true,
      data: manhwaList,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape manhwa detail by slug
 */
async function scrapeDetail(slug) {
  try {
    const url = `${BASE_URL}/series/${slug}/`;
    const $ = await fetchHTML(url);

    const title = $(".entry-title").text().trim();
    const alternativeTitle = $(".alternative").text().trim();
    const image = $(".thumb img").attr("src") || "";
    const rating = $(".num").text().trim();
    const followers = $(".bmc").text().trim();

    // Extract metadata from .tsinfo .imptdt
    let status = "";
    let type = "";
    let released = "";
    let author = "";
    let artist = "";
    let postedBy = "";
    let postedOn = "";
    let updatedOn = "";
    let views = "";

    $(".tsinfo .imptdt").each((i, elem) => {
      const fullText = $(elem).text().trim();
      const label = fullText.split(" ")[0];
      let value = $(elem).find("i").text().trim();

      // Fallback if value is empty or not in <i> tag
      if (!value) {
        value = fullText.replace(label, "").trim();
      }

      // Special handling for links (Author, Artist, Posted By)
      if ($(elem).find("a").length > 0) {
        value = $(elem).find("a").text().trim();
      }

      // Special handling for views - check for .ts-views-count span
      if (fullText.toLowerCase().includes("views")) {
        const viewsSpan = $(elem).find(".ts-views-count").text().trim();
        if (viewsSpan && viewsSpan !== "?") {
          value = viewsSpan;
        }
      }

      if (fullText.toLowerCase().includes("status")) {
        status = value;
      } else if (fullText.toLowerCase().includes("type")) {
        type = value;
      } else if (fullText.toLowerCase().includes("released")) {
        released = value;
      } else if (fullText.toLowerCase().includes("author")) {
        author = value;
      } else if (fullText.toLowerCase().includes("artist")) {
        artist = value;
      } else if (fullText.toLowerCase().includes("posted by")) {
        postedBy = value;
      } else if (fullText.toLowerCase().includes("posted on")) {
        postedOn = value;
      } else if (fullText.toLowerCase().includes("updated on")) {
        updatedOn = value;
      } else if (fullText.toLowerCase().includes("views")) {
        views = value;
      }
    });

    // Try to fetch real views via AJAX if views is empty or '?'
    if (!views || views === "?") {
      try {
        // Extract Post ID from script
        let postId = null;
        $("script").each((i, elem) => {
          const content = $(elem).html();
          if (content && content.includes("ts_dynamic_ajax_view")) {
            const match = content.match(/ts_dynamic_ajax_view\((\d+)\)/);
            if (match && match[1]) {
              postId = match[1];
            }
          }
        });

        if (postId) {
          const ajaxUrl = "https://manhwaindo.app/wp-admin/admin-ajax.php";
          const params = new URLSearchParams();
          params.append("action", "dynamic_view_ajax");
          params.append("post_id", postId);

          const ajaxResponse = await axios.post(ajaxUrl, params, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "X-Requested-With": "XMLHttpRequest",
              Referer: url,
              Origin: "https://manhwaindo.app",
            },
          });

          if (ajaxResponse.data && ajaxResponse.data.views) {
            views = ajaxResponse.data.views;
          }
        }
      } catch (err) {
        console.error("Error fetching views via AJAX:", err.message);
        // Ignore error and keep default views value
      }
    }

    // Get synopsis
    const synopsis = $(".entry-content.entry-content-single").text().trim();

    // Get genres
    const genres = [];
    $(".mgen a, .genre-info a").each((i, elem) => {
      const genre = $(elem).text().trim();
      if (genre && !genres.includes(genre)) {
        genres.push(genre);
      }
    });

    // Get chapters
    const chapters = [];
    $("#chapterlist li").each((i, elem) => {
      const chapterTitle = $(elem).find(".chapternum").text().trim();
      const chapterUrl = $(elem).find("a").attr("href") || "";
      const chapterSlug = chapterUrl.replace(BASE_URL, "").replace("/", "");
      const releaseDate = $(elem).find(".chapterdate").text().trim();

      chapters.push({
        title: chapterTitle,
        slug: chapterSlug,
        url: chapterUrl,
        releaseDate,
      });
    });

    return {
      success: true,
      data: {
        title,
        alternativeTitle,
        slug,
        image,
        rating,
        status,
        type,
        released,
        author,
        artist,
        postedBy,
        postedOn,
        updatedOn,
        views,
        followers,
        synopsis,
        genres,
        url,
        totalChapters: chapters.length,
        chapters,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape chapter images
 */
async function scrapeChapter(slug) {
  try {
    const url = `${BASE_URL}/${slug}/`;
    const $ = await fetchHTML(url);

    const title = $(".entry-title").text().trim();
    const images = [];

    $("#readerarea img").each((i, elem) => {
      let imgSrc = $(elem).attr("src") || "";
      if (imgSrc) {
        // Fix URL format - replace triple slash with double slash
        imgSrc = imgSrc.replace(/^https:\/\/\//, "https://");
        imgSrc = imgSrc.replace(/^http:\/\/\//, "http://");
        images.push(imgSrc);
      }
    });

    // Get series slug from breadcrumb
    let seriesSlug = null;
    const breadcrumbLink = $(".allc a").first();
    if (breadcrumbLink.length > 0) {
      const seriesUrl = breadcrumbLink.attr("href") || "";
      // Check if it's a valid series URL (not bookmark or other pages)
      if (seriesUrl.includes("/series/")) {
        seriesSlug = seriesUrl.replace(BASE_URL, "").replace("/series/", "").replace(/\//g, "").trim();
      }
    }

    // Fallback 1: Extract series name from title if breadcrumb doesn't work
    if (!seriesSlug) {
      // Title format: "Series Name Chapter X"
      const titleMatch = title.match(/^(.+?)\s+Chapter\s+\d+/i);
      if (titleMatch) {
        const seriesName = titleMatch[1].trim();
        seriesSlug = seriesName.toLowerCase().replace(/\s+/g, "-");
      }
    }

    // Fallback 2: Extract from chapter slug pattern (series-name-chapter-X)
    if (!seriesSlug && slug) {
      const slugMatch = slug.match(/^(.+?)-chapter-\d+/i);
      if (slugMatch) {
        seriesSlug = slugMatch[1].trim();
      }
    }

    // If we have series slug, fetch chapter list to get prev/next
    let prevChapter = null;
    let nextChapter = null;

    if (seriesSlug) {
      try {
        const seriesUrl = `${BASE_URL}/series/${seriesSlug}/`;
        const $series = await fetchHTML(seriesUrl);

        // Get all chapters
        const chapterSlugs = [];
        $series("#chapterlist li a").each((i, elem) => {
          const chapterUrl = $series(elem).attr("href") || "";
          const chapterSlug = chapterUrl.replace(BASE_URL, "").replace(/^\//, "").replace(/\/$/, "").trim();
          if (chapterSlug && !chapterSlugs.includes(chapterSlug)) {
            chapterSlugs.push(chapterSlug);
          }
        });

        // Find current chapter index
        const currentIndex = chapterSlugs.indexOf(slug);
        if (currentIndex !== -1) {
          // Previous chapter (index - 1)
          if (currentIndex > 0) {
            prevChapter = chapterSlugs[currentIndex - 1];
          }
          // Next chapter (index + 1)
          if (currentIndex < chapterSlugs.length - 1) {
            nextChapter = chapterSlugs[currentIndex + 1];
          }
        }
      } catch (err) {
        console.error("Error fetching series detail for navigation:", err.message);
        // Continue without prev/next navigation
      }
    }

    return {
      success: true,
      data: {
        title,
        slug,
        images,
        prevChapter,
        nextChapter,
        totalImages: images.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Search manhwa
 */
async function scrapeSearch(query) {
  try {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
    const $ = await fetchHTML(url);
    const manhwaList = [];

    $(".bsx").each((i, elem) => {
      const title = $(elem).find(".tt").text().trim();
      const slug = $(elem).find("a").attr("href")?.replace(BASE_URL, "").replace("/series/", "").replace("/", "") || "";
      const image = $(elem).find("img").attr("src") || "";
      const type = $(elem).find(".type").text().trim();
      const rating = $(elem).find(".numscore").text().trim();

      manhwaList.push({
        title,
        slug,
        image,
        type,
        rating,
        url: `${BASE_URL}/series/${slug}/`,
      });
    });

    return {
      success: true,
      query,
      data: manhwaList,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape project updates from homepage "Project Update" section
 */
async function scrapeProjectUpdates(page = 1) {
  try {
    // Project Update only available on homepage (page 1)
    if (page > 1) {
      return {
        success: true,
        page,
        data: [],
      };
    }

    const url = BASE_URL;
    const $ = await fetchHTML(url);
    const manhwaList = [];

    // Find "Project Update" heading and get items from next section
    let projectSection = null;
    $("h2, h3").each((i, elem) => {
      if ($(elem).text().trim() === "Project Update") {
        projectSection = $(elem).parent().next(".listupd");
        return false; // break
      }
    });

    if (projectSection) {
      // Scrape from Project Update section (.utao structure)
      projectSection.find(".utao").each((i, elem) => {
        const uta = $(elem).find(".uta");
        const title = uta.find(".luf h4").text().trim();
        const url = uta.find("a.series").attr("href") || "";
        const slug = url.replace(BASE_URL, "").replace("/series/", "").replace("/", "") || "";
        const image = uta.find(".imgu img").attr("src") || "";
        const type = "Manhwa";
        const rating = "";

        // Get chapters with time
        const chapters = [];
        uta.find(".luf ul li").each((j, li) => {
          const link = $(li).find("a");
          const timeSpan = $(li).find("span");
          chapters.push({
            title: link.text().trim(),
            url: link.attr("href") || "",
            slug: link.attr("href")?.replace(BASE_URL, "").replace("/", "") || "",
            time: timeSpan.text().trim() || "",
          });
        });

        manhwaList.push({
          title,
          slug,
          image,
          type,
          rating,
          url,
          chapters,
        });
      });
    }

    return {
      success: true,
      page,
      data: manhwaList,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape last update from homepage "Latest Update" section
 */
async function scrapeLastUpdate(page = 1) {
  try {
    // For page 1, use homepage Latest Update section. For other pages, use /series/?order=update
    const url = page === 1 ? BASE_URL : `${BASE_URL}/series/?page=${page}&order=update`;
    const $ = await fetchHTML(url);
    const manhwaList = [];

    if (page === 1) {
      // Find "Latest Update" heading and get items from next section
      let latestSection = null;
      $("h2, h3").each((i, elem) => {
        if ($(elem).text().trim() === "Latest Update") {
          latestSection = $(elem).parent().next(".listupd");
          return false; // break
        }
      });

      if (latestSection) {
        // Scrape from Latest Update section (.utao structure) - has time information
        latestSection.find(".utao").each((i, elem) => {
          const uta = $(elem).find(".uta");
          const title = uta.find(".luf h4").text().trim();
          const url = uta.find("a.series").attr("href") || "";
          const slug = url.replace(BASE_URL, "").replace("/series/", "").replace("/", "") || "";
          const image = uta.find(".imgu img").attr("src") || "";
          const type = "Manhwa";
          const rating = "";

          // Get chapters with time
          const chapters = [];
          uta.find(".luf ul li").each((j, li) => {
            const link = $(li).find("a");
            const timeSpan = $(li).find("span");
            chapters.push({
              title: link.text().trim(),
              url: link.attr("href") || "",
              slug: link.attr("href")?.replace(BASE_URL, "").replace("/", "") || "",
              time: timeSpan.text().trim() || "",
            });
          });

          manhwaList.push({
            title,
            slug,
            image,
            type,
            rating,
            url,
            chapters,
          });
        });
      }
    } else {
      // Scrape from Series List (.bsx structure) - no time information
      $(".bsx").each((i, elem) => {
        const title = $(elem).find(".tt").text().trim();
        const slug = $(elem).find("a").attr("href")?.replace(BASE_URL, "").replace("/series/", "").replace("/", "") || "";
        const image = $(elem).find("img").attr("src") || "";
        const type = $(elem).find(".type").text().trim();
        const rating = $(elem).find(".numscore").text().trim();

        // Get latest chapters
        const chapters = [];
        const epxs = $(elem).find(".epxs").text().trim();
        if (epxs) {
          // Generate chapter slug from title
          const chapterSlug = epxs.toLowerCase().replace(/\s+/g, "-");
          const fullSlug = slug ? `${slug}-${chapterSlug}` : chapterSlug;

          chapters.push({
            title: epxs,
            url: `${BASE_URL}/${fullSlug}/`,
            slug: fullSlug,
            time: "",
          });
        }

        $(elem)
          .find(".eph-num a")
          .each((j, chap) => {
            const chapterUrl = $(chap).attr("href") || "";
            const chapterSlug = chapterUrl.replace(BASE_URL, "").replace(/^\//, "").replace(/\/$/, "");

            chapters.push({
              title: $(chap).text().trim(),
              url: chapterUrl,
              slug: chapterSlug,
              time: "",
            });
          });

        manhwaList.push({
          title,
          slug,
          image,
          type,
          rating,
          url: `${BASE_URL}/series/${slug}/`,
          chapters,
        });
      });
    }

    return {
      success: true,
      page,
      data: manhwaList,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape series list from /series page with filters
 * @param {number} page - Page number
 * @param {object} filters - Filter options { order, type, status, genre }
 */
async function scrapeSeriesList(page = 1, filters = {}) {
  try {
    // Build URL with filters
    const params = new URLSearchParams();
    params.append("page", page);

    // Add filters
    if (filters.order) params.append("order", filters.order); // update, popular, latest, title
    if (filters.type) params.append("type", filters.type); // manhwa, manhua, manga
    if (filters.status) params.append("status", filters.status); // ongoing, completed, hiatus
    if (filters.genre) params.append("genre", filters.genre); // action, romance, etc

    const url = `${BASE_URL}/series/?${params.toString()}`;
    const $ = await fetchHTML(url);
    const seriesList = [];

    // Scrape from series grid (.bsx structure)
    $(".bsx").each((i, elem) => {
      const title = $(elem).find(".tt").text().trim();
      const slug = $(elem).find("a").attr("href")?.replace(BASE_URL, "").replace("/series/", "").replace(/\//g, "") || "";
      const image = $(elem).find("img").attr("src") || "";
      const type = $(elem).find(".type").text().trim();
      const rating = $(elem).find(".numscore").text().trim();
      const latestChapter = $(elem).find(".epxs").text().trim();

      seriesList.push({
        title,
        slug,
        image,
        type,
        rating,
        latestChapter,
        url: `${BASE_URL}/series/${slug}/`,
      });
    });

    return {
      success: true,
      page,
      filters,
      totalSeries: seriesList.length,
      data: seriesList,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Scrape available genres list
 */
async function scrapeGenres() {
  try {
    const url = `${BASE_URL}/series/`;
    const $ = await fetchHTML(url);
    const genres = [];

    // Scrape from genre checkboxes
    $('input.genre-item[type="checkbox"]').each((i, elem) => {
      const id = $(elem).attr("value") || "";
      const label = $(`label[for="${$(elem).attr("id")}"]`)
        .text()
        .trim();

      if (id && label) {
        genres.push({
          id,
          name: label,
          slug: label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        });
      }
    });

    // Sort alphabetically by name
    genres.sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      totalGenres: genres.length,
      data: genres,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

module.exports = {
  scrapeLatest,
  scrapePopular,
  scrapeDetail,
  scrapeChapter,
  scrapeSearch,
  scrapeProjectUpdates,
  scrapeLastUpdate,
  scrapeSeriesList,
  scrapeGenres,
};
