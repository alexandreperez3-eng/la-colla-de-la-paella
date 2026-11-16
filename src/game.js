/*
 LA COLLA DE LA PAELLA · PASO 02
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
  const stateLabel = document.querySelector('#state');
  const attackButton = document.querySelector('#attack');
  const keys = {up:false, down:false, left:false, right:false};
  // Máquina de estados: el personaje solo está en UNO de estos tres estados.
  const STATE = Object.freeze({IDLE:'IDLE', WALK:'WALK', ATTACK:'ATTACK'});
  const game = {
    player:{x:0,y:0,facing:1,walking:0,state:STATE.IDLE,stateTime:0,impactDone:false},
    enemy:{x:config.ladron.x,y:config.ladron.y,hp:config.ladron.vida,flash:0},
    collected:false,
    elapsed:0
  };
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));

  function reset() {
    game.player.x = config.personaje.xInicial;
    game.player.y = config.personaje.yInicial;
    game.player.walking = 0;
    game.player.state = STATE.IDLE;
    game.player.stateTime = 0;
    game.player.impactDone = false;
    game.enemy.hp = config.ladron.vida;
    game.enemy.flash = 0;
    game.collected = false;
    game.elapsed = 0;
    objective.textContent = '⚔️ Derrota al ladrón (3 golpes)';
    status.textContent = 'Acércate, mira hacia el ladrón y usa GOLPEAR.';
    stateLabel.textContent = 'Estado: IDLE';
  }

  speedInput.value = config.personaje.velocidad;
  speedValue.textContent = speedInput.value;
  speedInput.addEventListener('input',()=>{speedValue.textContent=speedInput.value;});
  document.querySelector('#reset').addEventListener('click',reset);

  function startAttack() {
    const p = game.player;
    if(game.collected || p.state === STATE.ATTACK) return;
    p.state = STATE.ATTACK;
    p.stateTime = 0;
    p.impactDone = false;
    status.textContent = '¡Aixada en marcha!';
  }

  // El botón usa pointerdown para reaccionar al tocar, sin esperar al clic.
  attackButton.addEventListener('pointerdown',event=>{
    event.preventDefault();
    startAttack();
  });
  attackButton.addEventListener('click',event=>{
    // Activación con teclado/accesibilidad sin duplicar el toque.
    if(event.detail === 0) startAttack();
  });

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
    if((event.key==='j' || event.key===' ') && !event.repeat){
      startAttack();event.preventDefault();
    }
  });
  window.addEventListener('keyup',event=>{const d=keyMap[event.key];if(d)keys[d]=false;});
  window.addEventListener('blur',()=>Object.keys(keys).forEach(d=>keys[d]=false));

  // Un ataque dura varios frames. Solo golpeamos en el instante de impacto.
  function update(delta) {
    const p=game.player, e=game.enemy, a=config.ataque;
    game.elapsed += delta;
    if(e.flash > 0)e.flash=Math.max(0,e.flash-delta);
    if(game.collected)return;

    if(p.state===STATE.ATTACK){
      p.stateTime += delta;
      if(!p.impactDone && p.stateTime>=a.instanteImpacto){
        p.impactDone=true; // una única comprobación de daño por ataque
        const frontal=(e.x-p.x)*p.facing;
        const sameLane=Math.abs(e.y-p.y)<=a.profundidad;
        if(e.hp>0 && frontal>=-12 && frontal<=a.alcance && sameLane){
          e.hp--;
          e.flash=0.2;
          status.textContent=e.hp>0 ? '¡Impacto! Al ladrón le quedan '+e.hp+' vidas.' : '¡Ladrón derrotado! Ahora recupera el arroz.';
          if(e.hp===0)objective.textContent='🌾 Recoge el saco de arroz';
        }else if(e.hp>0){
          status.textContent='Golpe fallido: acércate y mira hacia el ladrón.';
        }
      }
      if(p.stateTime>=a.duracion){
        p.state=STATE.IDLE;
        p.stateTime=0;
      }
    }else{
      let dx=Number(keys.right)-Number(keys.left);
      let dy=Number(keys.down)-Number(keys.up);
      if(dx!==0 || dy!==0){
        const length=Math.hypot(dx,dy);
        dx/=length;dy/=length;
        const speed=Number(speedInput.value);
        p.x=clamp(p.x+dx*speed*delta,config.limites.izquierda,config.limites.derecha);
        p.y=clamp(p.y+dy*speed*.72*delta,config.limites.arriba,config.limites.abajo);
        if(dx)p.facing=Math.sign(dx);
        p.state=STATE.WALK;
        p.walking+=15*delta;
      }else{
        p.state=STATE.IDLE;
      }
    }

    // La recompensa no se puede recoger mientras siga vivo el ladrón.
    if(e.hp===0 && Math.hypot(p.x-config.arroz.x,p.y-config.arroz.y)<config.arroz.radioRecogida){
      game.collected=true;
      objective.textContent='✅ ¡ARRÒS RECUPERAT!';
      status.textContent='¡Ganaste! Has aprendido estados, ataque y colisiones.';
    }
    coordinates.textContent=`Posición: ${Math.round(p.x)}, ${Math.round(p.y)}`;
    stateLabel.textContent='Estado: '+p.state;
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
  function drawEnemy(){
    const e=game.enemy;
    if(e.hp===0)return;
    const x=e.x,y=e.y;
    ellipse(x,y,25,8,'#59472f66');
    rect(x-13,y-26,11,26,'#38474f');rect(x+4,y-26,11,26,'#38474f');
    rect(x-23,y-84,46,60,e.flash>0?'#ffb96a':'#9e6556');
    ellipse(x,y-95,22,23,'#bb886c');
    rect(x-22,y-120,44,12,'#4f3c3c');rect(x-14,y-136,28,18,'#4f3c3c');
    ctx.textAlign='center';ctx.font='27px system-ui';
    ctx.fillStyle='#231f1a';ctx.fillText('•̀_•́',x,y-88);
    ctx.font='22px system-ui';ctx.fillText('🥄',x+31,y-43);
    rect(x-24,y-157,48,8,'#4f3931');
    rect(x-24,y-157,48*e.hp/config.ladron.vida,8,'#df7761');
    ctx.font='bold 13px system-ui';ctx.fillStyle='#543f2c';
    ctx.fillText('LLADRE',x,y-167);
  }

  function drawPlayer(){
    const p=game.player;
    const {x,y,facing,walking,state}=p;
    const walkingNow=state===STATE.WALK;
    const swing=walkingNow ? Math.sin(walking)*6 : 0;
    const idleBob=state===STATE.IDLE ? Math.sin(game.elapsed*3)*1.5 : 0;
    const attackProgress=state===STATE.ATTACK ? Math.min(p.stateTime/config.ataque.duracion,1) : 0;
    const lean=state===STATE.ATTACK ? Math.sin(attackProgress*Math.PI)*facing*9 : 0;

    ellipse(x,y,25,8,'#59472f66');
    rect(x-14,y-24+swing,12,26,'#3f5362');
    rect(x+3,y-24-swing,12,26,'#3f5362');
    rect(x-22+lean,y-83+idleBob,44,61,'#6f9855');
    ellipse(x+lean,y-95+idleBob,23,23,'#e6bd8d');
    rect(x-27+lean,y-120+idleBob,54,12,'#b18c57');
    rect(x-19+lean,y-136+idleBob,38,18,'#b18c57');
    ctx.textAlign='center';ctx.font='28px system-ui';ctx.fillStyle='#28423e';
    ctx.fillText('•ᴗ•',x+lean,y-90+idleBob);

    // Dibujamos la aixada como dos líneas: mango y cabeza metálica.
    ctx.save();
    ctx.translate(x+facing*24,y-48);
    const angle=state===STATE.ATTACK ? (-1.2+attackProgress*2.1)*facing : -.15*facing;
    ctx.rotate(angle);
    ctx.strokeStyle='#855d35';ctx.lineWidth=7;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(0,24);ctx.lineTo(0,-38);ctx.stroke();
    ctx.strokeStyle='#9eb2ad';ctx.lineWidth=10;
    ctx.beginPath();ctx.moveTo(-18,-38);ctx.lineTo(15,-38);ctx.stroke();
    ctx.restore();

    if(state===STATE.ATTACK){
      ctx.strokeStyle='#f6e2a6';ctx.lineWidth=5;
      ctx.beginPath();
      ctx.arc(x+facing*43,y-55,50,facing>0?-.9:2.25,facing>0?1.0:4.0);
      ctx.stroke();
    }
    ctx.fillStyle='#f2d69c';ctx.font='bold 13px system-ui';
    ctx.fillText('LLAURADOR',x,y-151);
  }

  function render(){
    background();drawRice();
    // Renderizamos primero al personaje más alejado (eje Y).
    if(game.enemy.y<game.player.y){drawEnemy();drawPlayer();}else{drawPlayer();drawEnemy();}
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