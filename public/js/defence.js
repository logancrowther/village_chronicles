// ── defence.js ──
function renderDefenceTab(){
  const jobs=['guard','archer','soldier','knight'];
  const ms=document.getElementById('mil-stats');
  if(ms)ms.innerHTML=jobs.map(j=>`<div class="mil-stat"><div class="n">${G.villagers.filter(v=>v.alive&&v.job===j).length}</div><div class="l">${JOBS[j].name}s</div></div>`).join('')+`<div class="mil-stat"><div class="n">${G.buildings.filter(b=>b.typeId==='wooden_wall'||b.typeId==='watchtower').length}</div><div class="l">Defences</div></div><div class="mil-stat"><div class="n">${G.buildings.filter(b=>b.typeId==='barracks').length}</div><div class="l">Barracks</div></div>`;
  const pa=document.getElementById('pending-attacks');
  if(pa)pa.innerHTML=G.pendingAttacks.length?G.pendingAttacks.map(a=>`<div class="attack-item${a.daysLeft<5?' urgent':''}"><div class="attack-item-title">${a.name} — ${a.size} raiders</div><div class="attack-item-sub">Strength: ${a.strength}</div><div class="attack-timer">Arrives in ~${a.daysLeft} days</div></div>`).join(''):'<div class="empty-state">No known attacks inbound.</div>';
  const bl=document.getElementById('battle-log');
  if(bl)bl.innerHTML=G.battleLog.length?G.battleLog.slice().reverse().map(l=>`<div class="log-item"><span class="${l.won?'outcome-win':'outcome-loss'}">${l.won?'Victory':'Defeat'}</span> — ${l.desc}<br><span style="font-size:10px;color:var(--faint)">${l.date}</span></div>`).join(''):'<div class="empty-state">No battles recorded.</div>';
  const ds=document.getElementById('def-status');
  if(ds)ds.textContent=G.pendingAttacks.length?`${G.pendingAttacks.length} threat(s) approaching`:'No known threats';
}

// Detection chance scales with watchtower/spy buildings
function detectionChance(){
  const towers=G.buildings.filter(b=>['watchtower','spy_post','gate_tower'].includes(b.typeId)).length;
  return Math.min(0.95,0.35+towers*0.12);
}

function scheduleThreat(v,forceHidden){
  if(G.pendingAttacks.find(a=>a.vid===v.id))return;
  const scale=Math.max(1,1+playerPower()*0.05)*(1+FOUNDING.totalFoundings*0.1);
  // Surprise raids get 1-4 days warning; spotted raids get 5-30 days
  const spotted=!forceHidden&&Math.random()<detectionChance();
  const daysLeft=spotted?Math.floor(rnd(5,30)):Math.floor(rnd(1,4));
  const size=Math.floor((rnd(3,8)+v.tier*2)*scale);
  const strength=Math.floor((size*2+v.tier*3)*scale);
  G.pendingAttacks.push({vid:v.id,name:v.name,size,strength,daysLeft,spotted});
  if(spotted){
    notify(`Scouts report: ${v.name} is marching ${size} raiders — arrives in ~${daysLeft} days!`,'warn');
    if(activeTab==='defence')renderDefenceTab();
  }
  // Unspotted raids arrive silently; player won't know until the attack
}

function executeDefenceEvent(attack){
  if(G.gameOver)return;
  const al=living();if(!al.length)return;
  const military=al.filter(v=>JOBS[v.job]?.mil);
  const defStr=(military.reduce((s,v)=>s+v.combatLevel*(v.str+v.agi),0)+G.buildings.filter(b=>b.typeId==='wooden_wall'||b.typeId==='watchtower').length*5)*(1+(FOUNDING.upgrades.defenceMult||0)*0.1);
  const ratio=defStr/(attack.strength+1);
  const won=ratio>0.7||Math.random()<Math.min(.9,ratio);
  let casualties=0;const dieChance=won?.1:.4;
  for(const v of al){if(Math.random()<(JOBS[v.job]?.mil?dieChance:dieChance*.3)){kill(v,'killed defending the village');casualties++;}}
  const desc=`${attack.name} raided with ${attack.size}. ${casualties} died.`;
  G.battleLog.push({won,desc,date:dateStr()});
  G.pendingAttacks=G.pendingAttacks.filter(a=>a.vid!==attack.vid);
  if(won){G.gold+=Math.floor(rnd(20,80));notify(`${attack.name}'s raid was repelled!${casualties?' '+casualties+' died defending.':''}`,'success');}
  else{notify(`Raid by ${attack.name}! ${casualties} died defending.`,'danger');if(!living().length&&G.hasEverHadVillager)triggerGameOver();}
  renderVillagersTab();renderDefenceTab();renderHUD();
}

