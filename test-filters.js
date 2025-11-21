const axios = require("axios");

const BASE_URL = "https://manhwaindo.app";

async function testFilters() {
  try {
    console.log("=== TESTING FILTER COMBINATIONS ===\n");

    // Test 1: No filter
    console.log("1. Testing no filter:");
    const test1 = `${BASE_URL}/series/?page=1`;
    console.log(`   URL: ${test1}`);
    try {
      const res1 = await axios.get(test1);
      console.log(`   ✅ Status: ${res1.status}\n`);
    } catch (err) {
      console.log(`   ❌ Error: ${err.response?.status || err.message}\n`);
    }

    // Test 2: Order only
    console.log("2. Testing order=update:");
    const test2 = `${BASE_URL}/series/?page=1&order=update`;
    console.log(`   URL: ${test2}`);
    try {
      const res2 = await axios.get(test2);
      console.log(`   ✅ Status: ${res2.status}\n`);
    } catch (err) {
      console.log(`   ❌ Error: ${err.response?.status || err.message}\n`);
    }

    // Test 3: Type only
    console.log("3. Testing type=manhwa:");
    const test3 = `${BASE_URL}/series/?page=1&type=manhwa`;
    console.log(`   URL: ${test3}`);
    try {
      const res3 = await axios.get(test3);
      console.log(`   ✅ Status: ${res3.status}\n`);
    } catch (err) {
      console.log(`   ❌ Error: ${err.response?.status || err.message}\n`);
    }

    // Test 4: Status only
    console.log("4. Testing status=ongoing:");
    const test4 = `${BASE_URL}/series/?page=1&status=ongoing`;
    console.log(`   URL: ${test4}`);
    try {
      const res4 = await axios.get(test4);
      console.log(`   ✅ Status: ${res4.status}\n`);
    } catch (err) {
      console.log(`   ❌ Error: ${err.response?.status || err.message}\n`);
    }

    // Test 5: Genre only (might need genre ID instead of name)
    console.log("5. Testing genre=action:");
    const test5 = `${BASE_URL}/series/?page=1&genre=action`;
    console.log(`   URL: ${test5}`);
    try {
      const res5 = await axios.get(test5);
      console.log(`   ✅ Status: ${res5.status}\n`);
    } catch (err) {
      console.log(`   ❌ Error: ${err.response?.status || err.message}\n`);
    }

    // Test 6: All filters combined
    console.log("6. Testing all filters:");
    const test6 = `${BASE_URL}/series/?page=1&order=update&type=manhwa&status=ongoing&genre=action`;
    console.log(`   URL: ${test6}`);
    try {
      const res6 = await axios.get(test6);
      console.log(`   ✅ Status: ${res6.status}\n`);
    } catch (err) {
      console.log(`   ❌ Error: ${err.response?.status || err.message}\n`);
    }

    // Test 7: Order + Type
    console.log("7. Testing order=update&type=manhwa:");
    const test7 = `${BASE_URL}/series/?page=1&order=update&type=manhwa`;
    console.log(`   URL: ${test7}`);
    try {
      const res7 = await axios.get(test7);
      console.log(`   ✅ Status: ${res7.status}\n`);
    } catch (err) {
      console.log(`   ❌ Error: ${err.response?.status || err.message}\n`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testFilters();
