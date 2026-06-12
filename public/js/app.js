const API = '/api';
let allInterns = [];
let currentInternId = null;

// ── Sidebar (mobile) ─────────────────────────────────────────────────────────
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('overlay');
  s.classList.toggle('open');
  o.classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ── Navigation ───────────────────────────────────────────────────────────────
const PAGE_META = {
  dashboard:       { title: 'Dashboard',        icon: '<svg width="16" height="16" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>' },
  interns:         { title: 'Interns',           icon: '<svg width="16" height="16" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  performance:     { title: 'Performance',       icon: '<svg width="16" height="16" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
  feedback:        { title: 'Feedback',          icon: '<svg width="16" height="16" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
  recommendations: { title: 'Recommendations',  icon: '<svg width="16" height="16" fill="none" stroke="#6366f1" stroke-width="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
};

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`page-${page}`).classList.add('active');
    document.getElementById('page-title').textContent = PAGE_META[page].title;
    document.getElementById('crumb-icon').innerHTML = PAGE_META[page].icon;
    renderTopbarActions(page);
    closeSidebar();
    if (page === 'dashboard')       loadDashboard();
    if (page === 'interns')         loadInterns();
    if (page === 'performance')     syncInternSelects();
    if (page === 'feedback')        syncInternSelects();
    if (page === 'recommendations') syncInternSelects();
  });
});

function renderTopbarActions(page) {
  const el = document.getElementById('topbar-actions');
  const ic = (d) => `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">${d}</svg>`;
  const plus = ic('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>');
  const bolt = ic('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>');

  if (page === 'interns')
    el.innerHTML = `<button class="btn btn-primary" onclick="openAddIntern()">${plus} Add Intern</button>`;
  else if (page === 'performance')
    el.innerHTML = `<button class="btn btn-primary" onclick="openAddReview()">${plus} Add Review</button>`;
  else if (page === 'feedback')
    el.innerHTML = `<button class="btn btn-primary" onclick="openAddFeedback()">${plus} Add Feedback</button>`;
  else if (page === 'recommendations')
    el.innerHTML = `<button class="btn btn-success" onclick="generateRec()">${bolt} Generate</button>`;
  else
    el.innerHTML = '';
}

