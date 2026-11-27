// Exports active opportunities and 253 institutes into static JSON for GitHub Pages / static hosting
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_DIR = path.join(ROOT_DIR, 'public', 'data');
const DB_PATH = path.join(ROOT_DIR, 'research_portal.db');

function normalizeInstitute(inst) {
  return {
    id: inst.id,
    name: inst.name,
    short_name: inst.short_name || inst.shortName || inst.name,
    category: inst.category,
    sub_category: inst.sub_category || inst.subCategory || inst.category,
    address: inst.address || '',
    city: inst.city || '',
    state: inst.state || '',
    website: inst.website || '',
    recruitment_url: inst.recruitment_url || inst.recruitmentUrl || inst.website || '',
    phd_url: inst.phd_url || inst.phdUrl || inst.website || '',
    sric_url: inst.sric_url || inst.sricUrl || inst.website || '',
    research_focus: inst.research_focus || inst.researchFocus || ''
  };
}

function exportStaticData() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const institutesPath = path.join(DATA_DIR, 'institutes.json');
  const rawInstitutes = JSON.parse(fs.readFileSync(institutesPath, 'utf-8'));
  const institutes = rawInstitutes
    .map(normalizeInstitute)
    .sort((a, b) => a.name.localeCompare(b.name));

  const instMap = new Map(institutes.map(i => [i.id, i]));
  const instNameMap = new Map(institutes.map(i => [i.name.toLowerCase(), i]));

  let opportunities = [];
  const todayStr = new Date().toISOString().split('T')[0];

  if (fs.existsSync(DB_PATH)) {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(DB_PATH);
    const rows = db.prepare(`
      SELECT o.*, i.city, i.state as institute_state, i.website as inst_website
      FROM opportunities o
      LEFT JOIN institutes i ON o.institute_id = i.id
      WHERE o.is_active = 1
        AND o.is_custom = 0
        AND (o.last_date_parsed IS NULL OR o.last_date_parsed = '' OR o.last_date_parsed >= ?)
      ORDER BY o.last_date_parsed ASC
    `).all(todayStr);

    opportunities = rows.map(row => {
      const matchedInst = instMap.get(row.institute_id) || instNameMap.get((row.institute_name || '').toLowerCase());
      return {
        id: row.id,
        institute_id: row.institute_id,
        institute_name: row.institute_name,
        category: row.category,
        opportunity_type: row.opportunity_type,
        title: row.title,
        department: row.department,
        description: row.description,
        advertisement_no: row.advertisement_no,
        link: row.link,
        pdf_url: row.pdf_url,
        start_date: row.start_date,
        last_date: row.last_date,
        last_date_parsed: row.last_date_parsed,
        stipend_salary: row.stipend_salary,
        eligibility: row.eligibility,
        is_active: row.is_active,
        is_custom: 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
        city: row.city || matchedInst?.city || '',
        institute_state: row.institute_state || matchedInst?.state || '',
        inst_website: row.inst_website || matchedInst?.website || ''
      };
    });
  } else {
    const seedPath = path.join(DATA_DIR, 'seed_opportunities.json');
    const seedRows = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    opportunities = seedRows
      .filter(row => !row.last_date_parsed || row.last_date_parsed >= todayStr)
      .map(row => {
        const inst = instMap.get(row.institute_id);
        return {
          ...row,
          is_active: 1,
          is_custom: 0,
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString(),
          city: inst?.city || '',
          institute_state: inst?.state || '',
          inst_website: inst?.website || ''
        };
      });
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'institutes.json'),
    JSON.stringify(institutes, null, 2)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, 'opportunities.json'),
    JSON.stringify(opportunities, null, 2)
  );

  console.log(`Exported ${institutes.length} institutes and ${opportunities.length} active opportunities to public/data/`);
  return { institutesCount: institutes.length, opportunitiesCount: opportunities.length };
}

if (require.main === module) {
  exportStaticData();
}

module.exports = { exportStaticData };
