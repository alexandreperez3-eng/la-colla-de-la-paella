/* LECCIÓN 1: cambia la velocidad y observa cómo responde el personaje. */
window.CONFIG = {
  anchura: 900,
  altura: 480,
  personaje: {
    velocidad: 245,
    xInicial: 120,
    yInicial: 365,
    vida: 6
  },
  limites: {izquierda: 30, derecha: 870, arriba: 284, abajo: 444},
  arroz: {x: 745, y: 369, radioRecogida: 53},
  // Primer esbirro: poco resistente, rápido, con cabotada anunciada.
  pesol: {x: 535, y: 365, vida: 2, semiancho: 27, semiprofundidad: 13,
    velocidad: 148, deteccion: 460, distanciaAtaque: 63, carrilAtaque: 38,
    preparacion: 0.34, duracionAtaque: 0.38, instanteImpacto: 0.19,
    embestida: 178, alcance: 67, recuperacion: 0.52, aturdimiento: 0.32},
  ataque: {
    // Cuatro pulsaciones: izquierda, derecha, patada, remate descendente.
    movimientos: [
      {id:'izquierda', nombre:'Corbellada izquierda', duracion:0.25, impacto:0.09, dano:1, alcance:116},
      {id:'derecha', nombre:'Corbellada derecha', duracion:0.28, impacto:0.11, dano:1, alcance:116},
      {id:'patada', nombre:'Patada frontal', duracion:0.32, impacto:0.15, dano:1, alcance:95, retroceso:26},
      {id:'descendente', nombre:'Doble corbellada descendent', duracion:0.45, impacto:0.20, dano:2, alcance:128, retroceso:38}
    ],
    alcance: 116, // alcance frontal desde el origen del jugador
    profundidad: 38 // margen en carril Y; la hurtbox del enemigo añade su semiprofundidad
  },
  // Parámetros visuales del remate; no alteran la hitbox ni el daño.
  feedbackRemate: {pausa:0.075, sacudida:0.18, destello:0.18, amplitud:6},
  especial: {
    duracion: 0.75,
    impacto: 0.39,
    dano: 2,
    radio: 135,
    recarga: 6
  }
};