/* Decorado provisional del primer tramo de Sueca, separado de la lógica.
   Coordenadas de mundo y dos profundidades para un parallax suave. */
(() => {
  'use strict';
  const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  function arbol(c,x,y){
    rect(c,x-6,y-32,12,42,'#6e543d');
    for(const [dx,dy,r] of [[-20,-47,24],[15,-59,28],[0,-77,27]]){
      c.beginPath();c.arc(x+dx,y+dy,r,0,Math.PI*2);
      c.fillStyle='#4d8056';c.fill();
      c.beginPath();c.arc(x+dx-5,y+dy-5,Math.max(9,r-12),0,Math.PI*2);
      c.fillStyle='#79a66d';c.fill();
    }
  }
  function edificio(c,x,i){
    const paleta=['#d0ab86','#e9c9a0','#e4ae9b','#aeb9aa','#d9b3a5'];
    const h=[136,160,146,171,153][i%5];
    rect(c,x,273-h,184,h,paleta[i%5]);
    rect(c,x,273-h,184,9,'#f4dfba');
    rect(c,x,273-h-11,184,12,i%2?'#a56b58':'#a87a5c');
    for(let piso=0;piso<2;piso++)for(let hueco=0;hueco<3;hueco++){
      const px=x+26+hueco*53,py=273-h+26+piso*52;
      rect(c,px,py,29,31,'#694e4a');
      rect(c,px+4,py+3,21,24,'#7a9c9e');
      rect(c,px+3,py+28,24,4,'#eacb9d');
      rect(c,px-4,py+25,37,3,'#75675a');
    }
    rect(c,x+65,236,44,37,'#79685c');
    rect(c,x+73,245,28,28,'#496d71');
  }
  function tenderete(c){
    // Punto de salida: mesas de paella e ingredientes, una escena de fiesta.
    rect(c,72,253,285,11,'#f1dfad');
    rect(c,76,265,9,30,'#7e563a');rect(c,342,265,9,30,'#7e563a');
    rect(c,63,231,298,23,'#b94037');
    for(let x=66;x<356;x+=34)rect(c,x,231,18,23,'#efcf93');
    rect(c,116,268,62,8,'#685547');
    c.beginPath();c.ellipse(147,269,39,12,0,0,Math.PI*2);
    c.fillStyle='#3e4139';c.fill();
    c.beginPath();c.ellipse(147,266,32,7,0,0,Math.PI*2);
    c.fillStyle='#e6b849';c.fill();
    rect(c,242,255,52,26,'#a47b4c');
    c.font='bold 18px monospace';c.textAlign='center';
    c.fillStyle='#fff2ca';c.fillText('FESTA DE LA PAELLA',211,248);
    c.font='bold 13px monospace';
    c.fillStyle='#4a4735';c.fillText('SUECA',270,274);
  }
  function dibujar(ctx,camara){
    const ancho=900,alto=480;
    ctx.imageSmoothingEnabled=false;
    const cielo=ctx.createLinearGradient(0,0,0,292);
    cielo.addColorStop(0,'#78aeb3');cielo.addColorStop(1,'#f3c895');
    ctx.fillStyle=cielo;ctx.fillRect(0,0,ancho,alto);
    ctx.beginPath();ctx.arc(782-camara*.07,68,31,0,Math.PI*2);
    ctx.fillStyle='#f7df9b';ctx.fill();
    // Fachadas y horizonte, con una velocidad de desplazamiento distinta.
    ctx.save();ctx.translate(-camara*.74,0);
    for(let i=-1;i<25;i++)edificio(ctx,i*184,i+26);
    ctx.restore();
    ctx.save();ctx.translate(-camara,0);
    rect(ctx,0,270,2680,23,'#9d9d88');
    rect(ctx,0,293,2680,167,'#bba080');
    for(let x=10;x<2690;x+=95)rect(ctx,x,329,54,2,'#d6ba98');
    for(let x=30;x<2690;x+=125)rect(ctx,x,418,76,2,'#9f846d');
    rect(ctx,0,456,2680,24,'#75845b');
    rect(ctx,0,455,2680,3,'#d7c39c');
    // Acera, árboles, farolas y señales a lo largo de la avenida.
    for(let x=520;x<2620;x+=430)arbol(ctx,x,278);
    for(let x=462;x<2640;x+=600){
      rect(ctx,x,216,6,64,'#536e67');
      rect(ctx,x-10,209,26,10,'#e5d8a9');
    }
    tenderete(ctx);
    rect(ctx,1345,237,220,36,'#f5d6a5');
    rect(ctx,1350,241,210,28,'#8f493e');
    ctx.fillStyle='#fff0c5';ctx.font='bold 17px monospace';
    ctx.textAlign='center';ctx.fillText('MESTRE SERRANO',1455,261);
    rect(ctx,2390,222,235,58,'#598378');
    rect(ctx,2400,230,215,42,'#e3d6a2');
    ctx.fillStyle='#365847';ctx.font='bold 16px monospace';
    ctx.fillText('CAP A SALES',2508,247);
    ctx.fillText('→',2510,266);
    ctx.restore();
  }
  window.Avenida=Object.freeze({dibujar});
})();