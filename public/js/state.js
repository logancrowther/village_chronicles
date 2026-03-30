// ── state.js ──
const REAL_MS_PER_DAY=400;
const DAYS_PER_YEAR=100;

const AVATAR_COLS=['#c8a040','#b8903a','#d0a848','#a87830','#c09040','#b88838'];
let FOUNDING={
  points:0,
  totalFoundings:0,
  upgrades:{goldMult:0,villagerChance:0,defenceMult:0,powerMult:0}
};
let G={
  gold:300,gps:0,villageName:'',
  year:1,day:1,dayMs:0,
  villagerId:1,buildingId:1,
  villagers:[],buildings:[],buildingCounts:{},
  worldVillages:[],attackTargets:[],allianceOffers:[],
  alliances:[],hostages:[],pendingAttacks:[],battleLog:[],raidLog:[],
  arrivals:[],notifLog:[],
  hasMilitary:false,gameOver:false,hasEverHadVillager:false,
  deceasedCount:0,
  refreshTimer:300000,alRefreshTimer:300000,
  refreshLabel:'5:00',alLabel:'5:00',
  map:{ox:0,oy:0,scale:1,drag:false,dx:0,dy:0,dox:0,doy:0,mouseX:0,mouseY:0},
  placing:null,placingRotated:false,shopCat:'food',notifsEnabled:true,
  vFilter:'all',
  expandedVillager:null,
};
