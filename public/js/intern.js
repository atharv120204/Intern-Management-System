const params = new URLSearchParams(location.search);
const INTERN_ID = params.get('id');
let currentInternId = INTERN_ID;
let internData = null;

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
}

// ── Build page shell ──────────────────────────────────────────────────────────
function buildShell(intern) {
  const color = avatarColor(intern.first_name);
  const start = fmtDate(intern.start_date);
  const end   = intern.end_date ? fmtDate(intern.end_date) : 'Present';
  document.getElementById('page-title').textContent = `${intern.first_name} ${intern.last_name}`;

  document.getElementById('main-content').innerHTML = `
    <div class="intern-hero">
      <div class="big-avatar" style="background:${color}">${initials(intern.first_name, intern.last_name)}</div>
      <div class="hero-info">
        <h2>${intern.first_name} ${intern.last_name}</h2>
        <div class="meta-chips">
          <span class="meta-chip">${intern.department}</span>
          <span class="badge badge-${intern.status}" style="font-size:12px">${intern.status}</span>
          ${intern.university ? `<span class="meta-chip">${intern.university}</span>` : ''}
          <span class="meta-chip">${start} – ${end}</span>
        </div>
      </div>
    </div>

    <div class="tab-bar">
      <button class="tab-btn active" data-tab="overview" onclick="switchTab('overview')">Overview</button>
      <button class="tab-btn" data-tab="performance" onclick="switchTab('performance')">Performance</button>
      <button class="tab-btn" data-tab="feedback" onclick="switchTab('feedback')">Feedback</button>
      <button class="tab-btn" data-tab="recommendations" onclick="switchTab('recommendations')">Recommendations</button>
    </div>

    <!-- TAB: Overview -->
    <div class="tab-panel active" id="tab-overview">
      <div class="two-col" style="margin-top:20px">
        <div class="card">
          <div class="card-header"><h3>Contact &amp; Info</h3></div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-row"><span class="info-label">Email</span><span class="info-value">${intern.email || '–'}</span></div>
              <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${intern.phone || '–'}</span></div>
              <div class="info-row"><span class="info-label">University</span><span class="info-value">${intern.university || '–'}</span></div>
              <div class="info-row"><span class="info-label">Major</span><span class="info-value">${intern.major || '–'}</span></div>
              <div class="info-row"><span class="info-label">Supervisor</span><span class="info-value">${intern.supervisor || '–'}</span></div>
              <div class="info-row"><span class="info-label">Department</span><span class="info-value">${intern.department || '–'}</span></div>
              <div class="info-row"><span class="info-label">Start Date</span><span class="info-value">${fmtDate(intern.start_date)}</span></div>
              <div class="info-row"><span class="info-label">End Date</span><span class="info-value">${intern.end_date ? fmtDate(intern.end_date) : 'Ongoing'}</span></div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>Performance Summary</h3></div>
          <div class="card-body" id="overview-perf">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:20px">
        <div class="card-header"><h3>Recent Feedback</h3></div>
        <div class="card-body" id="overview-feedback">
          <div class="spinner"></div>
        </div>
      </div>
    </div>

    <!-- TAB: Performance -->
    <div class="tab-panel" id="tab-performance">
      <div class="section-header">
        <h3>Performance Reviews</h3>
        <button class="btn btn-primary btn-sm" onclick="openAddReview()">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Review
        </button>
      </div>
      <div id="perf-content"><div style="padding:32px;display:flex;justify-content:center"><div class="spinner"></div></div></div>
    </div>

    <!-- TAB: Feedback -->
    <div class="tab-panel" id="tab-feedback">
      <div class="section-header">
        <h3>Feedback</h3>
        <button class="btn btn-primary btn-sm" onclick="openAddFeedback()">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Feedback
        </button>
      </div>
      <div id="fb-content"><div style="padding:32px;display:flex;justify-content:center"><div class="spinner"></div></div></div>
    </div>

    <!-- TAB: Recommendations -->
    <div class="tab-panel" id="tab-recommendations">
      <div class="section-header">
        <h3>Recommendations</h3>
        <button class="btn btn-success btn-sm" onclick="generateRec()">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Generate
        </button>
      </div>
      <div id="rec-content"><div style="padding:32px;display:flex;justify-content:center"><div class="spinner"></div></div></div>
    </div>
  `;

  // Load all tab data in parallel
  loadOverviewPerf();
  loadOverviewFeedback();
  loadPerf();
  loadFeedbackTab();
  loadRecsTab();
}

