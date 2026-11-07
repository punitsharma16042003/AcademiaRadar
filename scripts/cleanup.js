const fs = require('fs');
['test_server.js', 'scripts/test_listen.js', 'data/temp_count.json'].forEach(f => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});
console.log('Cleaned.');
