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
  ladron: {x: 530, y: 365, vida: 6, semiancho: 22, semiprofundidad: 14},
  ataque: {
    primero: {duracion: 0.34, impacto: 0.14, dano: 1},
    segundo: {duracion: 0.43, impacto: 0.20, dano: 2},
    alcance: 116, // alcance frontal desde el origen del jugador
    profundidad: 38 // margen en carril Y; la hurtbox del enemigo añade su semiprofundidad
  },
  especial: {
    duracion: 0.75,
    impacto: 0.39,
    dano: 2,
    radio: 135,
    recarga: 6
  }
};