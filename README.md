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

## Paso 03G — Segundo tajo con sprites reales

La **corbellada derecha** ya dispone de un atlas de cuatro poses en `assets/llaurador_attack_derecha.png` (448 × 128 px, fondo transparente). Es un corte ascendente que contrasta con la corbellada izquierda descendente del paso 03F. Se mantiene la estela luminosa del golpe.

La segunda pose cambia a los 0,04 s, la pose de impacto entra a los **0,11 s** y la recuperación comienza a los 0,19 s. El tiempo total del golpe sigue siendo **0,28 s**, el daño **1** y el alcance **116 px**. No se altera la cola de pulsaciones del combo.

La casilla **«Corbellada derecha: sprite nuevo»** permite probar la animación y volver al movimiento provisional sin reiniciar. La casilla de la izquierda sigue disponible independientemente. Los ataques 3 y 4 siguen con efectos Canvas sobre el sprite IDLE mientras preparamos sus animaciones definitivas.

**Prueba visual:** realizar dos pulsaciones (o las cuatro del combo) y comprobar la continuidad izquierda → derecha, la cara y el escuradents, el cambio de dirección de la estela y el anclaje de los pies. El nuevo sprite es una propuesta visual que requiere aprobación jugando.

## Paso 03G.1 — Corrección de la hoja de la corbella derecha

- El tercer fotograma de `assets/llaurador_attack_derecha.png` tenía la hoja superior cortada por el borde derecho de su celda. La fuente de arte original sí contenía la hoja entera.
- Se ha restaurado el extremo completo dentro de los mismos 112 × 128 píxeles, comprimiendo ligeramente únicamente el área del brazo/hoja derecha del tercer fotograma. La escala, los pies y la parte inferior permanecen alineados.
- **Los otros tres fotogramas se mantienen idénticos píxel a píxel** en el PNG decodificado. No se cambian tiempos, daño, hitboxes, entrada de combo ni Remolí.
- `tests/sprite-attack-right-clipping.test.cjs` decodifica el PNG y verifica que la punta queda visible con margen transparente en el borde: esta prueba fallaba con el archivo anterior y pasa con la corrección.
- La ruta del recurso incorpora `?v=03g1` para que Safari no reutilice el PNG antiguo en caché.

## Paso 03H — Patada frontal con cuatro poses reales

- `assets/llaurador_patada.png` (576 × 128 px) contiene **cuatro poses de 144 × 128 px**: guardia, rodilla elevada, extensión de la espardenya y recuperación. Las celdas son deliberadamente más anchas para evitar recortes de la pierna.
- El tercer movimiento del combo utiliza este atlas si está activada **«Patada: sprite nuevo»**. Al desactivarlo regresa el dibujo Canvas provisional para comparar.
- Los cambios son únicamente gráficos: **patada 0,32 s, impacto 0,15 s, daño 1, alcance 95 px, retroceso 26 px**, idénticos a la versión anterior. La cola del combo, las corbelladas, el remate y el Remolí permanecen sin cambios.
- `Animacion.framePorMarcas()` presenta la pose de pierna extendida justo cuando ocurre el impacto. El código evita dibujar la pierna Canvas encima del nuevo sprite.
- `tests/sprite-kick.test.cjs` valida dimensiones, transparencia, cuatro celdas con margen lateral, alineación de pies, extensión de la pierna y referencia a la sincronía de impacto.
- La animación es **propuesta visual para probar en juego**; el ritmo y las proporciones deben revisarse en tablet antes de aprobarla definitivamente.

## Paso 03I — Paleta maestra y rostro coherente

- Conservamos los fotogramas de ataque actuales y los recortes reparados en el tercer fotograma izquierdo y derecho.
- Los sprites de izquierda y derecha se han recoloreado usando tonos extraídos de `assets/llaurador_idle.png` como paleta maestra (sin ajuste global arbitrario de brillo). La piel, vestimenta y armas siguen esta referencia.
- Se recuperan los rasgos faciales del IDLE, incluido el escuradents, mediante un recorte de la zona facial adaptado a cada pose; la postura y las armas siguen siendo las de los ataques aprobados.
- El parámetro `?v=03i` fuerza la actualización del recurso gráfico en navegadores que pudieran haber almacenado una versión anterior.
- **No se alteran** los tiempos, daños, hitboxes, entradas de combo ni lógica del juego.
- Los PNG previos son recuperables desde el historial Git.
- El test `tests/sprite-coherence.test.cjs` verifica las dimensiones, transparencia, la luminosidad media respecto al IDLE y el margen derecho de la tercera pose izquierda.

La revisión visual en navegador sigue siendo necesaria: el test no puede garantizar que cada expresión facial quede perfecta.


## Paso 03I.1 — Retirada de rostros superpuestos

