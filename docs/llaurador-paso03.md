# Paso 03A · El Llaurador de les dos Corbelles

**Estado:** prototipo funcional para revisión. **Inspiración:** postura baja y agresiva de luchadores arcade clásicos, pero sin reproducir diseños de personajes conocidos.

## Identidad visual

- **Silueta:** espalda curva, cabeza adelantada, centro de gravedad bajo, rodillas flexionadas y brazos abiertos.
- **Armas:** dos **corbelles** curvas, una en cada mano; se ven también cuando está quieto.
- **Vestimenta:** camisa de faena color crema, faixa roja, pantalones azul pizarra, espardenyes y barret de palla. Paleta tierra, trigo, roja y acero.
- **Personalidad:** llaurador impetuoso y heroico; humor de arcade valenciano. No es una copia de Blanka ni comparte su paleta, peinado o movimientos característicos.
- **Nota de arte:** los dibujos Canvas del Paso 03A son una **maqueta vectorial**, no sprites terminados.

## Ficha de juego (valores de prueba)

| Atributo | Valor |
| --- | --- |
| Arquetipo | Melee rápido, corto alcance |
| Velocidad | 245 px/s (eje Y ajustado por perspectiva) |
| Vida de referencia | 6 puntos (a implementar con enemigos activos) |
| Ataque 1 | Corbella derecha, 1 de daño, 0,34 s |
| Ataque 2 | Corbella izquierda, 2 de daño, 0,43 s |
| Cómo encadenar | Pulsar GOLPEAR dos veces durante la primera animación |
| Distancia de ataque | 94 px adelante y ±40 px en profundidad |
| Especial | Remolí de Corbelles: golpe circular de 2 de daño |
| Especial: radio | 135 px |
| Especial: recarga | 6 segundos |
| Enemigo de entrenamiento | 6 PV, quieto en esta lección |

Los números son de **equilibrado provisional**. No son aún estadísticas definitivas del juego.

## Máquina de estados

- `IDLE`: respiración y balanceo de manos.
- `WALK`: las piernas alternan y el personaje conserva una postura encorvada.
- `ATTACK`: la primera corbella golpea en el fotograma de impacto; si se vuelve a pulsar, se **encola el segundo golpe**.
- `SPECIAL`: barrido giratorio con ambas corbelles; se desactiva durante su recarga.

**Regla de diseño:** una animación no equivale a daño constante. El daño se evalúa una sola vez en el instante `impacto`.

## Qué aprender en el código

1. `src/config.js`: la **configuración** define velocidad, daños y tiempos.
2. `src/game.js`: la **máquina de estados** gobierna qué acciones se pueden ejecutar.
3. `src/combat.js`: funciones **puras** de alcance frontal y circular, fáciles de probar.
4. `drawPlayer()`: la silueta y las corbelles se dibujan temporalmente sobre Canvas.

## Criterios de aceptación

- Se ve una corbella distinta en cada mano en IDLE/WALK.
- Dos pulsaciones encadenan dos ataques, sin daño multiplicado por fotograma.
- Fuera de alcance, de orientación o de línea de profundidad no hay impacto.
- El Remolí golpea alrededor del personaje y tiene recarga visible.
- Cuando el ladrón alcanza cero PV, el arroz queda disponible.

## Siguiente paso (03B)

Tras probar el combate y aprobar la silueta, dibujar un *model sheet* original y preparar los spritesheets `idle` (4 fotogramas), `walk` (6), `attack_1` (4), `attack_2` (5) y `special` (6). Sustituir después el dibujo Canvas mediante `drawImage`.

**Ejercicio:** en `src/config.js`, cambia `ataque.segundo.dano` de `2` a `3`. Predice cuántos combos necesitarás para derrotar al ladrón y compruébalo.
