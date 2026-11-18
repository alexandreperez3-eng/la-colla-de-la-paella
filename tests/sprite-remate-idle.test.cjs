/* 03P: comprobar que el nuevo remate procede del mismo llaurador.
   Decodifica PNG RGBA e indexado para comparar con el atlas real 03J. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const zlib=require('node:zlib');
function decodePng(path){
  const b=fs.readFileSync(path);
  assert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'firma PNG');
  let pos=8,w=0,h=0,kind=0,depth=0,palette,trans;
  const chunks=[];
  while(pos<b.length){
    const size=b.readUInt32BE(pos),type=b.toString('ascii',pos+4,pos+8);
    const v=b.subarray(pos+8,pos+8+size);pos+=size+12;
    if(type==='IHDR'){w=v.readUInt32BE(0);h=v.readUInt32BE(4);depth=v[8];kind=v[9];}
    else if(type==='PLTE')palette=v;
    else if(type==='tRNS')trans=v;
    else if(type==='IDAT')chunks.push(v);
    else if(type==='IEND')break;
  }
  assert.equal(depth,8);
  assert(kind===3||kind===6,'PNG indexado o RGBA');
  const raw=zlib.inflateSync(Buffer.concat(chunks)),channels=kind===3?1:4;
  const stride=w*channels,pixels=Buffer.alloc(w*h*4);
  let last=Buffer.alloc(stride),offset=0;
  for(let y=0;y<h;y++){
    const filter=raw[offset++],line=Buffer.alloc(stride);
    for(let j=0;j<stride;j++){
      const left=j>=channels?line[j-channels]:0,above=last[j];
      const upperLeft=j>=channels?last[j-channels]:0;
      let predict=0;
      if(filter===1)predict=left;
      else if(filter===2)predict=above;
      else if(filter===3)predict=Math.floor((left+above)/2);
      else if(filter===4){
        const p=left+above-upperLeft;
        const a=Math.abs(p-left),bb=Math.abs(p-above),c=Math.abs(p-upperLeft);
        predict=a<=bb&&a<=c?left:bb<=c?above:upperLeft;
      }else assert.equal(filter,0,'filtro PNG soportado');
      line[j]=(raw[offset++]+predict)&255;
    }
    for(let x=0;x<w;x++){
      const k=(y*w+x)*4;
      if(kind===6){line.copy(pixels,k,x*4,x*4+4);}
      else {
        const idx=line[x];
        pixels[k]=palette[idx*3];pixels[k+1]=palette[idx*3+1];
        pixels[k+2]=palette[idx*3+2];pixels[k+3]=trans?.[idx]??255;
      }
    }
    last=line;
  }
  return {w,h,pixels};
}
function pixel(img,x,y){
  const k=(y*img.w+x)*4;
  return img.pixels.subarray(k,k+4);
}
const sprite=decodePng('assets/llaurador_remate_desde_idle_03p.png');
const atlas=decodePng('assets/llaurador_combo_pack_03j.png');
assert.equal(sprite.w,832);assert.equal(sprite.h,160);
assert.equal(atlas.w,832);assert.equal(atlas.h,640);
const visible=[0,0,0,0],foot=[-1,-1,-1,-1],borders=[0,0,0,0];
let silhouetteEqual=0,nearColor=0,referenceOpaque=0,golden=0;
for(let y=0;y<160;y++)for(let x=0;x<832;x++){
  const n=Math.floor(x/208),lx=x%208;
  const p=pixel(sprite,x,y);
  if(p[3]>80){
    visible[n]++;foot[n]=Math.max(foot[n],y);
    if(lx===0||lx===207)borders[n]++;
    if(n===2&&lx>=128&&p[0]>205&&p[1]>137&&p[1]<247&&p[2]<200)golden++;
  }
  if(n===0){
    const a=pixel(atlas,lx,y);
    if((p[3]>80)===(a[3]>80))silhouetteEqual++;
    if(a[3]>80){
      referenceOpaque++;
      if(Math.abs(p[0]-a[0])<12 && Math.abs(p[1]-a[1])<12 &&
        Math.abs(p[2]-a[2])<12)nearColor++;
    }
  }
}
for(let n=0;n<4;n++){
  assert(visible[n]>1600,'cuatro poses reales '+n);
  assert(foot[n]>=148&&foot[n]<=159,'pies apoyados '+n);
  assert.equal(borders[n],0,'sin recorte '+n);
}
assert(silhouetteEqual>=.998*208*160,'el reposo comparte la silueta real del pack');
console.log('Diagnóstico paleta IDLE', {nearColor,referenceOpaque,porcentaje:100*nearColor/referenceOpaque,silhouetteEqual});
assert(nearColor>=referenceOpaque*.94,'el reposo mantiene la paleta del pack');
assert(golden>150,'el remate dibuja su doble estela por delante');
const game=fs.readFileSync('src/game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert(game.includes('faithfulDescendingImage.src'));
assert(game.includes('descendingSelectedImage()'));
assert(html.includes('id="remate-fiel"'));
console.log('03P: 4 poses, misma silueta/paleta del IDLE, márgenes y golpe frontal OK.');
