const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://manhwaindo.app';

async function debugSeparateSections() {
  try {
    const { data } = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    // Cari section "Project Update"
    let projectUpdateSection = null;
    let latestUpdateSection = null;
    
    $('.releases').each((i, section) => {
      const heading = $(section).find('h2, h3').first().text().trim();
      
      if (heading.includes('Project Update')) {
        projectUpdateSection = $(section);
        console.log('=== FOUND PROJECT UPDATE SECTION ===');
        console.log('Heading:', heading);
        
        const items = $(section).find('.utao');
        console.log('Total items:', items.length);
        console.log('\nFirst 3 items:');
        items.slice(0, 3).each((j, elem) => {
          const title = $(elem).find('.uta .luf h4').text().trim();
          console.log(`  ${j + 1}. ${title}`);
        });
      }
      
      if (heading.includes('Latest Update')) {
        latestUpdateSection = $(section);
        console.log('\n=== FOUND LATEST UPDATE SECTION ===');
        console.log('Heading:', heading);
        
        const items = $(section).find('.utao');
        console.log('Total items:', items.length);
        console.log('\nFirst 3 items:');
        items.slice(0, 3).each((j, elem) => {
          const title = $(elem).find('.uta .luf h4').text().trim();
          console.log(`  ${j + 1}. ${title}`);
        });
      }
    });
    
    // Check selector strategy
    console.log('\n=== SELECTOR STRATEGY ===');
    console.log('Can use: .releases:has(h2:contains("Project Update")) .utao');
    console.log('Or use: .releases:eq(0) .utao for Project Update');
    console.log('And: .releases:eq(1) .utao for Latest Update');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugSeparateSections();
