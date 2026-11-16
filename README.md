# La Colla de la Paella 🥘

**Paso 02 — Estados, animaciones y primer ataque.** Primer prototipo educativo de un beat 'em up ambientado en l'Horta valenciana.

## Qué puedes hacer

- Mover al llaurador con botones táctiles, flechas o WASD.
- Cambiar su velocidad con un deslizador.
- Golpear tres veces al ladrón (botón GOLPEAR o J/espacio) y recuperar el arroz.
- Observar los estados IDLE, WALK y ATTACK en pantalla.
- Recoger el arroz solo tras derrotar al ladrón.

## Archivos

- `index.html`: estructura de la interfaz.
- `style.css`: estilos y adaptación a móviles.
- `src/config.js`: velocidad, posiciones y límites.
- `src/game.js`: lógica, controles, renderizado y bucle de juego.

## Segunda práctica

Abre `src/config.js` y cambia `ataque.duracion` de `0.36` a `0.60`. Recarga y compara el ritmo de los golpes. Después modifica `ataque.alcance` de `105` a `160` para entender la hitbox.

La lógica del personaje está en `src/game.js` y los estados son `IDLE`, `WALK` y `ATTACK`. El ataque bloquea temporalmente el movimiento; solo aplica daño una vez, cuando cruza `instanteImpacto`.

### Qué observar

1. Quieto: estado IDLE con pequeña animación de respiración.
2. Caminar: estado WALK y piernas animadas.
3. Golpear: estado ATTACK, barrido de aixada y un único impacto.
4. Fuera de alcance o de profundidad: no se produce daño.

**Nota:** por ahora todos los dibujos son Canvas, no sprites finales.

En `src/game.js`, `update(delta)` aplica la fórmula `posición += dirección × velocidad × delta` para que el desplazamiento sea independiente de los FPS.

## Publicación

En GitHub, ve a **Settings > Pages**, selecciona **Deploy from a branch**, rama **main** y carpeta **/(root)**. Esta opción funciona en un repositorio público con el plan gratuito. Una vez activado, la web tendrá la URL que muestre GitHub Pages.

## Próximas lecciones

1. Enemigo móvil y respuesta al daño.
2. Sprites y animaciones.
3. Selección de los cuatro héroes.

Gráficos provisionales, sin dependencias externas.