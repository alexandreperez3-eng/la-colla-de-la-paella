/*
 Paso 03B: el estado elige la secuencia, el tiempo elige el fotograma.
 Función pura que podemos probar sin abrir el navegador.
*/
window.Animacion = Object.freeze({
  frame(tiempoSegundos, fotogramasPorSegundo, cantidadFotogramas) {
    if(cantidadFotogramas<=0 || fotogramasPorSegundo<=0)return 0;
    return Math.floor(Math.max(tiempoSegundos,0)*fotogramasPorSegundo)%cantidadFotogramas;
  },
  // A diferencia de IDLE/WALK, un ataque no vuelve al fotograma inicial.
  frameUnico(tiempoSegundos, duracionSegundos, cantidadFotogramas) {
    if(cantidadFotogramas<=0 || duracionSegundos<=0)return 0;
    const progreso=Math.min(Math.max(tiempoSegundos,0)/duracionSegundos,1);
    return Math.min(Math.floor(progreso*cantidadFotogramas),cantidadFotogramas-1);
  }
});
