// ── alliance.js ──
function renderAllianceTab(){
  document.getElementById('al-refresh').textContent='Offers refresh: '+G.alLabel;
  const ol=document.getElementById('alliance-offers');
  if(ol)ol.innerHTML=G.allianceOffers.length?G.allianceOffers.map(v=>{const n=G.alliances.length;const pc=Math.round(50*(1+n));const fc=Math.round(200*(1+n));const note=n>0?`<div style="font-size:11px;color:var(--gold2);margin-top:2px">Cost increases with each alliance (${n} active)</div>`:'';return`<div class="alliance-item"><div class="alliance-head"><span class="alliance-head-name">${v.name}</span><span style="font-size:11px;color:var(--dim)">Pop: ${v.pop}</span></div><div class="alliance-body-text">Tier ${v.tier+1} · Battles Won: ${v.battlesWon}<br>Seeking mutual security pact.</div>${note}<div class="alliance-actions"><button class="small-btn small-btn-peace" onclick="makeAlliance(${v.id},'peace')">Non-Aggression (${pc}g)</button><button class="small-btn small-btn-full" onclick="makeAlliance(${v.id},'full')">Full Alliance (${fc}g)</button></div></div>`;}).join(''):'<div class="empty-state">No villages seeking alliance.</div>';
  const al=document.getElementById('active-alliances');
  if(al)al.innerHTML=G.alliances.length?G.alliances.map(a=>`<div class="active-alliance-item"><div class="act-al-name">${a.name}<span class="alliance-type ${a.type==='peace'?'type-peace':'type-full'}">${a.type==='peace'?'Non-Aggression':'Full Alliance'}</span></div><div class="act-al-sub">${a.type==='full'?'Villagers may migrate here.':'Will not attack.'}</div><button class="break-btn" onclick="breakAlliance(${a.vid})">Break Alliance</button></div>`).join(''):'<div class="empty-state" style="font-size:11px">No alliances.</div>';
}

function renderAttackingTab(){
  document.getElementById('hostage-count').textContent=G.hostages.length;
  document.getElementById('atk-refresh').textContent='Targets refresh: '+G.refreshLabel;
  const tl=document.getElementById('attack-targets');
  if(tl)tl.innerHTML=G.attackTargets.length?G.attackTargets.map(v=>{
    const pop=v.scaledPop||v.pop;
    const rMin=v.rewardMin||Math.floor(50+v.wealth*80);
    const rMax=v.rewardMax||Math.floor(100+v.wealth*200+v.tier*100);
    return`<div class="target-item"><div class="target-head"><span class="target-name">${v.name}</span><span class="target-wealth">Tier ${v.tier+1}</span></div><div class="target-body">Pop: ~${pop} &nbsp;·&nbsp; Est. defenders: ~${Math.floor(pop*0.2)}<br>Reward: <span style="color:var(--gold2)">${fmt(rMin)}–${fmt(rMax)}g</span></div><div class="target-actions"><button class="small-btn small-btn-attack" onclick="openRaidModal(${v.id})">Plan Raid</button></div></div>`;
  }).join(''):'<div class="empty-state">No targets available.</div>';
  const hl=document.getElementById('hostages-list');
  const hostageBonus=G.hostages.length>0?'<div style="font-size:11px;color:#80c080;padding:4px 8px;background:rgba(0,80,0,.18);border-bottom:1px solid var(--border)">⚡ Hostage bonus active — gold/s doubled</div>':'';
  if(hl)hl.innerHTML=hostageBonus+(G.hostages.length?G.hostages.map(h=>`<div class="hostage-item"><div class="hostage-name">${h.name}</div><div class="hostage-status">From ${h.village} — HP: ${Math.floor(h.hp)}%</div><button class="feed-btn" onclick="feedHostage(${h.id})">Feed (${fmt(h.feedCost||5)}g)</button></div>`).join(''):'<div class="empty-state" style="font-size:11px">No hostages.</div>');
  const rl=document.getElementById('raid-log');
  if(rl)rl.innerHTML=G.raidLog.length?G.raidLog.slice().reverse().map(l=>`<div class="log-item"><span class="${l.success?'outcome-win':'outcome-loss'}">${l.success?'Success':'Failed'}</span> — ${l.desc}</div>`).join(''):'<div class="empty-state" style="font-size:11px">No raids yet.</div>';
}

function makeAlliance(vid,type){
  const v=G.worldVillages.find(x=>x.id===vid);if(!v)return;
  const n=G.alliances.length;
  const cost=type==='peace'?Math.round(50*(1+n)):Math.round(200*(1+n));
  if(G.gold<cost)return notify(`Need ${cost}g.`,'warn');
  G.gold-=cost;v.allianceWith=type;v.hostile=false;
  G.alliances.push({vid:v.id,name:v.name,type});
  G.pendingAttacks=G.pendingAttacks.filter(a=>a.vid!==vid);
  G.allianceOffers=G.allianceOffers.filter(x=>x.id!==vid);
  notify(`Alliance formed with ${v.name}!${type==='full'?' Villagers may migrate.':''}`,'success');
  if(type==='full'&&Math.random()<.5)setTimeout(()=>allianceMigrant(v),rnd(30000,90000));
  renderHUD();renderAllianceTab();renderDefenceTab();
}
function allianceMigrant(v){
  if(!G.alliances.find(a=>a.vid===v.id))return;
  const n=1+r(2);
  for(let i=0;i<n;i++)queueArrival();
  notify(`Migrants arriving from ${v.name}!`);
}
function breakAlliance(vid){
  const v=G.worldVillages.find(x=>x.id===vid);if(v)v.allianceWith=false;
  G.alliances=G.alliances.filter(a=>a.vid!==vid);
  notify('Alliance broken.','warn');
  if(v&&Math.random()<.4){v.hostile=true;scheduleThreat(v);}
  renderAllianceTab();
}
