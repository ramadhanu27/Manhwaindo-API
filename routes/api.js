const express = require("express");
const router = express.Router();
const { scrapeLatest, scrapePopular, scrapeDetail, scrapeChapter, scrapeSearch, scrapeProjectUpdates, scrapeLastUpdate, scrapeSeriesList, scrapeGenres } = require("../utils/scraper");

/**
 * GET /api
 * API info
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Manhwaindo API",
    version: "1.0.0",
    endpoints: {
      project: "/api/project?page=1 (Project Updates)",
      lastupdate: "/api/lastupdate?page=1 (Latest Update)",
      popular: "/api/popular",
      seriesList: "/api/series-list?page=1 (All Series List)",
      genres: "/api/genres (Get all genres)",
      detail: "/api/series/:slug",
      chapter: "/api/chapter/:slug (Get chapter images for reading/download)",
      search: "/api/search?q=query",
    },
  });
});

/**
 * GET /api/project
 * Get project updates (from homepage Project Update section)
 */
router.get("/project", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scrapeProjectUpdates(page);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/lastupdate
 * Get last updates (from /series/?order=update)
 */
router.get("/lastupdate", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await scrapeLastUpdate(page);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/series-list
 * Get all series list with pagination and filters
 * Query params: page, order, type, status
 */
router.get("/series-list", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const filters = {
      order: req.query.order, // update, popular, latest, title
      type: req.query.type, // manhwa, manhua, manga
      status: req.query.status, // ongoing, completed, hiatus
      // genre removed - requires genre ID, not name
    };

    const result = await scrapeSeriesList(page, filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/popular
 * Get popular manhwa
 */
router.get("/popular", async (req, res) => {
  try {
    const result = await scrapePopular();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/genres
 * Get all available genres
 */
router.get("/genres", async (req, res) => {
  try {
    const result = await scrapeGenres();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/series/:slug
 * Get manhwa detail by slug
 */
router.get("/series/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await scrapeDetail(slug);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/chapter/:slug
 * Get chapter images
 */
router.get("/chapter/:slug(*)", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await scrapeChapter(slug);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/download/:slug
 * Get download information for a chapter (returns image URLs for client-side download)
 * This avoids Netlify's 6MB serverless function response limit
 */
router.get("/download/:slug(*)", async (req, res) => {
  try {
    const { slug } = req.params;

    // Get chapter data
    const result = await scrapeChapter(slug);

    if (!result.success) {
      return res.status(404).json(result);
    }

    const { title, images } = result.data;

    if (!images || images.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No images found in this chapter",
      });
    }

    console.log(`[Download Info] Returning ${images.length} image URLs for ${slug}`);

    // Return download information
    res.json({
      success: true,
      data: {
        slug,
        title,
        totalImages: images.length,
        images: images.map((url, index) => ({
          url,
          filename: `${String(index + 1).padStart(3, "0")}.jpg`,
          index: index + 1,
        })),
        downloadInstructions: "Use client-side download or the /api/download-zip/:slug endpoint for smaller chapters",
      },
    });
  } catch (error) {
    console.error("[Download Info] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/download-multiple
 * Download multiple chapters as single ZIP file
 * Body: { slugs: ["chapter-1", "chapter-2", ...] }
 */
router.post("/download-multiple", async (req, res) => {
  try {
    const { slugs } = req.body;
    const archiver = require("archiver");
    const axios = require("axios");

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Body must contain "slugs" array with at least one chapter slug',
      });
    }

    // Set response headers for ZIP download
    const filename = `chapters-${Date.now()}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Create ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      throw err;
    });

    archive.pipe(res);

    console.log(`[Multi Download] Starting download for ${slugs.length} chapters`);

    let totalSuccess = 0;
    let totalFail = 0;

    // Process each chapter
    for (let chapterIndex = 0; chapterIndex < slugs.length; chapterIndex++) {
      const slug = slugs[chapterIndex];

      try {
        // Get chapter data
        const result = await scrapeChapter(slug);

        if (!result.success || !result.data.images) {
          console.error(`[Multi Download] Failed to get chapter: ${slug}`);
          continue;
        }

        const { images } = result.data;
        const folderName = slug;

        // Download each image in this chapter
        for (let i = 0; i < images.length; i++) {
          try {
            const imageUrl = images[i];

            const response = await axios.get(imageUrl, {
              responseType: "arraybuffer",
              timeout: 30000,
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                Referer: "https://manhwaindo.app/",
                Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
              },
            });

            let ext = imageUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)?.[1];
            if (!ext) {
              const contentType = response.headers["content-type"];
              ext = contentType?.split("/")[1]?.split(";")[0] || "jpg";
            }

            const filename = `${String(i + 1).padStart(3, "0")}.${ext}`;

            // Add image to archive in chapter folder
            archive.append(Buffer.from(response.data), {
              name: `${folderName}/${filename}`,
            });

            totalSuccess++;
          } catch (error) {
            totalFail++;
            console.error(`[Multi Download] Failed image ${i + 1} in ${slug}: ${error.message}`);
          }
        }
      } catch (error) {
        console.error(`[Multi Download] Error processing ${slug}:`, error.message);
      }
    }

    console.log(`[Multi Download] Complete: ${totalSuccess} images success, ${totalFail} failed`);

    await archive.finalize();
  } catch (error) {
    console.error("[Multi Download] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
});

/**
 * GET /api/download-pdf/:slug
 * Download chapter as PDF file
 */
router.get("/download-pdf/:slug(*)", async (req, res) => {
  try {
    const { slug } = req.params;
    const PDFDocument = require("pdfkit");
    const axios = require("axios");

    // Get chapter data
    const result = await scrapeChapter(slug);

    if (!result.success) {
      return res.status(404).json(result);
    }

    const { title, images } = result.data;

    if (!images || images.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No images found in this chapter",
      });
    }

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${slug}.pdf"`);

    // Create PDF document with A4 size
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
    });

    // Pipe PDF to response
    doc.pipe(res);

    let successCount = 0;
    let failCount = 0;
    let yPosition = 0;
    const pageWidth = 595; // A4 width in points

    console.log(`[PDF Download] Starting for ${slug} (${images.length} images)`);

    // Download all images first
    const imageBuffers = [];
    for (let i = 0; i < images.length; i++) {
      try {
        const imageUrl = images[i];

        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
          timeout: 30000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://manhwaindo.app/",
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
        });

        imageBuffers.push(Buffer.from(response.data));
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`[PDF Download] Failed image ${i + 1}/${images.length}: ${error.message}`);
      }
    }

    // Calculate total height needed
    let totalHeight = 0;
    const imageInfos = [];

    for (const buffer of imageBuffers) {
      try {
        const img = doc.openImage(buffer);
        const scaledHeight = (img.height * pageWidth) / img.width;
        imageInfos.push({ buffer, width: pageWidth, height: scaledHeight });
        totalHeight += scaledHeight;
      } catch (error) {
        console.error("[PDF Download] Error processing image:", error.message);
      }
    }

    // Create single page with total height
    doc.addPage({
      size: [pageWidth, totalHeight],
      margin: 0,
    });

    // Add all images vertically
    yPosition = 0;
    for (const info of imageInfos) {
      doc.image(info.buffer, 0, yPosition, {
        width: info.width,
        height: info.height,
      });
      yPosition += info.height;
    }

    console.log(`[PDF Download] Complete: ${successCount} success, ${failCount} failed`);

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("[PDF Download] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
});

/**
 * GET /api/search
 * Search manhwa
 */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required',
      });
    }

    const result = await scrapeSearch(q);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
