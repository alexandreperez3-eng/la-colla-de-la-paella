// Paso 03C: comprobar que el atlas WALK tiene seis celdas y transparencia.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ruta='assets/llaurador_walk.png';
const png=fs.readFileSync(ruta);
assert.equal(png.subarray(1,4).toString('ascii'),'PNG','el recurso es PNG');
assert.equal(png.readUInt32BE(16),112*6,'ancho = seis fotogramas de 112 px');
assert.equal(png.readUInt32BE(20),128,'altura de una única fila de sprites');
assert.ok(png.includes(Buffer.from('tRNS')),'el fondo está definido como transparente');
console.log('Sprite WALK: 6 frames de 112 x 128 y transparencia verificados.');
