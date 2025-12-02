const axios = require("axios");
const cheerio = require("cheerio");

async function debugSplit() {
  try {
    const { data } = await axios.get("https://anoboy.gg/one-piece-episode-1150-subtitle-indonesia/");
    const $ = cheerio.load(data);

    console.log("\n=== Debugging .split elements ===\n");

    $(".split").each((i, el) => {
      const $el = $(el);
      const fullText = $el.text().trim();
      const label = $el.find("b").text().trim();
      const value = fullText.replace(label, "").trim();

      console.log(`Split ${i}:`);
      console.log(`  Full Text: "${fullText}"`);
      console.log(`  Label: "${label}"`);
      console.log(`  Value: "${value}"`);
      console.log(`  Has <a>: ${$el.find("a").length > 0}`);
      if ($el.find("a").length > 0) {
        console.log(`  Link text: "${$el.find("a").text().trim()}"`);
      }
      console.log("");
    });

    console.log("\n=== Debugging .spe elements ===\n");

    const speSpans = $(".spe span");
    console.log(`Total .spe span elements: ${speSpans.length}`);

    speSpans.each((i, el) => {
      console.log(`Span ${i}: "${$(el).text().trim()}"`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

debugSplit();