// ── Dashboard ────────────────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const d = await api('/dashboard/stats');
    const countBadge = document.getElementById('topbar-count');
    countBadge.textContent = `${d.active} active`;

    document.getElementById('stats-grid').innerHTML = [
      statCard('c1','<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', d.total, 'Total Interns', 'up'),
      statCard('c2','<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', d.active, 'Active Interns', 'up'),
      statCard('c3','<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', d.avg_score ?? '–', 'Avg Score / 5', 'neutral'),
      statCard('c4','<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', d.total_feedback, 'Feedback Entries', 'up'),
      statCard('c5','<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', d.full_time_recs, 'Full-Time Recs', 'up'),
    ].join('');

    const rankColors = ['#6366f1','#10b981','#f59e0b','#0ea5e9','#ec4899'];
    document.getElementById('top-performers').innerHTML = d.top_performers.length
      ? d.top_performers.map((i, idx) => `
        <div class="performer-row">
          <div class="performer-rank" style="background:${rankColors[idx % rankColors.length]}">${idx + 1}</div>
          <div class="avatar" style="background:${avatarColor(i.first_name)}">${initials(i.first_name, i.last_name)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.first_name} ${i.last_name}</div>
            <div style="font-size:11.5px;color:var(--text3)">${i.department}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="font-size:18px;font-weight:800;color:var(--indigo-600)">${i.avg_score}</div>
            <div style="font-size:10px;color:var(--text3);font-weight:600">/5</div>
          </div>
        </div>`).join('')
      : emptyState('No performance data yet');

    const barColors = ['#6366f1','#10b981','#f59e0b','#0ea5e9','#ec4899','#8b5cf6','#f43f5e'];
    document.getElementById('dept-breakdown').innerHTML = d.by_department.map((dep, i) => `
      <div class="dept-bar-row">
        <div class="dept-bar-meta">
          <span>${dep.department}</span>
          <span>${dep.count} intern${dep.count !== 1 ? 's' : ''} · <strong>${dep.avg_score ?? '–'}</strong>/5</span>
        </div>
        <div class="dept-bar-bg">
          <div class="dept-bar-fill" style="width:${Math.min(100, (dep.avg_score || 0) / 5 * 100)}%;background:${barColors[i % barColors.length]}"></div>
        </div>
      </div>`).join('');

    document.querySelector('#recent-table tbody').innerHTML = d.recent_interns.map(i => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar" style="background:${avatarColor(i.first_name)}">${initials(i.first_name, i.last_name)}</div>
            <span style="font-weight:600">${i.first_name} ${i.last_name}</span>
          </div>
        </td>
        <td><span class="dept-pill">${i.department}</span></td>
        <td><span class="badge badge-${i.status}">${i.status}</span></td>
        <td>${scoreBar(i.avg_score)}</td>
      </tr>`).join('');
  } catch (e) { showToast('Failed to load dashboard', 'error'); }
}

// ── Interns ───────────────────────────────────────────────────────────────────
async function loadInterns() {
  document.querySelector('#interns-table tbody').innerHTML = '<tr><td colspan="7"><div class="spinner"></div></td></tr>';
  try {
    allInterns = await api('/interns');
    renderInternsTable(allInterns);
    populateDeptFilter();
    syncInternSelects();
    const cnt = document.getElementById('topbar-count');
    cnt.textContent = `${allInterns.length} interns`;
  } catch (e) { showToast('Failed to load interns', 'error'); }
}

function renderInternsTable(list) {
  const tbody = document.querySelector('#interns-table tbody');
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7">${emptyState('No interns match your filters')}</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(i => {
    const start = i.start_date ? new Date(i.start_date) : null;
    const end   = i.end_date   ? new Date(i.end_date)   : null;
    let duration = '–';
    if (start && end) {
      const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
      duration = `${months} mo`;
    } else if (start) {
      duration = `${fmtDate(i.start_date)} →`;
    }
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:11px">
          <div class="avatar" style="background:${avatarColor(i.first_name)}">${initials(i.first_name, i.last_name)}</div>
          <div>
            <div style="font-weight:700">${i.first_name} ${i.last_name}</div>
            <div style="font-size:12px;color:var(--text3)">${i.email}</div>
          </div>
        </div>
      </td>
      <td><span class="dept-pill">${i.department}</span></td>
      <td style="font-size:13px;color:var(--text2)">${i.supervisor || '–'}</td>
      <td style="font-size:12.5px;color:var(--text2)">${duration}</td>
      <td><span class="badge badge-${i.status}">${i.status}</span></td>
      <td>${scoreBar(i.avg_score)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-outline" onclick="openEditIntern(${i.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteIntern(${i.id},'${esc(i.first_name)} ${esc(i.last_name)}')">Delete</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function populateDeptFilter() {
  const depts = [...new Set(allInterns.map(i => i.department))].sort();
  const sel = document.getElementById('dept-filter');
  const cur = sel.value;
  sel.innerHTML = '<option value="">All Departments</option>' + depts.map(d => `<option value="${d}"${d === cur ? ' selected' : ''}>${d}</option>`).join('');
}

function filterInterns() {
  const q    = document.getElementById('intern-search').value.toLowerCase();
  const dept = document.getElementById('dept-filter').value;
  const stat = document.getElementById('status-filter').value;
  renderInternsTable(allInterns.filter(i =>
    (!dept || i.department === dept) &&
    (!stat || i.status === stat) &&
    (!q || `${i.first_name} ${i.last_name} ${i.email}`.toLowerCase().includes(q))
  ));
}

function openAddIntern() {
  document.getElementById('intern-modal-title').textContent = 'Add Intern';
  document.getElementById('intern-id').value = '';
  document.getElementById('fi-status-group').style.display = 'none';
  document.getElementById('intern-form').reset();
  openModal('modal-intern');
}

async function openEditIntern(id) {
  try {
    const i = await api(`/interns/${id}`);
    document.getElementById('intern-modal-title').textContent = 'Edit Intern';
    document.getElementById('intern-id').value = id;
    document.getElementById('fi-first').value      = i.first_name;
    document.getElementById('fi-last').value       = i.last_name;
    document.getElementById('fi-email').value      = i.email;
    document.getElementById('fi-phone').value      = i.phone || '';
    document.getElementById('fi-dept').value       = i.department;
    document.getElementById('fi-supervisor').value = i.supervisor || '';
    document.getElementById('fi-start').value      = i.start_date?.split('T')[0] || '';
    document.getElementById('fi-end').value        = i.end_date?.split('T')[0] || '';
    document.getElementById('fi-university').value = i.university || '';
    document.getElementById('fi-major').value      = i.major || '';
    document.getElementById('fi-status').value     = i.status;
    document.getElementById('fi-status-group').style.display = 'flex';
    openModal('modal-intern');
  } catch (e) { showToast('Failed to load intern', 'error'); }
}

async function saveIntern() {
  const id = document.getElementById('intern-id').value;
  const body = {
    first_name:  document.getElementById('fi-first').value,
    last_name:   document.getElementById('fi-last').value,
    email:       document.getElementById('fi-email').value,
    phone:       document.getElementById('fi-phone').value,
    department:  document.getElementById('fi-dept').value,
    supervisor:  document.getElementById('fi-supervisor').value,
    start_date:  document.getElementById('fi-start').value,
    end_date:    document.getElementById('fi-end').value,
    university:  document.getElementById('fi-university').value,
    major:       document.getElementById('fi-major').value,
    status:      document.getElementById('fi-status').value || 'active',
  };
  try {
    if (id) await api(`/interns/${id}`, 'PUT', body);
    else    await api('/interns', 'POST', body);
    closeModal('modal-intern');
    showToast(id ? 'Intern updated successfully' : 'Intern added successfully', 'success');
    loadInterns();
  } catch (e) { showToast('Error saving intern — check all fields', 'error'); }
}

async function deleteIntern(id, name) {
  if (!confirm(`Delete ${name}? This removes all their reviews, feedback, and recommendations.`)) return;
  try {
    await api(`/interns/${id}`, 'DELETE');
    showToast(`${name} deleted`, 'info');
    loadInterns();
  } catch (e) { showToast('Error deleting intern', 'error'); }
}

// ── Performance ───────────────────────────────────────────────────────────────
async function loadPerformanceForIntern() {
  const id = document.getElementById('perf-intern-select').value;
  currentInternId = id;
  if (!id) return;
  const el = document.getElementById('perf-content');
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const reviews = await api(`/performance/intern/${id}`);
    if (!reviews.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="es-icon"><svg width="26" height="26" fill="none" stroke="#94a3b8" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <h3>No reviews yet</h3><p>Add the first performance review.</p>
      </div>`;
      return;
    }
    const avg = (reviews.reduce((s, r) => s + parseFloat(r.overall_score), 0) / reviews.length).toFixed(2);
    el.innerHTML = `
      <div style="padding:16px 22px;background:linear-gradient(135deg,#fafbff,#f5f3ff);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3)">Average Score</div>
          <div style="font-size:28px;font-weight:800;color:var(--indigo-600);line-height:1.1">${avg}<span style="font-size:14px;font-weight:500;color:var(--text3)"> / 5</span></div>
        </div>
        <div style="flex:1;min-width:200px">
          ${avgScoreBars(reviews)}
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Reviewer</th><th>Date</th><th>Tech</th><th>Comms</th><th>Team</th><th>Init</th><th>Punct</th><th>Overall</th><th>Notes</th><th></th></tr></thead>
          <tbody>${reviews.map(r => `<tr>
            <td style="font-weight:600">${r.reviewer_name}</td>
            <td style="font-size:12.5px;color:var(--text2)">${fmtDate(r.review_date)}</td>
            <td>${scoreCell(r.technical_skills)}</td>
            <td>${scoreCell(r.communication)}</td>
            <td>${scoreCell(r.teamwork)}</td>
            <td>${scoreCell(r.initiative)}</td>
            <td>${scoreCell(r.punctuality)}</td>
            <td><span style="font-size:15px;font-weight:800;color:var(--indigo-600)">${r.overall_score}</span></td>
            <td style="font-size:12.5px;color:var(--text2);max-width:160px">${r.notes || '–'}</td>
            <td><button class="btn-icon" onclick="deleteReview(${r.id})" title="Delete"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg></button></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>`;
  } catch (e) { showToast('Failed to load reviews', 'error'); }
}

function avgScoreBars(reviews) {
  const fields = [['technical_skills','Technical'],['communication','Communication'],['teamwork','Teamwork'],['initiative','Initiative'],['punctuality','Punctuality']];
  const colors = ['#6366f1','#10b981','#f59e0b','#0ea5e9','#ec4899'];
  return fields.map(([k, label], i) => {
    const avg = (reviews.reduce((s, r) => s + r[k], 0) / reviews.length).toFixed(1);
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;font-size:12px">
      <span style="width:90px;color:var(--text2);font-weight:500">${label}</span>
      <div style="flex:1;height:5px;background:var(--border);border-radius:3px;overflow:hidden">
        <div style="width:${avg / 5 * 100}%;height:100%;background:${colors[i]};border-radius:3px"></div>
      </div>
      <span style="font-weight:700;color:var(--text);min-width:22px">${avg}</span>
    </div>`;
  }).join('');
}

