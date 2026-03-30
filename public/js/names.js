// ── names.js ──
const MNAMES=['Aldric','Bertram','Cedric','Edmund','Godfrey','Harold','Ingram','Jasper','Kenric','Leofric','Milo','Norman','Oswald','Percy','Quentin','Roland','Siegfried','Thorold','Ulric','Wulfric','Aelfric','Baldwin','Conrad','Dunstan','Egbert','Fulk','Gerard','Hamo','Falk','Jordan','Kenelm','Lambert'];
const FNAMES=['Agatha','Beatrice','Constance','Dorothy','Eleanor','Florinda','Gwyneth','Helena','Isolde','Juliana','Katherine','Lavinia','Mabel','Nellie','Petronilla','Rowena','Sibyl','Thomasina','Ursula','Alditha','Cecily','Denise','Edith','Felicia','Godiva','Hawise','Liora','Joan','Agnes','Philippa','Rose','Matilda'];
const SURNAMES=['Smith','Miller','Baker','Cooper','Fletcher','Mason','Turner','Fisher','Hunter','Thatcher','Ward','Webb','Weaver','Tanner','Farmer','Shepherd','Wright','Clark','Cook','Taylor','Archer','Stone','Ford','Brook','Hill','Longbottom','Whitfield','Elderwood','Blackwood','Pennsworth'];
const VNAMES=['Ashford','Bridgehaven','Crowmere','Dunmoor','Elmgate','Foxhollow','Greystone','Harrowfield','Ironspark','Kettlecroft','Larchwood','Millhaven','Nighthollow','Oldwick','Pinecrest','Quarryham','Ravenscar','Stonehearth','Thornwall','Zephyrcroft','Blackmoor','Coldwater','Duskfall','Emberglen','Frostmere'];

function rndName(male){const a=male?MNAMES:FNAMES;return a[r(a.length)]+' '+SURNAMES[r(SURNAMES.length)];}
function rndVName(){return VNAMES[r(VNAMES.length)]+' '+(r(2)?'Village':'Settlement');}
function r(n){return Math.floor(Math.random()*n);}
function rnd(a,b){return a+Math.random()*(b-a);}
