const axios = require("axios");
const cheerio = require("cheerio");

async function testSynopsis() {
  try {
    const { data } = await axios.get("https://anoboy.gg/one-piece-episode-1144-subtitle-indonesia/");
    const $ = cheerio.load(data);

    console.log("\n=== Testing Synopsis Selectors ===\n");

    console.log("1. .desc.mindes.alldes exists?", $(".desc.mindes.alldes").length > 0);
    console.log("   Text:", $(".desc.mindes.alldes").text().trim().substring(0, 150));
    console.log("");

    console.log("2. .desc.mindes.sliders exists?", $(".desc.mindes.sliders").length > 0);
    console.log("   Text:", $(".desc.mindes.sliders").text().trim().substring(0, 150));
    console.log("");

    console.log("3. .bixbox.synp exists?", $(".bixbox.synp").length > 0);
    console.log("   Text:", $(".bixbox.synp").text().trim().substring(0, 150));
    console.log("");

    console.log("4. All .desc classes:");
    $('[class*="desc"]').each((i, el) => {
      const classes = $(el).attr("class");
      const text = $(el).text().trim().substring(0, 100);
      console.log(`   ${i}. class="${classes}"`);
      console.log(`      Text: ${text}...`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testSynopsis();
