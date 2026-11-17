const assert=require('node:assert/strict');
const fs=require('node:fs');
const zlib=require('node:zlib');
const png=fs.readFileSync('assets/llaurador_patada.png');
assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PNG válido');
let pos=8,w=0,h=0,trns=null;const pieces=[];
while(pos<png.length){
  const len=png.readUInt32BE(pos),type=png.toString('ascii',pos+4,pos+8);
  const data=png.subarray(pos+8,pos+8+len);pos+=len+12;
  if(type==='IHDR'){
    w=data.readUInt32BE(0);h=data.readUInt32BE(4);
    assert.equal(data[8],8);assert.equal(data[9],3,'PNG indexado de 8 bits');
  }else if(type==='tRNS')trns=data;
  else if(type==='IDAT')pieces.push(data);
  if(type==='IEND')break;
}
assert.equal(w,576,'4 celdas de 144 px');assert.equal(h,128);assert(trns,'fondo transparente');
const raw=zlib.inflateSync(Buffer.concat(pieces));
const maxX=[-1,-1,-1,-1],bottom=[-1,-1,-1,-1];let extendedFoot=0;
let k=0,previous=Buffer.alloc(w);
for(let y=0;y<h;y++){
  const filter=raw[k++],row=Buffer.alloc(w);
  for(let x=0;x<w;x++){
    const a=x?row[x-1]:0,b=previous[x],c=x?previous[x-1]:0;
    let prediction=0;
    if(filter===1)prediction=a;
    else if(filter===2)prediction=b;
    else if(filter===3)prediction=Math.floor((a+b)/2);
    else if(filter===4){
      const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);
      prediction=da<=db&&da<=dc?a:db<=dc?b:c;
    }else assert.equal(filter,0,'Filtro PNG válido');
    row[x]=(raw[k++]+prediction)&255;
    if((trns[row[x]]??255)>100){
      const frame=Math.floor(x/144),localX=x%144;
      assert(localX>0&&localX<143,'sprite cortado en el borde: '+frame);
      maxX[frame]=Math.max(maxX[frame],localX);
      bottom[frame]=Math.max(bottom[frame],y);
      if(frame===2&&localX>=120&&y>=42&&y<=68)extendedFoot++;
    }
  }
  previous=row;
}
assert.equal(bottom.join(','),'122,122,122,122','pies alineados');
assert(maxX[2]>=maxX[0]+12,'tercer frame muestra patada extendida');
assert(extendedFoot>=5,'espardenya extendida visible');
const src=fs.readFileSync('src/game.js','utf8');
assert(src.includes('attackStep===3')&&src.includes('kickSpriteReady()'));
assert(src.includes('config.ataque.movimientos[2].impacto'),'pose de impacto sincronizada');
console.log('PATADA: sprites, pies, extensión e impacto verificados.');
