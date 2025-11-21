const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://manhwaindo.app";

async function testGenreFilter() {
  try {
    console.log("=== TESTING GENRE FILTER ===\n");

    // First, get genre list from series page
    const { data } = await axios.get(`${BASE_URL}/series/`);
    const $ = cheerio.load(data);

    console.log("Available genres:");
    const genres = [];
    $('input.genre-item[type="checkbox"]').each((i, elem) => {
      const id = $(elem).attr("value") || "";
      const label = $(`label[for="${$(elem).attr("id")}"]`)
        .text()
        .trim();

      if (id && label) {
        genres.push({ id, name: label });
        if (i < 5) {
          // Show first 5
          console.log(`  ${label}: ${id}`);
        }
      }
    });

    console.log(`  ... (${genres.length} total genres)\n`);

    // Test genre filter with ID
    if (genres.length > 0) {
      const testGenre = genres[0];
      console.log(`Testing genre filter with "${testGenre.name}" (ID: ${testGenre.id}):`);

      // Test with genre[]=ID format
      const testUrl = `${BASE_URL}/series/?page=1&genre[]=${testGenre.id}`;
      console.log(`URL: ${testUrl}`);

      try {
        const res = await axios.get(testUrl);
        console.log(`✅ Status: ${res.status}\n`);
      } catch (err) {
        console.log(`❌ Error: ${err.response?.status || err.message}\n`);
      }

      // Test with multiple genres
      if (genres.length > 1) {
        const testUrl2 = `${BASE_URL}/series/?page=1&genre[]=${genres[0].id}&genre[]=${genres[1].id}`;
        console.log(`Testing multiple genres:`);
        console.log(`URL: ${testUrl2}`);

        try {
          const res2 = await axios.get(testUrl2);
          console.log(`✅ Status: ${res2.status}\n`);
        } catch (err) {
          console.log(`❌ Error: ${err.response?.status || err.message}\n`);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testGenreFilter();
