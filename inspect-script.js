const axios = require('axios');
const cheerio = require('cheerio');

async function inspectScript() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/series/kucing-oren-galak/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== Inspecting Script 18 ===\n');
    
    $('script').each((i, elem) => {
      const content = $(elem).html();
      if (content && content.includes('views')) {
        console.log(`Script ${i} Content:`);
        console.log(content);
        console.log('-------------------');
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

inspectScript();
