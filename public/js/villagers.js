// ── villagers.js ──
function mkVillager(opts={}){
  const male=opts.male!==undefined?opts.male:r(2)===0;
  return{id:G.villagerId++,name:rndName(male),male,age:opts.age||Math.floor(rnd(18,42)),ageMs:0,job:'idle',hp:100,hunger:100,thirst:100,str:1+r(5),agi:1+r(5),intel:1+r(5),combatXp:0,combatLevel:1,alive:true,dead_cause:null,diseased:false,diseaseTimer:0,avatarCol:AVATAR_COLS[r(AVATAR_COLS.length)]};
}
function kill(v,cause){
  if(!v.alive)return;v.alive=false;v.job='idle';v.dead_cause=cause;G.deceasedCount++;
  notify(`${v.name} has died — ${cause}.`,'danger');
  if(activeTab==='villagers')renderVillagersTab();
}
function getInitials(v){const p=v.name.split(' ');return p[0][0]+(p[1]?p[1][0]:'');}
function living(){return G.villagers.filter(v=>v.alive);}
function milCount(){return G.villagers.filter(v=>v.alive&&JOBS[v.job]?.mil).length;}
