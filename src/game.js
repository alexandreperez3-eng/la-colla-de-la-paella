/*
 LA COLLA DE LA PAELLA · PASO 03C.3
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
  const specialButton = document.querySelector('#special');
  const specialStatus = document.querySelector('#special-status');
  const comboLabel = document.querySelector('#combo');
  const debugHitboxes = document.querySelector('#debug-hitboxes');
  const animationLabel = document.querySelector('#animation-label');
  const useNewWalk = document.querySelector('#walk-v2');
  // Los sprites son recursos gráficos independientes de la máquina de estados.
  const idleImage = new Image();
  idleImage.src = 'assets/llaurador_idle.png?v=03b';
  const walkImage = new Image();
  walkImage.src = 'assets/llaurador_walk.png?v=03c1';
  // La versión nueva se carga aparte: podemos comparar sin perder el original.
  const walkV2Image = new Image();
  walkV2Image.src = 'assets/llaurador_walk_v2.png?v=03c2';
  // Versión corregida: el rostro procede del sprite IDLE aprobado.
  const walkV3Image = new Image();
  walkV3Image.src = 'assets/llaurador_walk_v3.png?v=03c3';
  // Si la imagen no carga, el personaje sigue visible con el dibujo Canvas de respaldo.
  const idleSpriteReady = () => idleImage.complete && idleImage.naturalWidth === 448 && idleImage.naturalHeight === 128;
  const walkSpriteReady = () => walkImage.complete && walkImage.naturalWidth === 672 && walkImage.naturalHeight === 128;
  const walkV2SpriteReady = () => walkV2Image.complete && walkV2Image.naturalWidth === 672 && walkV2Image.naturalHeight === 128;
  const walkV3SpriteReady = () => walkV3Image.complete && walkV3Image.naturalWidth === 672 && walkV3Image.naturalHeight === 128;
  // OFF compara el WALK anterior (v2); ON usa el rostro corregido (v3).
  // Si una imagen falla al cargar, se usa otra versión como respaldo.
  const walkImageSeleccionada = () => {
    if(useNewWalk.checked && walkV3SpriteReady())return walkV3Image;
    if(walkV2SpriteReady())return walkV2Image;
    if(walkV3SpriteReady())return walkV3Image;
    return walkImage;
  };
  const IDLE_SPRITE = Object.freeze({ancho:112,alto:128,cantidad:4,fps:6});
  const WALK_SPRITE = Object.freeze({ancho:112,alto:128,cantidad:6,fps:9});
  const keys = {up:false, down:false, left:false, right:false};
  // Máquina de estados: el personaje solo está en UNO de estos tres estados.
  const STATE = Object.freeze({IDLE:'IDLE', WALK:'WALK', ATTACK:'ATTACK', SPECIAL:'SPECIAL'});
  const game = {
    player:{
      x:0,y:0,facing:1,walking:0,state:STATE.IDLE,stateTime:0,
      impactDone:false,attackStep:1,comboQueued:false,specialCooldown:0,
      animationTime:0,lastAnimationState:STATE.IDLE
    },
    enemy:{x:config.ladron.x,y:config.ladron.y,hp:config.ladron.vida,flash:0},
    collected:false,
    elapsed:0
  };
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
  useNewWalk.addEventListener('change',()=>{game.player.animationTime=0;});

  function reset() {
    game.player.x = config.personaje.xInicial;
    game.player.y = config.personaje.yInicial;
    game.player.walking = 0;
    game.player.state = STATE.IDLE;
    game.player.stateTime = 0;
    game.player.impactDone = false;
    game.player.attackStep = 1;
    game.player.comboQueued = false;
    game.player.specialCooldown = 0;
    game.player.animationTime = 0;
    game.player.lastAnimationState = STATE.IDLE;
    game.enemy.x = config.ladron.x;
    game.enemy.y = config.ladron.y;
    game.enemy.hp = config.ladron.vida;
    game.enemy.flash = 0;
    game.collected = false;
    game.elapsed = 0;
    objective.textContent = '⚔️ Derrota al ladrón de entrenamiento';
    status.textContent = 'Acércate, mira hacia él y encadena dos golpes.';
    stateLabel.textContent = 'Estado: IDLE';
    comboLabel.textContent = 'Combo: —';
    specialStatus.textContent = 'REMOLÍ';
    specialButton.disabled = false;
    animationLabel.textContent = 'Sprite: IDLE 1/4';
  }

  speedInput.value = config.personaje.velocidad;
  speedValue.textContent = speedInput.value;
  speedInput.addEventListener('input',()=>{speedValue.textContent=speedInput.value;});
  document.querySelector('#reset').addEventListener('click',reset);

  // El segundo toque durante ATTACK 1 encola el segundo tajo.
  function startAttack() {
    const p=game.player;
    if(game.collected || p.state===STATE.SPECIAL || game.enemy.hp===0)return;
    if(p.state===STATE.ATTACK){
      if(p.attackStep===1 && !p.comboQueued){
        p.comboQueued=true;
        status.textContent='¡Segundo tajo preparado!';
      }
      return;
    }
    p.state=STATE.ATTACK;
    p.stateTime=0;
    p.impactDone=false;
    p.attackStep=1;
    p.comboQueued=false;
    status.textContent='¡Primer tajo!';
  }

  // La técnica circular no necesita mirar hacia el enemigo.
  function startSpecial() {
    const p=game.player;
    if(game.collected || game.enemy.hp===0 || p.specialCooldown>0 ||
       p.state===STATE.ATTACK || p.state===STATE.SPECIAL)return;
    p.state=STATE.SPECIAL;
    p.stateTime=0;
    p.impactDone=false;
    p.specialCooldown=config.especial.recarga;
    status.textContent='¡REMOLÍ DE CORBELLES!';
  }

  function bindAction(button,action){
    button.addEventListener('pointerdown',event=>{
      event.preventDefault();action();
    });
    // detail=0: pulsación desde teclado/tecnologías asistivas.
    button.addEventListener('click',event=>{if(event.detail===0)action();});
  }
  bindAction(attackButton,startAttack);
  bindAction(specialButton,startSpecial);

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
    if(event.key==='k' && !event.repeat){
      startSpecial();event.preventDefault();
    }
  });
  window.addEventListener('keyup',event=>{const d=keyMap[event.key];if(d)keys[d]=false;});
  window.addEventListener('blur',()=>Object.keys(keys).forEach(d=>keys[d]=false));

  // Los golpes no hacen daño en cada frame: solo al cruzar su instante de impacto.
  function aplicarImpacto() {
    const p=game.player,e=game.enemy;
    if(e.hp<=0)return;
    const especial=p.state===STATE.SPECIAL;
    const tecnica=especial ? config.especial :
      (p.attackStep===1 ? config.ataque.primero : config.ataque.segundo);
    const acierta=especial ?
      Combat.circular(p,e,config.especial.radio) :
      Combat.frontal(p,e,config.ataque.alcance,config.ataque.profundidad,
        config.ladron.semiancho,config.ladron.semiprofundidad);
    if(acierta){
      e.hp=Math.max(0,e.hp-tecnica.dano);
      e.flash=0.18;
      status.textContent=e.hp>0
        ? '¡Impacto! Al ladrón le quedan '+e.hp+' PV.'
        : '¡Ladrón derrotado! Ahora recupera el arroz.';
      if(e.hp===0)objective.textContent='🌾 Recoge el saco de arroz';
    }else{
      status.textContent='Fallaste: revisa orientación, distancia y profundidad.';
    }
  }

  function update(delta) {
    const p=game.player,e=game.enemy;
    game.elapsed+=delta;
    e.flash=Math.max(0,e.flash-delta);
    p.specialCooldown=Math.max(0,p.specialCooldown-delta);
    specialStatus.textContent=p.specialCooldown>0 ?
      Math.ceil(p.specialCooldown)+' s' : 'REMOLÍ';
    specialButton.disabled=p.specialCooldown>0 || p.state===STATE.ATTACK ||
      p.state===STATE.SPECIAL || game.collected;

    if(!game.collected){
      if(p.state===STATE.ATTACK || p.state===STATE.SPECIAL){
        p.stateTime+=delta;
        const tecnica=p.state===STATE.SPECIAL ? config.especial :
          (p.attackStep===1 ? config.ataque.primero : config.ataque.segundo);
        if(!p.impactDone && p.stateTime>=tecnica.impacto){
          p.impactDone=true;
          aplicarImpacto();
        }
        if(p.stateTime>=tecnica.duracion){
          if(p.state===STATE.ATTACK && p.attackStep===1 && p.comboQueued){
            p.attackStep=2;
            p.comboQueued=false;
            p.impactDone=false;
            p.stateTime=0;
            status.textContent='¡Segundo tajo con la otra corbella!';
          }else{
            p.state=STATE.IDLE;
            p.stateTime=0;
          }
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
      if(e.hp===0 && Math.hypot(p.x-config.arroz.x,p.y-config.arroz.y)<config.arroz.radioRecogida){
        game.collected=true;
        objective.textContent='✅ ¡ARRÒS RECUPERAT!';
        status.textContent='¡Victoria! Has completado el entrenamiento de las corbelles.';
      }
    }
    // El estado determina la secuencia; el tiempo determina el frame.
    if(p.state!==p.lastAnimationState){
      p.animationTime=0;
      p.lastAnimationState=p.state;
    }else{
      p.animationTime+=delta;
    }
    // Caminar más rápido también acelera el ciclo, sin cambiar la velocidad del juego.
    const walkFps=clamp(WALK_SPRITE.fps*Number(speedInput.value)/config.personaje.velocidad,5,14);
    if(p.state===STATE.IDLE){
      const frame=Animacion.frame(p.animationTime,IDLE_SPRITE.fps,IDLE_SPRITE.cantidad);
      animationLabel.textContent='Sprite: IDLE '+(frame+1)+'/4';
    }else if(p.state===STATE.WALK){
      const frame=Animacion.frame(p.animationTime,walkFps,WALK_SPRITE.cantidad);
      const version=useNewWalk.checked && walkV2SpriteReady() ? 'nuevo' : 'anterior';
      animationLabel.textContent='Sprite: WALK '+version+' '+(frame+1)+'/6';
    }else{
      animationLabel.textContent='Sprite: '+p.state+' (provisional)';
    }

    coordinates.textContent=`Posición: ${Math.round(p.x)}, ${Math.round(p.y)}`;
    stateLabel.textContent='Estado: '+p.state+(p.state===STATE.ATTACK?' '+p.attackStep:'');
    comboLabel.textContent=p.state===STATE.ATTACK ?
      (p.comboQueued?'Combo: 2.º en cola':'Combo: '+p.attackStep+'/2'):'Combo: —';
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

  // Dibujo provisional: una corbella por mano (mango + hoja curva).
  // El arte definitivo será un spritesheet, no código geométrico.
  function drawCorbella(hx,hy,angle,sentido) {
    ctx.save();
    ctx.translate(hx,hy);
    ctx.rotate(angle);
    ctx.strokeStyle='#885a35';
    ctx.lineWidth=6;
    ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(0,-27);ctx.stroke();
    ctx.strokeStyle='#d9e5e1';ctx.lineWidth=7;
    ctx.beginPath();
    ctx.moveTo(0,-27);
    ctx.quadraticCurveTo(sentido*29,-60,sentido*30,-15);
    ctx.stroke();
    ctx.strokeStyle='#647d80';ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(0,-27);
    ctx.quadraticCurveTo(sentido*29,-60,sentido*30,-15);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(){
    const p=game.player;

    // IDLE y WALK usan sprites reales; ATTACK y SPECIAL siguen usando Canvas.
    // Conservamos el mismo rectángulo y punto de anclaje en ambos estados,
    // de manera que el cambio de animación no mueve al personaje de lugar.
    const usingIdle=p.state===STATE.IDLE && idleSpriteReady();
    const usingWalk=p.state===STATE.WALK && (walkSpriteReady() || walkV2SpriteReady() || walkV3SpriteReady());
    if(usingIdle || usingWalk){
      const sprite=usingIdle?IDLE_SPRITE:WALK_SPRITE;
      const imagen=usingIdle?idleImage:walkImageSeleccionada();
      if(!imagen.complete || imagen.naturalWidth !== sprite.ancho*sprite.cantidad)return;
      const fps=usingIdle?sprite.fps:
        clamp(sprite.fps*Number(speedInput.value)/config.personaje.velocidad,5,14);
      const frame=Animacion.frame(p.animationTime,fps,sprite.cantidad);
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.scale(p.facing,1);
      // La posición del jugador está en los pies; el sprite se dibuja arriba.
      ctx.drawImage(
        imagen,
        frame*sprite.ancho,0,
        sprite.ancho,sprite.alto,
        -64,-148,128,148
      );
      ctx.restore();
      ctx.fillStyle='#fff0bb';ctx.font='bold 13px system-ui';ctx.textAlign='center';
      ctx.fillText('LLAURADOR',p.x,p.y-159);
      return;
    }
    const {x,y,facing,walking,state}=p;
    const walk=state===STATE.WALK;
    const step=walk?Math.sin(walking)*7:0;
    const breath=state===STATE.IDLE?Math.sin(game.elapsed*4)*2:0;
    const active=state===STATE.ATTACK || state===STATE.SPECIAL;
    const cfg=state===STATE.SPECIAL?config.especial:
      (p.attackStep===1?config.ataque.primero:config.ataque.segundo);
    const phase=active?Math.min(p.stateTime/cfg.duracion,1):0;
    const bend=active?Math.sin(phase*Math.PI)*6:0;

    ellipse(x,y,31,9,'#59472f66');
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(facing,1); // la silueta completa gira mirando a la izquierda

    // Piernas flexionadas y espardenyes: centro de gravedad bajo.
    ctx.strokeStyle='#405467';ctx.lineWidth=12;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-8,-47);ctx.lineTo(-26,-22-step);ctx.lineTo(-17,0);ctx.stroke();
    ctx.beginPath();ctx.moveTo(10,-47);ctx.lineTo(34,-25+step);ctx.lineTo(38,0);ctx.stroke();
    ctx.strokeStyle='#e4c78d';ctx.lineWidth=8;
    ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(-29,0);
    ctx.moveTo(38,0);ctx.lineTo(51,0);ctx.stroke();

    // Torso de faena inclinado hacia delante (forma propia, no copia).
    ctx.fillStyle='#e8d8ae';ctx.beginPath();
    ctx.moveTo(-23,-87+breath);ctx.lineTo(16,-93+breath);
    ctx.lineTo(37+bend,-65);ctx.lineTo(12,-45);
    ctx.lineTo(-24,-55);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#b29b76';ctx.lineWidth=3;ctx.stroke();
    ctx.strokeStyle='#af343f';ctx.lineWidth=11;
    ctx.beginPath();ctx.moveTo(-12,-52);ctx.lineTo(19,-49);ctx.stroke();

    // Cabeza adelantada y barret de palla.
    ellipse(24+bend,-103+breath,22,21,'#e3b587');
    rect(0+bend,-124+breath,49,9,'#b99559');
    rect(8+bend,-140+breath,32,17,'#b99559');
    ctx.font='bold 21px system-ui';ctx.fillStyle='#2c3b33';ctx.textAlign='center';
    ctx.fillText('•̀ᴗ•́',27+bend,-98+breath);

    // Brazos abiertos, cada uno empuña una corbella.
    ctx.strokeStyle='#e3b587';ctx.lineWidth=11;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-13,-72);ctx.lineTo(-37,-49);ctx.stroke();
    ctx.beginPath();ctx.moveTo(15,-73);ctx.lineTo(53+bend,-51);ctx.stroke();
    const rotationOne=state===STATE.ATTACK && p.attackStep===1 ?
      -0.85+phase*2.35 : (state===STATE.SPECIAL?phase*Math.PI*3:-0.15);
    const rotationTwo=state===STATE.ATTACK && p.attackStep===2 ?
      0.85-phase*2.35 : (state===STATE.SPECIAL?-phase*Math.PI*3:0.18);
    drawCorbella(55+bend,-47,rotationOne,1);
    drawCorbella(-37,-44,rotationTwo,-1);

    if(state===STATE.ATTACK){
      ctx.strokeStyle='#ffe5a2';ctx.lineWidth=5;
      ctx.beginPath();
      if(p.attackStep===1)ctx.arc(45,-58,57,-1.0,1.0);
      else ctx.arc(-29,-56,53,2.2,4.3);
      ctx.stroke();
    }else if(state===STATE.SPECIAL){
      ctx.strokeStyle='#d8faf1';ctx.lineWidth=5;
      ctx.beginPath();
      ctx.arc(0,-58,77,phase*6,-0.1+phase*6+Math.PI*1.4);
      ctx.stroke();
      ctx.strokeStyle='#ffda89';ctx.lineWidth=3;
      ctx.beginPath();
      ctx.arc(0,-58,63,-phase*7,1.8-phase*7);ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle='#fff0bb';ctx.font='bold 13px system-ui';ctx.textAlign='center';
    ctx.fillText('LLAURADOR',x,y-159);
  }

  // Visualizamos sobre el torso la geometría que usa el combate.
  // El desplazamiento vertical -70 es únicamente visual; en lógica
  // las dos cajas se calculan sobre la posición de los pies.
  function drawHitboxes() {
    const p=game.player, e=game.enemy, a=config.ataque, l=config.ladron;
    const xInicio=p.facing>0?p.x-12:p.x-a.alcance;
    const ancho=a.alcance+12;
    const yCentro=p.y-70;
    ctx.save();
    ctx.setLineDash([7,5]);
    ctx.fillStyle='rgba(245,199,77,.18)';
    ctx.fillRect(xInicio,yCentro-a.profundidad,ancho,2*a.profundidad);
    ctx.strokeStyle='#ffe077';
    ctx.lineWidth=2;
    ctx.strokeRect(xInicio,yCentro-a.profundidad,ancho,2*a.profundidad);
    if(e.hp>0){
      ctx.fillStyle='rgba(242,85,109,.16)';
      ctx.fillRect(e.x-l.semiancho,e.y-70-l.semiprofundidad,2*l.semiancho,2*l.semiprofundidad);
      ctx.strokeStyle='#f65e80';
      ctx.strokeRect(e.x-l.semiancho,e.y-70-l.semiprofundidad,2*l.semiancho,2*l.semiprofundidad);
    }
    if(p.state===STATE.SPECIAL){
      ctx.strokeStyle='#4ef1ed';
      ctx.beginPath();ctx.arc(p.x,p.y-70,config.especial.radio,0,Math.PI*2);ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.font='bold 12px system-ui';
    ctx.textAlign='left';
    ctx.fillStyle='#574014';
    ctx.fillText('HITBOX',xInicio,yCentro-a.profundidad-8);
    ctx.restore();
  }

  function render(){
    background();drawRice();
    // Renderizamos primero al personaje más alejado (eje Y).
    if(game.enemy.y<game.player.y){drawEnemy();drawPlayer();}else{drawPlayer();drawEnemy();}
    if(debugHitboxes.checked)drawHitboxes();
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