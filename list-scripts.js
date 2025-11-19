const axios = require('axios');
const cheerio = require('cheerio');

async function listScripts() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/series/kucing-oren-galak/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== External Scripts ===\n');
    
    $('script[src]').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src.includes('ts') || src.includes('theme') || src.includes('custom')) {
        console.log(src);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listScripts();
