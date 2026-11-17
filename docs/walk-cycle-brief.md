# Revisión técnica de caminar — llaurador

## Incidencias detectadas por prueba en tablet

1. **Marcha con una pierna arrastrada.** El spritesheet original mantiene prácticamente siempre la misma pierna retrasada. El problema está en las poses, no en el sistema de estados ni en `Animacion.frame`.
2. **Cambio de color entre IDLE y WALK.** WALK procede de otra generación y tenía iluminación más clara y pantalones más violáceos. Corregido en 03C.1 mediante normalización de la paleta (sin recolorear IDLE).

## Referencia visual que manda

- **IDLE aprobado:** `assets/llaurador_idle.png` — color, proporción, ropa y sombreado. No cambiarlo.
- **Primer concepto WALK aprobado:** conservar el carácter, la inclinación y las dos corbelles de ese dibujo; corregir solo las fases de piernas.
- El rostro veterano, la barba, el escuradents, el barret de palla, la faixa roja, las espardenyes y las corbelles deben ser idénticos en todas las secuencias.

## Seis fases que debe tener un ciclo correcto

| Frame | Pie de apoyo | Pie en movimiento | Qué debe verse |
|---|---|---|---|
| 1 | Derecho | Izquierdo atrás | Contacto de talón/antepié, piernas abiertas |
| 2 | Derecho | Izquierdo | Izquierdo despegado y avanzando |
| 3 | Derecho→izquierdo | Izquierdo adelantando | Cruce visible de los pies bajo el cuerpo |
| 4 | Izquierdo | Derecho atrás | Apoyo contrario al frame 1 |
| 5 | Izquierdo | Derecho | Derecho despegado y avanzando |
| 6 | Izquierdo→derecho | Derecho adelantando | Cruce contrario; vuelve al frame 1 |

Cada fotograma tiene que mostrar **una alternancia real de apoyo**; no vale hacer seis variaciones de la misma zancada.

## Restricciones técnicas

- Spritesheet PNG RGBA de 6 × 112 × 128 px, un fotograma por columna.
- Personaje mirando a la derecha, sin fondo y sin bordes de celda.
- Coordenada de los pies estable al cambiar de frame, evitando saltos verticales al recorrer la escena.
- Evitar recortes en piernas, sombreado de distinta intensidad y cambios de vestuario.
- La velocidad del ciclo sigue proporcional a la velocidad de movimiento; no modificar velocidad del jugador, alcance, hitboxes ni daño.

**Estado:** brief de arte para una futura corrección de marcha. La pull request 03C.1 arregla únicamente el problema de color.
