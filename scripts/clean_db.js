const fs = require('fs');
['research_portal.db', 'research_portal.db-shm', 'research_portal.db-wal'].forEach(f => {
  if (fs.existsSync(f)) {
    try { fs.unlinkSync(f); } catch (e) {}
  }
});
console.log('DB files cleaned.');
