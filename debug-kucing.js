const axios = require('axios');
const cheerio = require('cheerio');

async function debugKucing() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/series/kucing-oren-galak/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== Debugging Kucing Oren Galak ===\n');
    
    $('.tsinfo .imptdt').each((i, elem) => {
      console.log(`Element ${i}:`);
      console.log('  Text:', $(elem).text().trim());
      console.log('  HTML:', $(elem).html().trim());
      console.log('-------------------');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugKucing();
