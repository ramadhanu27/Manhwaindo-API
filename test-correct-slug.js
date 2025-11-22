const axios = require("axios");

async function testCorrectSlug() {
  try {
    console.log("Testing with correct slug...\n");

    const response = await axios.get("http://localhost:3000/api/chapter/the-solo-leveling-id-chapter-00");
    const data = response.data;

    if (data.success && data.data.images) {
      const images = data.data.images;
      console.log(`✅ Success! Found ${images.length} images\n`);

      console.log("First 3 image URLs:");
      images.slice(0, 3).forEach((url, i) => {
        console.log(`${i + 1}. ${url}`);
      });

      // Test if first image is accessible
      console.log("\nTesting first image accessibility...");
      try {
        const imgResponse = await axios.head(images[0], { timeout: 5000 });
        console.log(`✅ Image is accessible! Status: ${imgResponse.status}`);
        console.log(`   Content-Type: ${imgResponse.headers["content-type"]}`);
      } catch (err) {
        console.log(`❌ Image not accessible: ${err.message}`);
      }
    } else {
      console.log("❌ Failed:", data);
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

testCorrectSlug();
