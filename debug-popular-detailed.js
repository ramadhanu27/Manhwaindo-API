const axios = require("axios");
const cheerio = require("cheerio");

async function debugPopularDetailed() {
  try {
    const { data } = await axios.get("https://anoboy.gg");
    const $ = cheerio.load(data);

    console.log("\n=== Detailed Popular Debug ===\n");

    // Check selectors
    console.log("1. .wpop-alltime li count:", $(".wpop-alltime li").length);
    console.log("2. .wpop-weekly li count:", $(".wpop-weekly li").length);
    console.log("3. .wpop-monthly li count:", $(".wpop-monthly li").length);
    console.log("");

    // Check first item structure
    const $firstItem = $(".wpop-alltime li").first();
    console.log("4. First item HTML (first 500 chars):");
    console.log($firstItem.html().substring(0, 500));
    console.log("");

    // Test extraction
    console.log("5. Testing extraction on first item:");
    const $link = $firstItem.find("a.series").first();
    console.log("   a.series found:", $link.length);
    console.log("   title:", $link.text().trim());
    console.log("   href:", $link.attr("href"));
    console.log("   img src:", $firstItem.find("img").attr("src"));
    console.log("   .numscore:", $firstItem.find(".numscore").text().trim());
    console.log("");

    // Check if title is empty
    if (!$link.text().trim()) {
      console.log("6. Title is EMPTY! Checking alternative selectors:");
      console.log("   h4 text:", $firstItem.find("h4").text().trim());
      console.log("   .tt text:", $firstItem.find(".tt").text().trim());
      console.log("   All a tags:", $firstItem.find("a").length);
      $firstItem.find("a").each((i, el) => {
        console.log(`   a[${i}] text:`, $(el).text().trim().substring(0, 50));
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

debugPopularDetailed();
