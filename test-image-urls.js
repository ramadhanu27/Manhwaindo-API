const axios = require("axios");

async function testChapterImages() {
  try {
    console.log("Testing chapter API...\n");

    const response = await axios.get("http://localhost:3000/api/chapter/solo-leveling-chapter-1");
    const data = response.data;

    if (data.success && data.data.images) {
      const images = data.data.images;
      console.log(`Total images: ${images.length}\n`);

      console.log("First 5 image URLs:");
      images.slice(0, 5).forEach((url, i) => {
        console.log(`${i + 1}. ${url}`);

        // Check URL format
        if (url.startsWith("https:///") || url.startsWith("http:///")) {
          console.log("   ⚠️ INVALID: Triple slash detected!");
        } else if (url.startsWith("https://") || url.startsWith("http://")) {
          console.log("   ✅ Valid URL format");
        } else {
          console.log("   ❌ Unknown format");
        }
      });

      // Check if all URLs have the same issue
      const tripleSlashCount = images.filter((url) => url.startsWith("https:///") || url.startsWith("http:///")).length;

      console.log(`\n${tripleSlashCount} out of ${images.length} URLs have triple slash issue`);

      if (tripleSlashCount === 0) {
        console.log("\n✅ All URLs are valid!");
      }
    } else {
      console.log("Failed to get chapter data:", data);
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

testChapterImages();
