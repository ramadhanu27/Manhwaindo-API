const axios = require('axios');
const qs = require('qs');

async function testCorrectAjax() {
  const url = 'https://manhwaindo.app/wp-admin/admin-ajax.php';
  const postId = 317485; // Kucing Oren Galak
  
  console.log('=== Testing Correct AJAX Action ===\n');
  
  try {
    const data = qs.stringify({
      action: 'dynamic_view_ajax',
      post_id: postId
    });
    
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://manhwaindo.app/series/kucing-oren-galak/',
        'Origin': 'https://manhwaindo.app'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.log(`Failed: ${error.message}`);
    if (error.response) {
      console.log('Response Data:', error.response.data);
    }
  }
}

testCorrectAjax();
