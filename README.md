# La Colla de la Paella 🥘

**Paso 03D — Primer tajo con sprites reales, en comparación experimental.**

## Qué hemos incorporado

- El primer golpe de corbella (`ATTACK 1`) tiene cuatro poses en `assets/llaurador_attack_1.png` (448×128 px, transparencia).
- Si está activado **ATTACK 1 nuevo (comparar)**, el juego utiliza el nuevo spritesheet. Si se desactiva, mantiene el dibujo de Canvas anterior. `ATTACK 2` y `SPECIAL` siguen utilizando Canvas.
- **La lógica de combate permanece igual:** primer impacto a 0,14 s, duración 0,34 s, daño 1, alcance, cola del segundo golpe y recarga del especial.
- La imagen es experimental, pendiente de revisión de tamaño de la cara, escuradents y continuidad respecto a `IDLE`.
- La comparación anterior `WALK v2/v3` sigue funcionando, con el rostro corregido.

## Nuevo concepto: no todas las animaciones son bucles

`Animacion.frame()` repite cíclicamente la secuencia, como corresponde a `IDLE` y `WALK`. La nueva función `Animacion.frameUnico(tiempo, duracion, cantidad)` recorre las poses una sola vez y se detiene en el último fotograma. **La animación no decide cuándo se hace daño**; el impacto sigue determinado por `update(delta)`.

## Cómo probarlo

1. Camina y comprueba las transiciones entre `IDLE` y `WALK`.
2. Pulsa **GOLPEAR** una vez: se reproduce el primer tajo con cuatro poses.
3. Desactiva **ATTACK 1 nuevo (comparar)** y repite para ver la versión Canvas anterior.
4. Pulsa dos veces para verificar que el segundo golpe conserva sus mecánicas.
5. Comprueba hitboxes y Remolí: ningún comportamiento de combate ha cambiado.

## Tests

Ejecuta `npm test` para comprobar animación cíclica y no cíclica, combate, tamaño de los atlases y transparencia.

[Diseño original y criterios de combate](docs/llaurador-paso03.md).
