/* 03N: feedback de impacto independiente de la lógica de combate.
   Funciones puras, probables sin navegador. */
window.Feedback=Object.freeze({
  repartirDelta(delta,restante){
    const d=Math.max(0,delta);
    const detenido=Math.min(d,Math.max(0,restante));
    return {accion:d-detenido,restante:Math.max(0,restante-detenido)};
  },
  intensidad(restante,duracion){
    if(duracion<=0)return 0;
    const f=Math.max(0,Math.min(1,restante/duracion));
    return f*f;
  },
  sacudida(restante,duracion,amplitud){
    if(restante<=0 || duracion<=0)return {x:0,y:0};
    const fraccion=Math.min(1,restante/duracion);
    const tiempo=duracion-restante;
    return {x:Math.sin(tiempo*240+1)*amplitud*fraccion,
      y:Math.sin(tiempo*173+2)*amplitud*.45*fraccion};
  }
});
