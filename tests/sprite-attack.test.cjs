const assert=require('node:assert/strict');
const fs=require('node:fs');
const filename='assets/llaurador_attack_1.png';
const data=fs.readFileSync(filename);
assert(data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Firma PNG correcta');
assert.equal(data.readUInt32BE(16),4*112,'4 fotogramas de ataque');
assert.equal(data.readUInt32BE(20),128,'Altura del sprite');
assert(data[25]===6 || data.includes(Buffer.from('tRNS')),'Transparencia');
console.log('Sprites ATTACK 1: 4 celdas de 112×128 con transparencia.');
