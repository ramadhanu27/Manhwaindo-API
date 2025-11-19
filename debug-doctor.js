const axios = require('axios');
const cheerio = require('cheerio');

async function debugDoctor() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/series/doctors-rebirth-id/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== Debugging Doctor\'s Rebirth ID ===\n');
    
    console.log('All .tsinfo .imptdt elements:');
    $('.tsinfo .imptdt').each((i, elem) => {
      console.log(`\n[${i}] Full Text: "${$(elem).text().trim()}"`);
      console.log(`    HTML: ${$(elem).html()}`);
    });
    
    console.log('\n\n=== Checking for Artist specifically ===');
    console.log('Contains "Artist":', $('*:contains("Artist")').length);
    
    $('*').filter(function() {
      return $(this).text().toLowerCase().includes('artist');
    }).each((i, elem) => {
      if (i < 5) {
        console.log(`Found: ${$(elem).prop('tagName')} - "${$(elem).text().trim().substring(0, 50)}"`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugDoctor();
