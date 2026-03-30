// ── founding.js ──

function getFoundingPoints(gold){
  if(gold<100000)return 0;
  return 1+Math.floor((gold-100000)/25000);
}

// Cost to buy the next upgrade at currentLevel: levels 0-2=1pt, 3-5=2pt, 6-8=3pt, etc.
function upgradeCost(currentLevel){
  return Math.floor(currentLevel/3)+1;
}

const FOUNDING_UPGRADES=[
  {key:'goldMult',     name:'Gold Multiplier',    desc:'Multiplies all gold/s by +0.1× per level'},
  {key:'villagerChance',name:'Villager Chance',   desc:'Multiplies arrival chance by +0.1× per level'},
  {key:'defenceMult',  name:'Defence Multiplier', desc:'Multiplies all defence strength by +0.1× per level'},
  {key:'powerMult',    name:'Power Multiplier',   desc:'Multiplies combat unit attack power by +0.1× per level'},
];

// Step 1 — confirmation modal
function openFoundingFlow(){
  const pts=getFoundingPoints(G.gold);
  if(pts<1){
    notify(`Need at least 100,000g to found a new village. You have ${fmt(Math.floor(G.gold))}g.`,'warn');
    return;
  }
  const carried=FOUNDING.points;
  const total=pts+carried;
  document.getElementById('modal-title').textContent='Found a New Village';
  document.getElementById('modal-body').innerHTML=`
    <div style="font-size:13px;line-height:1.8;color:var(--dim);margin-bottom:14px">
      Your chronicle has grown into legend. Abandon this village and start anew — your Founding Upgrades persist forever and make each new chronicle stronger than the last.
    </div>
    <div style="padding:12px 14px;background:var(--panel2);border:1px solid var(--border2);border-radius:4px;margin-bottom:14px">
      <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--gold);letter-spacing:.8px;margin-bottom:10px">FOUNDING REWARD</div>
      <div style="font-size:14px;color:var(--text)">Gold at founding: <b style="color:#e0c060">${fmt(Math.floor(G.gold))}g</b></div>
      <div style="font-size:13px;color:var(--dim);margin-top:6px">Earns <b style="color:#7ec87e">${pts}</b> new point${pts!==1?'s':''}${carried>0?` + <b style="color:#aaa">${carried}</b> carried over = <b style="color:#e0c060">${total}</b> total`:''}</div>
      ${FOUNDING.totalFoundings>0?`<div style="font-size:11px;color:var(--dim);margin-top:6px">Chronicle #${FOUNDING.totalFoundings+1} — difficulty increases with each founding</div>`:''}
    </div>
    <div style="font-size:12px;color:#b05050">All current progress will be reset. Founding upgrades are never lost (except via Settings → Restart Game).</div>
  `;
  document.getElementById('modal-footer').innerHTML=`
    <button class="btn btn-neutral" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" id="founding-continue">Choose Upgrades →</button>
  `;
  openModal();
  document.getElementById('founding-continue').onclick=()=>openFoundingShop(pts);
}

// Step 2 — upgrade shop
function openFoundingShop(earnedPts){
  let tempUpgrades={...FOUNDING.upgrades};
  let tempPoints=FOUNDING.points+earnedPts;

  function render(){
    document.querySelector('.modal').classList.add('modal--wide');
    document.getElementById('modal-title').textContent='Founding Upgrades';
    document.getElementById('modal-body').innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 14px;background:var(--panel2);border:1px solid var(--border2);border-radius:4px;margin-bottom:14px">
        <span style="font-family:'Cinzel',serif;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.6px">Points to Spend</span>
        <span style="font-family:'Cinzel',serif;font-size:24px;color:#e0c060" id="fp-display">${tempPoints}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${FOUNDING_UPGRADES.map(u=>{
          const lv=tempUpgrades[u.key]||0;
          const cost=upgradeCost(lv);
          const can=tempPoints>=cost;
          return`<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--panel2);border:1px solid var(--border${can?'2':''});border-radius:4px;opacity:${can?1:.7}">
            <div style="flex:1;min-width:0">
              <div style="font-family:'Cinzel',serif;font-size:13px;color:var(--text);margin-bottom:3px">${u.name}</div>
              <div style="font-size:11px;color:var(--dim);margin-bottom:4px">${u.desc}</div>
              <div style="font-size:11px;color:var(--gold2)">Level <b>${lv}</b> &nbsp;·&nbsp; <b>${(1+lv*0.1).toFixed(1)}×</b> now → <b style="color:#7ec87e">${(1+(lv+1)*0.1).toFixed(1)}×</b> after upgrade</div>
            </div>
            <button class="btn ${can?'btn-primary':'btn-neutral'}" onclick="foundingBuyUpgrade('${u.key}')" ${!can?'disabled':''} style="flex-shrink:0;min-width:72px;font-size:12px">
              ${cost}&nbsp;pt${cost!==1?'s':''}
            </button>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:12px;font-size:11px;color:var(--faint);text-align:center">Unspent points carry over to your next founding.</div>
    `;
    document.getElementById('modal-footer').innerHTML=`
      <button class="btn btn-neutral" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" id="found-commit">Found New Village</button>
    `;
    document.getElementById('found-commit').onclick=()=>{
      Object.assign(FOUNDING.upgrades,tempUpgrades);
      FOUNDING.points=tempPoints;
      FOUNDING.totalFoundings++;
      _saveLocked=true; // prevent beforeunload re-saving stale G
      localStorage.setItem(FOUNDING_KEY,JSON.stringify(FOUNDING));
      localStorage.removeItem(SAVE_KEY);
      closeModal();
      window.location.reload();
    };
  }

  window.foundingBuyUpgrade=function(key){
    const lv=tempUpgrades[key]||0;const cost=upgradeCost(lv);
    if(tempPoints<cost)return;
    tempPoints-=cost;tempUpgrades[key]=lv+1;
    render();
  };

  render();
}
