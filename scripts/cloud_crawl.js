// Runs the Node.js crawler in CI (GitHub Actions) and refreshes public/data/
const fs = require('node:fs');
const path = require('node:path');
const { initDatabase, saveOpportunitiesBatch } = require('../db');
const { runBackgroundScan } = require('../scraper');
const { exportStaticData } = require('./export_static');

async function main() {
  initDatabase();

  // Preserve existing active opportunities from public/data/opportunities.json before scanning
  const snapshotPath = path.join(__dirname, '..', 'public', 'data', 'opportunities.json');
  if (fs.existsSync(snapshotPath)) {
    const todayStr = new Date().toISOString().split('T')[0];
    const existing = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'))
      .filter(item => !item.last_date_parsed || item.last_date_parsed >= todayStr);
    if (existing.length > 0) {
      saveOpportunitiesBatch(existing);
      console.log(`[Cloud Crawl] Loaded ${existing.length} existing active opportunities into SQLite.`);
    }
  }

  const category = process.env.CRAWL_CATEGORY || 'ALL';
  const limit = process.env.CRAWL_LIMIT ? parseInt(process.env.CRAWL_LIMIT, 10) : null;

  await runBackgroundScan(category, limit);
  exportStaticData();
}

main().catch(err => {
  console.error('[Cloud Crawl] Failed:', err);
  process.exit(1);
});
