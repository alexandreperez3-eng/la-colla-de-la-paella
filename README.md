# La Colla de la Paella 🥘

**Paso 03E — Combo jugable de cuatro movimientos (versión provisional).**

## Nuevo combo del Llaurador

Pulsa **COMBO ×4** cuatro veces: `corbella izquierda → corbella derecha → patada frontal → doble corte cruzado`.

| Paso | Golpe | Duración | Impacto | Daño | Efecto |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | Corbellada izquierda | 0,25 s | 0,09 s | 1 | Estela descendente |
| 2 | Corbellada derecha | 0,28 s | 0,11 s | 1 | Estela ascendente |
| 3 | Patada frontal | 0,32 s | 0,15 s | 1 | Pierna extendida y retroceso de 26 px |
| 4 | Creuament de Corbelles | 0,45 s | 0,20 s | 2 | Dos estelas en X y retroceso de 38 px |

El ladrón de entrenamiento dispone de 10 PV: **dos combos completos** bastan para derrotarlo si todos los golpes conectan. Se mantiene el Remolí especial, con 6 s de recarga.

## Controles y encadenado

- **Tablet:** cruceta, botón **COMBO ×4** y botón **REMOLÍ**.
- **Ordenador:** flechas/WASD, **J**/espacio para el combo, **K** para el especial.
- Puedes pulsar **cuatro veces rápido**: las entradas se almacenan en una cola limitada a los tres movimientos siguientes. No se puede encolar indefinidamente ni ejecutar un quinto golpe.
- Con menos pulsaciones, el personaje termina el golpe actual y regresa a guardia.
- **Mostrar hitboxes** sigue mostrando el alcance; el golpe 3 tiene un alcance ligeramente inferior y el cuarto algo mayor.
- **Estelas de ataque** permite ocultar o mostrar los efectos provisionales.
- **WALK con cara corregida** mantiene la comparación v2/v3 del ciclo de caminar.

## Animación provisional

El personaje parte del sprite **IDLE aprobado** para los cuatro golpes; así conserva la cabeza, el barret, la faixa y el escuradents. Canvas añade las estelas y una pierna animada para la patada. **Todavía no son spritesheets definitivos de ataque**: hay que revisar visualmente el movimiento de los brazos y las piernas antes de aprobar el arte.

El antiguo spritesheet experimental de ATTACK 1 permanece en `assets/llaurador_attack_1.png`, sin utilizarse en el nuevo combo, para no perder versiones.

## Código que estudiar

- `src/config.js`: datos de las cuatro técnicas; duración, impacto, daño, alcance y retroceso.
- `src/combo.js`: lógica pura del buffer de entradas, `encolar()` y `siguiente()`.
- `src/game.js`: `startAttack()`, `update()`, `aplicarImpacto()` y `drawComboEffects()`.
- `src/combat.js`: detección de colisiones, independiente de los efectos gráficos.

El daño se aplica **una única vez** por movimiento al cruzar su instante de impacto; las estelas son efectos visuales y no proyectiles. No se ha modificado la lógica del Remolí.

## Pruebas

`npm test` ejecuta pruebas de los cuatro movimientos, límites de cola, impactos configurados, combate, animación y validación de sprites existentes.

### Qué revisar jugando

1. Pulsa cuatro veces rápidamente: debe ejecutar izquierda, derecha, patada y doble X, sin repetir.
2. Pulsa solo una, dos o tres veces: debe detenerse donde corresponda.
3. Comprueba cada movimiento mirando a derecha e izquierda, sin que cambie el tamaño de la cara.
4. Verifica el retroceso del enemigo en la patada y remate, sin daño por cada frame.
5. Prueba Remolí, hitboxes, el ciclo WALK y recuperación del arroz.

**Siguiente fase:** sprites de ataque definitivos frame a frame, después de aprobar el ritmo y las mecánicas de este prototipo.

## Paso 03F — Primer tajo con sprites reales

Se ha preparado **`assets/llaurador_attack_izquierda.png`**, un nuevo atlas PNG transparente con cuatro poses de 112 × 128 px (448 × 128 px en total), alineado con IDLE/WALK. Ahora el primer golpe puede mostrar una preparación, el arma recogida, el tajo y la recuperación. El impacto sigue a los **0,09 segundos** y el golpe dura **0,25 segundos**.

En la interfaz se ha añadido **«Corbellada izquierda: sprite nuevo»** (activado por defecto). Desmárcalo para volver al efecto Canvas anterior sin alterar la secuencia de cuatro golpes ni sus estadísticas. La estela cortante se puede activar o desactivar independientemente.

**Control de calidad:** este atlas es una primera versión artística que hay que revisar a resolución real: aunque mantiene sombrero, barba, escuradents y vestuario, las proporciones del rostro aún pueden diferir ligeramente del IDLE aprobado. No se han cambiado los tres movimientos restantes ni el Remolí.

La función pura `Animacion.framePorMarcas()` permite sincronizar el tercer fotograma del tajo con el instante de impacto, manteniendo un ritmo de poses no uniforme.
