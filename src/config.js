/* LECCIÓN 1: cambia la velocidad y observa cómo responde el personaje. */
window.CONFIG = {
  anchura: 900,
  altura: 480,
  personaje: {
    velocidad: 210,
    xInicial: 120,
    yInicial: 365
  },
  limites: {izquierda: 30, derecha: 870, arriba: 284, abajo: 444},
  arroz: {x: 745, y: 369, radioRecogida: 53},
  ladron: {x: 530, y: 365, vida: 3},
  ataque: {
    duracion: 0.36,       // segundos que dura la animación de ataque
    instanteImpacto: 0.13,// cuándo se comprueba si golpeamos
    alcance: 105,         // distancia horizontal
    profundidad: 37       // distancia máxima en el eje Y
  }
};