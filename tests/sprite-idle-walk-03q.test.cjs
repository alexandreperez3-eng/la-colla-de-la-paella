const assert=require('node:assert/strict');
const fs=require('node:fs'),zlib=require('node:zlib'),crypto=require('node:crypto');

function verify(path,frames){
  const png=fs.readFileSync(path);
  assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'firma PNG');
  let at=8,w=0,h=0,depth=0,color=0,transparent=null;
  const compressed=[];
  while(at<png.length){
    const len=png.readUInt32BE(at),type=png.toString('ascii',at+4,at+8);
    const data=png.subarray(at+8,at+8+len);
    at+=len+12;
    if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);depth=data[8];color=data[9];}
    if(type==='tRNS')transparent=data;
    if(type==='IDAT')compressed.push(data);
    if(type==='IEND')break;
  }
  assert.equal(w,208*frames);
  assert.equal(h,160);
  assert.equal(depth,8);
  assert.equal(color,3,'PNG de paleta indexada');
  assert(transparent&&compressed.length,'paleta con transparencia');
  const raw=zlib.inflateSync(Buffer.concat(compressed));
  let pos=0,prev=Buffer.alloc(w);
  const bounds=Array.from({length:frames},()=>({x0:999,x1:0,y0:999,y1:0,count:0}));
  const hashes=Array.from({length:frames},()=>crypto.createHash('sha256'));
  for(let y=0;y<h;y++){
    const filter=raw[pos++],row=Buffer.alloc(w);
    for(let x=0;x<w;x++){
      const a=x?row[x-1]:0,b=prev[x],c=x?prev[x-1]:0;
      let pred=0;
      if(filter===1)pred=a;
      else if(filter===2)pred=b;
      else if(filter===3)pred=Math.floor((a+b)/2);
      else if(filter===4){
        const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);
        pred=da<=db&&da<=dc?a:db<=dc?b:c;
      }else assert.equal(filter,0,'filtro PNG');
      const idx=(raw[pos++]+pred)&255;
      row[x]=idx;
      const f=Math.floor(x/208),lx=x%208,alpha=transparent[idx]??255;
      hashes[f].update(Buffer.from([idx,alpha]));
      if(alpha>80){
        const box=bounds[f];box.count++;
        box.x0=Math.min(box.x0,lx);box.x1=Math.max(box.x1,lx);
        box.y0=Math.min(box.y0,y);box.y1=Math.max(box.y1,y);
        assert(lx>0&&lx<207,'sin recorte lateral');
      }
    }
    prev=row;
  }
  for(const [i,b] of bounds.entries()){
    assert(b.count>1000,'sprite visible: '+i);
    assert(b.y1>=149&&b.y1<=154,'pies alineados: '+i);
    assert(b.y0>=12&&b.y0<=36,'cabeza dentro de celda: '+i);
  }
  assert.equal(new Set(hashes.map(h=>h.digest('hex'))).size,frames,'poses distintas');
  return bounds;
}
const idle=verify('assets/llaurador_idle_guardia_03q.png',4);
const walk=verify('assets/llaurador_walk_alternado_03q.png',6);
assert(idle[1].y0>idle[0].y0,'el personaje se agacha en reposo');
assert(walk[0].x0!==walk[1].x0 && walk[1].x0!==walk[2].x0,'posturas de marcha diferentes');
const game=fs.readFileSync('src/game.js','utf8');
assert(game.includes('usingNewIdle?IDLE_GUARDIA_SPRITE'),'nuevo IDLE conectado');
assert(game.includes('usingNewWalk?WALK_ALTERNADO_SPRITE'),'nuevo WALK conectado');
assert(game.includes('usingNewIdle?IDLE_GUARDIA_SPRITE.fps'),'reposo animado');
assert(game.includes('usingNewWalk?walkAlternadoImage'),'marcha conectada');
assert(game.includes('const celdaAncha=usingNewIdle || usingNewWalk'),'misma escala que los ataques');
assert(fs.readFileSync('index.html','utf8').includes('id="combo-pack"'),'selector alternativo');
console.log('03Q: IDLE y WALK, 4 + 6 fotogramas distintos, transparencia, alineación y render.');
