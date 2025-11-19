const axios = require('axios');
const qs = require('qs');

async function testAjax() {
  const url = 'https://manhwaindo.app/wp-admin/admin-ajax.php';
  const postId = 317485; // Kucing Oren Galak
  
  const actions = [
    'ts_dynamic_view',
    'ts_dynamic_view_ajax',
    'ts_dynamic_update_view',
    'ts_view_counter',
    'post_view_counter',
    'ts_dynamic_ajax_view' // Nama fungsi JS-nya
  ];
  
  console.log('=== Testing AJAX Actions ===\n');
  
  for (const action of actions) {
    try {
      const data = qs.stringify({
        action: action,
        post_id: postId,
        nonce: '' // Try without nonce first
      });
      
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://manhwaindo.app/series/kucing-oren-galak/'
        }
      });
      
      console.log(`Action: ${action}`);
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('-------------------');
      
    } catch (error) {
      console.log(`Action: ${action} - Failed: ${error.message}`);
    }
  }
}

testAjax();
