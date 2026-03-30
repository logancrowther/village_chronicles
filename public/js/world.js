// ── world.js ──
function genWorld(){
  G.worldVillages=[];
  const placed=[];
  const minDist=1400; // minimum distance between village centers in world units
  let attempts=0;
  while(G.worldVillages.length<80&&attempts<800){
    attempts++;
    const tier=r(5);
    let x,y,ok=false;
    for(let t=0;t<60;t++){
      x=(r(2)?1:-1)*rnd(1400,6000);
      y=(r(2)?1:-1)*rnd(1400,6000);
      ok=placed.every(p=>Math.hypot(p.x-x,p.y-y)>=minDist);
      if(ok)break;
    }
    if(!ok)continue;
    placed.push({x,y});
    G.worldVillages.push({id:G.worldVillages.length,name:rndVName(),pop:10+r(50)+tier*20,wealth:tier+rnd(.5,3),tier,battlesWon:r(5+tier*2),x,y,hostile:false,allianceWith:false,defeated:false,raidCooldownEnd:0});
  }
}
function refreshTargets(){
  // Exclude villages on cooldown, allied, or defeated
  const pool=G.worldVillages.filter(v=>!v.allianceWith&&!v.defeated&&(!v.raidCooldownEnd||totalGameDay()>=v.raidCooldownEnd));
  G.attackTargets=[];const used=new Set();
  // Scale difficulty by player power — more gold/army = harder targets & bigger rewards
  const power=playerPower();
  const scale=Math.max(1,1+power*0.04)*(1+FOUNDING.totalFoundings*0.1);
  while(G.attackTargets.length<10&&G.attackTargets.length<pool.length){
    const v=pool[r(pool.length)];
    if(!used.has(v.id)){
      used.add(v.id);
      // Attach scaled difficulty fields alongside the base village reference
      G.attackTargets.push({
        ...v,
        scaledPop:Math.floor(v.pop*scale),
        scaledBattles:Math.floor(v.battlesWon+power*0.4),
        rewardMin:Math.floor((50+v.wealth*80)*scale),
        rewardMax:Math.floor((100+v.wealth*200+v.tier*100)*scale),
      });
    }
  }
}
function refreshAllianceOffers(){
  const pool=G.worldVillages.filter(v=>!v.allianceWith&&!G.alliances.find(a=>a.vid===v.id)&&!v.defeated);
  G.allianceOffers=[];const used=new Set();
  while(G.allianceOffers.length<10&&G.allianceOffers.length<pool.length){const v=pool[r(pool.length)];if(!used.has(v.id)){used.add(v.id);G.allianceOffers.push(v);}}
}
