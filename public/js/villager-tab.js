// ── villager-tab.js ──
let selectedVillagerId=null;

function renderVillagersTab(){
  const al=living();
  document.getElementById('vs-total').textContent=al.length;
  document.getElementById('vs-housed').textContent=housingCap();
  document.getElementById('vs-deceased').textContent=G.deceasedCount;
  document.getElementById('vs-mil').textContent=milCount();
  const list=document.getElementById('villager-list');if(!list)return;
  const filter=G.vFilter;
  let shown=G.villagers.filter(v=>{
    if(filter==='idle')return v.alive&&v.job==='idle';
    if(filter==='workers')return v.alive&&v.job!=='idle'&&!JOBS[v.job]?.mil;
    if(filter==='combat')return v.alive&&JOBS[v.job]?.mil;
    return true;
  });
  list.innerHTML='';
  if(!G.hasEverHadVillager&&G.villagers.length===0){
    list.innerHTML=`<div style="padding:40px 24px;text-align:center">
      <div style="font-family:'Cinzel',serif;font-size:18px;color:var(--gold);margin-bottom:12px;letter-spacing:1px">Village Founding</div>
      <div style="font-size:13px;color:var(--dim);line-height:1.8;max-width:320px;margin:0 auto">
        Your village lies empty. A traveler is on their way — they will be your first settler and cannot be turned away.<br><br>
        <span style="color:var(--text)">Accept their arrival to begin your chronicle.</span>
      </div>
    </div>`;
    return;
  }
  if(!shown.length){list.innerHTML='<div class="empty-state">No villagers to show.</div>';return;}
  for(const v of shown){
    const starCount=Math.min(5,v.combatLevel+(Math.floor((v.str+v.agi+v.intel)/5)));
    const stars='★'.repeat(Math.max(1,starCount));
    const jobLabel=JOBS[v.job]?.name||v.job;
    const isMil=JOBS[v.job]?.mil;
    const isDead=!v.alive;
    const row=document.createElement('div');
    const isSelected=selectedVillagerId===v.id;
    row.className='v-row'+(isDead?' v-dead':'')+(isSelected?' expanded':'');
    row.dataset.vid=v.id;
    row.innerHTML=`
      <div class="v-avatar" style="background:${isDead?'#2a2420':v.avatarCol}">${getInitials(v)}</div>
      <div class="v-info">
        <div class="v-name">${v.name}</div>
        <div class="v-sub">
          <span>Age ${v.age}</span>
          <span class="job-tag${isMil?' mil':''}">${isDead?v.dead_cause||'Deceased':jobLabel}</span>
          <span class="star">${stars}</span>
          ${v.diseased?'<span style="color:var(--red2);font-size:11px">[Ill]</span>':''}
        </div>
      </div>
      <div class="v-right">
        <div class="v-bars">
          <div class="v-bar"><div class="v-bar-hp" style="width:${v.hp}%"></div></div>
          <div class="v-bar"><div class="v-bar-hunger" style="width:${v.hunger}%"></div></div>
          <div class="v-bar"><div class="v-bar-thirst" style="width:${v.thirst}%"></div></div>
        </div>
        <span class="v-chevron" style="color:${isSelected?'var(--gold)':'var(--dim)'}">▶</span>
      </div>
    `;
    row.onclick=()=>{
      if(isSelected){closeVillagerDetail();}
      else{openVillagerDetail(v);}
      renderVillagersTab();
    };
    list.appendChild(row);
  }
}

