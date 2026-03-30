// ── save.js ──
const SAVE_KEY='vc_save';
const FOUNDING_KEY='vc_founding';
let _saveLocked=false;

function saveGame(){
  if(_saveLocked)return;
  try{
    localStorage.setItem(SAVE_KEY,JSON.stringify(G));
    localStorage.setItem(FOUNDING_KEY,JSON.stringify(FOUNDING));
  }catch(e){}
}

function loadSave(){
  try{
    // Always load founding — persists through resets
    const fr=localStorage.getItem(FOUNDING_KEY);
    if(fr){
      const f=JSON.parse(fr);
      if(f.points!=null)FOUNDING.points=f.points;
      if(f.totalFoundings!=null)FOUNDING.totalFoundings=f.totalFoundings;
      if(f.upgrades)Object.assign(FOUNDING.upgrades,f.upgrades);
    }
    // Load game state
    const gr=localStorage.getItem(SAVE_KEY);
    if(!gr)return false;
    const gd=JSON.parse(gr);
    // Don't restore a game-over save — start fresh instead
    if(gd.gameOver){localStorage.removeItem(SAVE_KEY);return false;}
    Object.assign(G,gd);
    // Reset transient canvas/placement state only
    G.map=Object.assign({},G.map,{drag:false,dragged:false});
    G.placing=null;G.placingRotated=false;
    return true;
  }catch(e){localStorage.removeItem(SAVE_KEY);return false;}
}

function clearSave(){
  _saveLocked=true; // prevent beforeunload from re-saving
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(FOUNDING_KEY);
}
