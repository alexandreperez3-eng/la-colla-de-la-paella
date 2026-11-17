const assert=require('node:assert/strict');
const fs=require('node:fs');
const PNG_SIGNATURE=Buffer.from([137,80,78,71,13,10,26,10]);
function png(path,expectedWidth,expectedHeight){
  const data=fs.readFileSync(path);
  assert(data.subarray(0,8).equals(PNG_SIGNATURE),path+' debe ser un PNG');
  assert.equal(data.subarray(12,16).toString(),'IHDR',path+' sin cabecera IHDR');
  assert.equal(data.readUInt32BE(16),expectedWidth,path+' anchura');
  assert.equal(data.readUInt32BE(20),expectedHeight,path+' altura');
  assert(data.includes(Buffer.from('tRNS')) || data[25]===6,path+' debe tener transparencia');
  return data;
}
png('assets/llaurador_idle.png',448,128);
const previous=png('assets/llaurador_walk_v2.png',672,128);
const corrected=png('assets/llaurador_walk_v3.png',672,128);
assert(!previous.equals(corrected),'la corrección debe ser diferente del recurso anterior');
console.log('Sprites IDLE y WALK v2/v3 correctos, con transparencia y celdas de 112x128.');
