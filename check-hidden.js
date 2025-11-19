const axios = require('axios');
const cheerio = require('cheerio');

async function checkHiddenData() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/series/kucing-oren-galak/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== Checking Hidden Data ===\n');
    
    // Check JSON-LD
    $('script[type="application/ld+json"]').each((i, elem) => {
      console.log(`JSON-LD ${i}:`);
      console.log($(elem).html().substring(0, 200) + '...');
    });
    
    // Check Meta Tags
    console.log('\nMeta Tags:');
    $('meta').each((i, elem) => {
      const name = $(elem).attr('name') || $(elem).attr('property');
      const content = $(elem).attr('content');
      if (name && content) {
        console.log(`${name}: ${content}`);
      }
    });
    
    // Check scripts for variables
    console.log('\nScripts with "views" or numbers:');
    $('script').each((i, elem) => {
      const content = $(elem).html();
      if (content && (content.includes('views') || content.includes('1.1M'))) {
        console.log(`Script ${i}: Found potential match`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkHiddenData();
