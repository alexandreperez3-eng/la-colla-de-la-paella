/* Paso 03R: seis pasos sin halo residual, sin tocar el IDLE ni los ataques. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const path='assets/llaurador_walk_alternado_03r.png';
const png=fs.readFileSync(path),old=fs.readFileSync('assets/llaurador_walk_alternado_03q.png');
assert(!png.equals(old),'el PNG de 03R tiene que ser nuevo, no sólo cambiar la ruta');
assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'firma PNG');
let pos=8,w=0,h=0,depth=0,color=0,alpha=null;
const zipped=[];
while(pos<png.length){
  const len=png.readUInt32BE(pos),type=png.toString('ascii',pos+4,pos+8);
  const chunk=png.subarray(pos+8,pos+8+len);pos+=len+12;
  if(type==='IHDR'){w=chunk.readUInt32BE(0);h=chunk.readUInt32BE(4);depth=chunk[8];color=chunk[9];}
  if(type==='tRNS')alpha=chunk;
  if(type==='IDAT')zipped.push(chunk);
  if(type==='IEND')break;
}
assert.equal(w,6*208,'6 celdas de 208 px');
assert.equal(h,160,'altura estándar del pack');
assert.equal(depth,8);
assert.equal(color,3,'PNG indexado');
assert(alpha&&zipped.length,'paleta con transparencia real');
const raw=zlib.inflateSync(Buffer.concat(zipped));
const boxes=Array.from({length:6},()=>({minX:999,maxX:0,minY:999,maxY:0,pixels:0,halo:0}));
const hashes=Array.from({length:6},()=>crypto.createHash('sha256'));
let cursor=0,prev=Buffer.alloc(w);
for(let y=0;y<h;y++){
  const type=raw[cursor++],row=Buffer.alloc(w);
  for(let x=0;x<w;x++){
    const a=x?row[x-1]:0,b=prev[x],c=x?prev[x-1]:0;
    let predictor=0;
    if(type===1)predictor=a;
    else if(type===2)predictor=b;
    else if(type===3)predictor=Math.floor((a+b)/2);
    else if(type===4){
      const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);
      predictor=da<=db&&da<=dc?a:db<=dc?b:c;
    }else assert.equal(type,0,'filtro PNG compatible');
    const index=(raw[cursor++]+predictor)&255;
    row[x]=index;
    const i=Math.floor(x/208),localX=x%208,opacity=alpha[index]??255;
    hashes[i].update(Buffer.from([index,opacity]));
    if(opacity>80){
      const box=boxes[i];
      box.minX=Math.min(box.minX,localX);box.maxX=Math.max(box.maxX,localX);
      box.minY=Math.min(box.minY,y);box.maxY=Math.max(box.maxY,y);box.pixels++;
      assert(localX>0&&localX<207,'sin cortes laterales');
    }else if(opacity>0)boxes[i].halo++;
  }
  prev=row;
}
for(const [i,box] of boxes.entries()){
  assert(box.pixels>1200,'fotograma visible '+i);
  assert(box.minY>=18&&box.minY<=32,'sombrero alineado '+i);
  assert(box.maxY>=149&&box.maxY<=154,'pies anclados '+i);
  assert(box.halo<35,'sin borde translúcido extendido '+i);
}
assert.equal(new Set(hashes.map(h=>h.digest('hex'))).size,6,'seis fotogramas distintos');
const game=fs.readFileSync('src/game.js','utf8');
assert(game.includes('assets/llaurador_walk_alternado_03r.png?v=03r'),'motor carga PNG nuevo');
assert(game.includes('usingNewWalk?WALK_ALTERNADO_SPRITE'),'motor usa seis fotogramas');
assert(game.includes('const usingNewIdle='),'guardia original sigue intacta');
console.log('03R: WALK nuevo, 6 poses, limpieza de alfa, 208x160, pies y cabeza alineados.');
