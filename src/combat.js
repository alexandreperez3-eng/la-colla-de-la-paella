/*
 Paso 03A: colisiones básicas de combate.
 Funciones puras = mismo resultado para las mismas coordenadas.
 No dibujan ni alteran la vida del enemigo; solo contestan si hay impacto.
*/
window.Combat = Object.freeze({
  // Una corbella cruza una región frontal, no golpea solo el punto central.
  // Consideramos el ancho y la profundidad de la hurtbox del objetivo.
  frontal(player, enemy, alcance, profundidad, semiancho=0, semiprofundidad=0) {
    const inicio = player.facing>0 ? player.x-12 : player.x-alcance;
    const fin = player.facing>0 ? player.x+alcance : player.x+12;
    const enemigoIzquierda = enemy.x-semiancho;
    const enemigoDerecha = enemy.x+semiancho;
    const seSolapanEnX = fin>=enemigoIzquierda && inicio<=enemigoDerecha;
    const seSolapanEnY = Math.abs(enemy.y-player.y)<=profundidad+semiprofundidad;
    return seSolapanEnX && seSolapanEnY;
  },
  circular(player, enemy, radio) {
    return Math.hypot(enemy.x - player.x, enemy.y - player.y) <= radio;
  }
});
