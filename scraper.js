// Web Scraper & Website Checker Engine for Indian Research Institutes
const { db, saveOpportunitiesBatch } = require('./db');

const scanStatus = {
  isScanning: false,
  currentIndex: 0,
  total: 0,
  currentInstitute: '',
  itemsFound: 0,
  errors: 0,
  startedAt: null,
  finishedAt: null,
  recentLogs: []
};

function addLog(msg) {
  const time = new Date().toLocaleTimeString();
  const entry = `[${time}] ${msg}`;
  scanStatus.recentLogs.unshift(entry);
  if (scanStatus.recentLogs.length > 50) {
    scanStatus.recentLogs.pop();
  }
  console.log(entry);
}

// Month name lookup for date parsing
const MONTH_MAP = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12'
};

// Date extraction heuristics
function extractDatesFromText(text) {
  let startDate = '';
  let lastDate = '';
  let lastDateParsed = '';

  if (!text) return { startDate, lastDate, lastDateParsed };

  // Common patterns for Last Date / Deadline
  const deadlineMatch = text.match(/(?:last\s*date|closing\s*date|deadline|valid\s*(?:up\s*to|till)|apply\s*(?:by|before)|walk[- ]in\s*(?:on|date))\s*[:\-–]?\s*([0-9a-zA-Z\s,./\-–]{5,30})/i);
  const startMatch = text.match(/(?:start\s*date|commencement\s*date|opening\s*date|date\s*of\s*notification|published\s*on)\s*[:\-–]?\s*([0-9a-zA-Z\s,./\-–]{5,30})/i);

  function parseDateString(str) {
    if (!str) return { raw: '', parsed: '' };
    // Normalize dots/slashes between digits to dashes (e.g. 15.11.2026 -> 15-11-2026)
    let cleaned = str.trim().replace(/(\d{1,2})\.(\d{1,2})\.(202[5-9])/, '$1-$2-$3');
    cleaned = cleaned.replace(/(\d{1,2})\/(\d{1,2})\/(202[5-9])/, '$1-$2-$3');

    // 1. DD-MM-YYYY or DD/MM/YYYY
    const dmy = cleaned.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](202[5-9])\b/);
    if (dmy) {
      const day = dmy[1].padStart(2, '0');
      const month = dmy[2].padStart(2, '0');
      const year = dmy[3];
      return { raw: `${day}-${month}-${year}`, parsed: `${year}-${month}-${day}` };
    }

    // 2. DD Month YYYY (e.g. 15 November 2026 or 15th Nov, 2026)
    const monthText = cleaned.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(202[5-9])\b/);
    if (monthText) {
      const day = monthText[1].padStart(2, '0');
      const mStr = monthText[2].toLowerCase().substring(0, 3);
      const mNum = MONTH_MAP[mStr];
      const year = monthText[3];
      if (mNum) {
        return { raw: `${day} ${monthText[2]} ${year}`, parsed: `${year}-${mNum}-${day}` };
      }
    }

    // 3. Month DD, YYYY (e.g. November 15, 2026)
    const mdy = cleaned.match(/\b([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s+(202[5-9])\b/);
    if (mdy) {
      const mStr = mdy[1].toLowerCase().substring(0, 3);
      const mNum = MONTH_MAP[mStr];
      const day = mdy[2].padStart(2, '0');
      const year = mdy[3];
      if (mNum) {
        return { raw: `${day} ${mdy[1]} ${year}`, parsed: `${year}-${mNum}-${day}` };
      }
    }

    // Check for rolling
    if (/rolling|throughout|continuous/i.test(cleaned)) {
      return { raw: 'Rolling / Open', parsed: '2027-12-31' };
    }

    return { raw: '', parsed: '' };
  }

  if (deadlineMatch) {
    const res = parseDateString(deadlineMatch[1]);
    lastDate = res.raw;
    lastDateParsed = res.parsed;
  }

  if (startMatch) {
    const res = parseDateString(startMatch[1]);
    startDate = res.parsed || res.raw;
  }

  // If no explicit keyword, search entire text for general upcoming date
  if (!lastDate) {
    const general = parseDateString(text);
    if (general.raw) {
      lastDate = general.raw;
      lastDateParsed = general.parsed;
    }
  }

  return { startDate, lastDate, lastDateParsed };
}

