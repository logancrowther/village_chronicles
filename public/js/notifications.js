// ── notifications.js ──
function _buildNotifCard(msg,type,time,autoDismiss){
  const d=document.createElement('div');
  d.className='notif-card '+(type||'info');
  const icons={info:'i',danger:'!',success:'✓',warn:'!'};
  d.innerHTML=`<div class="notif-icon ${type||'info'}">${icons[type]||'i'}</div><div class="notif-body"><div class="notif-msg">${msg}</div><div class="notif-time">${time}</div></div><button class="notif-close" onclick="this.closest('.notif-card').remove()">×</button>`;
  if(autoDismiss)setTimeout(()=>d.remove(),15000);
  return d;
}

function notify(msg,type=''){
  if(!G.notifsEnabled)return;
  const log=document.getElementById('notif-log');if(!log)return;
  const time=dateStr();
  // Persist to save state
  G.notifLog=G.notifLog||[];
  G.notifLog.unshift({msg,type,time});
  if(G.notifLog.length>30)G.notifLog.length=30;
  const d=_buildNotifCard(msg,type,time,true);
  log.prepend(d);
  while(log.children.length>30)log.lastChild.remove();
}

function restoreNotifLog(){
  const log=document.getElementById('notif-log');if(!log)return;
  if(!G.notifLog||!G.notifLog.length)return;
  log.innerHTML='';
  // notifLog is newest-first; append in order so DOM matches
  for(const n of G.notifLog){
    log.appendChild(_buildNotifCard(n.msg,n.type||'info',n.time,false));
  }
}

function showNextArrival(){
  const popup=document.getElementById('arrival-popup');
  if(!G.arrivals.length){popup.classList.remove('visible');return;}
  const v=G.arrivals[0];
  const isFirst=!G.hasEverHadVillager&&G.villagers.length===0;
  document.getElementById('arr-name').textContent=v.name;
  document.getElementById('arr-sub').textContent=isFirst
    ?`Age ${v.age} \u2022 Your first settler has arrived`
    :`Age ${v.age} \u2022 Seeks refuge`;
  document.getElementById('arr-stats').innerHTML=`<span>♥ ${v.hp}</span><span>⚔ ${v.str+v.agi}</span><span>💧 ${v.thirst}</span>`;
  // Hide deny button for the very first arrival — it's mandatory
  const denyBtn=document.getElementById('arr-no');
  if(denyBtn)denyBtn.style.display=isFirst?'none':'';
  popup.classList.add('visible');
}
function acceptArrival(){
  if(!G.arrivals.length)return;
  const v=G.arrivals.shift();
  G.villagers.push(v);
  if(!G.hasEverHadVillager){
    G.hasEverHadVillager=true;
    notify(`${v.name} has founded your village!`,'success');
  } else {
    notify(`${v.name} has joined your village!`,'success');
  }
  renderVillagersTab();renderHUD();showNextArrival();
}
function denyArrival(){
  if(!G.arrivals.length)return;
  // Block deny if no villagers yet
  if(!G.hasEverHadVillager&&G.villagers.length===0)return;
  const v=G.arrivals.shift();
  notify(`${v.name} was turned away.`,'warn');
  showNextArrival();
}
function queueArrival(opts={}){
  const v=mkVillager(opts);
  G.arrivals.push(v);
  const isFirst=!G.hasEverHadVillager&&G.villagers.length===0&&G.arrivals.length===1;
  if(isFirst){
    notify('A traveler has arrived seeking to found a new life here.','info');
  } else {
    notify(`${G.arrivals.length>1?'Another traveler':'A traveler'} is requesting to join your village!`,'info');
  }
  if(G.arrivals.length===1)showNextArrival();
}
