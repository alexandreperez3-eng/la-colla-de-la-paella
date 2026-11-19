/* Paso 04C: el nuevo WALK cambia las botas sin alterar IDLE, combate, HURT y KO. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),zlib=require('node:zlib'),crypto=require('node:crypto');
function decode(file){
  const png=fs.readFileSync(file);
  assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PNG válido');
  let at=8,w,h,depth,color,palette,transparency;const data=[];
  while(at<png.length){
    const length=png.readUInt32BE(at),type=png.toString('ascii',at+4,at+8);
    const chunk=png.subarray(at+8,at+8+length);at+=length+12;
    if(type==='IHDR'){w=chunk.readUInt32BE(0);h=chunk.readUInt32BE(4);depth=chunk[8];color=chunk[9];}
    if(type==='PLTE')palette=chunk;
    if(type==='tRNS')transparency=chunk;
    if(type==='IDAT')data.push(chunk);
    if(type==='IEND')break;
  }
  assert.equal(w,768);assert.equal(h,560);assert.equal(depth,8);assert.equal(color,3);
  assert(palette&&transparency,'PNG indexado transparente');
  const raw=zlib.inflateSync(Buffer.concat(data));
  let pos=0,prev=Buffer.alloc(w);const pixels=Buffer.alloc(w*h);
  for(let y=0;y<h;y++){
    const filter=raw[pos++],row=Buffer.alloc(w);
    for(let x=0;x<w;x++){
      const a=x?row[x-1]:0,b=prev[x],c=x?prev[x-1]:0;
      let pred=0;
      if(filter===1)pred=a;
      else if(filter===2)pred=b;
      else if(filter===3)pred=Math.floor((a+b)/2);
      else if(filter===4){const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);
        pred=da<=db&&da<=dc?a:db<=dc?b:c;}
      else assert.equal(filter,0);
      row[x]=(raw[pos++]+pred)&255;
    }
    row.copy(pixels,y*w);prev=row;
  }
  return {png,pixels,palette,transparency,w,h};
}
const before=decode('assets/pesol_cabut_atlas_04b.png');
const after=decode('assets/pesol_cabut_atlas_04c.png');
assert(!before.png.equals(after.png),'el recurso del WALK debe cambiar');
assert(before.palette.equals(after.palette),'paleta original intacta');
assert(before.transparency.equals(after.transparency),'alfa original intacta');
for(let y=0;y<560;y++){
  if(y>=112&&y<224)continue;
  assert(before.pixels.subarray(y*768,(y+1)*768).equals(
    after.pixels.subarray(y*768,(y+1)*768)),
  `fila ${y}: no deben cambiar IDLE, ATTACK, HURT ni KO`);
}
const hashes=[],shoeCenters=[];
for(let frame=0;frame<6;frame++){
  const digest=crypto.createHash('sha256');
  let n=0,minY=999,maxY=0,sx=0,shoes=0,neutral=0;
  for(let y=0;y<112;y++)for(let x=0;x<128;x++){
    const ix=after.pixels[(112+y)*768+frame*128+x];
    const alpha=after.transparency[ix]??255;
    const r=after.palette[ix*3],g=after.palette[ix*3+1],b=after.palette[ix*3+2];
    digest.update(Buffer.from([ix]));
    if(alpha>=120){n++;minY=Math.min(y,minY);maxY=Math.max(y,maxY);}
    if(alpha>195&&y>=87&&r>95&&r>g*1.16&&g>b*1.08){sx+=x;shoes++;}
    if(alpha>200&&y>=91&&r>178&&g>163&&b>132&&r-g<45)neutral++;
  }
  hashes.push(digest.digest('hex'));
  assert(n>=2500,`WALK ${frame}: personaje visible`);
  assert(minY>=34&&minY<=43&&maxY>=101&&maxY<=105,`WALK ${frame}: pies alineados`);
  assert(shoes>70,`WALK ${frame}: botas visibles`);
  assert.equal(neutral,0,`WALK ${frame}: sin papel blanco entre piernas`);
  shoeCenters.push(sx/shoes);
}
assert.equal(new Set(hashes).size,6,'seis poses distintas');
assert(Math.max(...shoeCenters)-Math.min(...shoeCenters)>5,
  'las botas cambian de posición entre fases');
const game=fs.readFileSync('src/game.js','utf8');
assert(game.includes('pesol_cabut_atlas_04c.png?v=04c'),'motor apunta a 04C');
assert(game.includes('Pesol.pose(e)'),'usa la misma IA y el selector de estados');
console.log('04C: seis fases de WALK, piernas activas, paleta idéntica, sin fondo y cuatro estados intactos.');