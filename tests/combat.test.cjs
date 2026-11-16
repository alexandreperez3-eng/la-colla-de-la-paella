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

console.log('7 comprobaciones de combate superadas.');