function openAddReview() {
  if (!currentInternId) { showToast('Select an intern first', 'error'); return; }
  document.getElementById('rv-intern-id').value = currentInternId;
  document.getElementById('review-form').reset();
  document.getElementById('rv-date').value = today();
  openModal('modal-review');
}

async function saveReview() {
  const body = {
    intern_id:       document.getElementById('rv-intern-id').value,
    reviewer_name:   document.getElementById('rv-reviewer').value,
    review_date:     document.getElementById('rv-date').value,
    technical_skills:document.getElementById('rv-tech').value,
    communication:   document.getElementById('rv-comm').value,
    teamwork:        document.getElementById('rv-team').value,
    initiative:      document.getElementById('rv-init').value,
    punctuality:     document.getElementById('rv-punc').value,
    notes:           document.getElementById('rv-notes').value,
  };
  try {
    await api('/performance', 'POST', body);
    closeModal('modal-review');
    showToast('Review added', 'success');
    loadPerformanceForIntern();
  } catch (e) { showToast('Error saving review', 'error'); }
}

async function deleteReview(id) {
  if (!confirm('Delete this review?')) return;
  try { await api(`/performance/${id}`, 'DELETE'); loadPerformanceForIntern(); showToast('Review deleted', 'info'); }
  catch (e) { showToast('Error', 'error'); }
}

