const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://manhwaindo.app';

async function debugDetailStructure() {
  try {
    const { data } = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    // Cari semua .utao dan lihat parent mereka
    console.log('=== ALL .utao ITEMS ===');
    console.log('Total:', $('.utao').length);
    
    // Cari heading "Project Update"
    let projectHeading = null;
    let latestHeading = null;
    
    $('h2, h3, .heading').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text === 'Project Update') {
        projectHeading = $(elem);
      }
      if (text === 'Latest Update') {
        latestHeading = $(elem);
      }
    });
    
    if (projectHeading) {
      console.log('\n=== PROJECT UPDATE ===');
      // Cari .utao setelah heading ini
      const nextSection = projectHeading.parent().next();
      console.log('Next section class:', nextSection.attr('class'));
      
      const projectItems = nextSection.find('.utao');
      console.log('Items found:', projectItems.length);
      console.log('First 3:');
      projectItems.slice(0, 3).each((j, elem) => {
        const title = $(elem).find('.uta .luf h4').text().trim();
        console.log(`  ${j + 1}. ${title}`);
      });
    }
    
    if (latestHeading) {
      console.log('\n=== LATEST UPDATE ===');
      // Cari .utao setelah heading ini
      const nextSection = latestHeading.parent().next();
      console.log('Next section class:', nextSection.attr('class'));
      
      const latestItems = nextSection.find('.utao');
      console.log('Items found:', latestItems.length);
      console.log('First 3:');
      latestItems.slice(0, 3).each((j, elem) => {
        const title = $(elem).find('.uta .luf h4').text().trim();
        console.log(`  ${j + 1}. ${title}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugDetailStructure();
