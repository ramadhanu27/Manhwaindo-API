const axios = require('axios');
const cheerio = require('cheerio');

async function debugVeteranViews() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/series/the-veteran-healer-is-overpowered/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== Debugging Veteran Healer Views ===\n');
    
    $('.tsinfo .imptdt').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text.toLowerCase().includes('views') || $(elem).find('.ts-views-count').length > 0) {
        console.log('Found Views Element:');
        console.log('HTML:', $(elem).html());
        console.log('Text:', text);
        console.log('.ts-views-count text:', $(elem).find('.ts-views-count').text());
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugVeteranViews();