// Opportunity Type Classifier
function classifyOpportunityType(title, desc) {
  const combined = `${title} ${desc}`.toLowerCase();

  // 1. Postdoctoral (Check first so "Postdoctoral" doesn't get caught by "doctoral")
  if (/(?:post[- ]?doc|pdf|research\s*associate|\bipdf\b|early\s*career\s*fellow)/i.test(combined)) {
    return 'Postdoctoral Fellowship';
  }

  // 2. JRF / SRF / Project Staff
  if (/(?:\bjrf\b|\bsrf\b|project\s*associate|project\s*assistant|research\s*fellow|junior\s*research|senior\s*research|project\s*fellow|project\s*scientist)/i.test(combined)) {
    return 'JRF/SRF/Project Fellow';
  }

  // 3. PhD / Doctoral
  if (/(?:\bph\.?d\b|\bdoctorate\b|\bdoctoral\b|m\.?s\.?\s*\(research\)|i-phd|joint\s*phd)/i.test(combined)) {
    return 'PhD Admission';
  }

  // 4. Faculty Position
  if (/(?:faculty|assistant\s*professor|associate\s*professor|rolling\s*advertisement|\bprofessor\b)/i.test(combined)) {
    return 'Faculty Position';
  }

  // 5. Scientist & Technical Staff
  if (/(?:scientist|technical\s*officer|scientific\s*officer|technical\s*assistant|engineer)/i.test(combined)) {
    return 'Scientist/Technical Staff';
  }

  // 6. Internship
  if (/(?:internship|summer\s*fellowship|winter\s*school|visiting\s*student|trainee)/i.test(combined)) {
    return 'Research Internship';
  }

  return 'PhD Admission';
}

