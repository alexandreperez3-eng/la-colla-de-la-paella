// Evita que vuelva a recortarse la hoja en la tercera pose de la corbellada derecha.
// PNG indexado (paleta, profundidad 8): decodificación sin dependencias externas.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const zlib=require('node:zlib');
const data=fs.readFileSync('assets/llaurador_attack_derecha.png');
assert(data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
let at=8,width=0,height=0,trans=null;const parts=[];
while(at<data.length){
  const len=data.readUInt32BE(at),type=data.toString('ascii',at+4,at+8);
  const value=data.subarray(at+8,at+8+len);at+=len+12;
  if(type==='IHDR'){
    width=value.readUInt32BE(0);height=value.readUInt32BE(4);
    assert.equal(value[8],8,'PNG de 8 bits');
    assert.equal(value[9],3,'PNG de paleta');
  }else if(type==='tRNS')trans=value;
  else if(type==='IDAT')parts.push(value);
  if(type==='IEND')break;
}
assert.equal(width,448);assert.equal(height,128);assert(trans);
const raw=zlib.inflateSync(Buffer.concat(parts));
const rows=[];let pos=0,prev=Buffer.alloc(width);
for(let y=0;y<height;y++){
  const filter=raw[pos++],row=Buffer.alloc(width);
  for(let x=0;x<width;x++){
    const a=x?row[x-1]:0,b=prev[x],c=x?prev[x-1]:0;
    let prediction=0;
    if(filter===1)prediction=a;
    else if(filter===2)prediction=b;
    else if(filter===3)prediction=Math.floor((a+b)/2);
    else if(filter===4){
      const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
      prediction=pa<=pb && pa<=pc?a:pb<=pc?b:c;
    }else assert.equal(filter,0,'Filtro PNG reconocido');
    row[x]=(raw[pos++]+prediction)&255;
  }
  rows.push(row);prev=row;
}
const alpha=(x,y)=>trans[rows[y][x]]??255;
let bladePixels=0;
for(let y=0;y<65;y++){
  assert(alpha(335,y)<80,'Hoja cortada en el borde derecho del frame 3; fila '+y);
  for(let x=329;x<=332;x++)if(alpha(x,y)>100)bladePixels++;
}
assert(bladePixels>=6,'La punta de la hoja debe llegar cerca del borde sin cortarse');
console.log('Corbellada derecha: punta completa, con margen transparente en el tercer frame.');
