/*
 Paso 03B: el estado elige la secuencia, el tiempo elige el fotograma.
 Función pura que podemos probar sin abrir el navegador.
*/
window.Animacion = Object.freeze({
  frame(tiempoSegundos, fotogramasPorSegundo, cantidadFotogramas) {
    if(cantidadFotogramas<=0 || fotogramasPorSegundo<=0)return 0;
    return Math.floor(Math.max(tiempoSegundos,0)*fotogramasPorSegundo)%cantidadFotogramas;
  },
  // El atlas unificado 03J solo contiene una pose de reposo repetida.
  // Damos vida al IDLE con una respiración suave (periodo de 2.4 s),
  // sin regenerar píxeles ni modificar las coordenadas de los pies.
  respiracionIdle(tiempoSegundos) {
    const t=Math.max(0,tiempoSegundos);
    const fase=t*Math.PI*2/2.4;
    const aire=Math.sin(fase);
    return {
      escalaX:1+0.004*aire,
      escalaY:1+0.018*aire
    };
  },
  // A diferencia de IDLE/WALK, un ataque no vuelve al fotograma inicial.
  frameUnico(tiempoSegundos, duracionSegundos, cantidadFotogramas) {
    if(cantidadFotogramas<=0 || duracionSegundos<=0)return 0;
    const progreso=Math.min(Math.max(tiempoSegundos,0)/duracionSegundos,1);
    return Math.min(Math.floor(progreso*cantidadFotogramas),cantidadFotogramas-1);
  },
  // Marcas temporales para fotogramas no uniformes. El tajo pasa al frame de
  // impacto exactamente cuando se evalúa la hitbox, sin cambiar el daño.
  framePorMarcas(tiempoSegundos,marcas) {
    let fotograma=0;
    for(const marca of marcas){
      if(tiempoSegundos>=marca)fotograma++;
      else break;
    }
    return fotograma;
  }
});
