let currentInternId = null;
let allInterns = [];

async function init() {
  try {
    allInterns = await api('/interns');
    const sel = document.getElementById('perf-intern-select');
    sel.innerHTML = '<option value="">Select Intern…</option>' +
      allInterns.map(i => `<option value="${i.id}">${i.first_name} ${i.last_name}</option>`).join('');
    document.getElementById('topbar-count').textContent = `${allInterns.length} interns`;
  } catch (e) {
    showToast('Failed to load interns', 'error');
  }
}

async function loadPerformanceForIntern() {
  const id = document.getElementById('perf-intern-select').value;
  currentInternId = id;
  if (!id) {
    document.getElementById('perf-content').innerHTML = `
      <div class="empty-state">
        <div class="es-icon"><svg width="26" height="26" fill="none" stroke="#94a3b8" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <h3>No intern selected</h3><p>Choose an intern above to view their performance reviews.</p>
      </div>`;
    return;
  }
  const el = document.getElementById('perf-content');
  el.innerHTML = '<div style="padding:32px;display:flex;justify-content:center"><div class="spinner"></div></div>';
  try {
    const reviews = await api(`/performance/intern/${id}`);
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
    el.innerHTML = emptyState('Failed to load reviews');
    showToast('Failed to load reviews', 'error');
  }
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
    loadPerformanceForIntern();
  } catch (e) {
    showToast('Error saving review', 'error');
  }
}

async function deleteReview(id) {
  if (!confirm('Delete this review?')) return;
  try {
    await api(`/performance/${id}`, 'DELETE');
    loadPerformanceForIntern();
    showToast('Review deleted', 'info');
  } catch (e) {
    showToast('Error', 'error');
  }
}

document.addEventListener('DOMContentLoaded', init);
