// Database layer using Node 24 native node:sqlite
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'research_portal.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

// Initialize Tables
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS institutes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT,
      category TEXT NOT NULL,
      sub_category TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      website TEXT,
      recruitment_url TEXT,
      phd_url TEXT,
      sric_url TEXT,
      research_focus TEXT,
      last_scanned_at TEXT,
      scan_status TEXT DEFAULT 'idle',
      scan_error TEXT
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      institute_id TEXT,
      institute_name TEXT NOT NULL,
      category TEXT NOT NULL,
      opportunity_type TEXT NOT NULL,
      title TEXT NOT NULL,
      department TEXT,
      description TEXT,
      advertisement_no TEXT,
      link TEXT,
      pdf_url TEXT,
      start_date TEXT,
      last_date TEXT,
      last_date_parsed TEXT,
      stipend_salary TEXT,
      eligibility TEXT,
      is_active INTEGER DEFAULT 1,
      is_custom INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS application_tracker (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT,
      title TEXT NOT NULL,
      institute_name TEXT NOT NULL,
      category TEXT,
      opportunity_type TEXT,
      stage TEXT DEFAULT 'Interested',
      applied_date TEXT,
      deadline TEXT,
      portal_url TEXT,
      login_notes TEXT,
      custom_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scan_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institute_id TEXT,
      institute_name TEXT,
      timestamp TEXT NOT NULL,
      items_found INTEGER DEFAULT 0,
      status TEXT,
      message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_opp_category ON opportunities(category);
    CREATE INDEX IF NOT EXISTS idx_opp_type ON opportunities(opportunity_type);
    CREATE INDEX IF NOT EXISTS idx_opp_date ON opportunities(last_date_parsed);
    CREATE INDEX IF NOT EXISTS idx_inst_category ON institutes(category);
    CREATE INDEX IF NOT EXISTS idx_tracker_stage ON application_tracker(stage);
  `);

  seedInstitutesIfEmpty();
  seedOpportunitiesIfEmpty();
}

function seedInstitutesIfEmpty() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM institutes').get();
  if (countRow.count === 0) {
    const instFilePath = path.join(__dirname, 'data', 'institutes.json');
    if (fs.existsSync(instFilePath)) {
      const institutes = JSON.parse(fs.readFileSync(instFilePath, 'utf-8'));
      const insert = db.prepare(`
        INSERT INTO institutes (id, name, short_name, category, sub_category, address, city, state, website, recruitment_url, phd_url, sric_url, research_focus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      db.exec('BEGIN TRANSACTION');
      for (const inst of institutes) {
        insert.run(
          inst.id,
          inst.name,
          inst.shortName || inst.name,
          inst.category,
          inst.subCategory || inst.category,
          inst.address || '',
          inst.city || '',
          inst.state || '',
          inst.website || '',
          inst.recruitmentUrl || inst.website || '',
          inst.phdUrl || inst.website || '',
          inst.sricUrl || inst.website || '',
          inst.researchFocus || ''
        );
      }
      db.exec('COMMIT');
      console.log(`[DB] Seeded ${institutes.length} institutes successfully.`);
    }
  }
}

function seedOpportunitiesIfEmpty() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM opportunities').get();
  if (countRow.count === 0) {
    const oppFilePath = path.join(__dirname, 'data', 'seed_opportunities.json');
    if (fs.existsSync(oppFilePath)) {
      const opps = JSON.parse(fs.readFileSync(oppFilePath, 'utf-8'));
      saveOpportunitiesBatch(opps);
      console.log(`[DB] Seeded ${opps.length} initial opportunities.`);
    }
  }
}

function saveOpportunitiesBatch(items) {
  const upsert = db.prepare(`
    INSERT INTO opportunities (
      id, institute_id, institute_name, category, opportunity_type, title,
      department, description, advertisement_no, link, pdf_url, start_date,
      last_date, last_date_parsed, stipend_salary, eligibility, is_active,
      is_custom, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      department = excluded.department,
      description = excluded.description,
      advertisement_no = excluded.advertisement_no,
      link = excluded.link,
      pdf_url = excluded.pdf_url,
      start_date = excluded.start_date,
      last_date = excluded.last_date,
      last_date_parsed = excluded.last_date_parsed,
      stipend_salary = excluded.stipend_salary,
      eligibility = excluded.eligibility,
      is_active = excluded.is_active,
      updated_at = excluded.updated_at
  `);

  const now = new Date().toISOString();
  db.exec('BEGIN TRANSACTION');
  for (const item of items) {
    upsert.run(
      item.id,
      item.institute_id || 'general',
      item.institute_name,
      item.category || 'General',
      item.opportunity_type || 'PhD Admission',
      item.title,
      item.department || 'Multidisciplinary',
      item.description || '',
      item.advertisement_no || '',
      item.link || '',
      item.pdf_url || '',
      item.start_date || '',
      item.last_date || 'Rolling / Open',
      item.last_date_parsed || '',
      item.stipend_salary || '',
      item.eligibility || '',
      item.is_active !== undefined ? item.is_active : 1,
      item.is_custom || 0,
      item.created_at || now,
      now
    );
  }
  db.exec('COMMIT');
}

module.exports = {
  db,
  initDatabase,
  saveOpportunitiesBatch
};
