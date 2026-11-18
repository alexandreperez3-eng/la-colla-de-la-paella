// PASO 03J: atlas 4x4 del lote coherente, sin mezclar otros rostros.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const zlib=require('node:zlib');
const png=fs.readFileSync('assets/llaurador_combo_pack_03j.png');
assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Firma PNG');
let pos=8,width=0,height=0,pal=null,trans=null;const compressed=[];
while(pos<png.length){
  const len=png.readUInt32BE(pos),type=png.toString('ascii',pos+4,pos+8);
  const value=png.subarray(pos+8,pos+8+len);pos+=len+12;
  if(type==='IHDR'){
    width=value.readUInt32BE(0);height=value.readUInt32BE(4);
    assert.equal(value[8],8,'8 bits por canal de índice');
    assert.equal(value[9],3,'Paleta indexada');
  }else if(type==='PLTE')pal=value;
  else if(type==='tRNS')trans=value;
  else if(type==='IDAT')compressed.push(value);
  if(type==='IEND')break;
}
assert.equal(width,208*4,'cuatro columnas');
assert.equal(height,160*4,'cuatro filas');
assert(pal&&trans&&compressed.length,'paleta, transparencia y píxeles');
const raw=zlib.inflateSync(Buffer.concat(compressed));
const visible=new Array(16).fill(0);
const edge=new Array(16).fill(0);
const lastRow=new Array(16).fill(-1);
let cursor=0,previous=Buffer.alloc(width);
for(let y=0;y<height;y++){
  const filter=raw[cursor++],line=Buffer.alloc(width);
  for(let x=0;x<width;x++){
    const a=x?line[x-1]:0,b=previous[x],c=x?previous[x-1]:0;
    let p=0;
    if(filter===1)p=a;
    else if(filter===2)p=b;
    else if(filter===3)p=Math.floor((a+b)/2);
    else if(filter===4){
      const predictor=a+b-c,da=Math.abs(predictor-a),db=Math.abs(predictor-b),dc=Math.abs(predictor-c);
      p=da<=db&&da<=dc?a:db<=dc?b:c;
    }else assert.equal(filter,0,'filtro PNG compatible');
    const idx=(raw[cursor++]+p)&255;line[x]=idx;
    const alpha=trans[idx]??255;
    if(alpha>80){
      const col=Math.floor(x/208),row=Math.floor(y/160),n=row*4+col;
      visible[n]++;
      lastRow[n]=Math.max(lastRow[n],y%160);
      if(x%208===0||x%208===207)edge[n]++;
    }
  }
  previous=line;
}
for(let i=0;i<16;i++){
  assert(visible[i]>100,'frame '+i+' visible');
  assert.equal(edge[i],0,'frame '+i+' sin corte en bordes laterales');
  assert(lastRow[i]>=145&&lastRow[i]<=159,'frame '+i+' pies anclados');
}
const game=fs.readFileSync('src/game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert(game.includes('COMBO_PACK')&&game.includes('unifiedPackImage'),'el atlas se carga en Canvas');
assert(game.includes('(p.attackStep-1)*COMBO_PACK.alto'),'cada ataque ocupa su fila');
assert(game.includes('COMBO_MARCAS[p.attackStep-1]'),'cada ataque sincroniza el impacto');
assert(html.includes('id="combo-pack"'),'comparador activable');
console.log('Pack 03J: 16 frames 208x160, transparencia, márgenes y conexión al combo correctos.');
