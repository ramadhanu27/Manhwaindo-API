const axios = require("axios");
const cheerio = require("cheerio");

async function testAnoboy() {
  try {
    const { data } = await axios.get("https://anoboy.gg/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);

    console.log("=== Testing Selectors ===\n");

    // Test different selectors
    console.log("1. article.post count:", $("article.post").length);
    console.log("2. article count:", $("article").length);
    console.log("3. .post count:", $(".post").length);
    console.log("4. h2.entry-title count:", $("h2.entry-title").length);
    console.log("5. .entry-title count:", $(".entry-title").length);

    // Get first article structure
    const firstArticle = $("article").first();
    console.log("\n=== First Article HTML ===");
    console.log(firstArticle.html().substring(0, 500));

    // Try to find anime items
    console.log("\n=== Looking for anime items ===");
    $("article")
      .slice(0, 3)
      .each((i, el) => {
        const title = $(el).find("h2 a, .entry-title a, h3 a").first().text().trim();
        const link = $(el).find("a").first().attr("href");
        console.log(`${i + 1}. Title: ${title}`);
        console.log(`   Link: ${link}\n`);
      });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testAnoboy();