function triggerGameOver(){
  G.gameOver=true;
  document.getElementById('modal-title').textContent='Your Village Falls';
  document.getElementById('modal-body').innerHTML=`<p style="font-size:14px;line-height:1.8">Your last villager has fallen. The village lies in ruins.</p><p style="margin-top:10px;font-size:13px;color:var(--dim)">Survived to <b>${fullDateStr()}</b>.<br>Total battles: <b>${G.battleLog.length}</b></p>`;
  document.getElementById('modal-footer').innerHTML=`<button class="btn btn-primary" onclick="location.reload()">Begin Anew</button>`;
  document.getElementById('modal-close').style.display='none';
  openModal();
}

function dailyEvents(){
  for(const v of living()){
    v.hunger=Math.max(0,v.hunger-rnd(.08,.18));
    v.thirst=Math.max(0,v.thirst-rnd(.12,.25));
    // Base foraging — keeps villagers alive briefly without buildings
    v.hunger=Math.min(100,v.hunger+.04);
    v.thirst=Math.min(100,v.thirst+.06);
    const farms=G.buildings.filter(b=>CATALOG[b.typeId].cat==='food'||b.typeId==='irrigation'||b.typeId==='pond').length;
    const wells=G.buildings.filter(b=>b.typeId==='well'||b.typeId==='pond'||b.typeId==='irrigation'||b.typeId==='water_tower'||b.typeId==='fountain').length;
    if(farms>0)v.hunger=Math.min(100,v.hunger+farms*.4);
    if(wells>0)v.thirst=Math.min(100,v.thirst+wells*.7);
    if(v.hunger<10)v.hp=Math.max(0,v.hp-rnd(.5,1.5));
    if(v.thirst<10)v.hp=Math.max(0,v.hp-rnd(1,3));
    if(!v.diseased&&Math.random()<.0008){
      v.diseased=true;v.diseaseTimer=5+r(10);
      const diseases=['Smallpox','Plague','Fever','Dysentery','Cholera'];
      notify(`${v.name} has contracted ${diseases[r(diseases.length)]}!`,'danger');
    }
    if(v.diseased){
      v.hp=Math.max(0,v.hp-rnd(.5,2));v.diseaseTimer--;
      const docs=G.villagers.filter(x=>x.alive&&x.job==='doctor').length;
      if(docs>0){v.diseaseTimer=Math.max(0,v.diseaseTimer-docs*.5);v.hp=Math.min(100,v.hp+docs*.3);}
      if(v.diseaseTimer<=0){v.diseased=false;v.hp=Math.min(100,v.hp+15);}
    }
    if(!v.diseased&&v.hunger>50&&v.thirst>50)v.hp=Math.min(100,v.hp+rnd(.05,.2));
    if(v.hp<=0)kill(v,v.hunger<15?'starvation':v.thirst<15?'dehydration':v.diseased?'disease':'unknown causes');
    if(JOBS[v.job]?.mil){
      const tr=G.buildings.filter(b=>['archery_range','barracks','training_dummy'].includes(b.typeId)).length;
      if(tr>0){v.combatXp+=tr*.5;if(v.combatXp>=v.combatLevel*50){v.combatLevel++;v.combatXp=0;}}
    }
  }
  // Check raid cooldowns expiring
  for(const v of G.worldVillages){
    if(v.raidCooldownEnd&&totalGameDay()>=v.raidCooldownEnd){
      v.raidCooldownEnd=0;
      notify(`${v.name} can be raided again.`,'info');
    }
  }
  for(const h of G.hostages){h.hp=Math.max(0,h.hp-rnd(.5,1.5));if(h.hp<=0){G.hostages=G.hostages.filter(x=>x.id!==h.id);notify(`Hostage ${h.name} has died — gold/s bonus lost.`,'danger');calcGPS();}}
  for(const a of G.pendingAttacks){a.daysLeft--;if(a.daysLeft<=0){executeDefenceEvent(a);return;}}
  G.pendingAttacks=G.pendingAttacks.filter(a=>a.daysLeft>0);
  if(!living().length&&!G.gameOver&&G.hasEverHadVillager)triggerGameOver();
}
function yearlyEvents(){
  for(const v of living()){v.age++;if(v.age>70+r(15))kill(v,'old age');}
  if(living().length>1&&Math.random()<.3+G.alliances.length*.1){
    const n=1+r(2);
    for(let i=0;i<n;i++)queueArrival();
  }
  // Attacks come when player has military OR has progressed (3+ villagers or 5+ buildings)
  const progressed=G.hasMilitary||living().length>=3||G.buildings.length>=5;
  if(progressed&&Math.random()<.3){
    const foes=G.worldVillages.filter(v=>!v.allianceWith&&!v.defeated);
    if(foes.length){
      const foe=foes[r(foes.length)];
      // All attacks go through scheduleThreat — 35% are hidden (short warning), rest are spotted
      scheduleThreat(foe,Math.random()<.35);
    }
  }
}
