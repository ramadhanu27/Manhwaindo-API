const axios = require("axios");
const cheerio = require("cheerio");

async function checkImageSource() {
  try {
    console.log("Checking image source from manhwaindo.app...\n");

    const url = "https://manhwaindo.app/solo-leveling-chapter-1/";
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);

    console.log("First 3 images from #readerarea:");
    $("#readerarea img")
      .slice(0, 3)
      .each((i, elem) => {
        const src = $(elem).attr("src");
        const dataSrc = $(elem).attr("data-src");
        const lazySrc = $(elem).attr("data-lazy-src");

        console.log(`\nImage ${i + 1}:`);
        console.log("  src:", src);
        console.log("  data-src:", dataSrc);
        console.log("  data-lazy-src:", lazySrc);
      });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkImageSource();
