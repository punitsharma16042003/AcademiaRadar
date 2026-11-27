// AcademiaRadar India - Frontend Application Script
let opportunities = [];
let institutes = [];
let trackerItems = [];
let currentTab = 'opportunities';
let viewMode = 'cards';
let scanInterval = null;
let searchDebounceTimeout = null;
let staticMode = null;
let backendCheckPromise = null;
let staticDataPromise = null;
let staticInstitutes = [];
let staticOpportunities = [];

const TRACKER_CACHE_KEY = 'academia_tracker_cache';
const CUSTOM_OPPS_KEY = 'academia_custom_opps';

function detectBackendMode() {
  if (staticMode !== null) return Promise.resolve(staticMode);
  if (!backendCheckPromise) {
    backendCheckPromise = (async () => {
      try {
        const res = await fetch('./api/stats', { headers: { Accept: 'application/json' } });
        const ct = res.headers.get('content-type') || '';
        staticMode = !(res.ok && ct.includes('application/json'));
      } catch (e) {
        staticMode = true;
      }
      return staticMode;
    })();
  }
  return backendCheckPromise;
}

function loadStaticData() {
  if (!staticDataPromise) {
    staticDataPromise = Promise.all([
      fetch('./data/institutes.json').then(r => (r.ok ? r.json() : [])),
      fetch('./data/opportunities.json').then(r => (r.ok ? r.json() : []))
    ]).then(([instList, oppList]) => {
      staticInstitutes = Array.isArray(instList) ? instList : [];
      staticOpportunities = Array.isArray(oppList) ? oppList : [];
      return { institutes: staticInstitutes, opportunities: staticOpportunities };
    });
  }
  return staticDataPromise;
}

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

