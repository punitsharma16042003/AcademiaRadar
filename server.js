// Local Server Web App for Indian Research & Recruitment Advertisements
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { db, initDatabase, saveOpportunitiesBatch } = require('./db');
const {
  scanSingleInstitute,
  runBackgroundScan,
  stopScan,
  getScanStatus,
  extractDatesFromText
} = require('./scraper');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Initialize DB schema & seed data
initDatabase();

// Heuristic days remaining calculation
function calculateUrgency(lastDateParsed) {
  if (!lastDateParsed) return { daysRemaining: null, urgencyLevel: 'normal' };
  if (lastDateParsed.startsWith('2027') || lastDateParsed.startsWith('2028')) {
    return { daysRemaining: 365, urgencyLevel: 'rolling' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(lastDateParsed);
  if (isNaN(deadline.getTime())) {
    return { daysRemaining: null, urgencyLevel: 'normal' };
  }

  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { daysRemaining: diffDays, urgencyLevel: 'expired' };
  if (diffDays <= 3) return { daysRemaining: diffDays, urgencyLevel: 'critical' };
  if (diffDays <= 7) return { daysRemaining: diffDays, urgencyLevel: 'warning' };
  return { daysRemaining: diffDays, urgencyLevel: 'normal' };
}

// Request Helper: Parse JSON Body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Response Helpers
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, text, contentType = 'text/plain') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });
  res.end(text);
}

// Serve Static Files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res, pathname) {
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Security check: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access Denied');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Fallback to index.html for SPA-style routes
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
}