// ── Feedback ──────────────────────────────────────────────────────────────────
async function loadFeedbackForIntern() {
  const id = document.getElementById('fb-intern-select').value;
  currentInternId = id;
  if (!id) return;
  const el = document.getElementById('fb-content');
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const list = await api(`/feedback/intern/${id}`);
    if (!list.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="es-icon"><svg width="26" height="26" fill="none" stroke="#94a3b8" stroke-width="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
        <h3>No feedback yet</h3><p>Be the first to leave feedback.</p>
      </div>`;
      return;
    }
    const pos  = list.filter(f => f.category === 'positive').length;
    const cons = list.filter(f => f.category === 'constructive').length;
    el.innerHTML = `
      <div style="padding:14px 22px;border-bottom:1px solid var(--border);display:flex;gap:16px;flex-wrap:wrap">
        <div class="chip"><svg width="12" height="12" fill="none" stroke="#059669" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> ${pos} Positive</div>
        <div class="chip"><svg width="12" height="12" fill="none" stroke="#d97706" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${cons} Constructive</div>
        <div class="chip" style="margin-left:auto;color:var(--text3)">${list.length} total</div>
      </div>
      <div style="padding:16px 22px;display:flex;flex-direction:column;gap:12px">
        ${list.map(f => `
          <div class="fb-card">
            <div class="fb-header">
              <div style="display:flex;align-items:center;gap:8px">
                <div class="avatar" style="width:30px;height:30px;font-size:11px;background:${avatarColor(f.submitted_by)}">${f.submitted_by.slice(0,2).toUpperCase()}</div>
                <span style="font-weight:700;font-size:13.5px">${f.submitted_by}</span>
                <span class="badge badge-${f.category}">${f.category}</span>
                ${f.is_private ? '<span class="badge" style="background:#f1f5f9;color:#475569">Private</span>' : ''}
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:12px;color:var(--text3)">${fmtDate(f.feedback_date)}</span>
                <button class="btn-icon" onclick="deleteFeedback(${f.id})" title="Delete">
                  <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            </div>
            <p class="fb-msg">${f.message}</p>
          </div>`).join('')}
      </div>`;
  } catch (e) { showToast('Failed to load feedback', 'error'); }
}

function openAddFeedback() {
  if (!currentInternId) { showToast('Select an intern first', 'error'); return; }
  document.getElementById('fb-intern-id').value = currentInternId;
  document.getElementById('feedback-form').reset();
  document.getElementById('fb-date').value = today();
  openModal('modal-feedback');
}

async function saveFeedback() {
  const body = {
    intern_id:    document.getElementById('fb-intern-id').value,
    submitted_by: document.getElementById('fb-by').value,
    feedback_date:document.getElementById('fb-date').value,
    category:     document.getElementById('fb-cat').value,
    message:      document.getElementById('fb-msg').value,
    is_private:   document.getElementById('fb-private').value,
  };
  try {
    await api('/feedback', 'POST', body);
    closeModal('modal-feedback');
    showToast('Feedback submitted', 'success');
    loadFeedbackForIntern();
  } catch (e) { showToast('Error submitting feedback', 'error'); }
}

async function deleteFeedback(id) {
  if (!confirm('Delete this feedback?')) return;
  try { await api(`/feedback/${id}`, 'DELETE'); loadFeedbackForIntern(); showToast('Deleted', 'info'); }
  catch (e) { showToast('Error', 'error'); }
}

// ── Recommendations ───────────────────────────────────────────────────────────
async function loadRecommendationsForIntern() {
  const id = document.getElementById('rec-intern-select').value;
  currentInternId = id;
  if (!id) return;
  const el = document.getElementById('rec-content');
  el.innerHTML = '<div class="spinner"></div>';
  try {
    const list = await api(`/recommendations/intern/${id}`);
    if (!list.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="es-icon"><svg width="26" height="26" fill="none" stroke="#94a3b8" stroke-width="1.8" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <h3>No recommendations yet</h3><p>Click "Generate" to auto-create one from performance data.</p>
      </div>`;
      return;
    }
    el.innerHTML = `<div style="padding:20px 22px;display:flex;flex-direction:column;gap:14px">
      ${list.map(r => `
        <div class="rec-card type-${r.recommendation_type}">
          <div class="rec-head">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              <span class="badge badge-${r.recommendation_type}">${r.recommendation_type.replace('_', ' ')}</span>
              <span class="badge badge-${r.rating}">${r.rating}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:12px;color:var(--text3)">By <strong>${r.recommended_by}</strong> · ${fmtDate(r.recommendation_date)}</span>
              <button class="btn-icon" onclick="deleteRec(${r.id})" title="Delete">
                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          </div>
          <p class="rec-summary">${r.summary}</p>
          <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:12.5px">
            ${r.strengths ? `<div><span style="font-weight:700;color:var(--emerald-600)">✓ Strengths:</span> <span style="color:var(--text2)">${r.strengths}</span></div>` : ''}
            ${r.areas_for_improvement ? `<div><span style="font-weight:700;color:var(--amber-600)">→ Growth:</span> <span style="color:var(--text2)">${r.areas_for_improvement}</span></div>` : ''}
          </div>
        </div>`).join('')}
    </div>`;
  } catch (e) { showToast('Failed to load recommendations', 'error'); }
}

