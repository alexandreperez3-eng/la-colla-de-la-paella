/* Paso 03M: sprite de remate descendente sin tocar las reglas del combate. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const zlib=require('node:zlib');
const b=fs.readFileSync('assets/llaurador_remate_descendente_03m.png');
assert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'firma PNG');
let pos=8,w=0,h=0,depth=0,color=0,pal=null,trans=null;
const data=[];
while(pos<b.length){
  const n=b.readUInt32BE(pos),type=b.toString('ascii',pos+4,pos+8),v=b.subarray(pos+8,pos+8+n);
  pos+=n+12;
  if(type==='IHDR'){w=v.readUInt32BE(0);h=v.readUInt32BE(4);depth=v[8];color=v[9];}
  if(type==='PLTE')pal=v;
  if(type==='tRNS')trans=v;
  if(type==='IDAT')data.push(v);
  if(type==='IEND')break;
}
assert.equal(w,832,'4 celdas de 208px');
assert.equal(h,160,'altura compatible con el atlas');
assert.equal(depth,8);
assert.equal(color,3,'PNG de paleta indexada');
assert(pal&&trans&&data.length,'paleta, transparencia y pixels');
const raw=zlib.inflateSync(Buffer.concat(data));
let idx=0,prev=Buffer.alloc(w);
const visible=Array(4).fill(0),foot=Array(4).fill(-1),border=Array(4).fill(0),goldFront=Array(4).fill(0);
for(let y=0;y<h;y++){
  const filter=raw[idx++],row=Buffer.alloc(w);
  for(let x=0;x<w;x++){
    const a=x?row[x-1]:0,u=prev[x],c=x?prev[x-1]:0;
    let pred=0;
    if(filter===1)pred=a;
    else if(filter===2)pred=u;
    else if(filter===3)pred=Math.floor((a+u)/2);
    else if(filter===4){const p=a+u-c,da=Math.abs(p-a),du=Math.abs(p-u),dc=Math.abs(p-c);pred=da<=du&&da<=dc?a:du<=dc?u:c;}
    else assert.equal(filter,0,'filtro PNG esperado');
    const paletteIndex=(raw[idx++]+pred)&255;
    row[x]=paletteIndex;
    const alpha=trans[paletteIndex]??255;
    if(alpha>80){
      const f=Math.floor(x/208),lx=x%208;
      visible[f]++;foot[f]=y;
      if(lx===0||lx===207)border[f]++;
      const rgb=paletteIndex*3,r=pal[rgb],g=pal[rgb+1],blue=pal[rgb+2];
      if(lx>=128 && r>210&&g>145&&g<245&&blue<190)goldFront[f]++;
    }
  }
  prev=row;
}
for(let i=0;i<4;i++){
  assert(visible[i]>3500,'pose '+(i+1)+' visible');
  assert.equal(border[i],0,'fotograma '+(i+1)+' sin recorte lateral');
  assert(foot[i]>=150&&foot[i]<=159,'pies a la misma altura '+(i+1));
}
assert(goldFront[2]>600,'la doble estela se ve delante en el fotograma de impacto');
assert(goldFront[2]>2*goldFront[1],'el efecto principal se concentra en impacto');
const game=fs.readFileSync('src/game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const config=fs.readFileSync('src/config.js','utf8');
assert(game.includes("assets/llaurador_remate_descendente_03m.png?v=03m"),'el juego carga el nuevo recurso');
assert(game.includes('COMBO_MARCAS[p.attackStep-1]'),'instante del fotograma de impacto conservado');
assert(game.includes('!usingDescending && frame===2'),'sin dibujar la antigua X encima');
assert(config.includes("id:'descendente'") && config.includes('impacto:0.20') && config.includes('alcance:128'),'lógica del cuarto ataque intacta');
assert(html.includes('id="descendente-sprite"'),'comparador de versiones');
console.log('Paso 03M: 4 poses, transparencia, recortes, impacto frontal y conexión verificados.');
