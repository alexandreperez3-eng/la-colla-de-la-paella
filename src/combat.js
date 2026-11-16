/*
 Paso 03A: colisiones básicas de combate.
 Funciones puras = mismo resultado para las mismas coordenadas.
 No dibujan ni alteran la vida del enemigo; solo contestan si hay impacto.
*/
window.Combat = Object.freeze({
  frontal(player, enemy, alcance, profundidad) {
    const adelante = (enemy.x - player.x) * player.facing;
    return adelante >= -12 && adelante <= alcance &&
      Math.abs(enemy.y - player.y) <= profundidad;
  },
  circular(player, enemy, radio) {
    return Math.hypot(enemy.x - player.x, enemy.y - player.y) <= radio;
  }
});
