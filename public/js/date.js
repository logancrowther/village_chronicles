// ── date.js ──
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MDAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
function gameDate(){
  const dayOfYear=Math.floor((G.day-1)*3.65);
  let rem=dayOfYear,mi=0;
  while(mi<11&&rem>=MDAYS[mi]){rem-=MDAYS[mi];mi++;}
  return{month:MONTHS[mi],day:rem+1};
}
function dateStr(){const d=gameDate();return`Y${G.year} D${G.day}`;}
function fullDateStr(){const d=gameDate();return`Year ${G.year} — ${d.month} ${d.day}`;}
// Absolute game day counter (year 1 day 1 = 1)
function totalGameDay(){return(G.year-1)*DAYS_PER_YEAR+G.day;}