// Lightweight villager bar updater — does NOT rebuild DOM (so clicks work)
function updateVillagerBarsOnly(){
  const al=living();
  const eTotal=document.getElementById('vs-total');if(eTotal)eTotal.textContent=al.length;
  const eHoused=document.getElementById('vs-housed');if(eHoused)eHoused.textContent=housingCap();
  const eDec=document.getElementById('vs-deceased');if(eDec)eDec.textContent=G.deceasedCount;
  const eMil=document.getElementById('vs-mil');if(eMil)eMil.textContent=milCount();
  const list=document.getElementById('villager-list');if(!list)return;
  for(const v of G.villagers){
    const row=list.querySelector(`[data-vid="${v.id}"]`);if(!row)continue;
    const hp=row.querySelector('.v-bar-hp');if(hp)hp.style.width=v.hp+'%';
    const hu=row.querySelector('.v-bar-hunger');if(hu)hu.style.width=v.hunger+'%';
    const th=row.querySelector('.v-bar-thirst');if(th)th.style.width=v.thirst+'%';
  }
}

function openVillagerDetail(v){
  selectedVillagerId=v.id;
  const panel=document.getElementById('v-detail-panel');
  panel.classList.remove('hidden');
  refreshVillagerDetail(v);
}
function refreshVillagerDetail(v){
  if(!v)return;
  document.getElementById('vd-portrait').style.background=v.alive?v.avatarCol:'#2a2020';
  document.getElementById('vd-initials').textContent=getInitials(v);
  document.getElementById('vd-status').textContent=`Age ${v.age}${v.diseased?' · Ill':''}${!v.alive?' · '+v.dead_cause:''}`;
  document.getElementById('vd-name').textContent=v.name;
  document.getElementById('vd-job-label').textContent=JOBS[v.job]?.name||v.job;
  // Bars
  document.getElementById('vdb-hp').style.width=v.hp+'%';document.getElementById('vdv-hp').textContent=Math.floor(v.hp)+'%';
  document.getElementById('vdb-hunger').style.width=v.hunger+'%';document.getElementById('vdv-hunger').textContent=Math.floor(v.hunger)+'%';
  document.getElementById('vdb-thirst').style.width=v.thirst+'%';document.getElementById('vdv-thirst').textContent=Math.floor(v.thirst)+'%';
  // Stats grid
  document.getElementById('vd-stats').innerHTML=`
    <div class="vd-stat"><div class="n">${v.str}</div><div class="l">Strength</div></div>
    <div class="vd-stat"><div class="n">${v.agi}</div><div class="l">Agility</div></div>
    <div class="vd-stat"><div class="n">${v.intel}</div><div class="l">Intellect</div></div>
    <div class="vd-stat"><div class="n" style="color:var(--gold)">${v.combatLevel}</div><div class="l">Combat Lv</div></div>
    <div class="vd-stat"><div class="n">${v.age}</div><div class="l">Age</div></div>
    <div class="vd-stat"><div class="n">${v.male?'M':'F'}</div><div class="l">Gender</div></div>
  `;
  // Job grid
  if(v.alive){
    const grid=document.getElementById('vd-job-grid');
    grid.innerHTML=Object.entries(JOBS).map(([jid,j])=>{
      const locked=!j.free&&!hasBuilding(jid);
      const lockMsg=jid==='knight'?'Fully upgrade Barracks':'Requires building';
      return`<div class="vd-job-opt${v.job===jid?' active':''}${locked?' locked':''}" data-job="${jid}" data-vid="${v.id}">
        <div class="vd-job-opt-name">${j.name}</div>
        <div class="vd-job-opt-sub">${locked?lockMsg:(!j.free?j.desc.replace(/ \([^)]+\)/,'').replace(/ — .+/,''):'')}</div>
      </div>`;
    }).join('');
    grid.querySelectorAll('.vd-job-opt:not(.locked)').forEach(el=>{
      el.onclick=()=>{
        v.job=el.dataset.job;
        if(JOBS[v.job].mil)G.hasMilitary=true;
        calcGPS();refreshVillagerDetail(v);renderVillagersTab();
      };
    });
  } else {
    document.getElementById('vd-job-grid').innerHTML='<div class="empty-state" style="font-size:11px;grid-column:span 2">This villager has passed away.</div>';
  }
}
function closeVillagerDetail(){
  selectedVillagerId=null;
  document.getElementById('v-detail-panel').classList.add('hidden');
}