// ── Overview: Performance summary ─────────────────────────────────────────────
async function loadOverviewPerf() {
  const el = document.getElementById('overview-perf');
  try {
    const reviews = await api(`/performance/intern/${INTERN_ID}`);
    if (!reviews.length) {
      el.innerHTML = emptyState('No reviews yet', 'Add a performance review to see scores here.');
      return;
    }
    const avg = (reviews.reduce((s, r) => s + parseFloat(r.overall_score), 0) / reviews.length).toFixed(2);
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:18px">
        <div>
          <div class="big-score">${avg}</div>
          <div class="big-score-label">Average score out of 5</div>
        </div>
        <div style="flex:1">${avgScoreBars(reviews)}</div>
      </div>`;
  } catch (e) {
    el.innerHTML = emptyState('Failed to load performance data');
  }
}

// ── Overview: Recent feedback ─────────────────────────────────────────────────
async function loadOverviewFeedback() {
  const el = document.getElementById('overview-feedback');
  try {
    const list = await api(`/feedback/intern/${INTERN_ID}`);
    const recent = list.slice(0, 3);
    if (!recent.length) {
      el.innerHTML = emptyState('No feedback yet', 'Add feedback using the Feedback tab.');
      return;
    }
    el.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px">` +
      recent.map(f => `
        <div class="fb-card">
          <div class="fb-header">
            <div style="display:flex;align-items:center;gap:8px">
              <div class="avatar" style="width:30px;height:30px;font-size:11px;background:${avatarColor(f.submitted_by)}">${f.submitted_by.slice(0,2).toUpperCase()}</div>
              <span style="font-weight:700;font-size:13.5px">${f.submitted_by}</span>
              <span class="badge badge-${f.category}">${f.category}</span>
            </div>
            <span style="font-size:12px;color:var(--text3)">${fmtDate(f.feedback_date)}</span>
          </div>
          <p class="fb-msg">${f.message}</p>
        </div>`).join('') +
      `</div>`;
  } catch (e) {
    el.innerHTML = emptyState('Failed to load feedback');
  }
}