La composición facial del paso 03I dejó visibles restos de la cara anterior debajo de la copiada desde IDLE. Esta regresión visual se corrige retirando **por completo la capa de rostro superpuesto**, conservando las poses de las dos corbelladas, los recortes reparados y la paleta ajustada a IDLE.

**Limitación consciente:** la expresión facial original del ataque todavía presenta pequeñas diferencias respecto al IDLE. No afirmamos que la identidad facial ya esté igualada: antes de volver a transferir la cabeza, necesitaremos un borrado y ensamblaje de máscaras correcto que no deje restos. Se ha priorizado eliminar la doble cara sin romper el resto del arte o el combate.


## Paso 03J — Un solo atlas para los cuatro ataques (18 nov. 2026)

Prueba visual con un **único spritesheet 4×4**, generado desde los cuatro movimientos en la misma tanda artística. El atlas real está en `assets/llaurador_combo_pack_03j.png` (832×640 píxeles, 16 celdas de 208×160, PNG con transparencia).

- **Filas:** 0 corbellada izquierda, 1 corbellada derecha, 2 patada, 3 remate de las dos corbelles cruzadas.
- **Columnas:** preparación, movimiento, impacto y recuperación.
- La primera celda sirve también para **IDLE**, por lo que el reposo y los ataques comparten cara, escuradents, ropa, colores y escala. El IDLE del pack es una pose fija de momento.
- **WALK todavía conserva su sprite anterior**, de modo que esta prueba valida principalmente la coherencia entre reposo y las cuatro animaciones de ataque.
- La casilla **«Pack unificado: IDLE y 4 golpes (comparar)»** permite activar/desactivar toda la tanda. Los PNG antiguos siguen disponibles y sirven como respaldo cuando el pack está desactivado.
- Los efectos de corte están dentro de los fotogramas nuevos; evitamos superponer ondas Canvas duplicadas. «Estelas de ataques anteriores» afecta a las animaciones antiguas.
- La mecánica del combo, los daños, hitboxes, ventanas de impacto, buffer de entradas y Remolí **no se modifican**.
- Los originales generados se recortaron, alinearon y optimizaron para Canvas; no se pegaron caras encima de otras.
- `npm test` ejecuta también `tests/sprite-pack.test.cjs`, que valida las dieciséis celdas, su transparencia, los márgenes y las referencias de código.

**Prueba manual:** activa el pack, pulsa cuatro veces COMBO, revisa la transición reposo-ataque y el remate X; desactiva el pack para comparar con las versiones previas.


## Paso 03K — Doble corte cruzado delante del personaje

El impacto del cuarto ataque conserva **la misma hitbox, momento del impacto y daño**. En el fotograma de impacto, el torso se dibuja con la pose de brazos extendidos (frame 2) del mismo atlas 03J, mientras la onda X se extrae del arte original y se dibuja como una capa **delante de las corbelles**, sin tapar pecho o piernas. El efecto vive en `assets/llaurador_cruzado_onda_frontal.png`. No se ha movido el sprite completo ni las coordenadas del jugador. `ctx.scale(p.facing,1)` invierte tanto al personaje como la onda para mirar hacia ambos lados.

La prueba `tests/sprite-cross-front.test.cjs` valida el formato y tamaño del efecto, la referencia del recurso y el posicionamiento frontal en Canvas. La valoración final del barrido sigue siendo visual, jugando.


## Paso 03L — Doble corbellada descendent (remate aprobado)

El cuarto golpe cambia de diseño: el llaurador levanta las dos corbelles y las descarga simultáneamente delante del cuerpo. La animación consta de cuatro poses transparentes en `assets/llaurador_remate_descendente_03l.png` (832 × 160 píxeles; cuatro celdas de 208 × 160). El tercer fotograma tiene la estela descendente delante del personaje.

La casilla **«Remate descendente nuevo (comparar)»** está activada por defecto cuando está activo el pack 03J; al desactivarla reaparece la animación 03K del antiguo remate en X. Los tres primeros golpes y el reposo no se modifican.

El cuarto movimiento conserva **duración 0,45 s, impacto 0,20 s, daño 2, alcance 128 px y retroceso 38 px**; su identificador cambia a `descendente` y el nombre visible a «Doble corbellada descendent». El efecto X antiguo se omite cuando se muestra el sprite descendente. `tests/sprite-downslash.test.cjs` comprueba la estructura y los márgenes del PNG, la presencia del efecto delante y la conexión al código; la apariencia final debe valorarse visualmente.

Para probarlo: activa ambas casillas, sitúate frente al ladrón y pulsa COMBO cuatro veces. Puedes desactivar únicamente la casilla de remate descendente para comparar. El Remolí especial, los tiempos y las hitboxes permanecen inalterados.


