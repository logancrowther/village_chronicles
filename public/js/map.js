// ── map.js ──
const GRID=64;
function wToC(wx,wy){const cv=document.getElementById('map-canvas');return{x:cv.width/2+(wx-G.map.ox)*G.map.scale,y:cv.height/2+(wy-G.map.oy)*G.map.scale};}
function cToW(cx,cy){const cv=document.getElementById('map-canvas');return{x:(cx-cv.width/2)/G.map.scale+G.map.ox,y:(cy-cv.height/2)/G.map.scale+G.map.oy};}
function snapGrid(wx,wy){return{gx:Math.floor(wx/GRID),gy:Math.floor(wy/GRID)};}

// Draw menu background: starry sky + layered mountain silhouettes
function drawDunes(ctx,W,H,seed){
  const s=seed||0;
  // Deep sky gradient
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#04030a');sky.addColorStop(.45,'#080610');sky.addColorStop(.75,'#0c0806');sky.addColorStop(1,'#181008');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  // Stars
  ctx.save();
  for(let i=0;i<180;i++){
    const sx=((i*127+s*3)%W+W)%W;const sy=((i*89+s)%(H*.5)+H*.02);
    const sz=.4+((i*31)%8)*.12;const sa=.25+((i*17)%12)*.04;
    ctx.fillStyle=`rgba(230,215,180,${sa})`;ctx.beginPath();ctx.arc(sx,sy,sz,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  // Moon
  ctx.save();ctx.fillStyle='rgba(220,200,150,.12)';ctx.beginPath();ctx.arc(W*.78,H*.12,H*.055,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(220,200,150,.06)';ctx.beginPath();ctx.arc(W*.78,H*.12,H*.08,0,Math.PI*2);ctx.fill();ctx.restore();
  // Mountain layers
  function mtn(col,yFrac,a1,a2,f1,f2,p1,p2){
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-10,H+10);
    for(let x=-10;x<=W+10;x+=3){
      const y=H*yFrac+Math.sin(x*f1+p1)*H*a1+Math.sin(x*f2+p2)*H*a2+Math.sin(x*f1*.4+p1+1)*H*a1*.25;
      ctx.lineTo(x,y);
    }
    ctx.lineTo(W+10,H+10);ctx.closePath();ctx.fill();
  }
  mtn('#0c0a10',.38,.07,.04,.003,.007,1.2+s*.01,2.8);
  mtn('#100d0c',.46,.06,.035,.0042,.009,.5,1.9);
  mtn('#140f0a',.54,.055,.03,.005,.011,2.1,0.8);
  mtn('#191008',.62,.05,.03,.006,.013,3.3,2.3);
  mtn('#1e1209',.70,.04,.025,.008,.015,1.6,3.0);
  mtn('#211408',.78,.035,.02,.01,.018,0.9,1.4);
  ctx.fillStyle='#1c1208';ctx.fillRect(0,H*.84,W,H*.2);
}

// Seeded simple hash for repeatable noise
function hash(x,y){let h=(x*374761393+y*668265263)^((x*668265263)>>5);h^=h>>15;h*=2246822519;h^=h>>13;h*=3266489917;return(h^(h>>16))>>>0;}
function noiseVal(x,y){return(hash(x,y)%1000)/1000;}

function renderMap(){
  const cv=document.getElementById('map-canvas');if(!cv)return;
  const ctx=cv.getContext('2d');const W=cv.width,H=cv.height;

  // ── Dark top-down desert base ──
  ctx.fillStyle='#0e0b06';ctx.fillRect(0,0,W,H);

  // Scrolling sand texture: tile-based noise patches (anchored to canvas top-left)
  const tileSize=80;
  const camLeft=G.map.ox-W/(2*G.map.scale);
  const camTop=G.map.oy-H/(2*G.map.scale);
  const ofx=Math.floor(camLeft/tileSize)*tileSize;
  const ofy=Math.floor(camTop/tileSize)*tileSize;
  const cols=['rgba(28,20,10,.9)','rgba(22,16,8,.85)','rgba(32,24,12,.8)','rgba(18,14,7,.9)','rgba(26,18,9,.85)'];
  ctx.save();
  for(let wx=ofx;wx<camLeft+W/G.map.scale+tileSize;wx+=tileSize){
    for(let wy=ofy;wy<camTop+H/G.map.scale+tileSize;wy+=tileSize){
      const p=wToC(wx,wy);const ps=tileSize*G.map.scale;
      const nx=((Math.floor(wx/tileSize)%256)+256)%256;
      const ny=((Math.floor(wy/tileSize)%256)+256)%256;
      const n=noiseVal(nx,ny);
      ctx.fillStyle=cols[Math.floor(n*cols.length)];
      ctx.fillRect(p.x,p.y,ps+1,ps+1);
    }
  }
  ctx.restore();

  // Scattered rock formations (world-seeded, scroll with map)
  ctx.save();
  for(let i=0;i<120;i++){
    const rx=(((i*173+71)%600)-300)*GRID*.4;
    const ry=(((i*251+97)%600)-300)*GRID*.4;
    const p=wToC(rx,ry);
    if(p.x<-60||p.x>W+60||p.y<-60||p.y>H+60)continue;
    const sz=((i*37)%8+3)*G.map.scale;
    const alpha=.18+((i*13)%10)*.02;
    ctx.fillStyle=`rgba(10,8,4,${alpha})`;
    ctx.beginPath();ctx.ellipse(p.x,p.y,sz*1.6,sz,((i*29)%6)*.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(40,30,15,${alpha*.5})`;
    ctx.beginPath();ctx.ellipse(p.x-sz*.3,p.y-sz*.2,sz*.8,sz*.5,0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();

  // Vignette edges
  const vign=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);
  vign.addColorStop(0,'rgba(0,0,0,0)');vign.addColorStop(1,'rgba(0,0,0,.55)');
  ctx.fillStyle=vign;ctx.fillRect(0,0,W,H);

  // Village area warm glow
  const vc=wToC(0,0);const vr=GRID*14*G.map.scale;
  const vg=ctx.createRadialGradient(vc.x,vc.y,0,vc.x,vc.y,vr);
  vg.addColorStop(0,'rgba(200,155,50,.13)');vg.addColorStop(.6,'rgba(160,120,40,.05)');vg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

  // Grid
  const gs=GRID*G.map.scale;
  const sx=((-(G.map.ox%GRID)*G.map.scale)+W/2)%gs;
  const sy=((-(G.map.oy%GRID)*G.map.scale)+H/2)%gs;
  ctx.strokeStyle='rgba(180,140,50,.07)';ctx.lineWidth=.5;
  for(let x=sx;x<W+gs;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=sy;y<H+gs;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

  // Village center marker
  ctx.save();ctx.strokeStyle='rgba(200,168,75,.45)';ctx.lineWidth=Math.max(.5,G.map.scale);ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.arc(vc.x,vc.y,GRID*G.map.scale,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(200,168,75,.9)';ctx.beginPath();ctx.arc(vc.x,vc.y,3,0,Math.PI*2);ctx.fill();ctx.restore();

  // Buildings
  for(const b of G.buildings){
    const c=CATALOG[b.typeId];const p=wToC(b.gx*GRID,b.gy*GRID);
    const bw=b.rotated?c.gh:c.gw;const bh=b.rotated?c.gw:c.gh;
    const sw=bw*GRID*G.map.scale,sh=bh*GRID*G.map.scale;
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=6*G.map.scale;ctx.shadowOffsetY=3*G.map.scale;
    ctx.fillStyle=c.col;ctx.fillRect(p.x,p.y,sw,sh);ctx.shadowColor='transparent';
    ctx.strokeStyle=c.brd;ctx.lineWidth=Math.max(1,1.5*G.map.scale);ctx.strokeRect(p.x+.5,p.y+.5,sw-1,sh-1);
    // Highlight top edge
    ctx.fillStyle='rgba(255,255,255,.07)';ctx.fillRect(p.x,p.y,sw,sh*.25);
    const upName=b.upLevel>0&&c.ups[b.upLevel-1]?c.ups[b.upLevel-1].name:c.name;
    const fs=Math.max(8,Math.min(13,10*G.map.scale));
    ctx.font=`600 ${fs}px 'Cinzel',serif`;ctx.fillStyle='rgba(255,255,255,.92)';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(upName.length>14?upName.slice(0,12)+'…':upName,p.x+sw/2,p.y+sh/2);ctx.restore();
  }

  // Placement ghost
  if(G.placing){
    const c=CATALOG[G.placing];const w=cToW(G.map.mouseX,G.map.mouseY);const sg=snapGrid(w.x,w.y);
    const pgw=G.placingRotated?c.gh:c.gw;const pgh=G.placingRotated?c.gw:c.gh;
    const p=wToC(sg.gx*GRID,sg.gy*GRID);const sw=pgw*GRID*G.map.scale,sh=pgh*GRID*G.map.scale;
    const ok=canPlace(G.placing,sg.gx,sg.gy,G.placingRotated)&&G.gold>=bldCost(G.placing);
    ctx.save();ctx.globalAlpha=.55;
    ctx.fillStyle=ok?c.col:'#6a1010';ctx.strokeStyle=ok?c.brd:'#b02020';
    ctx.lineWidth=Math.max(1,2*G.map.scale);ctx.fillRect(p.x,p.y,sw,sh);ctx.strokeRect(p.x,p.y,sw,sh);
    ctx.globalAlpha=1;ctx.restore();
  }

  // World village territories (large boxes, like enemy territory)
  for(const v of G.worldVillages){
    const sz=(7+v.tier)*GRID;const sw=sz*G.map.scale;const sh=(6+v.tier)*GRID*G.map.scale;
    const p=wToC(v.x,v.y);
    if(p.x+sw<-40||p.x>W+40||p.y+sh<-40||p.y>H+40)continue;
    const onCooldown=v.raidCooldownEnd&&totalGameDay()<v.raidCooldownEnd;
    ctx.save();
    let fillCol,brdCol,textCol,subCol;
    if(v.allianceWith){
      fillCol='rgba(20,50,20,.7)';brdCol='#305a30';textCol='rgba(120,220,120,.92)';subCol='rgba(150,210,150,.6)';
    } else if(onCooldown){
      fillCol='rgba(28,28,28,.75)';brdCol='#484848';textCol='rgba(160,160,160,.85)';subCol='rgba(130,130,130,.6)';
    } else if(v.hostile){
      fillCol='rgba(80,8,8,.75)';brdCol='#c02020';textCol='rgba(255,120,120,.95)';subCol='rgba(200,140,140,.7)';
    } else {
      fillCol='rgba(60,10,10,.7)';brdCol='#8a1818';textCol='rgba(220,100,100,.9)';subCol='rgba(200,140,140,.7)';
    }
    ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=8*G.map.scale;ctx.shadowOffsetY=3*G.map.scale;
    ctx.fillStyle=fillCol;ctx.fillRect(p.x,p.y,sw,sh);
    ctx.shadowColor='transparent';
    ctx.strokeStyle=brdCol;ctx.lineWidth=Math.max(1.5,2*G.map.scale);
    ctx.strokeRect(p.x+.5,p.y+.5,sw-1,sh-1);
    ctx.fillStyle=onCooldown?'rgba(255,255,255,.02)':'rgba(255,80,80,.05)';
    ctx.fillRect(p.x,p.y,sw,sh*.22);
    const fs=Math.max(8,Math.min(14,11*G.map.scale));
    ctx.font=`600 ${fs}px 'Cinzel',serif`;
    ctx.fillStyle=textCol;ctx.textAlign='center';ctx.textBaseline='middle';
    const lbl=v.name;
    ctx.fillText(lbl.length>16?lbl.slice(0,14)+'…':lbl,p.x+sw/2,p.y+sh/2-fs*.5);
    ctx.font=`${Math.max(7,Math.min(10,8*G.map.scale))}px 'Crimson Text',serif`;
    ctx.fillStyle=subCol;
    const subText=onCooldown?`Recovering — ${v.raidCooldownEnd-totalGameDay()} days`:`Pop: ${v.pop} · Tier ${v.tier+1}`;
    ctx.fillText(subText,p.x+sw/2,p.y+sh/2+fs*.6);
    ctx.restore();
  }
}
function resizeCanvas(){
  const cv=document.getElementById('map-canvas');const wrap=document.getElementById('map-wrap');
  if(!wrap)return;cv.width=wrap.clientWidth;cv.height=wrap.clientHeight;renderMap();
}

function getWorldVillageAtCanvas(cx,cy){
  const w=cToW(cx,cy);
  for(const v of G.worldVillages){
    const sw=(7+v.tier)*GRID,sh=(6+v.tier)*GRID;
    if(w.x>=v.x&&w.x<v.x+sw&&w.y>=v.y&&w.y<v.y+sh)return v;
  }
  return null;
}

function getBuildingAtCanvas(cx,cy){
  const w=cToW(cx,cy);
  for(let i=G.buildings.length-1;i>=0;i--){
    const b=G.buildings[i];const c=CATALOG[b.typeId];
    const bw=b.rotated?c.gh:c.gw;const bh=b.rotated?c.gw:c.gh;
    const bx=b.gx*GRID,by=b.gy*GRID;
    if(w.x>=bx&&w.x<bx+bw*GRID&&w.y>=by&&w.y<by+bh*GRID) return b;
  }
  return null;
}
function demolishBuilding(b){
  const c=CATALOG[b.typeId];
  G.buildings=G.buildings.filter(x=>x.id!==b.id);
  G.buildingCounts[b.typeId]=Math.max(0,(G.buildingCounts[b.typeId]||1)-1);
  calcGPS();renderBuildingsList();renderShop();renderMap();renderHUD();
  notify(`${c.name} demolished.`,'warn');
}
function syncPlacingUI(){
  const btn=document.getElementById('btn-rotate');
  if(btn)btn.style.display=G.placing?'':'none';
  const hint=document.getElementById('place-hint');
  if(hint)hint.style.display=G.placing?'block':'none';
}
function initMapEvents(){
  const cv=document.getElementById('map-canvas');
  cv.addEventListener('mousedown',e=>{if(G.placing||e.button!==0)return;G.map.drag=true;G.map.dragged=false;G.map.dx=e.clientX;G.map.dy=e.clientY;G.map.dox=G.map.ox;G.map.doy=G.map.oy;cv.style.cursor='grabbing';});
  cv.addEventListener('mousemove',e=>{const rect=cv.getBoundingClientRect();G.map.mouseX=e.clientX-rect.left;G.map.mouseY=e.clientY-rect.top;if(G.map.drag){const dx=e.clientX-G.map.dx,dy=e.clientY-G.map.dy;if(Math.abs(dx)>5||Math.abs(dy)>5)G.map.dragged=true;G.map.ox=G.map.dox-dx/G.map.scale;G.map.oy=G.map.doy-dy/G.map.scale;}if(G.placing||G.map.drag)renderMap();});
  cv.addEventListener('mouseup',e=>{
    if(e.button!==0)return;
    const wasDragged=G.map.dragged;
    G.map.drag=false;G.map.dragged=false;cv.style.cursor=G.placing?'crosshair':'default';
    if(wasDragged)return; // real drag — not a click
    if(G.placing){const w=cToW(G.map.mouseX,G.map.mouseY);const sg=snapGrid(w.x,w.y);if(!placeBuilding(G.placing,sg.gx,sg.gy,G.placingRotated))notify('Cannot place here — not enough gold or space.','warn');else{G.placingRotated=false;syncPlacingUI();renderShop();renderMap();return;}}
    // Check for world village click
    const rect2=cv.getBoundingClientRect();
    const wv=getWorldVillageAtCanvas(e.clientX-rect2.left,e.clientY-rect2.top);
    if(wv){
      if(wv.allianceWith){notify(`You have an alliance with ${wv.name}.`,'info');}
      else if(wv.raidCooldownEnd&&totalGameDay()<wv.raidCooldownEnd){
        const days=wv.raidCooldownEnd-totalGameDay();
        notify(`${wv.name} is recovering — can be raided again in ${days} day${days!==1?'s':''}.`,'warn');
      } else {
        // Switch to attacking tab and open raid modal if in targets
        switchTab('attacking');
        const t=G.attackTargets.find(x=>x.id===wv.id);
        if(t){setTimeout(()=>openRaidModal(wv.id),50);}
        else{notify(`${wv.name} is not in your current raid targets — wait for the next refresh.`,'info');}
      }
    }
  });
  cv.addEventListener('contextmenu',e=>{
    e.preventDefault();
    if(G.placing){G.placing=null;G.placingRotated=false;syncPlacingUI();renderShop();return;}
    const rect=cv.getBoundingClientRect();
    const b=getBuildingAtCanvas(e.clientX-rect.left,e.clientY-rect.top);
    if(!b)return;
    const c=CATALOG[b.typeId];
    const upName=b.upLevel>0&&c.ups[b.upLevel-1]?c.ups[b.upLevel-1].name:c.name;
    window._demolishTarget=b;
    document.getElementById('modal-title').textContent=`Demolish ${upName}?`;
    document.getElementById('modal-body').innerHTML=`<p style="font-size:14px;line-height:1.8;color:var(--dim)">Are you sure you want to demolish <b style="color:var(--text)">${upName}</b>?</p><p style="margin-top:8px;font-size:13px;color:var(--red2)">You will receive <b>no gold refund</b>. This cannot be undone.</p>`;
    document.getElementById('modal-footer').innerHTML=`<button class="btn btn-neutral" onclick="closeModal()">Cancel</button><button class="btn btn-danger" onclick="demolishBuilding(window._demolishTarget);closeModal()">Demolish</button>`;
    openModal();
  });
  cv.addEventListener('mouseleave',()=>{if(G.map.drag){G.map.drag=false;cv.style.cursor='default';}});
  cv.addEventListener('wheel',e=>{e.preventDefault();G.map.scale=Math.max(.3,Math.min(3,G.map.scale+(e.deltaY>0?-.1:.1)));renderMap();},{passive:false});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){G.placing=null;G.placingRotated=false;syncPlacingUI();renderShop();}
    if((e.key==='r'||e.key==='R')&&G.placing){G.placingRotated=!G.placingRotated;renderMap();}
  });
  document.getElementById('btn-recenter').onclick=()=>{G.map.ox=0;G.map.oy=0;renderMap();};
  document.getElementById('btn-zoom-in').onclick=()=>{G.map.scale=Math.min(3,G.map.scale+.2);renderMap();};
  document.getElementById('btn-zoom-out').onclick=()=>{G.map.scale=Math.max(.3,G.map.scale-.2);renderMap();};
  document.getElementById('btn-rotate').onclick=()=>{if(G.placing){G.placingRotated=!G.placingRotated;renderMap();}};
}
