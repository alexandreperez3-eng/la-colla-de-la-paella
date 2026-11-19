/* Paso 04B: seis pasos auténticos y atlas sin papel blanco entre las piernas. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),zlib=require('node:zlib'),crypto=require('node:crypto');
const updated=fs.readFileSync('assets/pesol_cabut_atlas_04b.png');
const prior=fs.readFileSync('assets/pesol_cabut_atlas_04a.png');
assert(!updated.equals(prior),'el PNG debe cambiar de verdad');
assert(updated.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PNG válido');
let width=0,height=0,depth=0,color=0,palette=null,alpha=null;
let pointer=8;const deflated=[];
while(pointer<updated.length){
  const len=updated.readUInt32BE(pointer),type=updated.toString('ascii',pointer+4,pointer+8);
  const bytes=updated.subarray(pointer+8,pointer+8+len);pointer+=12+len;
  if(type==='IHDR'){width=bytes.readUInt32BE(0);height=bytes.readUInt32BE(4);depth=bytes[8];color=bytes[9];}
  if(type==='PLTE')palette=bytes;
  if(type==='tRNS')alpha=bytes;
  if(type==='IDAT')deflated.push(bytes);
  if(type==='IEND')break;
}
assert.equal(width,6*128);assert.equal(height,5*112);
assert.equal(depth,8);assert.equal(color,3);assert(palette&&alpha,'paleta con transparencia real');
const inflated=zlib.inflateSync(Buffer.concat(deflated));
let offset=0,prev=Buffer.alloc(width);
const hashes=Array.from({length:6},()=>crypto.createHash('sha256'));
const footsteps=Array.from({length:6},()=>({shoeX:0,shoeN:0,pixels:0,white:0,minY:999,maxY:0}));
for(let y=0;y<height;y++){
  const type=inflated[offset++],row=Buffer.alloc(width);
  for(let x=0;x<width;x++){
    const a=x?row[x-1]:0,b=prev[x],c=x?prev[x-1]:0;
    let predictor=0;
    if(type===1)predictor=a;
    else if(type===2)predictor=b;
    else if(type===3)predictor=Math.floor((a+b)/2);
    else if(type===4){const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);
      predictor=da<=db&&da<=dc?a:db<=dc?b:c;}
    else assert.equal(type,0,'filtro PNG conocido');
    const index=(inflated[offset++]+predictor)&255;
    row[x]=index;
    const localY=y%112,localX=x%128,rowNo=Math.floor(y/112),frame=Math.floor(x/128);
    const opacity=alpha[index]??255;
    const r=palette[index*3],g=palette[index*3+1],bl=palette[index*3+2];
    if(opacity>200 && localY>=84 && r>173 && g>162 && bl>132 && r-g<48)
      assert.fail(`restos de papel blanco en fila ${rowNo}, fotograma ${frame}, x=${localX}, y=${localY}`);
    if(rowNo!==1)continue;
    hashes[frame].update(Buffer.from([r,g,bl,opacity]));
    const f=footsteps[frame];
    if(opacity>125){f.pixels++;f.minY=Math.min(f.minY,localY);f.maxY=Math.max(f.maxY,localY);}
    if(opacity>190 && localY>=84 && r>100 && r>g*1.1 && g>bl*1.12){f.shoeN++;f.shoeX+=localX;}
  }
  prev=row;
}
assert.equal(new Set(hashes.map(h=>h.digest('hex'))).size,6,'seis poses distintas');
for(const [i,f] of footsteps.entries()){
  assert(f.pixels>2000,`personaje visible en pose ${i}`);
  assert(f.minY>=38&&f.minY<=48,`altura coherente con IDLE (${i})`);
  assert(f.maxY>=102&&f.maxY<=105,`pies al suelo (${i})`);
  assert(f.shoeN>50,`calzado visible (${i})`);
}
const centroids=footsteps.map(f=>f.shoeX/f.shoeN);
assert(Math.max(...centroids)-Math.min(...centroids)>8,'las patas cambian de posición, no solo el cuerpo');
const game=fs.readFileSync('src/game.js','utf8');
assert(game.includes('pesol_cabut_atlas_04'),'Canvas carga un atlas del Pèsol');
assert(game.includes('Pesol.pose(e)'),'misma máquina de estados y selección de frames');
console.log('04B: transparencias limpias en 19 poses, marcha de 6 pasos, escala y anclaje OK.');