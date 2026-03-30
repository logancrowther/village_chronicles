// ── menu.js ──
function initMenu(){
  const mc=document.getElementById('menu-canvas');
  function resizeMenu(){mc.width=window.innerWidth;mc.height=window.innerHeight;drawMenuBg();}
  function drawMenuBg(){
    const ctx=mc.getContext('2d');
    drawDunes(ctx,mc.width,mc.height,42);
    const vig=ctx.createRadialGradient(mc.width/2,mc.height/2,mc.height*.1,mc.width/2,mc.height/2,mc.width*.8);
    vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,.6)');
    ctx.fillStyle=vig;ctx.fillRect(0,0,mc.width,mc.height);
  }
  window.addEventListener('resize',resizeMenu);
  resizeMenu();
  // Update button text if a save exists
  if(localStorage.getItem('vc_save')){
    document.getElementById('menu-start').textContent='Continue Your Chronicle';
    const sub=document.getElementById('menu-subtitle');
    if(sub)sub.textContent='Your village awaits, Chieftain.';
  }
  document.getElementById('menu-start').onclick=()=>{
    document.getElementById('menu-screen').style.display='none';
    document.body.classList.add('game-started');
    init();
  };
}