function getLocalCustomOpportunities() {
  try {
    const raw = localStorage.getItem(CUSTOM_OPPS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveLocalCustomOpportunities(items) {
  try {
    localStorage.setItem(CUSTOM_OPPS_KEY, JSON.stringify(items));
  } catch (e) {}
}

function getLocalTrackerItems() {
  try {
    const raw = localStorage.getItem(TRACKER_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveLocalTrackerItems(items) {
  try {
    localStorage.setItem(TRACKER_CACHE_KEY, JSON.stringify(items));
  } catch (e) {}
}

function getActiveStaticOpportunities() {
  const combined = [...getLocalCustomOpportunities(), ...staticOpportunities];
  return combined
    .map(o => {
      const u = calculateUrgency(o.last_date_parsed);
      return {
        ...o,
        daysRemaining: u.daysRemaining,
        urgencyLevel: u.urgencyLevel
      };
    })
    .filter(o => o.urgencyLevel !== 'expired');
}

function applyStaticScannerUi() {
  const dot = document.getElementById('scanDot');
  const label = document.getElementById('scanLabel');
  const sub = document.getElementById('scanSub');
  const title = document.getElementById('scanStatusTitle');
  const percent = document.getElementById('scanProgressPercent');
  const fill = document.getElementById('progressBarFill');
  const scanned = document.getElementById('scannedCount');
  const discovered = document.getElementById('discoveredCount');
  const errors = document.getElementById('errorsCount');
  const target = document.getElementById('currentTargetName');
  const startBtn = document.getElementById('startScanBtn');
  const stopBtn = document.getElementById('stopScanBtn');
  const consoleLogs = document.getElementById('consoleLogs');

  if (dot) dot.className = 'status-dot dot-idle';
  if (label) label.textContent = 'Static Snapshot';
  if (sub) sub.textContent = 'GitHub Pages • 253 Institutes';
  if (title) title.textContent = 'Hosted Mode: Pre-Crawled Snapshot Active';
  if (percent) percent.textContent = '100%';
  if (fill) fill.style.width = '100%';
  if (scanned) scanned.textContent = '253 / 253';
  if (discovered) discovered.textContent = String(staticOpportunities.length || 0);
  if (errors) errors.textContent = '0';
  if (target) target.textContent = 'Local Node.js server required for live crawl';
  if (startBtn) startBtn.disabled = false;
  if (stopBtn) stopBtn.disabled = true;
  if (consoleLogs) {
    consoleLogs.innerHTML = [
      '<div class="log-line">[GitHub Pages Mode] Serving pre-crawled active opportunities and 253 institutes snapshot.</div>',
      '<div class="log-line text-muted">[Note] Browsers block direct cross-origin scraping of external .ac.in / .res.in portals.</div>',
      '<div class="log-line text-muted">[Tip] To run live web crawls, clone the repo and run "node server.js" locally on http://localhost:5000.</div>'
    ].join('');
  }
}

function downloadBlobFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await detectBackendMode();
  if (staticMode) {
    await loadStaticData();
    applyStaticScannerUi();
  } else {
    startScannerPolling();
  }
  loadInstitutes();
  loadStats();
  loadOpportunities();
  loadTracker();

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Toast notification helper
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.borderColor = isError ? 'var(--urgent-red)' : 'var(--accent-cyan)';
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.className = `theme-${savedTheme}`;
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains('theme-dark');
  const newTheme = isDark ? 'light' : 'dark';
  document.body.className = `theme-${newTheme}`;
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Tab navigation
function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`view${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  if (tabName === 'tracker') {
    if (trackerItems.length === 0) {
      loadTracker().then(() => renderKanban());
    } else {
      renderKanban();
    }
  } else if (tabName === 'institutes') {
    if (institutes.length === 0) {
      loadInstitutes().then(() => renderInstitutesGrid());
    } else {
      renderInstitutesGrid();
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}
window.switchTab = switchTab;

// View toggle (Cards vs Table)
function setViewMode(mode) {
  viewMode = mode;
  document.getElementById('cardViewBtn').classList.toggle('active', mode === 'cards');
  document.getElementById('tableViewBtn').classList.toggle('active', mode === 'table');
  
  document.getElementById('oppCardsContainer').classList.toggle('hidden', mode === 'table');
  document.getElementById('oppTableContainer').classList.toggle('hidden', mode === 'cards');

  if (window.lucide) lucide.createIcons();
}

// Load stats from API or static snapshot
async function loadStats() {
  try {
    await detectBackendMode();
    let data;

    if (staticMode) {
      await loadStaticData();
      const allOpps = getActiveStaticOpportunities();
      const tracked = getLocalTrackerItems();
      let urgentCount = 0;
      let weekCount = 0;
      allOpps.forEach(o => {
        if (o.urgencyLevel === 'critical') urgentCount++;
        if (o.urgencyLevel === 'critical' || o.urgencyLevel === 'warning') weekCount++;
      });

      data = {
        totalInstitutes: staticInstitutes.length || 253,
        totalOpportunities: allOpps.length,
        phdCount: allOpps.filter(o => o.opportunity_type === 'PhD Admission').length,
        fellowshipCount: allOpps.filter(o => ['JRF/SRF/Project Fellow', 'Postdoctoral Fellowship'].includes(o.opportunity_type)).length,
        facultyCount: allOpps.filter(o => ['Faculty Position', 'Scientist/Technical Staff'].includes(o.opportunity_type)).length,
        urgentCount,
        weekCount,
        trackedCount: tracked.length
      };
    } else {
      const res = await fetch('./api/stats');
      if (!res.ok) return;
      data = await res.json();
    }

    document.getElementById('statInstitutes').textContent = data.totalInstitutes || 253;
    document.getElementById('statOpps').textContent = data.totalOpportunities || 0;
    document.getElementById('statPhd').textContent = data.phdCount || 0;
    document.getElementById('statJrf').textContent = data.fellowshipCount || 0;
    document.getElementById('statUrgent').textContent = data.urgentCount || 0;
    document.getElementById('statTracker').textContent = data.trackedCount || 0;

    document.getElementById('oppTabCount').textContent = data.totalOpportunities || 0;
    document.getElementById('trackTabCount').textContent = data.trackedCount || 0;

    // Check urgent alert banner
    const banner = document.getElementById('urgentAlertBanner');
    if (data.urgentCount > 0) {
      document.getElementById('urgentAlertText').textContent = `🚨 ${data.urgentCount} research opportunities & admissions are closing in less than 72 hours!`;
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }

  } catch (e) {
    console.error('Failed to load stats:', e);
  }
}

function closeUrgentBanner() {
  document.getElementById('urgentAlertBanner').classList.add('hidden');
}

// Load opportunities
async function loadOpportunities() {
  const search = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;
  const type = document.getElementById('typeFilter').value;
  const urgency = document.getElementById('urgencyFilter').value;
  const state = document.getElementById('stateFilter').value;
  const sort = document.getElementById('sortFilter').value;

  const params = new URLSearchParams({ search, category, type, urgency, state, sort });

  try {
    await detectBackendMode();
    if (staticMode) {
      await loadStaticData();
      let opps = getActiveStaticOpportunities();
      const s = search.trim().toLowerCase();

      if (category !== 'ALL') opps = opps.filter(o => o.category === category);
      if (type !== 'ALL') opps = opps.filter(o => o.opportunity_type === type);
      if (state !== 'ALL') opps = opps.filter(o => (o.institute_state || o.state) === state);
      if (s) {
        opps = opps.filter(o =>
          (o.title || '').toLowerCase().includes(s) ||
          (o.institute_name || '').toLowerCase().includes(s) ||
          (o.department || '').toLowerCase().includes(s) ||
          (o.description || '').toLowerCase().includes(s)
        );
      }

      if (urgency === 'urgent') {
        opps = opps.filter(o => o.urgencyLevel === 'critical');
      } else if (urgency === 'week') {
        opps = opps.filter(o => o.urgencyLevel === 'critical' || o.urgencyLevel === 'warning');
      } else if (urgency === 'active') {
        opps = opps.filter(o => o.urgencyLevel === 'normal' || o.urgencyLevel === 'rolling');
      } else if (urgency === 'rolling') {
        opps = opps.filter(o => o.urgencyLevel === 'rolling');
      }

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
        opps.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      } else if (sort === 'institute') {
        opps.sort((a, b) => (a.institute_name || '').localeCompare(b.institute_name || ''));
      }

      opportunities = opps;
    } else {
      const res = await fetch(`./api/opportunities?${params}`);
      if (!res.ok) throw new Error('Network error');
      opportunities = await res.json();
    }

    document.getElementById('resultsCount').textContent = `Showing ${opportunities.length} active opportunities`;
    renderOpportunities();
  } catch (err) {
    console.error('Failed to load opportunities:', err);
    document.getElementById('resultsCount').textContent = 'Error loading opportunities.';
  }
}

// Render opportunities (Cards and Table)
function renderOpportunities() {
  renderCards();
  renderTable();
  if (window.lucide) lucide.createIcons();
}

function getCategoryTagClass(cat) {
  if (cat.includes('IIT')) return 'tag-iit';
  if (cat.includes('CSIR')) return 'tag-csir';
  if (cat.includes('NIT')) return 'tag-nit';
  if (cat.includes('IIIT')) return 'tag-iiit';
  if (cat.includes('AIIMS')) return 'tag-aiims';
  if (cat.includes('Govt') || cat.includes('DAE') || cat.includes('ISRO') || cat.includes('DRDO')) return 'tag-govtrd';
  return 'tag-default';
}

function getUrgencyBadgeHtml(opp) {
  if (opp.urgencyLevel === 'critical') {
    return `<span class="urgency-badge urgency-critical">⏳ Closing in ${opp.daysRemaining} days!</span>`;
  }
  if (opp.urgencyLevel === 'warning') {
    return `<span class="urgency-badge urgency-warning">⚠️ ${opp.daysRemaining} days left</span>`;
  }
  if (opp.urgencyLevel === 'rolling') {
    return `<span class="urgency-badge urgency-rolling">🟣 Rolling / Open Call</span>`;
  }
  if (opp.urgencyLevel === 'expired') {
    return `<span class="urgency-badge urgency-expired">Passed Deadline</span>`;
  }
  if (opp.daysRemaining !== null) {
    return `<span class="urgency-badge urgency-normal">🟢 ${opp.daysRemaining} days left</span>`;
  }
  return `<span class="urgency-badge urgency-normal">🟢 Open</span>`;
}

function renderCards() {
  const container = document.getElementById('oppCardsContainer');
  if (!container) return;

  const validOpps = opportunities.filter(opp => opp.urgencyLevel !== 'expired');

  if (validOpps.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-secondary); border-radius: 12px; border: 1px dashed var(--border-color);">
        <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
        <h3>No Active Advertisements Found</h3>
        <p style="color: var(--text-muted); margin-top: 6px;">Try adjusting your search criteria, clearing filters, or crawling institute websites.</p>
        <button class="btn-primary" style="margin-top: 16px;" onclick="clearFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = validOpps.map(opp => {
    const isTracked = trackerItems.some(t => t.opportunity_id === opp.id || t.title === opp.title);
    return `
      <div class="opp-card" id="card-${opp.id}">
        <div class="card-top">
          <div class="inst-badge-group">
            <span class="inst-category-tag ${getCategoryTagClass(opp.category)}">${opp.category}</span>
            <span class="type-pill">${opp.opportunity_type}</span>
          </div>
          ${getUrgencyBadgeHtml(opp)}
        </div>

        <div class="inst-name">${escapeHtml(opp.institute_name)} ${opp.city ? `• ${escapeHtml(opp.city)}` : ''}</div>
        <h3 class="opp-title" title="${escapeHtml(opp.title)}">${escapeHtml(opp.title)}</h3>
        <div class="opp-dept">🏛️ ${escapeHtml(opp.department || 'Multidisciplinary')}</div>
        <div class="opp-desc">${escapeHtml(opp.description || '')}</div>

        <div class="dates-bar">
          <div class="date-item">
            <span>Start Date</span>
            <strong>${opp.start_date ? formatDateDisplay(opp.start_date) : 'Announced'}</strong>
          </div>
          <div class="date-item" style="text-align: right;">
            <span>Last Date</span>
            <strong style="color: ${opp.urgencyLevel === 'critical' ? 'var(--urgent-red)' : 'inherit'};">
              ${opp.last_date ? formatDateDisplay(opp.last_date) : 'Open'}
            </strong>
          </div>
        </div>

        <div class="meta-row">
          ${opp.stipend_salary ? `<span class="meta-chip stipend-chip">💰 ${escapeHtml(opp.stipend_salary)}</span>` : ''}
          ${opp.eligibility ? `<span class="meta-chip">🎓 ${escapeHtml(opp.eligibility)}</span>` : ''}
          ${opp.advertisement_no ? `<span class="meta-chip">№ ${escapeHtml(opp.advertisement_no)}</span>` : ''}
        </div>

        <div class="card-actions">
          ${opp.link ? `
            <a href="${opp.link}" target="_blank" rel="noopener" class="btn-secondary" title="Visit Official Advertisement Portal">
              <i data-lucide="external-link"></i> Official Portal
            </a>
          ` : ''}
          <button class="btn-track ${isTracked ? 'tracked' : ''}" onclick="toggleTrackOpportunity('${opp.id}')">
            <i data-lucide="${isTracked ? 'check-circle' : 'bookmark'}"></i> ${isTracked ? 'Tracked' : 'Add to Pipeline'}
          </button>
          <button type="button" onclick="downloadIcs('${opp.id}')" class="btn-ics" title="Export Deadline to Calendar (.ics)">
            <i data-lucide="calendar"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderTable() {
  const tbody = document.getElementById('oppTableBody');
  if (!tbody) return;

  const validOpps = opportunities.filter(opp => opp.urgencyLevel !== 'expired');

  if (validOpps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px;">No active advertisements match your filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = validOpps.map(opp => {
    const isTracked = trackerItems.some(t => t.opportunity_id === opp.id || t.title === opp.title);
    return `
      <tr>
        <td>${getUrgencyBadgeHtml(opp)}</td>
        <td><strong>${escapeHtml(opp.institute_name)}</strong><br><small style="color:var(--text-dim);">${escapeHtml(opp.city || '')}</small></td>
        <td><span class="inst-category-tag ${getCategoryTagClass(opp.category)}">${opp.category}</span></td>
        <td><span class="type-pill">${opp.opportunity_type}</span></td>
        <td>
          <a href="${opp.link || '#'}" target="_blank" rel="noopener" style="color:var(--text-main); font-weight:600; text-decoration:none;">
            ${escapeHtml(opp.title)}
          </a>
          <br><small style="color:var(--text-dim);">${escapeHtml(opp.department || '')}</small>
        </td>
        <td>${opp.start_date ? formatDateDisplay(opp.start_date) : '-'}</td>
        <td style="font-weight:700; color:${opp.urgencyLevel === 'critical' ? 'var(--urgent-red)' : 'inherit'};">
          ${opp.last_date ? formatDateDisplay(opp.last_date) : 'Rolling'}
        </td>
        <td><small style="color:#34d399; font-weight:600;">${escapeHtml(opp.stipend_salary || '-')}</small></td>
        <td>
          <div style="display:flex; gap:6px;">
            ${opp.link ? `<a href="${opp.link}" target="_blank" class="btn-micro" title="Portal">🔗</a>` : ''}
            <button class="btn-micro" onclick="toggleTrackOpportunity('${opp.id}')" title="Track">${isTracked ? '✓' : '+'}</button>
            <button type="button" onclick="downloadIcs('${opp.id}')" class="btn-micro" title="Calendar">📅</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Load 253 institutes directory
async function loadInstitutes() {
  try {
    await detectBackendMode();
    if (staticMode) {
      await loadStaticData();
      institutes = staticInstitutes;
    } else {
      const res = await fetch('./api/institutes');
      if (!res.ok) return;
      institutes = await res.json();
    }

    // Populate State filter dropdown once
    const states = [...new Set(institutes.map(i => i.state).filter(Boolean))].sort();
    const stateSelect = document.getElementById('stateFilter');
    if (stateSelect) {
      const existing = new Set(Array.from(stateSelect.options).map(o => o.value));
      states.forEach(st => {
        if (!existing.has(st)) {
          const opt = document.createElement('option');
          opt.value = st;
          opt.textContent = st;
          stateSelect.appendChild(opt);
        }
      });
    }

  } catch (e) {
    console.error('Failed to load institutes:', e);
  }
}

function renderInstitutesGrid() {
  const container = document.getElementById('institutesGrid');
  if (!container) return;

  const search = (document.getElementById('dirSearchInput')?.value || '').toLowerCase();
  const category = document.getElementById('dirCategorySelect')?.value || 'ALL';

  let filtered = institutes.filter(inst => {
    if (category !== 'ALL' && inst.category !== category) return false;
    if (search) {
      const matchName = inst.name.toLowerCase().includes(search);
      const matchCity = (inst.city || '').toLowerCase().includes(search);
      const matchState = (inst.state || '').toLowerCase().includes(search);
      const matchFocus = (inst.research_focus || '').toLowerCase().includes(search);
      if (!matchName && !matchCity && !matchState && !matchFocus) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px;">No institutes matched your search.</div>`;
    return;
  }

  container.innerHTML = filtered.map(inst => `
    <div class="inst-dir-card">
      <div class="inst-dir-header">
        <span class="inst-category-tag ${getCategoryTagClass(inst.category)}">${inst.category}</span>
        <span style="font-size:0.75rem; color:var(--text-dim);">${inst.city || ''}</span>
      </div>
      <h3 class="inst-dir-name">${escapeHtml(inst.name)}</h3>
      <div class="inst-dir-location">📍 ${escapeHtml(inst.city || '')}, ${escapeHtml(inst.state || '')}</div>
      <div class="inst-dir-address">${escapeHtml(inst.address || '')}</div>
      <div class="inst-dir-focus"><strong>Focus:</strong> ${escapeHtml(inst.research_focus || 'Advanced Research & Education')}</div>

      <div class="dir-links-grid">
        <a href="${inst.website}" target="_blank" rel="noopener" class="dir-link-btn">🌐 Official Web</a>
        <a href="${inst.recruitment_url || inst.website}" target="_blank" rel="noopener" class="dir-link-btn">💼 Careers / Jobs</a>
        <a href="${inst.phd_url || inst.website}" target="_blank" rel="noopener" class="dir-link-btn">🎓 PhD Portal</a>
        <a href="${inst.sric_url || inst.website}" target="_blank" rel="noopener" class="dir-link-btn">🔬 Dean Research</a>
      </div>

      <button class="btn-scan-inst" onclick="scanSpecificInstitute('${inst.id}')">
        ⚡ Live Check Portal
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function filterInstitutes() {
  renderInstitutesGrid();
}

// Single institute live check
async function scanSpecificInstitute(instId) {
  await detectBackendMode();
  if (staticMode) {
    showToast('Live portal crawling runs in the local Node.js server. Use the official links above in GitHub Pages mode.', true);
    return;
  }
  showToast('Initiating portal crawl for institute...');
  try {
    const res = await fetch(`./api/institutes/${instId}/scan`, { method: 'POST' });
    const result = await res.json();
    if (result.success) {
      showToast(`Scan complete! ${result.itemsCount} opportunities found.`);
      loadOpportunities();
      loadStats();
    } else {
      showToast(`Scan note: ${result.error || 'Portal check finished'}`, true);
    }
  } catch (err) {
    showToast('Failed to contact portal.', true);
  }
}

// Application Pipeline (Kanban Tracker)
const STAGES_ORDER = [
  'Interested',
  'Preparing Documents',
  'Applied',
  'Interview/Written Test',
  'Selected'
];

async function loadTracker() {
  // Load local cache first so UI is instant even if network is slow
  const cached = getLocalTrackerItems();
  if (cached.length > 0 && trackerItems.length === 0) {
    trackerItems = cached;
    renderKanban();
  }

  await detectBackendMode();
  if (staticMode) {
    trackerItems = getLocalTrackerItems();
    renderKanban();
    return;
  }

  try {
    const res = await fetch('./api/tracker');
    if (!res.ok) return;
    trackerItems = await res.json();
    saveLocalTrackerItems(trackerItems);
    renderKanban();
  } catch (e) {
    console.warn('Could not contact /api/tracker, rendering local pipeline state:', e);
    renderKanban();
  }
}

function renderKanban() {
  const stages = [
    { id: 'dropInterested', stage: 'Interested', countId: 'countInterested' },
    { id: 'dropPrep', stage: 'Preparing Documents', countId: 'countPrep' },
    { id: 'dropApplied', stage: 'Applied', countId: 'countApplied' },
    { id: 'dropInterview', stage: 'Interview/Written Test', countId: 'countInterview' },
    { id: 'dropSelected', stage: 'Selected', countId: 'countSelected' }
  ];

  stages.forEach(s => {
    const col = document.getElementById(s.id);
    const counter = document.getElementById(s.countId);
    if (!col) return;

    // Attach drag and drop listeners to column dropzone
    col.ondragover = onKanbanDragOver;
    col.ondragleave = onKanbanDragLeave;
    col.ondrop = (e) => onKanbanDrop(e, s.stage);

    const items = trackerItems.filter(item => item.stage === s.stage);
    if (counter) counter.textContent = items.length;

    if (items.length === 0) {
      col.innerHTML = `
        <div class="kanban-empty-slot">
          <span>Drop or move applications here</span>
        </div>
      `;
    } else {
      col.innerHTML = items.map(item => {
        const stageIdx = STAGES_ORDER.indexOf(item.stage);
        const prevStage = stageIdx > 0 ? STAGES_ORDER[stageIdx - 1] : null;
        const nextStage = stageIdx < STAGES_ORDER.length - 1 ? STAGES_ORDER[stageIdx + 1] : null;

        return `
          <div class="kanban-card" id="track-${item.id}" draggable="true" ondragstart="onKanbanDragStart(event, '${item.id}')">
            <div class="kanban-card-title">${escapeHtml(item.title)}</div>
            <div class="kanban-card-inst">${escapeHtml(item.institute_name)}</div>
            ${item.deadline ? `<div class="kanban-meta-item">⏳ Deadline: <strong>${formatDateDisplay(item.deadline)}</strong></div>` : ''}
            ${item.portal_url ? `
              <div class="kanban-meta-item">
                <a href="${item.portal_url}" target="_blank" rel="noopener" style="color:var(--accent-cyan); text-decoration:none;">🔗 Open Portal</a>
              </div>
            ` : ''}
            ${item.login_notes ? `<div class="kanban-notes-preview"><strong>Login/App ID:</strong> ${escapeHtml(item.login_notes)}</div>` : ''}
            ${item.custom_notes ? `<div class="kanban-notes-preview"><strong>Notes:</strong> ${escapeHtml(item.custom_notes)}</div>` : ''}

            <!-- 1-Click Sequential Stage Navigation Buttons -->
            <div class="kanban-stage-nav">
              ${prevStage ? `
                <button class="btn-step-prev" onclick="moveStagePrev('${item.id}')" title="Move back to ${prevStage}">
                  ◀ Back
                </button>
              ` : '<span style="flex:1;"></span>'}
              
              ${nextStage ? `
                <button class="btn-step-next" onclick="moveStageNext('${item.id}')" title="Advance to ${nextStage}">
                  Next Stage ▶
                </button>
              ` : '<span class="status-selected">🏆 Accepted!</span>'}
            </div>

            <!-- Stage Jump Dropdown & Delete -->
            <div class="kanban-actions-row">
              <select class="btn-stage-move" onchange="updateTrackerStage('${item.id}', this.value)" title="Jump directly to any pipeline stage" onclick="event.stopPropagation()">
                <option value="Interested" ${item.stage === 'Interested' ? 'selected' : ''}>💡 Interested</option>
                <option value="Preparing Documents" ${item.stage === 'Preparing Documents' ? 'selected' : ''}>📝 Preparing SOP</option>
                <option value="Applied" ${item.stage === 'Applied' ? 'selected' : ''}>📤 Applied</option>
                <option value="Interview/Written Test" ${item.stage === 'Interview/Written Test' ? 'selected' : ''}>🎯 Interview</option>
                <option value="Selected" ${item.stage === 'Selected' ? 'selected' : ''}>🏆 Selected</option>
              </select>
              <button class="btn-card-del" onclick="deleteTrackerItem('${item.id}')" title="Remove from pipeline">✕</button>
            </div>
          </div>
        `;
      }).join('');
    }
  });

  if (window.lucide) lucide.createIcons();
}

function moveStageNext(id) {
  const item = trackerItems.find(t => t.id === id);
  if (!item) return;
  const idx = STAGES_ORDER.indexOf(item.stage);
  if (idx < STAGES_ORDER.length - 1) {
    updateTrackerStage(id, STAGES_ORDER[idx + 1]);
  }
}

function moveStagePrev(id) {
  const item = trackerItems.find(t => t.id === id);
  if (!item) return;
  const idx = STAGES_ORDER.indexOf(item.stage);
  if (idx > 0) {
    updateTrackerStage(id, STAGES_ORDER[idx - 1]);
  }
}

window.moveStageNext = moveStageNext;
window.moveStagePrev = moveStagePrev;

// Drag & drop handlers for Kanban board
let draggedTrackerId = null;

function onKanbanDragStart(e, id) {
  draggedTrackerId = id;
  e.dataTransfer.setData('text/plain', id);
  e.dataTransfer.effectAllowed = 'move';
}

function onKanbanDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const dropzone = e.currentTarget;
  if (dropzone && !dropzone.classList.contains('drag-over')) {
    dropzone.classList.add('drag-over');
  }
}

function onKanbanDragLeave(e) {
  const dropzone = e.currentTarget;
  if (dropzone) {
    dropzone.classList.remove('drag-over');
  }
}

function onKanbanDrop(e, targetStage) {
  e.preventDefault();
  const dropzone = e.currentTarget;
  if (dropzone) {
    dropzone.classList.remove('drag-over');
  }
  const id = e.dataTransfer.getData('text/plain') || draggedTrackerId;
  if (id && targetStage) {
    updateTrackerStage(id, targetStage);
  }
}

window.onKanbanDragStart = onKanbanDragStart;
window.onKanbanDragOver = onKanbanDragOver;
window.onKanbanDragLeave = onKanbanDragLeave;
window.onKanbanDrop = onKanbanDrop;

async function toggleTrackOpportunity(oppId) {
  const opp = opportunities.find(o => o.id === oppId);
  if (!opp) return;

  const existing = trackerItems.find(t => t.opportunity_id === oppId || t.title === opp.title);
  if (existing) {
    // Delete from tracker
    await deleteTrackerItem(existing.id);
  } else {
    // Add to tracker
    const newEntry = {
      id: `track-${Date.now()}`,
      opportunity_id: opp.id,
      title: opp.title,
      institute_name: opp.institute_name,
      category: opp.category,
      opportunity_type: opp.opportunity_type,
      stage: 'Interested',
      deadline: opp.last_date_parsed || opp.last_date,
      portal_url: opp.link,
      custom_notes: `Discovered on portal. Stipend: ${opp.stipend_salary || 'N/A'}`
    };

    // Optimistic local add
    trackerItems.unshift(newEntry);
    saveLocalTrackerItems(trackerItems);
    renderKanban();
    renderOpportunities();
    showToast('Added to Application Pipeline!');

    await detectBackendMode();
    if (staticMode) {
      await loadStats();
      return;
    }

    try {
      await fetch('./api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      await loadTracker();
      await loadStats();
    } catch (e) {
      console.warn('Saved pipeline entry locally');
    }
  }
}

async function updateTrackerStage(id, newStage) {
  // 1. Instant optimistic UI update
  const item = trackerItems.find(t => t.id === id);
  if (!item) return;
  item.stage = newStage;
  item.updated_at = new Date().toISOString();

  // Save in local cache and re-render instantly
  saveLocalTrackerItems(trackerItems);
  renderKanban();

  await detectBackendMode();
  if (staticMode) {
    showToast(`Application moved to "${newStage}"`);
    loadStats();
    return;
  }

  // 2. Persist to server
  try {
    let res = await fetch('./api/tracker/stage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stage: newStage })
    });

    if (!res.ok) {
      res = await fetch(`./api/tracker/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
    }

    if (res.ok) {
      showToast(`Application moved to "${newStage}"`);
    } else {
      showToast(`Moved to "${newStage}" (saved locally)`);
    }
    loadStats();
  } catch (e) {
    console.warn('Persisted stage update locally:', e);
    showToast(`Moved to "${newStage}" (saved in browser)`);
  }
}

async function deleteTrackerItem(id) {
  if (!confirm('Remove this application from pipeline?')) return;
  trackerItems = trackerItems.filter(t => t.id !== id);
  saveLocalTrackerItems(trackerItems);
  renderKanban();
  loadStats();
  renderOpportunities();

  await detectBackendMode();
  if (staticMode) {
    showToast('Application removed from pipeline');
    return;
  }

  try {
    await fetch(`./api/tracker/${id}`, { method: 'DELETE' });
    showToast('Application removed from pipeline');
  } catch (e) {
    showToast('Removed from pipeline (local)');
  }
}

// Scanner polling and controls
function startScannerPolling() {
  if (scanInterval) clearInterval(scanInterval);
  scanInterval = setInterval(pollScanStatus, 2500);
  pollScanStatus();
}

async function pollScanStatus() {
  await detectBackendMode();
  if (staticMode) {
    if (scanInterval) clearInterval(scanInterval);
    applyStaticScannerUi();
    return;
  }
  try {
    const res = await fetch('./api/scan/status');
    if (!res.ok) return;
    const status = await res.json();

    const dot = document.getElementById('scanDot');
    const label = document.getElementById('scanLabel');
    const sub = document.getElementById('scanSub');
    const title = document.getElementById('scanStatusTitle');
    const percent = document.getElementById('scanProgressPercent');
    const fill = document.getElementById('progressBarFill');
    const scanned = document.getElementById('scannedCount');
    const discovered = document.getElementById('discoveredCount');
    const errors = document.getElementById('errorsCount');
    const target = document.getElementById('currentTargetName');

    const startBtn = document.getElementById('startScanBtn');
    const stopBtn = document.getElementById('stopScanBtn');

    if (status.isScanning) {
      dot.className = 'status-dot dot-scanning';
      label.textContent = `Scanning: ${status.currentIndex} / ${status.total}`;
      sub.textContent = status.currentInstitute || 'Active';

      title.textContent = `Crawler Running: ${status.currentInstitute || ''}`;
      const pct = status.total > 0 ? Math.round((status.currentIndex / status.total) * 100) : 0;
      percent.textContent = `${pct}%`;
      fill.style.width = `${pct}%`;

      scanned.textContent = `${status.currentIndex} / ${status.total}`;
      discovered.textContent = status.itemsFound;
      errors.textContent = status.errors;
      target.textContent = status.currentInstitute || '-';

      if (startBtn) startBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = false;
    } else {
      dot.className = 'status-dot dot-idle';
      label.textContent = status.finishedAt ? 'Scan Finished' : 'Scanner: Ready';
      sub.textContent = '253 Institutes Database';

      title.textContent = status.finishedAt ? 'Last Scan Completed' : 'Crawler Status: Idle';
      if (startBtn) startBtn.disabled = false;
      if (stopBtn) stopBtn.disabled = true;
    }

    // Append logs
    if (status.recentLogs && status.recentLogs.length > 0) {
      const consoleLogs = document.getElementById('consoleLogs');
      if (consoleLogs) {
        consoleLogs.innerHTML = status.recentLogs.map(l => `<div class="log-line">${escapeHtml(l)}</div>`).join('');
      }
    }

  } catch (e) {
    console.error('Error polling scanner:', e);
  }
}

async function startQuickScan() {
  await detectBackendMode();
  if (staticMode) {
    switchTab('scanner');
    applyStaticScannerUi();
    showToast('Live portal crawling requires running "node server.js" locally.', true);
    return;
  }
  showToast('Starting portal scanner...');
  switchTab('scanner');
  await fetch('./api/scan/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'ALL', limit: 15 })
  });
}

async function triggerCategoryScan(cat) {
  await detectBackendMode();
  if (staticMode) {
    switchTab('scanner');
    applyStaticScannerUi();
    showToast('Live portal crawling requires running "node server.js" locally.', true);
    return;
  }
  showToast(`Starting crawler for ${cat}...`);
  switchTab('scanner');
  await fetch('./api/scan/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: cat, limit: 10 })
  });
}

async function startScanProcess() {
  await detectBackendMode();
  if (staticMode) {
    applyStaticScannerUi();
    showToast('Live portal crawling requires running "node server.js" locally.', true);
    return;
  }
  const cat = document.getElementById('categoryFilter')?.value || 'ALL';
  showToast(`Starting full crawler run...`);
  await fetch('./api/scan/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: cat })
  });
}

async function stopScanProcess() {
  await detectBackendMode();
  if (staticMode) return;
  await fetch('./api/scan/stop', { method: 'POST' });
  showToast('Scan stopped');
}

function runCategoryScan() {
  const cat = document.getElementById('categoryFilter').value;
  triggerCategoryScan(cat);
}

function clearCrawlerLogs() {
  document.getElementById('consoleLogs').innerHTML = '<div class="log-line text-muted">[Screen cleared]</div>';
}

// Filter and Search
function handleSearch() {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    loadOpportunities();
  }, 250);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  loadOpportunities();
}

