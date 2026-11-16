// Pruebas sin dependencias: node tests/combat.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const code = fs.readFileSync('src/combat.js', 'utf8');
const sandbox = {window: {}, Math};
vm.runInNewContext(code, sandbox);
const Combat = sandbox.window.Combat;
const hero = {x:100, y:350, facing:1};

assert.equal(Combat.frontal(hero,{x:170,y:360},94,40),true,'enemigo delante y cerca');
assert.equal(Combat.frontal(hero,{x:205,y:350},94,40),false,'enemigo fuera del alcance');
assert.equal(Combat.frontal(hero,{x:170,y:402},94,40),false,'enemigo fuera de la calle Y');
assert.equal(Combat.frontal(hero,{x:40,y:350},94,40),false,'enemigo detrás');
assert.equal(Combat.frontal({...hero,facing:-1},{x:40,y:350},94,40),true,'girar cambia la dirección de ataque');
assert.equal(Combat.circular(hero,{x:10,y:350},135),true,'especial puede alcanzar detrás');
assert.equal(Combat.circular(hero,{x:250,y:350},135),false,'especial tiene radio limitado');

// Paso 03A.1: las corbelles alcanzan la superficie del enemigo, no solo su centro.
const alcance=116, profundidad=38, ancho=22, fondo=14;
assert.equal(Combat.frontal(hero,{x:238,y:350},alcance,profundidad,ancho,fondo),true,
  'límite frontal: la hoja roza la hurtbox del ladrón');
assert.equal(Combat.frontal(hero,{x:240,y:350},alcance,profundidad,ancho,fondo),false,
  'fuera de alcance aunque la distancia sea pequeña');
assert.equal(Combat.frontal(hero,{x:140,y:402},alcance,profundidad,ancho,fondo),true,
  'bordes de carril Y solapados');
assert.equal(Combat.frontal(hero,{x:140,y:403},alcance,profundidad,ancho,fondo),false,
  'sin solapamiento de carril Y');
assert.equal(Combat.frontal({...hero,facing:-1},{x:-38,y:350},alcance,profundidad,ancho,fondo),true,
  'alcance idéntico mirando a izquierda');
assert.equal(Combat.frontal(hero,{x:60,y:350},alcance,profundidad,ancho,fondo),false,
  'enemigo situado detrás, sin colisión frontal');
console.log('13 comprobaciones de combate superadas.');