// ── Performance tab ───────────────────────────────────────────────────────────
async function loadPerf() {
  const el = document.getElementById('perf-content');
  try {
    const reviews = await api(`/performance/intern/${INTERN_ID}`);
    if (!reviews.length) {
      el.innerHTML = emptyState('No reviews yet', 'Click "+ Add Review" to add the first performance review.');
      return;
    }
    const avg = (reviews.reduce((s, r) => s + parseFloat(r.overall_score), 0) / reviews.length).toFixed(2);
    el.innerHTML = `
      <div style="padding:16px 22px;background:linear-gradient(135deg,#fafbff,#f5f3ff);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text3)">Average Score</div>
          <div style="font-size:28px;font-weight:800;color:var(--indigo-600);line-height:1.1">${avg}<span style="font-size:14px;font-weight:500;color:var(--text3)"> / 5</span></div>
        </div>
        <div style="flex:1;min-width:200px">${avgScoreBars(reviews)}</div>
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
  } catch (e) {
    el.innerHTML = emptyState('Failed to load performance reviews');
  }
}

// ── Feedback tab ──────────────────────────────────────────────────────────────
async function loadFeedbackTab() {
  const el = document.getElementById('fb-content');
  try {
    const list = await api(`/feedback/intern/${INTERN_ID}`);
    if (!list.length) {
      el.innerHTML = emptyState('No feedback yet', 'Click "+ Add Feedback" to add the first entry.');
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
                <button class="btn-icon" onclick="deleteFeedbackItem(${f.id})" title="Delete">
                  <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            </div>
            <p class="fb-msg">${f.message}</p>
          </div>`).join('')}
      </div>`;
  } catch (e) {
    el.innerHTML = emptyState('Failed to load feedback');
  }
}

// ── Recommendations tab ───────────────────────────────────────────────────────
async function loadRecsTab() {
  const el = document.getElementById('rec-content');
  try {
    const list = await api(`/recommendations/intern/${INTERN_ID}`);
    if (!list.length) {
      el.innerHTML = emptyState('No recommendations yet', 'Click "Generate" to auto-create one from performance data.');
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
              <button class="btn-icon" onclick="deleteRecItem(${r.id})" title="Delete">
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
  } catch (e) {
    el.innerHTML = emptyState('Failed to load recommendations');
  }
}

// ── Modal openers ─────────────────────────────────────────────────────────────
function openAddReview() {
  document.getElementById('rv-intern-id').value = INTERN_ID;
  document.getElementById('review-form').reset();
  document.getElementById('rv-date').value = today();
  openModal('modal-review');
}

function openAddFeedback() {
  document.getElementById('fb-intern-id').value = INTERN_ID;
  document.getElementById('feedback-form').reset();
  document.getElementById('fb-date').value = today();
  openModal('modal-feedback');
}

async function generateRec() {
  try {
    const gen = await api(`/recommendations/generate/${INTERN_ID}`);
    document.getElementById('rec-intern-id').value = INTERN_ID;
    document.getElementById('rec-form').reset();
    document.getElementById('rec-date').value = today();
    document.getElementById('gen-preview').innerHTML = `<h4>✨ Auto-Generated from Performance Data</h4><p>${gen.summary}</p>`;
    document.getElementById('rec-type').value     = gen.recommendation_type || 'pending';
    document.getElementById('rec-rating').value   = gen.rating || 'adequate';
    document.getElementById('rec-strengths').value= gen.strengths || '';
    document.getElementById('rec-improve').value  = gen.areas_for_improvement || '';
    document.getElementById('rec-summary').value  = gen.summary || '';
    openModal('modal-rec');
  } catch (e) {
    showToast('Error generating recommendation', 'error');
  }
}

// ── Save actions ──────────────────────────────────────────────────────────────
async function saveReview() {
  const body = {
    intern_id:        document.getElementById('rv-intern-id').value,
    reviewer_name:    document.getElementById('rv-reviewer').value,
    review_date:      document.getElementById('rv-date').value,
    technical_skills: document.getElementById('rv-tech').value,
    communication:    document.getElementById('rv-comm').value,
    teamwork:         document.getElementById('rv-team').value,
    initiative:       document.getElementById('rv-init').value,
    punctuality:      document.getElementById('rv-punc').value,
    notes:            document.getElementById('rv-notes').value,
  };
  try {
    await api('/performance', 'POST', body);
    closeModal('modal-review');
    showToast('Review added', 'success');
    loadPerf();
    loadOverviewPerf();
  } catch (e) { showToast('Error saving review', 'error'); }
}

async function saveFeedback() {
  const body = {
    intern_id:     document.getElementById('fb-intern-id').value,
    submitted_by:  document.getElementById('fb-by').value,
    feedback_date: document.getElementById('fb-date').value,
    category:      document.getElementById('fb-cat').value,
    message:       document.getElementById('fb-msg').value,
    is_private:    document.getElementById('fb-private').value,
  };
  try {
    await api('/feedback', 'POST', body);
    closeModal('modal-feedback');
    showToast('Feedback submitted', 'success');
    loadFeedbackTab();
    loadOverviewFeedback();
  } catch (e) { showToast('Error submitting feedback', 'error'); }
}

async function saveRecommendation() {
  const body = {
    intern_id:             document.getElementById('rec-intern-id').value,
    recommended_by:        document.getElementById('rec-by').value,
    recommendation_date:   document.getElementById('rec-date').value,
    recommendation_type:   document.getElementById('rec-type').value,
    rating:                document.getElementById('rec-rating').value,
    strengths:             document.getElementById('rec-strengths').value,
    areas_for_improvement: document.getElementById('rec-improve').value,
    summary:               document.getElementById('rec-summary').value,
  };
  try {
    await api('/recommendations', 'POST', body);
    closeModal('modal-rec');
    showToast('Recommendation saved', 'success');
    loadRecsTab();
  } catch (e) { showToast('Error saving recommendation', 'error'); }
}

async function deleteReview(id) {
  if (!confirm('Delete this review?')) return;
  try { await api(`/performance/${id}`, 'DELETE'); loadPerf(); loadOverviewPerf(); showToast('Review deleted', 'info'); }
  catch (e) { showToast('Error', 'error'); }
}

async function deleteFeedbackItem(id) {
  if (!confirm('Delete this feedback?')) return;
  try { await api(`/feedback/${id}`, 'DELETE'); loadFeedbackTab(); loadOverviewFeedback(); showToast('Deleted', 'info'); }
  catch (e) { showToast('Error', 'error'); }
}

async function deleteRecItem(id) {
  if (!confirm('Delete this recommendation?')) return;
  try { await api(`/recommendations/${id}`, 'DELETE'); loadRecsTab(); showToast('Deleted', 'info'); }
  catch (e) { showToast('Error', 'error'); }
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (!INTERN_ID) {
    document.getElementById('main-content').innerHTML = emptyState('No intern selected', 'Return to the interns list and select an intern.');
    return;
  }
  try {
    internData = await api(`/interns/${INTERN_ID}`);
    buildShell(internData);
  } catch (e) {
    document.getElementById('main-content').innerHTML = emptyState('Intern not found', 'This intern may have been deleted.');
    showToast('Failed to load intern', 'error');
  }
});
