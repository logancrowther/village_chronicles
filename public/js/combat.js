// ── combat.js ──
function openRaidModal(vid){
  // Use scaled target entry so odds reflect current difficulty
  const t=G.attackTargets.find(x=>x.id===vid)||G.worldVillages.find(x=>x.id===vid);
  if(!t)return;
  const military=G.villagers.filter(x=>x.alive&&JOBS[x.job]?.mil);
  const pop=t.scaledPop||t.pop;
  const battles=t.scaledBattles||t.battlesWon;
  const rewardMin=t.rewardMin||Math.floor(50+t.wealth*80);
  const rewardMax=t.rewardMax||Math.floor(100+t.wealth*200+t.tier*100);
  const need=pop*0.8+battles*2+t.tier*5;
  document.getElementById('modal-title').textContent=`Raid: ${t.name}`;
  const body=document.getElementById('modal-body');
  body.innerHTML=`
    <p style="font-size:13px;color:var(--dim);margin-bottom:10px">Select units to send. <span style="color:var(--gold2)">Units may die even on success.</span></p>
    <div style="font-size:12px;color:var(--text);margin-bottom:10px;padding:6px 8px;background:var(--panel2);border:1px solid var(--border);border-radius:3px">
      Est. defenders: ~${Math.floor(pop*0.2)} &nbsp;·&nbsp; Reward: <span style="color:var(--gold2)">${fmt(rewardMin)}–${fmt(rewardMax)}g</span>
    </div>
    <div style="font-family:Cinzel,serif;font-size:10px;color:var(--dim);text-transform:uppercase;margin-bottom:6px">Your Military (${military.length})</div>
    ${!military.length?'<div class="empty-state">No military. Train soldiers first.</div>':''}
    <div id="raid-unit-list" style="display:grid;grid-template-columns:1fr 1fr;gap:4px;max-height:200px;overflow-y:auto">
      ${military.map(u=>`<div class="job-opt" data-uid="${u.id}"><div class="job-opt-name">${u.name}</div><div class="job-opt-desc">${JOBS[u.job].name} · Lv${u.combatLevel} · HP:${u.hp}</div></div>`).join('')}
    </div>
    <div style="margin-top:10px;font-size:12px;color:var(--dim)" id="raid-odds">Select units above.</div>`;
  const sel=new Set();
  body.querySelectorAll('.job-opt').forEach(el=>{
    el.onclick=()=>{
      const uid=parseInt(el.dataset.uid);
      sel.has(uid)?sel.delete(uid):sel.add(uid);
      el.classList.toggle('active',sel.has(uid));
      const str=G.villagers.filter(u=>sel.has(u.id)).reduce((s,u)=>s+u.combatLevel*(u.str+u.agi),0)*(1+(FOUNDING.upgrades.powerMult||0)*0.1);
      const odds=Math.min(95,Math.max(5,Math.round(str/(need||1)*80)));
      document.getElementById('raid-odds').textContent=`Success: ~${odds}% (${sel.size} units, strength: ${str})`;
    };
  });
  window._raidSel=sel;
  window._raidTarget=t;
  document.getElementById('modal-footer').innerHTML=`<button class="btn btn-neutral" onclick="closeModal()">Cancel</button><button class="btn btn-danger" onclick="executeRaid(${vid},window._raidSel)">Send Raid</button>`;
  openModal();
}

function executeRaid(vid,sel){
  closeModal();
  const t=window._raidTarget||G.attackTargets.find(x=>x.id===vid)||G.worldVillages.find(x=>x.id===vid);
  const v=G.worldVillages.find(x=>x.id===vid);
  if(!t||!v||sel.size===0){notify('Select at least one unit.','warn');return;}
  const units=G.villagers.filter(u=>sel.has(u.id)&&u.alive);
  const str=units.reduce((s,u)=>s+u.combatLevel*(u.str+u.agi),0)*(1+(FOUNDING.upgrades.powerMult||0)*0.1);
  const pop=t.scaledPop||t.pop;
  const battles=t.scaledBattles||t.battlesWon;
  const need=pop*0.8+battles*2+t.tier*5;
  const odds=Math.min(95,Math.max(5,str/(need||1)*80))/100;
  const success=Math.random()<odds;let dead=0;
  units.forEach(u=>{if(Math.random()<(success?.15:.45)){kill(u,'killed in battle');dead++;}else if(Math.random()<.3)u.hp=Math.max(10,u.hp-r(30));});

  // Set 2-year raid cooldown and remove from active targets
  v.raidCooldownEnd=totalGameDay()+200;
  G.attackTargets=G.attackTargets.filter(x=>x.id!==vid);

  if(success){
    const rewardMin=t.rewardMin||Math.floor(50+v.wealth*80);
    const rewardMax=t.rewardMax||Math.floor(100+v.wealth*200+v.tier*100);
    const reward=Math.floor(rnd(rewardMin,rewardMax));
    G.gold+=reward;
    const hostageTaken=Math.random()<.3;
    if(hostageTaken)G.hostages.push({id:G.villagerId++,name:rndName(r(2)===0),village:v.name,hp:80+r(20),feedCost:5});
    G.raidLog.push({success:true,desc:`Raided ${v.name}. +${fmt(reward)}g.${dead?' '+dead+' lost.':''}${hostageTaken?' Hostage taken.':''}`,date:dateStr()});
    notify(`Raid success! +${fmt(reward)}g from ${v.name}.${hostageTaken?' Hostage taken.':''}`,'success');
    if(Math.random()<.3){v.hostile=true;scheduleThreat(v,false);}
  }else{
    v.battlesWon++;if(Math.random()<.5)v.hostile=true;
    G.raidLog.push({success:false,desc:`Raid on ${v.name} failed.${dead?' '+dead+' lost.':''}`,date:dateStr()});
    notify(`Raid on ${v.name} failed!${dead?' '+dead+' lost.':''}`,'danger');
    if(v.hostile)scheduleThreat(v,true); // retaliation — surprise attack, short warning
  }
  renderHUD();renderAttackingTab();renderVillagersTab();
}

function feedHostage(hid){
  const h=G.hostages.find(x=>x.id===hid);if(!h)return;
  const cost=h.feedCost||5;
  if(G.gold<cost)return notify(`Need ${cost}g to feed ${h.name}.`,'warn');
  G.gold-=cost;h.hp=Math.min(100,h.hp+20);
  h.feedCost=Math.ceil(cost*1.6);
  renderHUD();renderAttackingTab();
}