function applyFilters() {
  loadOpportunities();
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = 'ALL';
  document.getElementById('typeFilter').value = 'ALL';
  document.getElementById('urgencyFilter').value = 'ALL';
  document.getElementById('stateFilter').value = 'ALL';
  document.getElementById('sortFilter').value = 'deadline_asc';
  loadOpportunities();
}

function filterByType(type) {
  switchTab('opportunities');
  document.getElementById('typeFilter').value = type;
  loadOpportunities();
}

function filterByUrgency(urgency) {
  switchTab('opportunities');
  document.getElementById('urgencyFilter').value = urgency;
  loadOpportunities();
}

// Calendar Export (.ICS)
async function downloadIcs(oppId) {
  await detectBackendMode();
  if (!staticMode) {
    window.location.href = `./api/calendar/${encodeURIComponent(oppId)}.ics`;
    return;
  }

  const opp = opportunities.find(o => o.id === oppId) || getActiveStaticOpportunities().find(o => o.id === oppId);
  if (!opp) {
    showToast('Opportunity not found for calendar export', true);
    return;
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
    `DESCRIPTION:Institute: ${opp.institute_name}\\nCategory: ${opp.opportunity_type}\\nStipend: ${opp.stipend_salary || 'N/A'}\\nPortal Link: ${opp.link || ''}\\n\\nDetails: ${(opp.description || '').replace(/\r?\n/g, ' ')}`,
    `URL:${opp.link || ''}`,
    'BEGIN:VALARM',
    'TRIGGER:-P2D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: 2 days left to apply for ${opp.title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  downloadBlobFile(ics, `${opp.id}-deadline.ics`, 'text/calendar; charset=utf-8');
  showToast('Calendar (.ics) downloaded!');
}
window.downloadIcs = downloadIcs;

// Export Data
async function exportData(format) {
  await detectBackendMode();
  if (!staticMode) {
    if (format === 'csv') {
      window.location.href = './api/export/csv';
    } else if (format === 'json') {
      window.location.href = './api/export/json';
    }
    return;
  }

  const list = opportunities.length > 0 ? opportunities : getActiveStaticOpportunities();
  if (format === 'csv') {
    let csv = 'ID,Institute,Category,Type,Title,Department,Last Date,Start Date,Stipend,Link\r\n';
    list.forEach(o => {
      const clean = str => `"${String(str || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
      csv += `${clean(o.id)},${clean(o.institute_name)},${clean(o.category)},${clean(o.opportunity_type)},${clean(o.title)},${clean(o.department)},${clean(o.last_date)},${clean(o.start_date)},${clean(o.stipend_salary)},${clean(o.link)}\r\n`;
    });
    downloadBlobFile(csv, 'Research_Advertisements_2026.csv', 'text/csv; charset=utf-8');
    showToast('Exported CSV file!');
  } else if (format === 'json') {
    downloadBlobFile(JSON.stringify(list, null, 2), 'Research_Advertisements_2026.json', 'application/json');
    showToast('Exported JSON file!');
  }
}

// Custom Opportunity Modal
function openAddModal() {
  document.getElementById('addModal').classList.remove('hidden');
}

function closeAddModal() {
  document.getElementById('addModal').classList.add('hidden');
}

async function submitCustomOpportunity(e) {
  e.preventDefault();
  const title = document.getElementById('addTitle').value;
  const institute_name = document.getElementById('addInstName').value;
  const category = document.getElementById('addCategory').value;
  const opportunity_type = document.getElementById('addType').value;
  const department = document.getElementById('addDept').value;
  const start_date = document.getElementById('addStartDate').value;
  const last_date = document.getElementById('addLastDate').value;
  const stipend_salary = document.getElementById('addStipend').value;
  const link = document.getElementById('addLink').value;
  const eligibility = document.getElementById('addEligibility').value;
  const description = document.getElementById('addDesc').value;

  await detectBackendMode();
  if (staticMode) {
    const now = new Date().toISOString();
    const customItem = {
      id: `custom-${Date.now()}`,
      institute_id: 'custom',
      institute_name,
      category: category || 'Other',
      opportunity_type: opportunity_type || 'PhD Admission',
      title,
      department: department || 'General',
      description: description || 'Manually added advertisement by user',
      advertisement_no: `CUSTOM/${new Date().getFullYear()}`,
      link: link || '',
      pdf_url: '',
      start_date: start_date || now.split('T')[0],
      last_date: last_date || 'Rolling / Open',
      last_date_parsed: last_date || '2026-12-31',
      stipend_salary: stipend_salary || '',
      eligibility: eligibility || '',
      is_active: 1,
      is_custom: 1,
      created_at: now
    };
    const customList = getLocalCustomOpportunities();
    customList.unshift(customItem);
    saveLocalCustomOpportunities(customList);
    showToast('Custom advertisement saved in browser!');
    closeAddModal();
    document.getElementById('addOppForm').reset();
    loadOpportunities();
    loadStats();
    return;
  }

  try {
    const res = await fetch('./api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, institute_name, category, opportunity_type,
        department, start_date, last_date, stipend_salary,
        link, eligibility, description
      })
    });

    if (res.ok) {
      showToast('Custom advertisement saved successfully!');
      closeAddModal();
      document.getElementById('addOppForm').reset();
      loadOpportunities();
      loadStats();
    } else {
      showToast('Error saving opportunity', true);
    }
  } catch (err) {
    showToast('Failed to submit opportunity', true);
  }
}

// Tracker Modal
function openAddTrackerModal() {
  document.getElementById('trackerModalTitle').textContent = 'Add Application to Pipeline';
  document.getElementById('trackerForm').reset();
  document.getElementById('trackItemId').value = '';
  document.getElementById('trackerModal').classList.remove('hidden');
}

function closeTrackerModal() {
  document.getElementById('trackerModal').classList.add('hidden');
}

async function submitTrackerForm(e) {
  e.preventDefault();
  const id = document.getElementById('trackItemId').value;
  const title = document.getElementById('trackTitle').value;
  const institute_name = document.getElementById('trackInst').value;
  const stage = document.getElementById('trackStage').value;
  const deadline = document.getElementById('trackDeadline').value;
  const applied_date = document.getElementById('trackAppliedDate').value;
  const portal_url = document.getElementById('trackPortalUrl').value;
  const login_notes = document.getElementById('trackLoginNotes').value;
  const custom_notes = document.getElementById('trackCustomNotes').value;

  const payload = {
    title, institute_name, stage, deadline,
    applied_date, portal_url, login_notes, custom_notes
  };

  await detectBackendMode();
  if (staticMode) {
    const now = new Date().toISOString();
    if (id) {
      const idx = trackerItems.findIndex(t => t.id === id);
      if (idx !== -1) {
        trackerItems[idx] = { ...trackerItems[idx], ...payload, updated_at: now };
      }
      showToast('Application updated');
    } else {
      trackerItems.unshift({
        id: `track-${Date.now()}`,
        opportunity_id: null,
        ...payload,
        created_at: now,
        updated_at: now
      });
      showToast('Application added to pipeline');
    }
    saveLocalTrackerItems(trackerItems);
    closeTrackerModal();
    renderKanban();
    loadStats();
    return;
  }

  try {
    if (id) {
      await fetch(`./api/tracker/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast('Application updated');
    } else {
      await fetch('./api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast('Application added to pipeline');
    }

    closeTrackerModal();
    loadTracker();
    loadStats();
  } catch (err) {
    showToast('Failed to save pipeline entry', true);
  }
}

// Helpers
function formatDateDisplay(dStr) {
  if (!dStr) return '';
  if (dStr.toLowerCase().includes('rolling')) return 'Rolling / Continuous';

  // If already DD Month YYYY
  if (/[a-zA-Z]/.test(dStr) && !dStr.includes('T')) return dStr;

  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
