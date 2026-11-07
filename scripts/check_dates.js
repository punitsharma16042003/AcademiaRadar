const { db } = require('../db');

const today = new Date().toISOString().split('T')[0];
console.log('Current Date:', today);

const rows = db.prepare('SELECT id, title, last_date, last_date_parsed FROM opportunities').all();
console.log('Total opportunities in DB:', rows.length);

const expired = rows.filter(r => {
  if (!r.last_date_parsed) return false;
  return r.last_date_parsed < today;
});

console.log('Expired count:', expired.length);
console.log('Sample expired:');
expired.slice(0, 10).forEach(e => {
  console.log(`- [${e.last_date_parsed}] (raw: ${e.last_date}) ${e.title.slice(0, 70)}`);
});
