// ── hud.js ──
let activeTab='map';

function renderHUD(){
  document.getElementById('hud-gold').textContent=fmt(Math.floor(G.gold));
  document.getElementById('hud-gps').textContent=`(${G.gps>=0?'+':''}${G.gps.toFixed(1)}/s)`;
  document.getElementById('hud-pop').textContent=living().length;
  document.getElementById('hud-cap').textContent=housingCap();
  document.getElementById('hud-defence').textContent=milCount();
  document.getElementById('hud-houses').textContent=G.buildings.filter(b=>CATALOG[b.typeId].cat==='housing').length;
  document.getElementById('hud-date').textContent=fullDateStr();
  const hc=document.getElementById('hud-village-name');
  if(hc)hc.textContent=G.villageName||'Unnamed Village';
  const vnd=document.getElementById('village-name-display');
  if(vnd)vnd.textContent=G.villageName||'Unnamed Village';
}

// Update only countdown labels — no DOM rebuild, so buttons stay clickable
function updateTabTimers(){
  if(activeTab==='attacking'){
    const ar=document.getElementById('atk-refresh');
    if(ar)ar.textContent='Targets refresh: '+G.refreshLabel;
  }
  if(activeTab==='alliance'){
    const alr=document.getElementById('al-refresh');
    if(alr)alr.textContent='Offers refresh: '+G.alLabel;
  }
  if(activeTab==='defence'){
    const ds=document.getElementById('def-status');
    if(ds)ds.textContent=G.pendingAttacks.length?`${G.pendingAttacks.length} threat(s) approaching`:'No known threats';
  }
}

function openModal(){document.getElementById('modal-overlay').classList.add('open');}
function closeModal(){
  document.getElementById('modal-overlay').classList.remove('open');
  document.querySelector('.modal').classList.remove('modal--wide');
}

function renderSettingsTab(){
  const btn=document.getElementById('toggle-notifs');
  if(!btn)return;
  btn.classList.toggle('on',!!G.notifsEnabled);
  btn.title=G.notifsEnabled?'On — click to disable':'Off — click to enable';
  btn.onclick=()=>{G.notifsEnabled=!G.notifsEnabled;renderSettingsTab();};

  // Founding status
  const fi=document.getElementById('founding-info');
  if(fi){
    const u=FOUNDING.upgrades;
    const hasAny=u.goldMult||u.villagerChance||u.defenceMult||u.powerMult;
    fi.innerHTML=FOUNDING.totalFoundings>0
      ?`<div style="font-size:12px;color:var(--gold2);margin-bottom:6px">Chronicle #${FOUNDING.totalFoundings+1} — <b>${FOUNDING.points}</b> unspent point${FOUNDING.points!==1?'s':''}</div>`
       +`<div style="font-size:11px;color:var(--dim);line-height:1.8">`
       +(u.goldMult?`Gold ×${(1+u.goldMult*0.1).toFixed(1)}&nbsp; `:'')
       +(u.villagerChance?`Villagers ×${(1+u.villagerChance*0.1).toFixed(1)}&nbsp; `:'')
       +(u.defenceMult?`Defence ×${(1+u.defenceMult*0.1).toFixed(1)}&nbsp; `:'')
       +(u.powerMult?`Power ×${(1+u.powerMult*0.1).toFixed(1)}`:'')
       +'</div>'
      :`<div style="font-size:12px;color:var(--faint);font-style:italic">No founding upgrades yet.</div>`;
  }

  document.getElementById('btn-found-village').onclick=()=>openFoundingFlow();
  document.getElementById('btn-restart-game').onclick=()=>{
    document.getElementById('modal-title').textContent='Restart Game?';
    document.getElementById('modal-body').innerHTML='<p style="font-size:14px;line-height:1.8;color:var(--dim)">Are you sure you want to restart? <b style="color:var(--text)">All progress — including founding upgrades — will be lost permanently.</b></p><p style="margin-top:8px;font-size:13px;color:var(--red2)">This cannot be undone.</p>';
    document.getElementById('modal-footer').innerHTML='<button class="btn btn-neutral" onclick="closeModal()">Cancel</button><button class="btn btn-danger" id="confirm-restart">Yes, Restart Everything</button>';
    document.getElementById('modal-overlay').classList.add('open');
    document.getElementById('confirm-restart').onclick=()=>{closeModal();restartGame();};
  };
}

function switchTab(tab){
  activeTab=tab;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.toggle('active',p.id==='tab-'+tab));
  if(tab==='map'){resizeCanvas();renderShop();renderBuildingsList();}
  if(tab==='villagers')renderVillagersTab();
  if(tab==='defence')renderDefenceTab();
  if(tab==='attacking')renderAttackingTab();
  if(tab==='alliance')renderAllianceTab();
  if(tab==='settings')renderSettingsTab();
}
