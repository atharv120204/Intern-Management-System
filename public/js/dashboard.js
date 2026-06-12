async function loadDashboard() {
  try {
    const d = await api('/dashboard/stats');
    document.getElementById('topbar-count').textContent = `${d.active} active`;

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
            <a href="/intern.html?id=${i.id}" style="font-weight:700;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;text-decoration:none;color:var(--text)">${i.first_name} ${i.last_name}</a>
            <div style="font-size:11.5px;color:var(--text3)">${i.department}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="font-size:18px;font-weight:800;color:var(--indigo-600)">${i.avg_score}</div>
            <div style="font-size:10px;color:var(--text3);font-weight:600">/5</div>
          </div>
        </div>`).join('')
      : emptyState('No performance data yet');

    const barColors = ['#6366f1','#10b981','#f59e0b','#0ea5e9','#ec4899','#8b5cf6','#f43f5e'];
    document.getElementById('dept-breakdown').innerHTML = d.by_department.length
      ? d.by_department.map((dep, i) => `
        <div class="dept-bar-row">
          <div class="dept-bar-meta">
            <span>${dep.department}</span>
            <span>${dep.count} intern${dep.count !== 1 ? 's' : ''} · <strong>${dep.avg_score ?? '–'}</strong>/5</span>
          </div>
          <div class="dept-bar-bg">
            <div class="dept-bar-fill" style="width:${Math.min(100, (dep.avg_score || 0) / 5 * 100)}%;background:${barColors[i % barColors.length]}"></div>
          </div>
        </div>`).join('')
      : emptyState('No department data yet');

    document.querySelector('#recent-table tbody').innerHTML = d.recent_interns.map(i => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar" style="background:${avatarColor(i.first_name)}">${initials(i.first_name, i.last_name)}</div>
            <a href="/intern.html?id=${i.id}" style="font-weight:600;text-decoration:none;color:var(--text)">${i.first_name} ${i.last_name}</a>
          </div>
        </td>
        <td><span class="dept-pill">${i.department}</span></td>
        <td><span class="badge badge-${i.status}">${i.status}</span></td>
        <td>${scoreBar(i.avg_score)}</td>
      </tr>`).join('');
  } catch (e) {
    showToast('Failed to load dashboard', 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
