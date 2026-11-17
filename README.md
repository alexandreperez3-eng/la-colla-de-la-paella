# La Colla de la Paella 🥘

**Paso 03C.3 — Coherencia del rostro y escuradents al caminar.**

## Problema detectado durante las pruebas
Al pasar de `IDLE` a `WALK`, la cara parecía reducirse y se perdía el escuradents. La imagen conceptual a alta resolución lo incluía, pero la versión final que utiliza Canvas se redujo a seis celdas de 112 × 128 px y perdió detalle, además de tener proporciones faciales distintas.

## Solución
- `assets/llaurador_walk_v3.png`: seis pasos del WALK v2, pero con la **cabeza y el escuradents del IDLE aprobado**, adaptados al balanceo del cuerpo. Se mantiene el anclaje de los pies y la escala de los spritesheets (672 × 128 px).
- El selector táctil **WALK con cara corregida (comparar)** alterna entre la corrección v3 (activada) y el antiguo v2 (desactivada).
- La imagen anterior `llaurador_walk_v2.png` permanece en el repositorio, de modo que podemos comparar y revertir sin perder nada.
- `src/game.js` carga los recursos por separado, con fallback si falla alguna imagen.
- La lógica de movimiento, los estados, daños y hitboxes **no se han modificado**.

## Qué aprender
Un sprite no es el dibujo conceptual: al reducirlo, los detalles de 1–2 píxeles como un escuradents pueden desaparecer. En imágenes para juegos hay que revisar a la **resolución real de reproducción**, no solamente la ilustración grande.

## Validación manual
1. Comprobar que aparece el rostro veterano y el escuradents tanto quieto como andando.
2. Alternar WALK antiguo/corregido sin reiniciar; evaluar si hay saltos o cortes en el cuello.
3. Caminar hacia derecha e izquierda; detenerse para volver a IDLE.
4. Probar combo y «Mostrar hitboxes»: las mecánicas deben seguir igual.

## Pruebas automáticas
`npm test`. Todas las pruebas se ejecutan sin dependencias externas.

[Diseño y estadísticas del llaurador](docs/llaurador-paso03.md).
