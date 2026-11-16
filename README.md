# La Colla de la Paella 🥘

**Paso 03B — Primer sprite real del llaurador: IDLE.** Prototipo de beat ’em up valenciano para navegador, con código pensado para aprender.

## Controles
- **Tablet/móvil:** flechas de dirección, **GOLPEAR** (dos toques encadenan dos tajos) y **REMOLÍ** (especial circular).
- **Ordenador:** flechas/WASD, **J** o espacio para golpear, **K** para Remolí.
- El ladrón tiene 6 PV; una combinación completa hace 1 + 2 puntos de daño. El Remolí hace 2 y necesita 6 segundos de recarga.
- Acaba con el ladrón y recupera el arroz.
- Activa **Mostrar hitboxes** para ver la zona frontal amarilla de la corbella y la hurtbox rosa del ladrón.
- En **IDLE** se dibuja un spritesheet de 4 fotogramas (6 FPS de animación). **WALK**, **ATTACK** y **SPECIAL** conservan los dibujos provisionales de Canvas hasta la siguiente lección; el cambio de estilo al moverse es intencionado por ahora.

## Qué estudiar
- [Ficha de diseño funcional del llaurador](docs/llaurador-paso03.md).
- [Guion de pruebas manuales](docs/guion-pruebas-paso03.md).
- `src/config.js`: parámetros de velocidad, daño, alcance y tiempos.
- `src/combat.js`: solapamiento de hitbox frontal y hurtbox del enemigo, además del alcance circular.
- Ajustamos el alcance frontal a 116 píxeles y contamos la anchura del enemigo (22 px por lado). Así no hace falta tocarlo con el cuerpo.
- `assets/llaurador_idle.png`: imagen PNG transparente de 448 × 128 px, cuatro celdas de 112 × 128.
- `src/animation.js`: convierte tiempo transcurrido en índice de fotograma.
- `src/game.js`: máquina de estados `IDLE`, `WALK`, `ATTACK`, `SPECIAL`, lectura de controles y dibujo Canvas.
- `index.html` y `style.css`: interfaz táctil.

## Pruebas automáticas
Con Node.js instalado: `npm test`. No se necesitan dependencias.

## Ejercicio recomendado
Modifica `ataque.segundo.dano` de `2` a `3`. ¿Cómo cambia el número de combos necesarios para derrotar al ladrón?

## Publicación
GitHub Pages sirve la rama `main` cuando está configurado con **Deploy from a branch**. Los cambios de esta rama se revisan primero mediante un pull request.

Hemos integrado el primer spritesheet real. **Ejercicio:** prueba a cambiar `fps:6` por `fps:3` en `src/game.js` y observa el ritmo de la respiración del personaje.
