const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://manhwaindo.app';

async function debugLastUpdate() {
  try {
    const url = `${BASE_URL}/series/?order=update`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    // Ambil item pertama untuk debug
    const firstItem = $('.bsx').first();
    
    console.log('=== FIRST ITEM HTML ===');
    console.log(firstItem.html());
    
    console.log('\n=== CHAPTER INFO ===');
    
    // Cek .epxs
    const epxs = firstItem.find('.epxs');
    console.log('EPXS HTML:', epxs.html());
    console.log('EPXS Text:', epxs.text().trim());
    
    // Cek .eph-num
    const ephNum = firstItem.find('.eph-num');
    console.log('\nEPH-NUM HTML:', ephNum.html());
    
    // Cek setiap chapter
    ephNum.find('span').each((i, span) => {
      console.log(`\nChapter ${i + 1}:`);
      console.log('HTML:', $(span).html());
      console.log('Text:', $(span).text());
      
      const link = $(span).find('a');
      console.log('Link text:', link.text());
      console.log('Link href:', link.attr('href'));
      
      // Cek apakah ada element waktu
      const timeElement = $(span).find('span, i, time');
      console.log('Time element:', timeElement.html());
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugLastUpdate();
