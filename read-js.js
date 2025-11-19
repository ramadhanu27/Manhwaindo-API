const axios = require('axios');

async function readJsFile() {
  try {
    const { data } = await axios.get('https://manhwaindo.app/wp-content/themes/mangareader/assets/js/tsmedia.js?ver=2.2.2');
    console.log('=== tsmedia.js Content ===\n');
    
    // Search for the function definition
    const lines = data.split('\n');
    let found = false;
    
    lines.forEach((line, index) => {
      if (line.includes('ts_dynamic_ajax_view') || found) {
        console.log(line);
        found = true;
        // Print next 20 lines to see the function body
        if (found && line.includes('}')) {
           // Simple heuristic to stop printing
           // found = false; 
        }
      }
    });
    
    if (!found) {
      console.log('Function not found in tsmedia.js. Checking function.js...');
      const funcData = await axios.get('https://manhwaindo.app/wp-content/themes/mangareader/assets/js/function.js?ver=2.2.2');
      const funcLines = funcData.data.split('\n');
      
      funcLines.forEach(line => {
        if (line.includes('ts_dynamic_ajax_view')) {
          console.log('Found in function.js:');
          console.log(line);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

readJsFile();
