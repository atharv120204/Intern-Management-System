let allInterns = [];

async function loadInterns() {
  document.getElementById('intern-cards').innerHTML =
    '<div style="grid-column:1/-1;display:flex;justify-content:center;padding:40px"><div class="spinner"></div></div>';
  try {
    allInterns = await api('/interns');
    renderInternCards(allInterns);
    populateDeptFilter();
    document.getElementById('topbar-count').textContent = `${allInterns.length} interns`;
  } catch (e) {
    showToast('Failed to load interns', 'error');
  }
}

const DEPT_GRADIENTS = {
  'Engineering':   'linear-gradient(90deg,#6366f1,#8b5cf6)',
  'Marketing':     'linear-gradient(90deg,#ec4899,#f43f5e)',
  'Data Science':  'linear-gradient(90deg,#0ea5e9,#6366f1)',
  'Product':       'linear-gradient(90deg,#10b981,#0ea5e9)',
  'Design':        'linear-gradient(90deg,#8b5cf6,#ec4899)',
  'Finance':       'linear-gradient(90deg,#f59e0b,#f43f5e)',
  'HR':            'linear-gradient(90deg,#14b8a6,#10b981)',
  'Operations':    'linear-gradient(90deg,#f59e0b,#10b981)',
};

function getDeptGradient(dept) {
  return DEPT_GRADIENTS[dept] || `linear-gradient(90deg,${avatarColor(dept)},#8b5cf6)`;
}

function renderInternCards(list) {
  const container = document.getElementById('intern-cards');
  if (!list.length) {
    container.innerHTML = `<div style="grid-column:1/-1">${emptyState('No interns match your filters', 'Try adjusting your search or filters.')}</div>`;
    return;
  }
  container.innerHTML = list.map(i => {
    const color = avatarColor(i.first_name);
    const grad = getDeptGradient(i.department);
    return `<div class="intern-card" style="--ic-color:${grad}">
      <div class="intern-card-head">
        <div class="avatar" style="background:${color};width:44px;height:44px;font-size:16px;flex-shrink:0">${initials(i.first_name, i.last_name)}</div>
        <div class="intern-card-meta">
          <div class="intern-card-name">${i.first_name} ${i.last_name}</div>
          <div class="intern-card-email">${i.email}</div>
        </div>
      </div>
      <div class="intern-card-body">
        <div class="intern-card-row">
          <span class="dept-pill">${i.department}</span>
          <span class="badge badge-${i.status}">${i.status}</span>
        </div>
        <div class="intern-card-row" style="color:var(--text2)">
          <span style="font-size:12px">Avg Score</span>
          ${scoreBar(i.avg_score)}
        </div>
        ${i.supervisor ? `<div class="intern-card-row"><span style="font-size:12px;color:var(--text3)">Supervisor</span><span style="font-size:12.5px;font-weight:600">${i.supervisor}</span></div>` : ''}
      </div>
      <div class="intern-card-actions">
        <a href="/intern.html?id=${i.id}" class="btn btn-outline btn-sm" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:5px">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Profile
        </a>
        <button class="btn btn-ghost btn-sm" onclick="openEditIntern(${i.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteIntern(${i.id},'${esc(i.first_name)} ${esc(i.last_name)}')">Delete</button>
      </div>
    </div>`;
  }).join('');
}

function populateDeptFilter() {
  const depts = [...new Set(allInterns.map(i => i.department))].sort();
  const sel = document.getElementById('dept-filter');
  const cur = sel.value;
  sel.innerHTML = '<option value="">All Departments</option>' +
    depts.map(d => `<option value="${d}"${d === cur ? ' selected' : ''}>${d}</option>`).join('');
}

function filterInterns() {
  const q    = document.getElementById('intern-search').value.toLowerCase();
  const dept = document.getElementById('dept-filter').value;
  const stat = document.getElementById('status-filter').value;
  renderInternCards(allInterns.filter(i =>
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
  } catch (e) {
    showToast('Failed to load intern', 'error');
  }
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
  } catch (e) {
    showToast('Error saving intern — check all fields', 'error');
  }
}

async function deleteIntern(id, name) {
  if (!confirm(`Delete ${name}? This removes all their reviews, feedback, and recommendations.`)) return;
  try {
    await api(`/interns/${id}`, 'DELETE');
    showToast(`${name} deleted`, 'info');
    loadInterns();
  } catch (e) {
    showToast('Error deleting intern', 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadInterns);
