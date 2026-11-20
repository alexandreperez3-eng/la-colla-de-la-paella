const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Ejecuta el mismo bucle y los mismos manejadores que index.html, con reloj manual.
const elementos = new Map();
const contexto = new Proxy({}, {get(obj, key) {
  if (key === 'measureText') return () => ({width:100});
  if (key === 'createLinearGradient') return () => ({addColorStop() {}});
  return () => {};
}});
function elemento(id) {
  if (!elementos.has(id)) elementos.set(id, {
    dataset:{}, textContent:'', checked:true, classList:{add(){}, remove(){}},
    getContext:() => contexto, addEventListener(tipo, fn){this[tipo]=fn;}
  });
  return elementos.get(id);
}
let frame;
const direcciones = ['up','down','left','right'].map(dir => {
  const boton = elemento(dir);
  boton.dataset.move = dir;
  return boton;
});
const mundo = {Image:class {}, document:{querySelector:elemento, querySelectorAll:()=>direcciones},
  addEventListener(){}, requestAnimationFrame(fn){frame=fn;}};
mundo.window=mundo;
let jugador, tiempo=0;
const enemigos=new Set();
const avisos=[];
const html=fs.readFileSync('index.html','utf8');
for(const [,ruta] of html.matchAll(/<script src="([^"?]+)/g)){
  vm.runInNewContext(fs.readFileSync(ruta,'utf8'),mundo);
  if(ruta.endsWith('/pesol.js')){
    const ai=mundo.Pesol;
    mundo.Pesol={...ai,avanzar(e,p,...args){
      enemigos.add(e);
      jugador=p;
      const previo=e.state;
      const resultado=ai.avanzar(e,p,...args);
      if(previo!==e.state && e.state==='PRE_ATTACK')avisos.push(tiempo);
      return resultado;
    }};
  }
}
function avanzar(n){
  for(let i=0;i<n;i++)frame(tiempo+=1000/60);
}
const objetivo=()=>elemento('#objective').textContent;
const pulsar=id=>elemento(id).pointerdown({preventDefault(){}});
avanzar(60);
const x=jugador.x;
pulsar('right');
avanzar(12);
pulsar('#attack');
assert(jugador.x>x);
assert.equal(jugador.state,'ATTACK');
elemento('right').pointercancel();
avanzar(2400);
assert.match(objetivo(),/vencido/);
assert(avisos.length>=6);
assert(avisos.slice(1).every((t,i)=>t-avisos[i]>=770));
elemento('#reset').click();
enemigos.clear();
avanzar(65);
assert.equal(jugador.hp,mundo.CONFIG.personaje.vida);
assert.equal(enemigos.size,2);

// Dos delante, ambos dentro del arco y con estados independientes.
const [a,b]=enemigos;
for(const [i,e] of [a,b].entries()){
  e.x=jugador.x+75;
  e.y=jugador.y+(i?22:-22);
}
pulsar('#attack');
avanzar(14);
assert.deepEqual([a.hp,b.hp],[1,1]);
avanzar(5);
a.x=jugador.x-60;
b.x=jugador.x+65;
pulsar('#special');
avanzar(31);
assert.deepEqual([a.hp,b.hp],[0,0]);
assert.match(objetivo(),/1 superada/);
avanzar(151);
assert.match(objetivo(),/Oleada 2\/3/);

// Otra partida por las entradas normales: acercarse, orientar, agrupar, recoger.
elemento('#reset').click();
enemigos.clear();
avanzar(2);
const objetivos=new Set();
let maxVivos=0;
for(let t=0;t<1000;t++){
  objetivos.add(objetivo());
  if(objetivo().includes('RECUPERAT'))break;
  const distancia=e=>Math.hypot(e.x-jugador.x,e.y-jugador.y);
  const vivos=[...enemigos].filter(e=>e.hp>0).sort((a,b)=>distancia(a)-distancia(b));
  maxVivos=Math.max(maxVivos,vivos.length);
  const e=vivos[0], destino=e||mundo.CONFIG.arroz;
  const dx=destino.x-jugador.x, dy=destino.y-jugador.y;
  for(const d of direcciones)d.pointerup();
  if(Math.abs(dx)>(e?95:12)||(e&&jugador.facing*dx<0))pulsar(dx>0?'right':'left');
  if(Math.abs(dy)>(e?28:8))pulsar(dy>0?'down':'up');
  if(vivos.filter(e=>distancia(e)<128).length>=2 && !jugador.specialCooldown && jugador.state==='IDLE'){
    pulsar('#special');
  }else if(e && jugador.facing*dx>=0 && Math.abs(dx)<136 && Math.abs(dy)<49){
    pulsar('#attack');
  }
  avanzar(6);
}
assert.match(objetivo(),/RECUPERAT/);
assert(objetivos.has('Oleada 2 superada'));
assert(objetivos.has('Tres oleadas superadas · Recoge el arroz'));
assert.equal(enemigos.size,9);
assert(maxVivos>=2 && maxVivos<=3);
const m=mundo.Mision.crear();
m.oleada=3;
for(let i=0;i<500;i++)mundo.Mision.avanzar(m,jugador,.02,mundo.CONFIG);
assert.equal(m.enemigos.length,3);
assert.equal(mundo.Mision.pendientes(m),1);
m.enemigos[0].hp=0;
mundo.Mision.avanzar(m,jugador,.02,mundo.CONFIG);
assert.equal(m.enemigos.length,4);
console.log('Misión: nueve Pèsols, multigolpe frontal y radial, controles, derrota, reinicio y victoria en '+jugador.hp+' PV.');
