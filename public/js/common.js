const API = '/api';

async function api(path, method='GET', body=null) {
  const opts = {method, headers:{'Content-Type':'application/json'}};
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function showToast(msg, type='info') {
  const icons = {success:'✓', error:'✕', info:'ℹ'};
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.innerHTML = `<div class="toast-icon">${icons[type]||'•'}</div><span>${msg}</span>`;
  document.getElementById('toast').appendChild(el);
  setTimeout(()=>el.remove(), 3500);
}

const AV_COLORS=['#6366f1','#10b981','#f59e0b','#0ea5e9','#ec4899','#8b5cf6','#f43f5e','#14b8a6'];
function avatarColor(name){let h=0;for(const c of(name||''))h=(h*31+c.charCodeAt(0))%AV_COLORS.length;return AV_COLORS[h]}
function initials(f,l){return(f?.[0]||'')+(l?.[0]||'')}
function fmtDate(d){if(!d)return'–';return new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}
function today(){return new Date().toISOString().split('T')[0]}
function esc(s){return String(s).replace(/'/g,"\\'")}

function scoreCell(v){return`<span class="score-cell sc-${v}">${v}</span>`}
function scoreBar(val){
  if(!val)return'<span style="font-size:12px;color:var(--text3)">No reviews</span>';
  return`<div class="score-bar"><div class="bar"><div class="fill" style="width:${val/5*100}%"></div></div><span class="val">${val}</span></div>`;
}
function emptyState(msg,sub=''){
  return`<div class="empty-state"><div class="es-icon"><svg width="26" height="26" fill="none" stroke="#94a3b8" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><h3>${msg}</h3>${sub?`<p>${sub}</p>`:''}</div>`;
}

function avgScoreBars(reviews) {
  const fields=[['technical_skills','Technical'],['communication','Communication'],['teamwork','Teamwork'],['initiative','Initiative'],['punctuality','Punctuality']];
  const colors=['#6366f1','#10b981','#f59e0b','#0ea5e9','#ec4899'];
  return fields.map(([k,label],i)=>{
    const avg=(reviews.reduce((s,r)=>s+r[k],0)/reviews.length).toFixed(1);
    return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:12.5px">
      <span style="width:95px;color:var(--text2);font-weight:500">${label}</span>
      <div style="flex:1;height:7px;background:var(--border);border-radius:4px;overflow:hidden">
        <div style="width:${avg/5*100}%;height:100%;background:${colors[i]};border-radius:4px"></div>
      </div>
      <span style="font-weight:700;min-width:24px;text-align:right">${avg}</span>
    </div>`;
  }).join('');
}

function statCard(cls, icon, value, label, trend) {
  return `<div class="stat-card ${cls}">
    <div class="stat-icon">${icon}</div>
    <div class="stat-value">${value ?? '–'}</div>
    <div class="stat-label">${label}</div>
    <span class="stat-trend ${trend}">${trend === 'up' ? '↑ Active' : '● Tracked'}</span>
  </div>`;
}

function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('show')}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');document.getElementById('overlay').classList.toggle('show')}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));
  document.getElementById('hamburger')?.addEventListener('click',toggleSidebar);
  document.getElementById('overlay')?.addEventListener('click',closeSidebar);
});