async function generateRec() {
  if (!currentInternId) { showToast('Select an intern first', 'error'); return; }
  try {
    const gen = await api(`/recommendations/generate/${currentInternId}`);
    document.getElementById('rec-intern-id').value = currentInternId;
    document.getElementById('rec-form').reset();
    document.getElementById('rec-date').value = today();
    document.getElementById('gen-preview').innerHTML = `
      <h4>✨ Auto-Generated from Performance Data</h4>
      <p>${gen.summary}</p>`;
    document.getElementById('rec-type').value     = gen.recommendation_type || 'pending';
    document.getElementById('rec-rating').value   = gen.rating || 'adequate';
    document.getElementById('rec-strengths').value= gen.strengths || '';
    document.getElementById('rec-improve').value  = gen.areas_for_improvement || '';
    document.getElementById('rec-summary').value  = gen.summary || '';
    openModal('modal-rec');
  } catch (e) { showToast('Error generating recommendation', 'error'); }
}

async function saveRecommendation() {
  const body = {
    intern_id:            document.getElementById('rec-intern-id').value,
    recommended_by:       document.getElementById('rec-by').value,
    recommendation_date:  document.getElementById('rec-date').value,
    recommendation_type:  document.getElementById('rec-type').value,
    rating:               document.getElementById('rec-rating').value,
    strengths:            document.getElementById('rec-strengths').value,
    areas_for_improvement:document.getElementById('rec-improve').value,
    summary:              document.getElementById('rec-summary').value,
  };
  try {
    await api('/recommendations', 'POST', body);
    closeModal('modal-rec');
    showToast('Recommendation saved', 'success');
    loadRecommendationsForIntern();
  } catch (e) { showToast('Error saving recommendation', 'error'); }
}

