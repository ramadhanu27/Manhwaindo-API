const axios = require("axios");

async function testAPI() {
  try {
    console.log("Testing API...\n");
    const response = await axios.get("http://localhost:3000/api/chapter/solo-leveling-chapter-1");
    console.log("Response:", JSON.stringify(response.data, null, 2).substring(0, 500));
  } catch (error) {
    console.error("Error:", error.code, error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testAPI();
