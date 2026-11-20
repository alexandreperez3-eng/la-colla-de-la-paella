const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const archivos = ['config', 'combat', 'horta'];
function cargar(contexto, scripts) {
  for (const archivo of scripts) {
    vm.runInContext(fs.readFileSync('src/' + archivo + '.js', 'utf8'), contexto, {filename:archivo + '.js'});
  }
}
const contexto = vm.createContext({});
contexto.window = contexto;
cargar(contexto, archivos);
const {Combat, Horta} = contexto;
const disposicion = [
  {tipo:'caixa', x:200, y:365, premio:'vida'},
  {tipo:'cabas', x:120, y:365, premio:'remoli'},
  {tipo:'gerra', x:590, y:365, premio:'vida'}
];
const estado = Horta.crear(disposicion);
const jugador = {x:140, y:365, facing:1, hp:6, specialCooldown:0};

const frontal = o => Combat.frontal(jugador, o, 116, 38, o.semiancho, o.semiprofundidad);
const circular = o => Combat.circular(jugador, o, 135);
jugador.x = 160;
Horta.golpear(estado, frontal, 1, 0);
assert.equal(estado.objetos[0].estado, 'dañado');
assert.equal(estado.objetos[0].hp, 1);
assert.equal(estado.objetos[1].hp, 1, 'el capazo queda fuera del cono frontal');
assert.equal(estado.recompensas.length, 0);
Horta.golpear(estado, circular, 2, 1);
Horta.golpear(estado, circular, 2, 2);
assert.equal(estado.objetos[0].estado, 'roto');
assert.equal(estado.objetos[1].estado, 'roto', 'el Remolí golpea también a la espalda');
assert.equal(estado.objetos[2].estado, 'intacto', 'se respeta el radio');
assert.equal(estado.recompensas.length, 2, 'cada objeto suelta como máximo un premio');

jugador.x = 200;
assert.equal(Horta.recoger(estado, jugador, 6, 3), '', 'reserva el premio con la vida llena');
jugador.hp = 4;
jugador.x = 226;
assert.equal(Horta.recoger(estado, jugador, 6, 3), '', 'fuera del radio de recogida');
jugador.x = 225;
assert.equal(Horta.recoger(estado, jugador, 6, 3), '+2 PV');
assert.equal(jugador.hp, 6);
jugador.hp = 5;
Horta.recoger(estado, jugador, 6, 4);
assert.equal(jugador.hp, 5, 'el premio recogido no se reaplica');

jugador.x = 120;
assert.equal(Horta.recoger(estado, jugador, 6, 4), '', 'reserva el premio con Remolí listo');
jugador.specialCooldown = 1.8;
assert.equal(Horta.recoger(estado, jugador, 6, 4), 'REMOLÍ PREPARAT');
assert.equal(jugador.specialCooldown, 0);
assert.equal(estado.recompensas.length, 0);
Horta.limpiarEfectos(estado, 6);
assert.equal(estado.efectos.length, 0);
const reiniciado = Horta.crear(disposicion);
assert.equal(reiniciado.objetos[0].hp, 2);
assert.equal(reiniciado.recompensas.length, 0);

// Ejecuta el bucle real con un reloj controlado y comprueba lo que llega al Canvas.
const dibujados = new Map();
const premiosVisibles = new Set();
let proximoFrame;
let tiempo = 0;
const nada = () => {};
const canvas = new Proxy({}, {
  get: (_, metodo) => metodo === 'createLinearGradient' ? () => ({addColorStop:nada}) : nada
});
function elemento() {
  const handlers = new Map();
  return {
    checked:true,
    getContext:() => canvas,
    addEventListener:(tipo, fn) => handlers.set(tipo, fn),
    pulsar:tipo => handlers.get(tipo)({preventDefault:nada})
  };
}
const elementos = new Map();
contexto.document = {
  querySelector(id) {
    if (!elementos.has(id)) elementos.set(id, elemento());
    return elementos.get(id);
  },
  querySelectorAll:() => []
};
contexto.Image = class {};
contexto.requestAnimationFrame = callback => { proximoFrame = callback; };
contexto.addEventListener = nada;
contexto.HortaRender = {
  objeto:(_, o) => dibujados.set(o.tipo, o.hp),
  recompensa:(_, r) => premiosVisibles.add(r.premio),
  efectos:nada
};
contexto.CONFIG.horta = [
  {tipo:'caixa', x:170, y:365, premio:'vida'},
  {tipo:'cabas', x:120, y:342, premio:'remoli'}
];
contexto.CONFIG.pesol.x = 200;
cargar(contexto, ['animation', 'combo', 'feedback', 'remate', 'pesol', 'game']);

function avanzar(frames) {
  for (let frame = 0; frame < frames; frame++) {
    dibujados.clear();
    premiosVisibles.clear();
    proximoFrame(tiempo += 16);
  }
}

elementos.get('#attack').pulsar('pointerdown');
avanzar(9);
assert.equal(dibujados.get('caixa'), 1);
assert.match(elementos.get('#status').textContent, /7 PV/, 'el mismo golpe alcanza caja y Pèsol');
avanzar(4);
assert.equal(dibujados.get('caixa'), 1, 'los siguientes frames del mismo golpe no repiten daño');
elementos.get('#attack').pulsar('pointerdown');
avanzar(16);
assert.equal(dibujados.has('caixa'), false, 'el siguiente golpe del combo sí puede romperla');
assert.equal(premiosVisibles.has('vida'), true);
avanzar(10);
elementos.get('#reset').pulsar('click');
avanzar(2);
assert.equal(dibujados.get('caixa'), 2);
assert.equal(premiosVisibles.size, 0);
elementos.get('#special').pulsar('pointerdown');
avanzar(28);
assert.equal(dibujados.size, 0, 'un Remolí rompe dos objetos a la vez');
assert.equal(premiosVisibles.has('remoli'), false, 'el premio desaparece al recogerlo');
assert.equal(premiosVisibles.has('vida'), true);
assert.equal(elementos.get('#special-status').textContent, '3 s', 'recarga reducida tres segundos');
console.log('Horta: alcance, resistencia, daño único, combo, premios, recarga y reinicio.');
