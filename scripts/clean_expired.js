const { db } = require('../db');

const today = new Date().toISOString().split('T')[0];
console.log('Today:', today);

// Count before
const before = db.prepare('SELECT COUNT(*) as c FROM opportunities').get().c;
console.log('Total opportunities before cleanup:', before);

const expired = db.prepare(`
  SELECT id, title, last_date, last_date_parsed 
  FROM opportunities 
  WHERE last_date_parsed IS NOT NULL 
    AND last_date_parsed != '' 
    AND last_date_parsed < ?
`).all(today);

console.log(`Found ${expired.length} expired opportunities.`);
expired.forEach(e => {
  console.log(`- Removing: [${e.last_date_parsed}] ${e.title.slice(0, 70)}`);
});

const info = db.prepare(`
  DELETE FROM opportunities 
  WHERE last_date_parsed IS NOT NULL 
    AND last_date_parsed != '' 
    AND last_date_parsed < ?
`).run(today);

console.log(`Deleted ${info.changes} expired rows.`);

const after = db.prepare('SELECT COUNT(*) as c FROM opportunities').get().c;
console.log('Total active opportunities remaining in DB:', after);
