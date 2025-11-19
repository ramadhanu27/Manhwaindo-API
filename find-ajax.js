const axios = require('axios');
const cheerio = require('cheerio');

async function findAjaxConfig() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/series/kucing-oren-galak/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    console.log('=== Searching for AJAX Config ===\n');
    
    $('script').each((i, elem) => {
      const content = $(elem).html();
      if (content) {
        // Look for common WordPress AJAX patterns
        if (content.includes('admin-ajax.php') || 
            content.includes('nonce') || 
            content.includes('ajaxurl') ||
            content.includes('ts_dynamic_ajax_view')) {
          
          console.log(`Script ${i} matches:`);
          // Print only relevant lines
          const lines = content.split('\n');
          lines.forEach(line => {
            if (line.includes('var ') || line.includes('const ') || line.includes('let ') || 
                line.includes('admin-ajax') || line.includes('nonce') || line.includes('view')) {
              if (line.length < 500) { // Avoid printing minified massive lines
                console.log(line.trim());
              }
            }
          });
          console.log('-------------------');
        }
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findAjaxConfig();
