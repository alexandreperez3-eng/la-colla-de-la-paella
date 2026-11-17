# La Colla de la Paella 🥘

**Paso 03C — El llaurador también camina con sprites reales.** Prototipo de beat ’em up valenciano para navegador, con código pensado para aprender.

## Controles
- **Tablet/móvil:** flechas de dirección, **GOLPEAR** (dos toques encadenan dos tajos) y **REMOLÍ** (especial circular).
- **Ordenador:** flechas/WASD, **J** o espacio para golpear, **K** para Remolí.
- El ladrón tiene 6 PV; una combinación completa hace 1 + 2 puntos de daño. El Remolí hace 2 y necesita 6 segundos de recarga.
- Acaba con el ladrón y recupera el arroz.
- Activa **Mostrar hitboxes** para ver la zona frontal amarilla de la corbella y la hurtbox rosa del ladrón.
- En **IDLE** se dibuja un spritesheet de 4 fotogramas (6 FPS). En **WALK** se dibuja el ciclo de 6 poses que aprobamos (9 FPS a 245 px/s). **ATTACK** y **SPECIAL** conservan los dibujos provisionales de Canvas por ahora.
- El ritmo de **WALK** sigue el deslizador de velocidad: a mayor velocidad, más fotogramas por segundo (entre 5 y 14 FPS). El estado `WALK` comienza por el primer fotograma cada vez que entramos en él.

## Qué estudiar
- [Ficha de diseño funcional del llaurador](docs/llaurador-paso03.md).
- [Guion de pruebas manuales](docs/guion-pruebas-paso03.md).
- `src/config.js`: parámetros de velocidad, daño, alcance y tiempos.
- `src/combat.js`: solapamiento de hitbox frontal y hurtbox del enemigo, además del alcance circular.
- Ajustamos el alcance frontal a 116 píxeles y contamos la anchura del enemigo (22 px por lado). Así no hace falta tocarlo con el cuerpo.
- `assets/llaurador_idle.png`: PNG de 448 × 128 px, cuatro celdas de 112 × 128.
- `assets/llaurador_walk.png`: PNG de 672 × 128 px, seis celdas de 112 × 128. Son exactamente las **primeras seis poses** aprobadas, con fondo eliminado, escala común y pies alineados.
- `src/animation.js`: convierte tiempo transcurrido en índice de fotograma.
- `src/game.js`: máquina de estados `IDLE`, `WALK`, `ATTACK`, `SPECIAL`, lectura de controles y dibujo Canvas.
- `index.html` y `style.css`: interfaz táctil.

## Pruebas automáticas
Con Node.js instalado: `npm test`. No se necesitan dependencias.

## Ejercicio recomendado
Modifica `ataque.segundo.dano` de `2` a `3`. ¿Cómo cambia el número de combos necesarios para derrotar al ladrón?

## Publicación
GitHub Pages sirve la rama `main` cuando está configurado con **Deploy from a branch**. Los cambios de esta rama se revisan primero mediante un pull request.

Tenemos dos animaciones reales. **Ejercicio:** busca `WALK_SPRITE.fps` en `src/game.js` y cambia su valor de `9` a `6`. ¿Qué diferencia aprecias al caminar a la misma velocidad? No se ha cambiado ninguna hitbox, daño ni velocidad de desplazamiento del personaje.
