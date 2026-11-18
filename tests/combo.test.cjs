const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('src/combo.js','utf8'),sandbox);
vm.runInNewContext(fs.readFileSync('src/config.js','utf8'),sandbox);
const Combo=sandbox.window.Combo;
const pasos=sandbox.window.CONFIG.ataque.movimientos;
assert.equal(pasos.map(p=>p.id).join(','),'izquierda,derecha,patada,descendente');
assert.equal(pasos.length,4);
assert.equal(pasos.reduce((n,p)=>n+p.dano,0),5);
for(const paso of pasos)assert(paso.duracion>paso.impacto && paso.impacto>0,paso.id+' impacto dentro del golpe');
let paso=1, enCola=0;
for(let i=0;i<8;i++)enCola=Combo.encolar(paso,enCola,pasos.length);
assert.equal(enCola,3,'cola limitada a tres golpes pendientes');
for(let esperado=2;esperado<=4;esperado++){
  const siguiente=Combo.siguiente(paso,enCola,pasos.length);
  assert(siguiente,'hay golpe pendiente');paso=siguiente.paso;enCola=siguiente.enCola;
  assert.equal(paso,esperado);
}
assert.equal(enCola,0);
assert.equal(Combo.siguiente(paso,enCola,pasos.length),null);
assert.equal(Combo.siguiente(1,0,4),null);
console.log('Pruebas del combo de cuatro movimientos superadas.');