## Paso 03M — Remate descendente del lote artístico coherente (18 nov. 2026)

Se ha integrado como **recurso nuevo** `assets/llaurador_remate_descendente_03m.png` (832 × 160 px, cuatro fotogramas de 208 × 160, fondo transparente). Parte del boceto de doble corbellada descendente que se consideró más cercano al estilo de las tres primeras animaciones. Se han conservado sus poses, sus colores y la cara dibujada; **no se han superpuesto cabezas ni recoloreado partes**.

El **cuarto ataque del pack 03J** utiliza este recurso cuando están activados «Pack unificado» y «Remate 03M · doble tajo descendente». Los tres primeros ataques, el IDLE y el WALK se dejan intactos. La versión anterior `03L` se conserva en GitHub para comparación e historial; la opción de desactivar el remate permite ver el cuarto golpe anterior (X).

**La jugabilidad no cambia**: 0,45 s de duración, 0,20 s al impacto, 2 puntos de daño, 128 px de alcance y 38 px de retroceso; también se mantienen las colisiones y el buffer de entradas. La estela ya está dibujada en el fotograma 3 y se presenta frontalmente, sin superponer el antiguo efecto X.

Se añade `tests/sprite-downslash-03m.test.cjs`: comprueba firma y tipo PNG, dimensiones, transparencia, ausencia de recorte en los cuatro bordes laterales, alineación de pies, mayor estela en el fotograma de impacto, conexión a `src/game.js` y sincronización con el golpe. **No sustituye la valoración visual jugando**: la continuidad exacta del personaje entre animaciones sigue siendo una cuestión artística que debe aprobarse en pantalla.


## Paso 03N — Remate más intenso, sin cambiar sprites

Conservamos el mismo PNG del doble tajo descendente y el resto del combo. Cuando el cuarto golpe conecta, añadimos un **hit-stop de 75 ms**, una **sacudida decreciente de 180 ms** (hasta 6 px), un **destello de impacto de 180 ms** en el punto de contacto y una breve prolongación del flash del enemigo. Ningún efecto cambia el daño, las hitboxes ni el momento de impacto.

La casilla «Impacto reforzado (comparar)» permite activar y desactivar el feedback sin cambiar de sprite. Si el golpe falla, no se aplica ningún efecto de contacto. El código visual está en `src/feedback.js` y las pruebas puras en `tests/feedback.test.cjs`.


## Paso 03O — IDLE respirando (pack unificado)

**Causa del fallo:** en el pack 03J las cuatro copias del reposo son idénticas y el motor además utilizaba solo el primer fotograma. Recorrer celdas idénticas no recuperaría la animación.

**Corrección:** se mantiene exactamente el mismo sprite del pack unificado, pero `Animacion.respiracionIdle(t)` modula suavemente la altura (±1,8 %) y anchura (±0,4 %) de la pose a lo largo de 2,4 segundos. Se realiza en Canvas con el punto de pivote en la base del sprite para que los pies permanezcan plantados. El movimiento vuelve a empezar sin saltos y no modifica el archivo PNG.

Solo se aplica cuando el jugador está en `IDLE` con «Pack unificado» activado. Caminar y atacar no cambian, ni tampoco daño, hitboxes o tiempos. Al desactivar el pack, permanece disponible el IDLE anterior de cuatro fotogramas. `tests/idle-breathing.test.cjs` comprueba periodicidad, límites de movimiento y el punto de anclaje.


## Paso 03P — Remate basado en el atlas real 03J (sin nueva paleta)

Las pruebas detectaron que copiar los fotogramas desde un PNG local introducía diferencias cromáticas con el **atlas exacto que está publicado**. Se descartó esa versión y se corrigió de raíz: cuando activamos «Remate con el llaurador original (03P)», Canvas utiliza **el mismo objeto `unifiedPackImage`**, cargado desde `assets/llaurador_combo_pack_03j.png`, para dibujar todas las poses del cuarto ataque.

`src/remate.js` selecciona cuatro poses del atlas original: reposo idéntico, corbellada alzada, brazos proyectados hacia delante, recuperación. Solo las dos estelas doradas descendentes se trazan por separado delante del personaje en el frame de impacto. No se generan nuevos píxeles de piel, sombrero, pantalón o rostro ni se recolorea el atlas.

La casilla «Remate con el llaurador original (03P)» viene activada; al desactivarla puedes comparar con el remate generado 03M (que permanece intacto). Los tiempos, daño, alcance, retroceso, el feedback 03N, la respiración 03O y los otros tres golpes no cambian.

**Limitación artística:** la pose de preparación eleva una corbella más que la otra y la pose de impacto viene de una animación distinta del mismo pack: puede requerir refinamiento del movimiento de los brazos. El objetivo de esta versión es resolver la identidad visual del personaje *sin volver a generarlo*.
