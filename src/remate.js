/* 03P: el cuerpo se toma directamente del atlas 03J, sin recoloración.
   El efecto de las corbelles se dibuja por delante del personaje. */
window.Remate=Object.freeze({
  pose(fotograma){
    const n=Math.max(0,Math.min(3,Math.trunc(fotograma)));
    // Fila 0: IDLE; fila 1: corbellada derecha; fila 3: dos corbelles.
    // Todos los dibujos proceden del mismo pack que el IDLE original.
    const origen=[
      {fila:0,columna:0},
      {fila:1,columna:2},
      {fila:3,columna:1},
      {fila:3,columna:3}
    ];
    return origen[n];
  },
  dibujarEstelas(ctx){
    ctx.save();
    ctx.lineCap='round';
    const arcos=[
      {inicio:[46,-116],control1:[87,-108],control2:[117,-66],fin:[88,-28]},
      {inicio:[61,-120],control1:[105,-99],control2:[133,-62],fin:[106,-27]}
    ];
    for(const a of arcos){
      for(const capa of [
        {ancho:13,color:'rgba(154,74,13,.55)'},
        {ancho:9,color:'#efac39'},
        {ancho:4,color:'#fff2b7'}
      ]){
        ctx.strokeStyle=capa.color;
        ctx.lineWidth=capa.ancho;
        ctx.beginPath();
        ctx.moveTo(...a.inicio);
        ctx.bezierCurveTo(...a.control1,...a.control2,...a.fin);
        ctx.stroke();
      }
    }
    ctx.fillStyle='#fff7d1';
    for(const [x,y] of [[86,-27],[105,-26]]){
      ctx.beginPath();
      ctx.arc(x,y,3,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
});
