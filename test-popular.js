const axios = require('axios');
const cheerio = require('cheerio');

async function testPopular2() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== Testing .popularslider .bsx ===\n');
    
    const manhwaList = [];
    
    $('.popularslider .bsx').each((i, elem) => {
      const title = $(elem).find('.tt').text().trim();
      const slug = $(elem).find('a').attr('href')?.replace('https://manhwaindo.app', '').replace('/series/', '').replace('/', '') || '';
      const image = $(elem).find('img').attr('src') || '';
      const type = $(elem).find('.type').text().trim();
      const rating = $(elem).find('.numscore').text().trim();
      const latestChapter = $(elem).find('.epxs').text().trim();

      manhwaList.push({
        title,
        slug,
        image,
        type,
        rating,
        latestChapter,
        url: `https://manhwaindo.app/series/${slug}/`
      });
    });
    
    console.log(`Found ${manhwaList.length} items\n`);
    console.log('Sample data:');
    console.log(JSON.stringify(manhwaList.slice(0, 3), null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPopular2();
