/*
 LA COLLA DE LA PAELLA · PASO 01
 Aprende: bucle de juego, delta, teclas, controles táctiles,
 movimiento normalizado, Canvas 2D y detección de proximidad.
*/
(() => {
  'use strict';
  const config = window.CONFIG;
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const speedInput = document.querySelector('#speed');
  const speedValue = document.querySelector('#speed-value');
  const coordinates = document.querySelector('#coordinates');
  const status = document.querySelector('#status');
  const objective = document.querySelector('#objective');
  const keys = {up:false, down:false, left:false, right:false};
  const game = {player:{x:0,y:0,facing:1,walking:0},collected:false};
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));

  function reset() {
    game.player.x = config.personaje.xInicial;
    game.player.y = config.personaje.yInicial;
    game.player.walking = 0;
    game.collected = false;
    objective.textContent = '🎯 Acércate al saco de arroz';
    status.textContent = 'Camina en dos dimensiones y recupera el arroz.';
  }

  speedInput.value = config.personaje.velocidad;
  speedValue.textContent = speedInput.value;
  speedInput.addEventListener('input',()=>{speedValue.textContent=speedInput.value;});
  document.querySelector('#reset').addEventListener('click',reset);

  document.querySelectorAll('[data-move]').forEach(button => {
    const direction = button.dataset.move;
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      keys[direction] = true;
      button.classList.add('down');
      if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
    });
    const release=()=>{keys[direction]=false;button.classList.remove('down');};
    button.addEventListener('pointerup',release);
    button.addEventListener('pointercancel',release);
    button.addEventListener('lostpointercapture',release);
  });

  const keyMap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  window.addEventListener('keydown',event=>{
    const d=keyMap[event.key];
    if(d){keys[d]=true;event.preventDefault();}
  });
  window.addEventListener('keyup',event=>{const d=keyMap[event.key];if(d)keys[d]=false;});
  window.addEventListener('blur',()=>Object.keys(keys).forEach(d=>keys[d]=false));

  function update(delta) {
    if(game.collected)return;
    let dx=Number(keys.right)-Number(keys.left);
    let dy=Number(keys.down)-Number(keys.up);
    if(dx!==0||dy!==0) {
      const length=Math.hypot(dx,dy);
      dx/=length;dy/=length; // evita ir 1.414 veces más rápido en diagonal
      const speed=Number(speedInput.value);
      game.player.x=clamp(game.player.x+dx*speed*delta,config.limites.izquierda,config.limites.derecha);
      game.player.y=clamp(game.player.y+dy*speed*.72*delta,config.limites.arriba,config.limites.abajo);
      if(dx)game.player.facing=Math.sign(dx);
      game.player.walking+=15*delta;
    }
    const distance=Math.hypot(game.player.x-config.arroz.x,game.player.y-config.arroz.y);
    if(distance<config.arroz.radioRecogida) {
      game.collected=true;
      objective.textContent='✅ ¡ARRÒS RECUPERAT!';
      status.textContent='¡Primer objetivo conseguido! Pulsa «Volver a empezar».';
    }
    coordinates.textContent=`Posición: ${Math.round(game.player.x)}, ${Math.round(game.player.y)}`;
  }

  const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  function ellipse(x,y,rx,ry,color){
    ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();
  }
  function background(){
    const sky=ctx.createLinearGradient(0,0,0,300);
    sky.addColorStop(0,'#659ea5');sky.addColorStop(1,'#f0cf90');
    ctx.fillStyle=sky;ctx.fillRect(0,0,900,480);
    ellipse(720,74,37,37,'#fff1ba');
    rect(0,234,900,246,'#719e68');
    for(let i=0;i<9;i++){
      const x=i*115-25,y=163+Math.sin(i)*15;
      rect(x,y,85,103,i%2?'#e2c48d':'#f2d3a0');
      ctx.fillStyle='#ad785e';ctx.beginPath();
      ctx.moveTo(x-7,y+4);ctx.lineTo(x+42,y-25);ctx.lineTo(x+93,y+4);ctx.fill();
      rect(x+23,y+30,19,26,'#7a9a91');
    }
    rect(0,289,900,171,'#c5a57e');
    for(let i=0;i<4;i++)rect(0,317+i*42,900,2,'#b3956d');
    for(let i=0;i<28;i++){
      const x=i*35+10;ctx.strokeStyle='#537a48';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(x,287);ctx.lineTo(x-12,265);
      ctx.moveTo(x,287);ctx.lineTo(x+10,264);ctx.stroke();
    }
    rect(0,458,900,22,'#52794b');
    ctx.textAlign='left';ctx.font='bold 17px system-ui';ctx.fillStyle='#284642';
    ctx.fillText('CAMÍ DE L’HORTA',24,36);
  }
  function drawRice(){
    if(game.collected)return;
    const {x,y}=config.arroz;
    ellipse(x,y,28,8,'#584b3b77');
    ctx.save();ctx.translate(x,y-31);
    ctx.fillStyle='#f3d8a2';ctx.beginPath();
    ctx.moveTo(-22,22);ctx.lineTo(-24,-18);ctx.lineTo(-14,-28);
    ctx.lineTo(15,-28);ctx.lineTo(24,-18);ctx.lineTo(20,22);
    ctx.closePath();ctx.fill();ctx.strokeStyle='#a27c4b';ctx.lineWidth=3;ctx.stroke();
    ctx.textAlign='center';ctx.font='bold 15px system-ui';ctx.fillStyle='#754f2f';
    ctx.fillText('ARRÒS',0,3);ctx.restore();
    ctx.fillStyle='#234e43';ctx.font='bold 15px system-ui';ctx.textAlign='center';
    ctx.fillText('⬇ RECOGE',x,y-74);
  }
  function drawPlayer(){
    const {x,y,facing,walking}=game.player;
    const swing=Math.sin(walking)*6;
    ellipse(x,y,25,8,'#59472f66');
    rect(x-14,y-24+swing,12,26,'#3f5362');
    rect(x+3,y-24-swing,12,26,'#3f5362');
    rect(x-22,y-83,44,61,'#6f9855');
    ellipse(x,y-95,23,23,'#e6bd8d');
    rect(x-27,y-120,54,12,'#b18c57');
    rect(x-19,y-136,38,18,'#b18c57');
    ctx.textAlign='center';ctx.font='28px system-ui';ctx.fillStyle='#28423e';
    ctx.fillText('•ᴗ•',x,y-90);
    ctx.font='27px system-ui';ctx.fillText('🌾',x+facing*32,y-44);
    ctx.fillStyle='#f2d69c';ctx.font='bold 13px system-ui';
    ctx.fillText('LLAURADOR',x,y-145);
  }
  function render(){
    background();drawRice();drawPlayer();
    if(game.collected){
      ctx.fillStyle='#183d36dd';ctx.fillRect(235,150,430,125);
      ctx.textAlign='center';ctx.fillStyle='#f8dc95';ctx.font='bold 31px system-ui';
      ctx.fillText('ARRÒS RECUPERAT! 🥘',450,203);
      ctx.fillStyle='#fff4d2';ctx.font='17px system-ui';
      ctx.fillText('Hem començat la nostra aventura!',450,241);
    }
  }
  let last=0;
  function loop(timestamp){
    const delta=Math.min((timestamp-last)/1000||0,.05);
    last=timestamp;update(delta);render();requestAnimationFrame(loop);
  }
  reset();requestAnimationFrame(loop);
})();