// Main HTTP Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname, searchParams } = parsedUrl;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    // API Routes
    if (pathname === '/api/stats' && req.method === 'GET') {
      const todayStr = new Date().toISOString().split('T')[0];
      const totalInstitutes = db.prepare('SELECT COUNT(*) as c FROM institutes').get().c;

      // Select only active, non-expired opportunities
      const allOpps = db.prepare(`
        SELECT last_date_parsed, opportunity_type 
        FROM opportunities 
        WHERE is_active = 1 
          AND (last_date_parsed IS NULL OR last_date_parsed = '' OR last_date_parsed >= ?)
      `).all(todayStr);

      const totalOpportunities = allOpps.length;
      const phdCount = allOpps.filter(o => o.opportunity_type === 'PhD Admission').length;
      const fellowshipCount = allOpps.filter(o => ['JRF/SRF/Project Fellow', 'Postdoctoral Fellowship'].includes(o.opportunity_type)).length;
      const facultyCount = allOpps.filter(o => ['Faculty Position', 'Scientist/Technical Staff'].includes(o.opportunity_type)).length;
      const trackedCount = db.prepare('SELECT COUNT(*) as c FROM application_tracker').get().c;

      let urgentCount = 0;
      let weekCount = 0;
      allOpps.forEach(o => {
        const u = calculateUrgency(o.last_date_parsed);
        if (u.urgencyLevel === 'critical') urgentCount++;
        if (u.urgencyLevel === 'critical' || u.urgencyLevel === 'warning') weekCount++;
      });

      return sendJson(res, 200, {
        totalInstitutes,
        totalOpportunities,
        phdCount,
        fellowshipCount,
        facultyCount,
        urgentCount,
        weekCount,
        trackedCount,
        scanner: getScanStatus()
      });
    }

    if (pathname === '/api/opportunities' && req.method === 'GET') {
      const search = searchParams.get('search') || '';
      const category = searchParams.get('category') || 'ALL';
      const type = searchParams.get('type') || 'ALL';
      const urgency = searchParams.get('urgency') || 'ALL';
      const state = searchParams.get('state') || 'ALL';
      const sort = searchParams.get('sort') || 'deadline_asc';

      const todayStr = new Date().toISOString().split('T')[0];

      let query = `
        SELECT o.*, i.city, i.state as institute_state, i.website as inst_website,
               (SELECT COUNT(*) FROM application_tracker t WHERE t.opportunity_id = o.id) as is_tracked
        FROM opportunities o
        LEFT JOIN institutes i ON o.institute_id = i.id
        WHERE o.is_active = 1
          AND (o.last_date_parsed IS NULL OR o.last_date_parsed = '' OR o.last_date_parsed >= ?)
      `;
      const params = [todayStr];

      if (category !== 'ALL') {
        query += ' AND o.category = ?';
        params.push(category);
      }

      if (type !== 'ALL') {
        query += ' AND o.opportunity_type = ?';
        params.push(type);
      }

      if (state !== 'ALL') {
        query += ' AND i.state = ?';
        params.push(state);
      }

      if (search.trim()) {
        query += ` AND (o.title LIKE ? OR o.institute_name LIKE ? OR o.department LIKE ? OR o.description LIKE ?)`;
        const s = `%${search.trim()}%`;
        params.push(s, s, s, s);
      }

      let opps = db.prepare(query).all(...params);

      // Enhance with computed urgency and remaining days
      opps = opps.map(o => {
        const u = calculateUrgency(o.last_date_parsed);
        return {
          ...o,
          daysRemaining: u.daysRemaining,
          urgencyLevel: u.urgencyLevel
        };
      });

      // Filter by urgency if selected; by default always exclude expired
      if (urgency === 'urgent') {
        opps = opps.filter(o => o.urgencyLevel === 'critical');
      } else if (urgency === 'week') {
        opps = opps.filter(o => o.urgencyLevel === 'critical' || o.urgencyLevel === 'warning');
      } else if (urgency === 'rolling') {
        opps = opps.filter(o => o.urgencyLevel === 'rolling');
      } else {
        // Exclude expired by default
        opps = opps.filter(o => o.urgencyLevel !== 'expired');
      }

      // Sort
      if (sort === 'deadline_asc') {
        opps.sort((a, b) => {
          if (!a.last_date_parsed) return 1;
          if (!b.last_date_parsed) return -1;
          return a.last_date_parsed.localeCompare(b.last_date_parsed);
        });
      } else if (sort === 'deadline_desc') {
        opps.sort((a, b) => {
          if (!a.last_date_parsed) return 1;
          if (!b.last_date_parsed) return -1;
          return b.last_date_parsed.localeCompare(a.last_date_parsed);
        });
      } else if (sort === 'newest') {
        opps.sort((a, b) => b.created_at.localeCompare(a.created_at));
      } else if (sort === 'institute') {
        opps.sort((a, b) => a.institute_name.localeCompare(b.institute_name));
      }

      return sendJson(res, 200, opps);
    }

    if (pathname === '/api/opportunities' && req.method === 'POST') {
      const data = await parseJsonBody(req);
      if (!data.title || !data.institute_name) {
        return sendJson(res, 400, { error: 'Institute name and Title are required' });
      }

      const id = `custom-${Date.now()}`;
      const now = new Date().toISOString();
      const dates = extractDatesFromText(`${data.last_date || ''} ${data.start_date || ''}`);

      const item = {
        id,
        institute_id: data.institute_id || 'custom',
        institute_name: data.institute_name,
        category: data.category || 'Custom / Other',
        opportunity_type: data.opportunity_type || 'PhD Admission',
        title: data.title,
        department: data.department || 'General',
        description: data.description || 'Manually added advertisement by user',
        advertisement_no: data.advertisement_no || `CUSTOM/${new Date().getFullYear()}`,
        link: data.link || '',
        pdf_url: data.pdf_url || '',
        start_date: data.start_date || dates.startDate || new Date().toISOString().split('T')[0],
        last_date: data.last_date || 'Rolling / Open',
        last_date_parsed: data.last_date_parsed || dates.lastDateParsed || '2026-12-31',
        stipend_salary: data.stipend_salary || '',
        eligibility: data.eligibility || '',
        is_active: 1,
        is_custom: 1,
        created_at: now
      };

      saveOpportunitiesBatch([item]);
      return sendJson(res, 201, { success: true, item });
    }

    if (pathname.startsWith('/api/opportunities/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/opportunities/', '');
      db.prepare('DELETE FROM opportunities WHERE id = ?').run(id);
      return sendJson(res, 200, { success: true });
    }

    if (pathname === '/api/institutes' && req.method === 'GET') {
      const category = searchParams.get('category') || 'ALL';
      const state = searchParams.get('state') || 'ALL';
      const search = searchParams.get('search') || '';

      let query = 'SELECT * FROM institutes WHERE 1=1';
      const params = [];

      if (category !== 'ALL') {
        query += ' AND category = ?';
        params.push(category);
      }
      if (state !== 'ALL') {
        query += ' AND state = ?';
        params.push(state);
      }
      if (search.trim()) {
        query += ' AND (name LIKE ? OR short_name LIKE ? OR city LIKE ? OR research_focus LIKE ?)';
        const s = `%${search.trim()}%`;
        params.push(s, s, s, s);
      }

      query += ' ORDER BY name ASC';
      const institutes = db.prepare(query).all(...params);
      return sendJson(res, 200, institutes);
    }

    if (pathname.match(/^\/api\/institutes\/([^/]+)\/scan$/) && req.method === 'POST') {
      const match = pathname.match(/^\/api\/institutes\/([^/]+)\/scan$/);
      const instituteId = match[1];
      const inst = db.prepare('SELECT * FROM institutes WHERE id = ?').get(instituteId);
      if (!inst) {
        return sendJson(res, 404, { error: 'Institute not found' });
      }

      // Execute scan asynchronously
      const result = await scanSingleInstitute(inst);
      return sendJson(res, 200, result);
    }

    if (pathname === '/api/scan/start' && req.method === 'POST') {
      const data = await parseJsonBody(req);
      const category = data.category || 'ALL';
      const limit = data.limit ? parseInt(data.limit, 10) : null;

      // Run in background without blocking HTTP response
      runBackgroundScan(category, limit).catch(err => {
        console.error('Scan error:', err);
      });

      return sendJson(res, 200, { success: true, message: 'Scan started in background', status: getScanStatus() });
    }

    if (pathname === '/api/scan/stop' && req.method === 'POST') {
      stopScan();
      return sendJson(res, 200, { success: true, message: 'Scan stopped', status: getScanStatus() });
    }

    if (pathname === '/api/scan/status' && req.method === 'GET') {
      return sendJson(res, 200, getScanStatus());
    }

    // Application Tracker Routes
    if (pathname === '/api/tracker' && req.method === 'GET') {
      const items = db.prepare('SELECT * FROM application_tracker ORDER BY updated_at DESC').all();
      return sendJson(res, 200, items);
    }

    if (pathname === '/api/tracker' && req.method === 'POST') {
      const data = await parseJsonBody(req);
      const id = `track-${Date.now()}`;
      const now = new Date().toISOString();

      const insert = db.prepare(`
        INSERT INTO application_tracker (
          id, opportunity_id, title, institute_name, category, opportunity_type,
          stage, applied_date, deadline, portal_url, login_notes, custom_notes,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insert.run(
        id,
        data.opportunity_id || null,
        data.title || 'Untitled Application',
        data.institute_name || '',
        data.category || '',
        data.opportunity_type || '',
        data.stage || 'Interested',
        data.applied_date || null,
        data.deadline || '',
        data.portal_url || '',
        data.login_notes || '',
        data.custom_notes || '',
        now,
        now
      );

      return sendJson(res, 201, { success: true, id });
    }

    if (pathname.startsWith('/api/tracker/') && req.method === 'PUT') {
      const id = pathname.replace('/api/tracker/', '');
      const data = await parseJsonBody(req);
      const now = new Date().toISOString();

      const update = db.prepare(`
        UPDATE application_tracker
        SET stage = COALESCE(?, stage),
            login_notes = COALESCE(?, login_notes),
            custom_notes = COALESCE(?, custom_notes),
            applied_date = COALESCE(?, applied_date),
            updated_at = ?
        WHERE id = ?
      `);

      update.run(data.stage, data.login_notes, data.custom_notes, data.applied_date, now, id);
      return sendJson(res, 200, { success: true });
    }

    if (pathname.startsWith('/api/tracker/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/tracker/', '');
      db.prepare('DELETE FROM application_tracker WHERE id = ?').run(id);
      return sendJson(res, 200, { success: true });
    }

    // Calendar Export (.ICS)
    if (pathname.startsWith('/api/calendar/') && pathname.endsWith('.ics')) {
      const oppId = pathname.replace('/api/calendar/', '').replace('.ics', '');
      const opp = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(oppId);

      if (!opp) {
        return sendText(res, 404, 'Opportunity not found');
      }

      let dtEnd = '20261130T235959Z';
      if (opp.last_date_parsed && opp.last_date_parsed.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dtEnd = opp.last_date_parsed.replace(/-/g, '') + 'T180000Z';
      }

      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AcademiaRadar//Research Deadline Tracker//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${opp.id}@academiaradar.in`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dtEnd}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:DEADLINE: ${opp.title} (${opp.institute_name})`,
        `DESCRIPTION:Institute: ${opp.institute_name}\\nCategory: ${opp.opportunity_type}\\nStipend: ${opp.stipend_salary || 'N/A'}\\nPortal Link: ${opp.link}\\n\\nDetails: ${opp.description}`,
        `URL:${opp.link}`,
        'BEGIN:VALARM',
        'TRIGGER:-P2D',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: 2 days left to apply for ${opp.title}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      res.writeHead(200, {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${opp.id}-deadline.ics"`
      });
      return res.end(ics);
    }

    // CSV Export
    if (pathname === '/api/export/csv') {
      const todayStr = new Date().toISOString().split('T')[0];
      const opps = db.prepare(`
        SELECT * FROM opportunities 
        WHERE is_active = 1 
          AND (last_date_parsed IS NULL OR last_date_parsed = '' OR last_date_parsed >= ?)
        ORDER BY last_date_parsed ASC
      `).all(todayStr);
      let csv = 'ID,Institute,Category,Type,Title,Department,Last Date,Start Date,Stipend,Link\r\n';
      opps.forEach(o => {
        const clean = str => `"${(str || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
        csv += `${clean(o.id)},${clean(o.institute_name)},${clean(o.category)},${clean(o.opportunity_type)},${clean(o.title)},${clean(o.department)},${clean(o.last_date)},${clean(o.start_date)},${clean(o.stipend_salary)},${clean(o.link)}\r\n`;
      });

      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Research_Advertisements_2026.csv"'
      });
      return res.end(csv);
    }

    // JSON Export
    if (pathname === '/api/export/json') {
      const todayStr = new Date().toISOString().split('T')[0];
      const opps = db.prepare(`
        SELECT * FROM opportunities 
        WHERE is_active = 1 
          AND (last_date_parsed IS NULL OR last_date_parsed = '' OR last_date_parsed >= ?)
        ORDER BY last_date_parsed ASC
      `).all(todayStr);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="Research_Advertisements_2026.json"'
      });
      return res.end(JSON.stringify(opps, null, 2));
    }

    // Static Assets
    serveStatic(req, res, pathname);

  } catch (err) {
    console.error('Server error on request:', pathname, err);
    sendJson(res, 500, { error: 'Internal Server Error', details: err.message });
  }
});

// Auto-run scanner on startup after 3 seconds so server is fully responsive first
setTimeout(() => {
  console.log('[Auto-Scan] Initiating automated background check for premier institutes...');
  runBackgroundScan('ALL', 10).catch(e => console.error('[Auto-Scan error]:', e));
}, 3000);

server.listen(PORT, '0.0.0.0', () => {
  console.log('================================================================');
  console.log(` 🚀  AcademiaRadar - Research & PhD Portal Web App`);
  console.log(` 🌐  Local Server active at: http://localhost:${PORT}`);
  console.log(` 🏢  Tracking 253 Premier Institutes across all categories`);
  console.log('================================================================');
});
