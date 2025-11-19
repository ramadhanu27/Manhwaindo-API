const axios = require('axios');
const cheerio = require('cheerio');

async function testDetailParsing() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/series/the-veteran-healer-is-overpowered/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== Detailed Parsing Test ===\n');
    
    $('.tsinfo .imptdt').each((i, elem) => {
      const fullText = $(elem).text().trim();
      const iconText = $(elem).find('i').text().trim();
      
      // Remove icon text to get value
      let value = fullText;
      if (iconText) {
        value = fullText.replace(iconText, '').trim();
      }
      
      console.log(`Index ${i}:`);
      console.log(`  Full text: "${fullText}"`);
      console.log(`  Icon text: "${iconText}"`);
      console.log(`  Value: "${value}"`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDetailParsing();
