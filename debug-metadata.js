const axios = require('axios');
const cheerio = require('cheerio');

async function debugMetadata() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/series/doctors-rebirth-id/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== Debugging Metadata for Doctor\'s Rebirth ID ===\n');
    
    $('.tsinfo .imptdt').each((i, elem) => {
      console.log(`Element ${i}:`);
      console.log('  HTML:', $(elem).html().trim());
      console.log('  Text:', $(elem).text().trim());
      console.log('  Icon Text:', $(elem).find('i').text().trim());
      console.log('-------------------');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugMetadata();
