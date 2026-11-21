const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const sandbox={window:{},Math};sandbox.window=sandbox;
for(const f of ['src/config.js','src/pesol.js','src/mission.js'])
  vm.runInNewContext(fs.readFileSync(f,'utf8'),sandbox);
const M=sandbox.Mision,cfg=sandbox.CONFIG;
let m=M.crear(),p={x:120,y:365};
for(let i=0;i<900;i++)M.avanzar(m,p,.016,cfg);
assert.equal(m.fase,'avance','no hay oleadas por tiempo');
assert.equal(m.enemigos.length,0,'sin enemigos antes del punto de activación');
p.x=639;M.avanzar(m,p,.016,cfg);assert.equal(m.fase,'avance');
p.x=640;M.avanzar(m,p,.016,cfg);
assert.equal(m.fase,'combate');assert.equal(m.enemigos.length,2);
assert.equal(M.limiteX(m),1040,'no puede avanzar por la calle durante el combate');
for(const e of m.enemigos) sandbox.Pesol.recibirGolpe(e,9,1,0,cfg.limites,cfg.pesol);
M.avanzar(m,p,.016,cfg);
assert.equal(m.fase,'tira-li');assert.equal(m.completados,1);
assert.equal(M.limiteX(m),M.anchoMundo-45,'camino abierto después del combate');
p.x=1106;M.avanzar(m,p,.016,cfg);assert.equal(m.fase,'avance');
p.x=1579;M.avanzar(m,p,.016,cfg);assert.equal(m.fase,'avance');
p.x=1580;M.avanzar(m,p,.016,cfg);
assert.equal(m.fase,'combate');assert.equal(m.enemigos.length,3);
assert.equal(M.limiteX(m),2010);
const a=m.enemigos[0],b=m.enemigos[1];a.x=b.x=1730;a.y=b.y=365;
M.separar(m.enemigos,.04,cfg);
assert(Math.hypot(a.x-b.x,a.y-b.y)>0,'enemigos separados');
for(const e of m.enemigos)sandbox.Pesol.recibirGolpe(e,9,1,0,cfg.limites,cfg.pesol);
M.avanzar(m,p,.016,cfg);assert.equal(m.fase,'tira-li');
p.x=2076;M.avanzar(m,p,.016,cfg);assert.equal(m.fase,'avance');
p.x=2520;M.avanzar(m,p,.016,cfg);assert.equal(m.fase,'final');
assert.equal(m.completados,2);
assert.equal(M.crear().completados,0,'reinicio de los encuentros');
assert(m.camara>0 && m.camara<=M.anchoMundo-900,'cámara en límites');

// Integración del juego real sin navegador (Canvas e imágenes simuladas).
const elementos=new Map(),direcciones=['up','down','left','right'];
const ctx=new Proxy({}, {get(_o,k){
  if(k==='measureText')return()=>({width:160});
  if(k==='createLinearGradient')return()=>({addColorStop(){}});
  return()=>{};
}});
function elemento(id){
  if(!elementos.has(id))elementos.set(id,{
    dataset:{},checked:true,value:245,textContent:'',
    classList:{add(){},remove(){}},
    getContext(){return ctx},
    addEventListener(t,f){this[t]=f;}
  });
  return elementos.get(id);
}
for(const d of direcciones)elemento(d).dataset.move=d;
let frame,tiempo=0,actual,heroe;
const mundo={Image:class {complete=false;naturalWidth=0;naturalHeight=0;},
  document:{querySelector:elemento,querySelectorAll:()=>direcciones.map(elemento)},
  addEventListener(){},requestAnimationFrame(f){frame=f;}};
mundo.window=mundo;
const html=fs.readFileSync('index.html','utf8');
for(const [,ruta] of html.matchAll(/<script src="([^"?]+)/g)){
  vm.runInNewContext(fs.readFileSync(ruta,'utf8'),mundo);
  if(ruta.endsWith('mission.js')){
    const base=mundo.Mision;
    mundo.Mision={...base,avanzar(m,p,...args){actual=m;heroe=p;return base.avanzar(m,p,...args);}};
  }
}
assert.equal(typeof frame,'function','bucle gráfico arrancado');
function pasos(n){for(let i=0;i<n;i++)frame(tiempo+=1000/60);}
const boton=d=>elemento(d);
const pulsar=d=>boton(d).pointerdown({preventDefault(){},pointerId:1});
pasos(2);const inicio=heroe.x;
pulsar('right');pasos(137);
assert(heroe.x>inicio && actual.fase==='combate','el movimiento activa el primer encuentro');
assert.equal(actual.enemigos.length,2);
for(const [i,e] of actual.enemigos.entries()){e.x=heroe.x+75;e.y=heroe.y+(i?20:-20);}
pulsar('#attack');pasos(9);
assert.deepEqual(Array.from(actual.enemigos,e=>e.hp),[1,1],'la misma corbellada alcanza a varios');
pasos(5);
assert.deepEqual(Array.from(actual.enemigos,e=>e.hp),[1,1],'un solo daño por golpe');
for(const e of actual.enemigos)mundo.Pesol.recibirGolpe(e,9,1,0,mundo.CONFIG.limites,mundo.CONFIG.pesol);
pasos(1);
assert.equal(actual.fase,'tira-li');
assert.match(boton('#objective').textContent,/TIRA-LI/);
pasos(160);assert.equal(actual.fase,'avance');
let intentos=0;
while(actual.fase==='avance' && intentos++<200)pasos(1);
assert.equal(actual.fase,'combate','segundo encuentro activado por la posición');
assert.equal(actual.enemigos.length,3);
for(const e of actual.enemigos)mundo.Pesol.recibirGolpe(e,9,1,0,mundo.CONFIG.limites,mundo.CONFIG.pesol);
pasos(1);assert.equal(actual.fase,'tira-li');
pasos(290);assert.match(boton('#objective').textContent,/completat/);
assert(html.includes('src/avenida.js') && html.indexOf('src/avenida.js')<html.indexOf('src/game.js'));
const motor=fs.readFileSync('src/game.js','utf8');
assert(motor.includes('Mision.limiteX(m)')&&motor.includes("ctx.translate(-game.mission.camara,0)"));
assert(motor.includes('pesol_cabut_atlas_04c.png?v=04c'),'sprites aprobados intactos');
boton('#reset').click();pasos(2);
assert.equal(actual.fase,'avance');assert.equal(actual.enemigos.length,0);
assert.equal(heroe.hp,mundo.CONFIG.personaje.vida);
console.log('Acto 1.1: triggers por avance, bloqueo, cámara, multigolpe, TIRA-LI, final y reinicio.');