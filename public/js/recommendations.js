let currentInternId = null;
let allInterns = [];

async function init() {
  try {
    allInterns = await api('/interns');
    const sel = document.getElementById('rec-intern-select');
    sel.innerHTML = '<option value="">Select Intern…</option>' +
      allInterns.map(i => `<option value="${i.id}">${i.first_name} ${i.last_name}</option>`).join('');
    document.getElementById('topbar-count').textContent = `${allInterns.length} interns`;
  } catch (e) {
    showToast('Failed to load interns', 'error');
  }
}

async function loadRecommendationsForIntern() {
  const id = document.getElementById('rec-intern-select').value;
  currentInternId = id;
  if (!id) {
    document.getElementById('rec-content').innerHTML = `
      <div class="empty-state">
        <div class="es-icon"><svg width="26" height="26" fill="none" stroke="#94a3b8" stroke-width="1.8" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <h3>No intern selected</h3><p>Select an intern, then click Generate to auto-create a recommendation.</p>
      </div>`;
    return;
  }
  const el = document.getElementById('rec-content');
  el.innerHTML = '<div style="padding:32px;display:flex;justify-content:center"><div class="spinner"></div></div>';
  try {
    const list = await api(`/recommendations/intern/${id}`);
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
  } catch (e) {
    el.innerHTML = emptyState('Failed to load recommendations');
    showToast('Failed to load recommendations', 'error');
  }
}

async function generateRec() {
  if (!currentInternId) { showToast('Select an intern first', 'error'); return; }
  try {
    const gen = await api(`/recommendations/generate/${currentInternId}`);
    document.getElementById('rec-intern-id').value = currentInternId;
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
    loadRecommendationsForIntern();
  } catch (e) {
    showToast('Error saving recommendation', 'error');
  }
}

async function deleteRec(id) {
  if (!confirm('Delete this recommendation?')) return;
  try {
    await api(`/recommendations/${id}`, 'DELETE');
    loadRecommendationsForIntern();
    showToast('Deleted', 'info');
  } catch (e) {
    showToast('Error', 'error');
  }
}

document.addEventListener('DOMContentLoaded', init);
