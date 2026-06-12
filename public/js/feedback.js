let currentInternId = null;
let allInterns = [];

async function init() {
  try {
    allInterns = await api('/interns');
    const sel = document.getElementById('fb-intern-select');
    sel.innerHTML = '<option value="">Select Intern…</option>' +
      allInterns.map(i => `<option value="${i.id}">${i.first_name} ${i.last_name}</option>`).join('');
    document.getElementById('topbar-count').textContent = `${allInterns.length} interns`;
  } catch (e) {
    showToast('Failed to load interns', 'error');
  }
}

async function loadFeedbackForIntern() {
  const id = document.getElementById('fb-intern-select').value;
  currentInternId = id;
  if (!id) {
    document.getElementById('fb-content').innerHTML = `
      <div class="empty-state">
        <div class="es-icon"><svg width="26" height="26" fill="none" stroke="#94a3b8" stroke-width="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
        <h3>No intern selected</h3><p>Choose an intern above to view their feedback.</p>
      </div>`;
    return;
  }
  const el = document.getElementById('fb-content');
  el.innerHTML = '<div style="padding:32px;display:flex;justify-content:center"><div class="spinner"></div></div>';
  try {
    const list = await api(`/feedback/intern/${id}`);
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
                <button class="btn-icon" onclick="deleteFeedback(${f.id})" title="Delete">
                  <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            </div>
            <p class="fb-msg">${f.message}</p>
          </div>`).join('')}
      </div>`;
  } catch (e) {
    el.innerHTML = emptyState('Failed to load feedback');
    showToast('Failed to load feedback', 'error');
  }
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
    loadFeedbackForIntern();
  } catch (e) {
    showToast('Error submitting feedback', 'error');
  }
}

async function deleteFeedback(id) {
  if (!confirm('Delete this feedback?')) return;
  try {
    await api(`/feedback/${id}`, 'DELETE');
    loadFeedbackForIntern();
    showToast('Deleted', 'info');
  } catch (e) {
    showToast('Error', 'error');
  }
}

document.addEventListener('DOMContentLoaded', init);
