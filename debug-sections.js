const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://manhwaindo.app';

async function debugHomeSections() {
  try {
    const { data } = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== LOOKING FOR SECTIONS ===\n');
    
    // Cari section dengan heading "Project Update"
    $('h2, h3, .heading, .section-title').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text.toLowerCase().includes('project') || text.toLowerCase().includes('update')) {
        console.log(`Found heading: "${text}"`);
        console.log('Parent class:', $(elem).parent().attr('class'));
        console.log('Next sibling:', $(elem).next().attr('class'));
        console.log('---');
      }
    });
    
    console.log('\n=== CHECKING .utao ITEMS ===');
    console.log('Total .utao items:', $('.utao').length);
    
    // Cek apakah ada wrapper untuk Project Update
    const projectSection = $('.utao').parent().parent();
    console.log('\nProject section class:', projectSection.attr('class'));
    console.log('Project section id:', projectSection.attr('id'));
    
    // Ambil beberapa item pertama
    console.log('\n=== FIRST 3 .utao ITEMS ===');
    $('.utao').slice(0, 3).each((i, elem) => {
      const title = $(elem).find('.uta .luf h4').text().trim();
      console.log(`${i + 1}. ${title}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugHomeSections();