async function deleteRec(id) {
  if (!confirm('Delete this recommendation?')) return;
  try { await api(`/recommendations/${id}`, 'DELETE'); loadRecommendationsForIntern(); showToast('Deleted', 'info'); }
  catch (e) { showToast('Error', 'error'); }
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function syncInternSelects() {
  ['perf-intern-select','fb-intern-select','rec-intern-select'].forEach(selId => {
    const sel = document.getElementById(selId);
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">Select Intern…</option>' +
      allInterns.map(i => `<option value="${i.id}"${i.id == cur ? ' selected' : ''}>${i.first_name} ${i.last_name}</option>`).join('');
  });
}

async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-backdrop').forEach(m =>
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); })
);

function showToast(msg, type = 'info') {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.innerHTML = `<div class="toast-icon">${icons[type] || '•'}</div><span>${msg}</span>`;
  document.getElementById('toast').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function scoreBar(val) {
  if (!val) return '<span style="font-size:12px;color:var(--text3)">No reviews</span>';
  return `<div class="score-bar">
    <div class="bar"><div class="fill" style="width:${val / 5 * 100}%"></div></div>
    <span class="val">${val}</span>
  </div>`;
}

function scoreCell(v) {
  return `<span class="score-cell sc-${v}">${v}</span>`;
}

function emptyState(msg) {
  return `<div class="empty-state"><div class="es-icon"><svg width="26" height="26" fill="none" stroke="#94a3b8" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><p>${msg}</p></div>`;
}

function statCard(cls, icon, value, label, trend) {
  return `<div class="stat-card ${cls}">
    <div class="stat-icon">${icon}</div>
    <div class="stat-value">${value ?? '–'}</div>
    <div class="stat-label">${label}</div>
    <span class="stat-trend ${trend}">${trend === 'up' ? '↑ Active' : '● Tracked'}</span>
  </div>`;
}

const AVATAR_COLORS = ['#6366f1','#10b981','#f59e0b','#0ea5e9','#ec4899','#8b5cf6','#f43f5e','#14b8a6'];
function avatarColor(name) {
  let h = 0;
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function initials(f, l) { return (f?.[0] || '') + (l?.[0] || ''); }
function fmtDate(d) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function today() { return new Date().toISOString().split('T')[0]; }
function esc(s) { return String(s).replace(/'/g, "\\'"); }

// ── Init ──────────────────────────────────────────────────────────────────────
(async () => {
  await loadInterns();
  loadDashboard();
  renderTopbarActions('dashboard');
  document.getElementById('topbar-count').textContent = '';
})();
