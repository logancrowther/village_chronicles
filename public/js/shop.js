// ── shop.js ──
function renderShop(){
  const cats=document.getElementById('shop-cats');const items=document.getElementById('shop-items');if(!cats||!items)return;
  const used=new Set(Object.values(CATALOG).map(c=>c.cat));
  cats.innerHTML='';
  for(const [k,l] of Object.entries(CATS)){
    if(!used.has(k))continue;
    const b=document.createElement('button');b.className='shop-cat'+(G.shopCat===k?' active':'');b.textContent=l;
    b.onclick=()=>{G.shopCat=k;renderShop();};cats.appendChild(b);
  }
  items.innerHTML='';
  for(const [id,c] of Object.entries(CATALOG)){
    if(c.cat!==G.shopCat)continue;
    const cost=bldCost(id);const canBuy=G.gold>=cost;
    const div=document.createElement('div');div.className='shop-item'+(G.placing===id?' selected':'');
    div.innerHTML=`<div class="shop-item-head"><span class="shop-item-name">${c.name}</span><span class="shop-item-cost">${fmt(cost)}g</span></div><div class="shop-item-desc">${c.desc}</div><div class="shop-item-meta">${c.workers>0?`<span>${c.workers}× ${JOBS[c.job]?.name||c.job}</span>`:'<span>No workers</span>'}${c.gps>0?`<span>+${c.gps.toFixed(1)}g/s</span>`:''}<span>${c.gw}×${c.gh}</span>${G.buildingCounts[id]?`<span>Own: ${G.buildingCounts[id]}</span>`:''}</div><button class="buy-btn" ${canBuy?'':'disabled'}>${G.placing===id?'Cancel Placement':'Place Building'}</button>`;
    div.querySelector('.buy-btn').onclick=e=>{e.stopPropagation();if(G.placing===id){G.placing=null;G.placingRotated=false;}else if(canBuy){G.placing=id;G.placingRotated=false;}syncPlacingUI();renderShop();};
    items.appendChild(div);
  }
}

function renderBuildingsList(){
  const el=document.getElementById('buildings-list');if(!el)return;
  if(!G.buildings.length){el.innerHTML='<div class="empty-state">No buildings placed yet.<br>Buy from the Shop tab.</div>';return;}
  const jc={};for(const v of G.villagers)if(v.alive)jc[v.job]=(jc[v.job]||0)+1;
  el.innerHTML='';
  for(const b of G.buildings){
    const c=CATALOG[b.typeId];const upName=b.upLevel>0&&c.ups[b.upLevel-1]?c.ups[b.upLevel-1].name:c.name;
    const nextUp=c.ups[b.upLevel];let gps=c.gps;
    for(let u=1;u<=b.upLevel;u++)if(c.ups[u-1]?.gpsAdd)gps+=c.ups[u-1].gpsAdd;
    const div=document.createElement('div');div.className='placed-item';
    div.innerHTML=`<div class="placed-item-head"><span class="placed-item-name">${upName}</span><span class="placed-item-id">#${b.id}${b.upLevel>0?' Lv'+b.upLevel:''}</span></div><div class="placed-item-body">${c.workers>0?`<div class="row"><span>Workers</span><span>${jc[c.job]||0}/${c.workers}</span></div>`:''}<div class="row"><span>Type</span><span>${c.name}</span></div>${c.gps>0?`<div class="row"><span>Income</span><span class="gold-text">+${gps.toFixed(1)}g/s</span></div>`:''}</div>${nextUp?`<button class="upgrade-btn" data-bid="${b.id}" ${G.gold>=nextUp.cost?'':'disabled'}>Upgrade → ${nextUp.name} (${fmt(nextUp.cost)}g)</button>`:''}`;
    if(nextUp)div.querySelector('.upgrade-btn').onclick=()=>upgradeBuilding(b.id);
    el.appendChild(div);
  }
}