// Parse HTML tags without heavy external libraries
function parseHtmlItems(html, institute) {
  const items = [];
  if (!html) return items;

  // Regex to match links and anchor text
  // <a href="..." ...>text</a>
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  const seenUrls = new Set();
  const searchKeywords = /(ph\.?d|admission|recruitment|vacancy|advertisement|postdoc|fellowship|project\s*staff|jrf|srf|scientist|assistant\s*professor)/i;

  while ((match = linkRegex.exec(html)) !== null) {
    const rawUrl = match[1].trim();
    let anchorText = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    if (!anchorText || anchorText.length < 10) continue;
    if (!searchKeywords.test(anchorText)) continue;

    // Filter out common navigation clutter
    if (/login|home|contact|terms|privacy|sitemap|download\s*adobe/i.test(anchorText)) continue;

    let fullUrl = rawUrl;
    try {
      fullUrl = new URL(rawUrl, institute.recruitmentUrl || institute.website).href;
    } catch (e) {
      fullUrl = rawUrl;
    }

    if (seenUrls.has(fullUrl)) continue;
    seenUrls.add(fullUrl);

    // Extract surrounding window text in html for dates
    const index = match.index;
    const windowStart = Math.max(0, index - 200);
    const windowEnd = Math.min(html.length, index + match[0].length + 300);
    const surroundingText = html.slice(windowStart, windowEnd).replace(/<[^>]+>/g, ' ');

    const dates = extractDatesFromText(surroundingText);
    const oppType = classifyOpportunityType(anchorText, surroundingText);

    // Filter out expired notices whose last date has already passed
    const todayStr = new Date().toISOString().split('T')[0];
    if (dates.lastDateParsed && dates.lastDateParsed < todayStr) {
      continue;
    }

    // Generate unique ID
    const urlHash = Buffer.from(fullUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    const id = `web-${institute.id}-${urlHash}`;

    items.push({
      id,
      institute_id: institute.id,
      institute_name: institute.name,
      category: institute.category,
      opportunity_type: oppType,
      title: anchorText.slice(0, 250),
      department: institute.subCategory || 'Research Department',
      description: `Discovered on official portal. Notice: "${anchorText}". Context: ${surroundingText.slice(0, 200)}...`,
      advertisement_no: `AUTO/${institute.shortName || 'PORTAL'}/${new Date().getFullYear()}`,
      link: fullUrl,
      pdf_url: fullUrl.endsWith('.pdf') ? fullUrl : '',
      start_date: dates.startDate || new Date().toISOString().split('T')[0],
      last_date: dates.lastDate || 'Check Official Notification',
      last_date_parsed: dates.lastDateParsed || '2026-12-31',
      stipend_salary: oppType.includes('JRF') ? '₹37,000 + HRA as per MoE/CSIR norms' : 'As per institute & project norms',
      eligibility: 'See official advertisement brochure for detailed criteria',
      is_active: 1,
      is_custom: 0,
      created_at: new Date().toISOString()
    });

    if (items.length >= 10) break; // Limit per institute to prevent duplicate spam
  }

  return items;
}

// Scrape single institute with polite timeouts & error handling
async function scanSingleInstitute(institute) {
  const urlToFetch = institute.recruitmentUrl || institute.phdUrl || institute.website;
  addLog(`Checking ${institute.name} at ${urlToFetch}...`);

  // Update DB status to scanning
  db.prepare(`UPDATE institutes SET scan_status = 'scanning' WHERE id = ?`).run(institute.id);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(urlToFetch, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const items = parseHtmlItems(html, institute);

    const now = new Date().toISOString();

    if (items.length > 0) {
      saveOpportunitiesBatch(items);
      addLog(`✓ Found ${items.length} opportunities for ${institute.shortName || institute.name}`);
    } else {
      addLog(`✓ Connected to ${institute.shortName || institute.name} (portal checked, no new direct links parsed)`);
    }

    db.prepare(`
      UPDATE institutes 
      SET last_scanned_at = ?, scan_status = 'success', scan_error = NULL 
      WHERE id = ?
    `).run(now, institute.id);

    db.prepare(`
      INSERT INTO scan_logs (institute_id, institute_name, timestamp, items_found, status, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(institute.id, institute.name, now, items.length, 'success', `Scanned successfully. ${items.length} opportunities saved.`);

    return { success: true, itemsCount: items.length };

  } catch (err) {
    const now = new Date().toISOString();
    const errorMsg = err.name === 'AbortError' ? 'Connection timed out (8s)' : err.message;
    addLog(`⚠ ${institute.shortName || institute.name}: ${errorMsg}`);

    db.prepare(`
      UPDATE institutes 
      SET last_scanned_at = ?, scan_status = 'failed', scan_error = ? 
      WHERE id = ?
    `).run(now, errorMsg, institute.id);

    db.prepare(`
      INSERT INTO scan_logs (institute_id, institute_name, timestamp, items_found, status, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(institute.id, institute.name, now, 0, 'failed', errorMsg);

    return { success: false, error: errorMsg };
  }
}

// Background batch scanner
async function runBackgroundScan(categoryFilter = null, maxInstitutes = null) {
  if (scanStatus.isScanning) {
    addLog('Scan already in progress. Skipping duplicate run.');
    return;
  }

  let query = 'SELECT * FROM institutes';
  const params = [];
  if (categoryFilter && categoryFilter !== 'ALL') {
    query += ' WHERE category = ?';
    params.push(categoryFilter);
  }
  query += ' ORDER BY id ASC';

  const institutes = db.prepare(query).all(...params);
  const targetList = maxInstitutes ? institutes.slice(0, maxInstitutes) : institutes;

  scanStatus.isScanning = true;
  scanStatus.currentIndex = 0;
  scanStatus.total = targetList.length;
  scanStatus.itemsFound = 0;
  scanStatus.errors = 0;
  scanStatus.startedAt = new Date().toISOString();
  scanStatus.finishedAt = null;

  addLog(`🚀 Starting scan across ${targetList.length} institutes${categoryFilter ? ` (${categoryFilter})` : ''}...`);

  // Run in chunks with controlled concurrency (3 parallel requests)
  const CONCURRENCY = 3;
  for (let i = 0; i < targetList.length; i += CONCURRENCY) {
    if (!scanStatus.isScanning) {
      addLog('Scan paused/stopped by user.');
      break;
    }

    const chunk = targetList.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (inst) => {
      scanStatus.currentInstitute = inst.name;
      scanStatus.currentIndex++;
      const res = await scanSingleInstitute(inst);
      if (res.success) {
        scanStatus.itemsFound += (res.itemsCount || 0);
      } else {
        scanStatus.errors++;
      }
    }));

    // Polite pause between chunks
    await new Promise(r => setTimeout(r, 600));
  }

  // Purge any advertisements whose last dates have already passed
  const todayStr = new Date().toISOString().split('T')[0];
  const purged = db.prepare(`DELETE FROM opportunities WHERE last_date_parsed IS NOT NULL AND last_date_parsed != '' AND last_date_parsed < ?`).run(todayStr);
  if (purged.changes > 0) {
    addLog(`🧹 Purged ${purged.changes} expired advertisements whose last date passed.`);
  }

  scanStatus.isScanning = false;
  scanStatus.finishedAt = new Date().toISOString();
  addLog(`✅ Scan cycle finished! Scanned: ${scanStatus.currentIndex}, Total Opportunities Found: ${scanStatus.itemsFound}, Failed/Timed-out: ${scanStatus.errors}`);
}

function stopScan() {
  if (scanStatus.isScanning) {
    scanStatus.isScanning = false;
    addLog('⏹ Scan cancellation requested.');
  }
}

function getScanStatus() {
  return { ...scanStatus };
}

module.exports = {
  scanSingleInstitute,
  runBackgroundScan,
  stopScan,
  getScanStatus,
  extractDatesFromText,
  classifyOpportunityType
};
