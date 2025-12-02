const axios = require("axios");
const cheerio = require("cheerio");

async function debugSynopsis() {
  try {
    const { data } = await axios.get("https://anoboy.gg/one-piece-episode-1150-subtitle-indonesia/");
    const $ = cheerio.load(data);

    console.log("\n=== Debugging Synopsis Selectors ===\n");

    console.log("1. .entry-content.entry-content-single:");
    console.log($(".entry-content.entry-content-single").text().trim().substring(0, 200));
    console.log("");

    console.log("2. .entry-content p (all):");
    $(".entry-content p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 50) {
        console.log(`  Paragraph ${i}: ${text.substring(0, 150)}...`);
      }
    });
    console.log("");

    console.log("3. .bixbox.synp .entry-content:");
    console.log($(".bixbox.synp .entry-content").text().trim().substring(0, 200));
    console.log("");

    console.log('4. [itemprop="description"]:');
    console.log($('[itemprop="description"]').text().trim().substring(0, 200));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

debugSynopsis();
