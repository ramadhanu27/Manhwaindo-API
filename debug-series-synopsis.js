const axios = require("axios");
const cheerio = require("cheerio");

async function testSynopsis() {
  try {
    const { data } = await axios.get("https://anoboy.gg/anime/fujimoto-tatsuki-17-26/");
    const $ = cheerio.load(data);

    console.log("\n=== Testing Synopsis Selectors ===\n");

    console.log('1. .entry-content[itemprop="description"] exists?', $('.entry-content[itemprop="description"]').length > 0);
    console.log("   Text:", $('.entry-content[itemprop="description"]').text().trim().substring(0, 200));
    console.log("");

    console.log("2. .desc.mindes exists?", $(".desc.mindes").length > 0);
    console.log("   Text:", $(".desc.mindes").text().trim().substring(0, 200));
    console.log("");

    console.log("3. .bixbox.synp exists?", $(".bixbox.synp").length > 0);
    console.log("   Text:", $(".bixbox.synp .entry-content").text().trim().substring(0, 200));
    console.log("");

    console.log('4. All elements with itemprop="description":');
    $('[itemprop="description"]').each((i, el) => {
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
