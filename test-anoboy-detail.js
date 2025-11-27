const axios = require("axios");
const cheerio = require("cheerio");

async function testAnoboyDetail() {
  try {
    const { data } = await axios.get("https://anoboy.gg/kimi-to-koete-koi-ni-naru-episode-7-subtitle-indonesia/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);

    console.log("=== Testing Detail Page ===\n");

    // Title
    const title = $("h1.entry-title").text().trim();
    console.log("Title:", title);

    // Thumbnail
    const thumb = $(".thumb img").attr("src");
    console.log("Thumbnail:", thumb);

    // Synopsis
    const synopsis = $(".entry-content p").first().text().trim();
    console.log("Synopsis:", synopsis.substring(0, 100) + "...");

    // Streaming iframes
    console.log("\n=== Streaming Links ===");
    $("iframe").each((i, el) => {
      const src = $(el).attr("src");
      console.log(`${i + 1}. ${src}`);
    });

    // Download links
    console.log("\n=== Download Links ===");
    $("a").each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");
      if (text && href && (text.includes("Download") || text.includes("480p") || text.includes("720p") || text.includes("1080p") || text.includes("MP4"))) {
        console.log(`${text}: ${href}`);
      }
    });

    // Check for video player
    console.log("\n=== Video Player ===");
    const videoPlayer = $(".player, #player, .video-player").html();
    if (videoPlayer) {
      console.log("Found player:", videoPlayer.substring(0, 200));
    }

    // Check for download section
    console.log("\n=== Download Section ===");
    const downloadSection = $(".download, .dl, .unduh").html();
    if (downloadSection) {
      console.log("Found download section:", downloadSection.substring(0, 200));
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testAnoboyDetail();
