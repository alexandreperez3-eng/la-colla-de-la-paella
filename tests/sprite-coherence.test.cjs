/* Regresión 03I: uniformidad de paleta y ausencia de recorte en el frame izquierdo 3. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const zlib=require('node:zlib');
function decode(path){
  const b=fs.readFileSync(path);let pos=8,w=0,h=0,pal,trns;const chunks=[];
  assert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  while(pos<b.length){
    const len=b.readUInt32BE(pos),t=b.toString('ascii',pos+4,pos+8);
    const v=b.subarray(pos+8,pos+8+len);pos+=12+len;
    if(t==='IHDR'){w=v.readUInt32BE(0);h=v.readUInt32BE(4);assert.equal(v[9],3,'indexado');}
    if(t==='PLTE')pal=v;if(t==='tRNS')trns=v;if(t==='IDAT')chunks.push(v);
    if(t==='IEND')break;
  }
  const raw=zlib.inflateSync(Buffer.concat(chunks));
  const rgba=new Uint8Array(w*h*4);
  let prev=Buffer.alloc(w);
  let k=0,tot=[0,0,0],n=0;
  for(let y=0;y<h;y++){
    const filter=raw[k++],line=Buffer.alloc(w);
    for(let x=0;x<w;x++){
      const a=x?line[x-1]:0,up=prev[x],c=x?prev[x-1]:0;
      let pred=0;
      if(filter===1)pred=a;
      else if(filter===2)pred=up;
      else if(filter===3)pred=Math.floor((a+up)/2);
      else if(filter===4){const p=a+up-c,da=Math.abs(p-a),db=Math.abs(p-up),dc=Math.abs(p-c);pred=da<=db&&da<=dc?a:db<=dc?up:c;}
      else assert.equal(filter,0,'filtro reconocido');
      const idx=(raw[k++]+pred)&255;line[x]=idx;
      const o=(y*w+x)*4,alpha=trns?.[idx]??255;
      rgba[o]=pal[3*idx];rgba[o+1]=pal[3*idx+1];rgba[o+2]=pal[3*idx+2];rgba[o+3]=alpha;
      if(alpha>200){for(let c=0;c<3;c++)tot[c]+=rgba[o+c];n++;}
    }prev=line;
  }
  return {w,h,rgba,mean:tot.map(t=>t/n)};
}
const idle=decode('assets/llaurador_idle.png');
const left=decode('assets/llaurador_attack_izquierda.png');
const right=decode('assets/llaurador_attack_derecha.png');
assert.equal(idle.w,448);assert.equal(idle.h,128);
for(const [label,sprite] of [['izquierda',left],['derecha',right]]){
  assert.equal(sprite.w,448,label+' 4 frames 112px');
  assert.equal(sprite.h,128,label+' alto');
  for(let c=0;c<3;c++)assert(Math.abs(sprite.mean[c]-idle.mean[c])<12,label+' canal RGB '+c);
}
for(let y=0;y<128;y++){
  const offset=(y*left.w+335)*4;
  assert(left.rgba[offset+3]<80,'Recorte en borde derecho del tercer frame izquierdo, y='+y);
}
console.log('Paleta próxima al IDLE, transparencia y margen izquierdo del tajo verificados.');
