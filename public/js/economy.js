// ── economy.js ──
function fmt(n){if(n>=1000000)return(n/1000000).toFixed(1)+'M';if(n>=1000)return(n/1000).toFixed(1)+'K';return String(Math.floor(n));}

// Overall player power score — used to scale incoming raids and target difficulty
function playerPower(){
  const goldScore=Math.floor(G.gold/500);
  const milScore=milCount()*3;
  const buildScore=G.buildings.length;
  const popScore=living().length;
  return goldScore+milScore+buildScore+popScore;
}

function bldCost(id){const c=CATALOG[id];return Math.floor(c.baseCost*Math.pow(c.mult,G.buildingCounts[id]||0));}
function calcGPS(){
  let gps=0;
  const jc={};for(const v of G.villagers)if(v.alive)jc[v.job]=(jc[v.job]||0)+1;
  for(const b of G.buildings){
    const c=CATALOG[b.typeId];let g=c.gps;
    for(let u=1;u<=b.upLevel;u++)if(c.ups[u-1]?.gpsAdd)g+=c.ups[u-1].gpsAdd;
    if(c.workers===0)gps+=g;
    else{const a=Math.min(c.workers,jc[c.job]||0);if(a>0)gps+=g*(a/c.workers);}
  }
  gps+=living().length*.05;
  for(const v of G.villagers)if(v.alive&&!JOBS[v.job].free)gps-=(JOBS[v.job].cost||0)/100;
  gps*=(1+(FOUNDING.upgrades.goldMult||0)*0.1);
  if(G.hostages&&G.hostages.length>0)gps*=2;
  G.gps=Math.max(-50,gps);return G.gps;
}
function housingCap(){
  const housingIds=['cottage','longhouse','dormitory','noble_house'];
  let c=0;
  for(const b of G.buildings){
    if(!housingIds.includes(b.typeId))continue;
    const cat=CATALOG[b.typeId];let cap=cat.cap||0;
    for(let u=1;u<=b.upLevel;u++)cap+=(cat.ups[u-1]?.capAdd||0);
    c+=cap;
  }
  return c;
}

function canPlace(id,gx,gy,rotated){
  const c=CATALOG[id];
  const gw=rotated?c.gh:c.gw;const gh=rotated?c.gw:c.gh;
  for(const b of G.buildings){const bc=CATALOG[b.typeId];const bw=b.rotated?bc.gh:bc.gw;const bh=b.rotated?bc.gw:bc.gh;if(gx<b.gx+bw&&gx+gw>b.gx&&gy<b.gy+bh&&gy+gh>b.gy)return false;}
  return true;
}
function placeBuilding(id,gx,gy,rotated){
  const cost=bldCost(id);if(G.gold<cost||!canPlace(id,gx,gy,rotated))return false;
  G.gold-=cost;G.buildingCounts[id]=(G.buildingCounts[id]||0)+1;
  G.buildings.push({id:G.buildingId++,typeId:id,gx,gy,upLevel:0,rotated:!!rotated});
  calcGPS();renderBuildingsList();renderHUD();return true;
}
function upgradeBuilding(bid){
  const b=G.buildings.find(x=>x.id===bid);if(!b)return;
  const c=CATALOG[b.typeId];const up=c.ups[b.upLevel];if(!up)return;
  if(G.gold<up.cost)return notify('Not enough gold.','warn');
  G.gold-=up.cost;b.upLevel++;
  calcGPS();renderBuildingsList();renderHUD();
  notify(`${c.name} upgraded to ${up.name}!`,'success');
}
const CRAFTSMAN_BUILDINGS=['pottery','glassblower','candle_maker','rope_works','bathhouse','jeweler'];
function hasBuilding(jobId){
  const req={guard:'watchtower',archer:'archery_range',soldier:'barracks'};
  if(jobId==='craftsman') return G.buildings.some(b=>CRAFTSMAN_BUILDINGS.includes(b.typeId));
  if(jobId==='knight') return G.buildings.some(b=>b.typeId==='barracks'&&b.upLevel>=(CATALOG.barracks.ups.length));
  if(!req[jobId])return true;
  return G.buildings.some(b=>b.typeId===req[jobId]);
}
