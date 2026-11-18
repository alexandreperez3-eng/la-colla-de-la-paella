/* Paso 03L: cuatro poses del doble tajo descendente, separadas del efecto X. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const zlib=require('node:zlib');
const img=fs.readFileSync('assets/llaurador_remate_descendente_03l.png');
assert(img.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'PNG válido');
let pos=8,w=0,h=0,depth=0,color=0;
const parts=[];
while(pos<img.length){
 const len=img.readUInt32BE(pos),type=img.toString('ascii',pos+4,pos+8);
 const body=img.subarray(pos+8,pos+8+len);pos+=12+len;
 if(type==='IHDR'){w=body.readUInt32BE(0);h=body.readUInt32BE(4);depth=body[8];color=body[9];}
 if(type==='IDAT')parts.push(body);
 if(type==='IEND')break;
}
assert.equal(w,832,'4 celdas de 208 px');
assert.equal(h,160,'altura compatible con COMBO_PACK');
assert.equal(depth,8);assert.equal(color,6,'RGBA con transparencia');
const raw=zlib.inflateSync(Buffer.concat(parts));
const opaque=[0,0,0,0],bottom=[-1,-1,-1,-1],gold=[0,0,0,0];
let previous=new Uint8Array(w*4),cursor=0;
for(let y=0;y<h;y++){
 const filter=raw[cursor++],row=new Uint8Array(w*4);
 for(let j=0;j<w*4;j++){
  const left=j>=4?row[j-4]:0,up=previous[j],ul=j>=4?previous[j-4]:0;
  let pred=0;
  if(filter===1)pred=left;
  else if(filter===2)pred=up;
  else if(filter===3)pred=Math.floor((left+up)/2);
  else if(filter===4){const p=left+up-ul,da=Math.abs(p-left),db=Math.abs(p-up),dc=Math.abs(p-ul);pred=da<=db&&da<=dc?left:db<=dc?up:ul;}
  else assert.equal(filter,0,'filtro PNG compatible');
  row[j]=(raw[cursor++]+pred)&255;
 }
 for(let x=0;x<w;x++){
  const step=Math.floor(x/208),localX=x%208,o=x*4,a=row[o+3];
  if(a>80){
   opaque[step]++;bottom[step]=y;
   assert(localX>0&&localX<207,'sin recorte lateral: '+step);
   if(localX>=128&&row[o]>210&&row[o+1]>145&&row[o+1]<245&&row[o+2]<190)gold[step]++;
  }
 }
 previous=row;
}
for(let i=0;i<4;i++){assert(opaque[i]>1800,'pose visible '+i);assert(bottom[i]>=150&&bottom[i]<=159,'pies alineados '+i);}
assert(gold[2]>500,'doble estela descendente delante del personaje');
assert(gold[0]<50,'sin estela en preparación');
const game=fs.readFileSync('src/game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert(game.includes('descendingImage')&&game.includes('usingDescending'),'sprite integrado');
assert(game.includes('const origenY=usingDescending?0:'),'fila propia en origen');
assert(game.includes('!usingDescending && frame===2'),'no se superpone X vieja');
assert(html.includes('id="descendente-sprite"'),'selector de comparación');
console.log('Remate descendente: PNG, 4 poses, pies, márgenes, impacto frontal y render OK.');
