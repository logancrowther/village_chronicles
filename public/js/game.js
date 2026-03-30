// ── game.js ──
const REFRESH_INTERVAL=300000;
let lastTick=Date.now(),dayAccum=0;

function restartGame(){
  clearSave(); // wipes both game save and founding upgrades
  window.location.reload();
}

function gameTick(){
  if(G.gameOver)return;
  const now=Date.now();const dt=Math.min(now-lastTick,200);lastTick=now;
  G.gold=Math.max(0,G.gold+G.gps*(dt/1000));
  dayAccum+=dt;
  while(dayAccum>=REAL_MS_PER_DAY){dayAccum-=REAL_MS_PER_DAY;G.day++;dailyEvents();if(G.day>DAYS_PER_YEAR){G.day=1;G.year++;yearlyEvents();}}
  G.refreshTimer-=dt;G.alRefreshTimer-=dt;
  const rl=Math.max(0,G.refreshTimer);const al=Math.max(0,G.alRefreshTimer);
  G.refreshLabel=`${Math.floor(rl/60000)}:${String(Math.floor((rl%60000)/1000)).padStart(2,'0')}`;
  G.alLabel=`${Math.floor(al/60000)}:${String(Math.floor((al%60000)/1000)).padStart(2,'0')}`;
  if(G.refreshTimer<=0){G.refreshTimer=REFRESH_INTERVAL;refreshTargets();notify('New raid targets available.');if(activeTab==='attacking')renderAttackingTab();}
  if(G.alRefreshTimer<=0){G.alRefreshTimer=REFRESH_INTERVAL;refreshAllianceOffers();notify('New alliance opportunities available.');if(activeTab==='alliance')renderAllianceTab();}
  calcGPS();renderHUD();
  if(activeTab==='map')renderMap();
  if(activeTab==='villagers')updateVillagerBarsOnly();
  // Update only the countdown labels in-place — no DOM rebuild so buttons stay clickable
  updateTabTimers();
}

function init(){
  const hasSave=loadSave();
  if(!hasSave){
    genWorld();refreshTargets();refreshAllianceOffers();
  }else{
    // Recalc derived state from restored G
    refreshTargets();calcGPS();
  }
  resizeCanvas();renderShop();renderBuildingsList();renderHUD();
  initMapEvents();
  document.querySelectorAll('.tab-btn').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
  document.querySelectorAll('.sidebar-tab').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('.sidebar-tab').forEach(x=>x.classList.toggle('active',x.dataset.stab===b.dataset.stab));
    document.querySelectorAll('.sidebar-panel').forEach(p=>p.classList.toggle('active',p.id==='stab-'+b.dataset.stab));
    if(b.dataset.stab==='shop')renderShop();if(b.dataset.stab==='buildings')renderBuildingsList();
  });
  document.querySelectorAll('.vf-btn').forEach(b=>b.onclick=()=>{G.vFilter=b.dataset.filter;document.querySelectorAll('.vf-btn').forEach(x=>x.classList.toggle('active',x.dataset.filter===b.dataset.filter));renderVillagersTab();});
  document.getElementById('modal-close').onclick=closeModal;
  document.getElementById('modal-overlay').onclick=e=>{if(e.target===document.getElementById('modal-overlay'))closeModal();};
  document.getElementById('arr-yes').onclick=acceptArrival;
  document.getElementById('arr-no').onclick=denyArrival;
  document.getElementById('vd-close').onclick=()=>{closeVillagerDetail();renderVillagersTab();};
  // Village rename modal
  function openRenameModal(){
    const current=G.villageName||'';
    document.getElementById('modal-title').textContent='Name Your Village';
    document.getElementById('modal-body').innerHTML=`<div style="margin-bottom:10px;color:var(--dim);font-size:13px">Choose a name that will echo through the ages.</div><input id="rename-input" type="text" maxlength="32" value="${current.replace(/"/g,'&quot;')}" placeholder="Enter village name…" style="width:100%;background:var(--panel2);border:1px solid var(--border2);border-radius:3px;color:var(--gold2);font-family:'Cinzel',serif;font-size:14px;padding:8px 10px;outline:none;letter-spacing:.3px">`;
    document.getElementById('modal-footer').innerHTML='<button class="btn btn-primary" id="rename-confirm">Confirm</button><button class="btn btn-neutral" id="rename-cancel">Cancel</button>';
    document.getElementById('modal-overlay').classList.add('open');
    const inp=document.getElementById('rename-input');
    inp.focus();inp.select();
    document.getElementById('rename-confirm').onclick=()=>{G.villageName=inp.value.trim();renderHUD();closeModal();};
    document.getElementById('rename-cancel').onclick=closeModal;
    inp.onkeydown=e=>{if(e.key==='Enter'){G.villageName=inp.value.trim();renderHUD();closeModal();}if(e.key==='Escape')closeModal();};
  }
  document.getElementById('btn-rename').onclick=openRenameModal;
  document.getElementById('village-name-box').onclick=openRenameModal;
  window.addEventListener('resize',resizeCanvas);
  // Random alliance requests
  setInterval(()=>{if(living().length>=5&&Math.random()<.4){const c=G.worldVillages.filter(v=>!v.allianceWith&&!G.alliances.find(a=>a.vid===v.id));if(c.length){const v=c[r(c.length)];notify(`${v.name} has sent an alliance request!`,'warn');if(!G.allianceOffers.find(x=>x.id===v.id))G.allianceOffers.unshift(v);if(activeTab==='alliance')renderAllianceTab();}}},90000);
  // Spontaneous arrivals — boosted by Villager Chance founding upgrade
  setInterval(()=>{const chance=.3*(1+(FOUNDING.upgrades.villagerChance||0)*0.1);if(living().length>0&&Math.random()<chance){const n=1+r(2);for(let i=0;i<n;i++)queueArrival();}},120000);
  lastTick=Date.now();
  setInterval(gameTick,50);
  // Keep detail panel up to date
  setInterval(()=>{if(selectedVillagerId){const v=G.villagers.find(x=>x.id===selectedVillagerId);if(v)refreshVillagerDetail(v);}},500);
  // Autosave every 30 seconds and on tab hide
  setInterval(saveGame,30000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame();});
  window.addEventListener('beforeunload',saveGame);
  if(!hasSave){
    // Start on villagers tab so player sees founding message
    switchTab('villagers');
    // First arrival — mandatory founder
    setTimeout(()=>queueArrival({age:r(2)?28:24,male:r(2)===0}),800);
  }else{
    restoreNotifLog();        // repopulate the notification panel
    showNextArrival();        // re-show any pending arrival request
    switchTab('villagers');
    notify('Welcome back, Chieftain.','info');
  }
}
document.addEventListener('DOMContentLoaded',()=>initMenu());
