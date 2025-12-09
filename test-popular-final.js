const { scrapePopular } = require("./anime/scraper");

async function test() {
  console.log("Testing scrapePopular on production code...\n");

  const result = await scrapePopular("all");
  console.log("Result:", JSON.stringify(result, null, 2));

  if (result.success && result.data.length > 0) {
    console.log("\n✅ SUCCESS! Found", result.data.length, "popular anime");
    console.log("First anime:", result.data[0].title);
  } else {
    console.log("\n❌ FAILED! No data returned");
  }
}

test();
