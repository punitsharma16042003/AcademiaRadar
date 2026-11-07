// AcademiaRadar India - Frontend Application Script
let opportunities = [];
let institutes = [];
let trackerItems = [];
let currentTab = 'opportunities';
let viewMode = 'cards';
let scanInterval = null;
let searchDebounceTimeout = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadInstitutes();
  loadStats();
  loadOpportunities();
  loadTracker();
  initTheme();
  startScannerPolling();
  
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
    renderKanban();
  } else if (tabName === 'institutes') {
    renderInstitutesGrid();
  }

  if (window.lucide) lucide.createIcons();
}

// View toggle (Cards vs Table)
function setViewMode(mode) {
  viewMode = mode;
  document.getElementById('cardViewBtn').classList.toggle('active', mode === 'cards');
  document.getElementById('tableViewBtn').classList.toggle('active', mode === 'table');
  
  document.getElementById('oppCardsContainer').classList.toggle('hidden', mode === 'table');
  document.getElementById('oppTableContainer').classList.toggle('hidden', mode === 'cards');

  if (window.lucide) lucide.createIcons();
}

// Load stats from API
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) return;
    const data = await res.json();

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
    const res = await fetch(`/api/opportunities?${params}`);
    if (!res.ok) throw new Error('Network error');
    opportunities = await res.json();

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
          <a href="/api/calendar/${opp.id}.ics" download class="btn-ics" title="Export Deadline to Calendar (.ics)">
            <i data-lucide="calendar"></i>
          </a>
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
            <a href="/api/calendar/${opp.id}.ics" download class="btn-micro" title="Calendar">📅</a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Load 253 institutes directory
async function loadInstitutes() {
  try {
    const res = await fetch('/api/institutes');
    if (!res.ok) return;
    institutes = await res.json();

    // Populate State filter dropdown
    const states = [...new Set(institutes.map(i => i.state).filter(Boolean))].sort();
    const stateSelect = document.getElementById('stateFilter');
    if (stateSelect) {
      states.forEach(st => {
        const opt = document.createElement('option');
        opt.value = st;
        opt.textContent = st;
        stateSelect.appendChild(opt);
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
  showToast('Initiating portal crawl for institute...');
  try {
    const res = await fetch(`/api/institutes/${instId}/scan`, { method: 'POST' });
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
async function loadTracker() {
  try {
    const res = await fetch('/api/tracker');
    if (!res.ok) return;
    trackerItems = await res.json();
    renderKanban();
  } catch (e) {
    console.error('Failed to load tracker items:', e);
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

    const items = trackerItems.filter(item => item.stage === s.stage);
    if (counter) counter.textContent = items.length;

    col.innerHTML = items.map(item => `
      <div class="kanban-card" id="track-${item.id}">
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

        <div class="kanban-actions-row">
          <select class="btn-stage-move" onchange="updateTrackerStage('${item.id}', this.value)">
            <option value="Interested" ${item.stage === 'Interested' ? 'selected' : ''}>Interested</option>
            <option value="Preparing Documents" ${item.stage === 'Preparing Documents' ? 'selected' : ''}>Preparing Docs</option>
            <option value="Applied" ${item.stage === 'Applied' ? 'selected' : ''}>Applied</option>
            <option value="Interview/Written Test" ${item.stage === 'Interview/Written Test' ? 'selected' : ''}>Interview</option>
            <option value="Selected" ${item.stage === 'Selected' ? 'selected' : ''}>Selected</option>
          </select>
          <button class="btn-micro" style="color:var(--urgent-red);" onclick="deleteTrackerItem('${item.id}')" title="Delete">✕</button>
        </div>
      </div>
    `).join('');
  });

  if (window.lucide) lucide.createIcons();
}

async function toggleTrackOpportunity(oppId) {
  const opp = opportunities.find(o => o.id === oppId);
  if (!opp) return;

  const existing = trackerItems.find(t => t.opportunity_id === oppId || t.title === opp.title);
  if (existing) {
    // Delete from tracker
    await fetch(`/api/tracker/${existing.id}`, { method: 'DELETE' });
    showToast('Removed from Application Pipeline');
  } else {
    // Add to tracker
    await fetch('/api/tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opportunity_id: opp.id,
        title: opp.title,
        institute_name: opp.institute_name,
        category: opp.category,
        opportunity_type: opp.opportunity_type,
        stage: 'Interested',
        deadline: opp.last_date_parsed || opp.last_date,
        portal_url: opp.link,
        custom_notes: `Discovered on portal. Stipend: ${opp.stipend_salary || 'N/A'}`
      })
    });
    showToast('Added to Application Pipeline!');
  }

  await loadTracker();
  await loadStats();
  renderOpportunities();
}

async function updateTrackerStage(id, newStage) {
  try {
    await fetch(`/api/tracker/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage })
    });
    showToast(`Application moved to ${newStage}`);
    loadTracker();
  } catch (e) {
    showToast('Failed to update stage', true);
  }
}

async function deleteTrackerItem(id) {
  if (!confirm('Remove this application from pipeline?')) return;
  try {
    await fetch(`/api/tracker/${id}`, { method: 'DELETE' });
    showToast('Application removed');
    loadTracker();
    loadStats();
    renderOpportunities();
  } catch (e) {
    showToast('Failed to delete item', true);
  }
}

// Scanner polling and controls
function startScannerPolling() {
  if (scanInterval) clearInterval(scanInterval);
  scanInterval = setInterval(pollScanStatus, 2500);
  pollScanStatus();
}

async function pollScanStatus() {
  try {
    const res = await fetch('/api/scan/status');
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
  showToast('Starting portal scanner...');
  switchTab('scanner');
  await fetch('/api/scan/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'ALL', limit: 15 })
  });
}

async function triggerCategoryScan(cat) {
  showToast(`Starting crawler for ${cat}...`);
  switchTab('scanner');
  await fetch('/api/scan/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: cat, limit: 10 })
  });
}

async function startScanProcess() {
  const cat = document.getElementById('categoryFilter')?.value || 'ALL';
  showToast(`Starting full crawler run...`);
  await fetch('/api/scan/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: cat })
  });
}

async function stopScanProcess() {
  await fetch('/api/scan/stop', { method: 'POST' });
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

// Export Data
function exportData(format) {
  if (format === 'csv') {
    window.location.href = '/api/export/csv';
  } else if (format === 'json') {
    window.location.href = '/api/export/json';
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

  try {
    const res = await fetch('/api/opportunities', {
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

  try {
    if (id) {
      await fetch(`/api/tracker/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast('Application updated');
    } else {
      await fetch('/api/tracker', {
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
