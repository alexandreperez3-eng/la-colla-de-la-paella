# La Colla de la Paella 🥘

**Paso 01 — Movimiento del llaurador.** Primer prototipo educativo de un beat 'em up ambientado en l'Horta valenciana.

## Qué puedes hacer

- Mover al llaurador con botones táctiles, flechas o WASD.
- Cambiar su velocidad con un deslizador.
- Recoger un saco de arroz y reiniciar.

## Archivos

- `index.html`: estructura de la interfaz.
- `style.css`: estilos y adaptación a móviles.
- `src/config.js`: velocidad, posiciones y límites.
- `src/game.js`: lógica, controles, renderizado y bucle de juego.

## Primera práctica

Abre `src/config.js` y cambia `velocidad: 210` a `velocidad: 280`. Recarga la página y compara el movimiento.

En `src/game.js`, `update(delta)` aplica la fórmula `posición += dirección × velocidad × delta` para que el desplazamiento sea independiente de los FPS.

## Publicación

En GitHub, ve a **Settings > Pages**, selecciona **Deploy from a branch**, rama **main** y carpeta **/(root)**. Esta opción funciona en un repositorio público con el plan gratuito. Una vez activado, la web tendrá la URL que muestre GitHub Pages.

## Próximas lecciones

1. Animación y estados idle/walk/attack.
2. Enemigos y hitboxes.
3. Sprites y animaciones.
4. Selección de los cuatro héroes.

Gráficos provisionales, sin dependencias externas.