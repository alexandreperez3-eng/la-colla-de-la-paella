# Desarrollo y validación

## Estado de la base

Auditoría de `main` en `5e2174745763b669fc870a9c8aeeccff17acbb78`, Acte 1.1l. El título del juego y el historial Git identifican el acto. El campo `version` de npm sigue en `0.8.0`.

El tramo jugable recorre Mestre Serrano con dos encuentros de 2 y 3 Pèsols, aviso «TIRA-LI! →» y salida hacia Sales. Los enemigos están colocados en el mundo desde el inicio y se activan al entrar en el visor. La cámara es lateral y dibuja con desplazamiento entero. Las fachadas de GO! y El Terrat tienen público animado y el hueco lateral deja ver el horizonte. El recorrido posterior está descrito en [Acto 1](ACTO1.md).

| Ruta | Responsabilidad |
| --- | --- |
| `index.html`, `style.css` | Página estática, HUD de depuración, controles para teclado y táctil, Canvas de 900 × 480. |
| `src/game.js`, `src/config.js` | Bucle de `requestAnimationFrame`, estado del jugador, integración de entradas y datos de movimiento y técnicas. |
| `src/mission.js`, `src/pesol.js` | Progreso, límites, cámara, separación de enemigos e IA del Pèsol Cabut. |
| `src/combat.js`, `src/combo.js` | Impactos y colisiones, cola de golpes. |
| `src/animation.js`, `src/feedback.js`, `src/remate.js` | Selección de fotogramas, pausa breve de impacto y apoyo visual del remate. |
| `src/avenida.js`, `src/escenario.js` | Composición de Mestre Serrano, posiciones, paralaje, público y dibujante reutilizable de capas. |
| `assets/` | Atlas de personajes y arte del escenario, incluidos recursos históricos de comparación. |

El juego se puede publicar como archivos estáticos con rutas relativas, sin compilación ni dependencias en ejecución. Node.js y Python sirven para desarrollo. Playwright Test, fijado en el archivo de bloqueo, es una dependencia de desarrollo. El servidor de pruebas sirve la raíz en loopback. Playwright lo inicia, espera a que responda y lo cierra al terminar.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm start` | Servir el juego en <http://127.0.0.1:4173>. Detén el servidor manual antes de lanzar Playwright. |
| `npm test` | Comprobar sintaxis, lógica, píxeles de sprites y composición del escenario desde Node.js. Funciona sin instalar paquetes. |
| `npm ci` | Instalar las dependencias bloqueadas con Node.js 24. |
| `npx playwright install chromium firefox webkit` | Descargar los motores de navegador. En Linux con librerías pendientes, añade `--with-deps`. |
| `npm run test:browser` | Ejecutar toda la suite. Usa `-- --project=webkit-ipad`, por ejemplo, para limitarla a un perfil. |
| `npx playwright show-report` | Abrir el informe HTML con las capturas y las trazas disponibles. |

## Cobertura

La base ya tenía 26 archivos de pruebas Node para lógica, sprites y escenario. También tenía un script WebKit de renderizado y controles en un perfil iPad, con instalación y servidor gestionados a mano en CI. La suite Playwright incorpora ese recorrido y las reglas visuales originales.

| Cobertura | Comprobaciones |
| --- | --- |
| Chromium, Firefox y WebKit de escritorio | Movimiento y liberación de tecla, activación del combate, geometría estable y reinicio. Combo de cuatro pulsaciones y recarga del Remolí con reloj controlado. |
| WebKit en perfil iPad apaisado y Chromium táctil | Botonera dentro de pantalla, toque de un solo golpe y Remolí, geometría al entrar en combate y reinicio. |
| Chromium táctil | Dos contactos simultáneos mediante CDP: mantener dirección, atacar y soltar el movimiento al cancelar. |
| Canvas en Chromium, Firefox, WebKit y perfil iPad | Carga de capas reales. Compara píxeles en dos instantes fijos para detectar animación ausente y movimiento fuera de los portales y figurantes. Compara el hueco entre fachadas con el horizonte del mismo render. Adjunta capturas al informe. |

GitHub Actions ejecuta las pruebas Node y las de navegador en cada PR y cada push a `main`. Los jobs solo requieren lectura del repositorio. El job de navegador publica `informe-playwright` durante siete días con las capturas y, cuando hay fallos, trazas. Usa runners estándar del repositorio público y la imagen oficial de Playwright con los tres motores preinstalados. Al actualizar Playwright, actualiza a la vez la etiqueta de la imagen en `.github/workflows/test.yml`.

La comprobación visual compara regiones en el mismo motor, donde desaparecen las diferencias de antialiasing entre navegadores. Sirve para verificar propiedades concretas del escenario. La revisión artística de composición y animación sigue siendo manual. WebKit en Linux con perfil de iPad emula pantalla y tacto. La latencia, los gestos del sistema, el rendimiento y la ergonomía a dos pulgares se verifican en un iPad físico.

## Siguientes misiones

- **Escenarios.** Añade recorridos comprobables a `mission.js` y capas al dibujante existente. Conserva la activación por borde visible y valida el final de tramo y el reinicio. Adjunta capturas del inicio, encuentros y salida cuando cambie el arte.
- **Combate.** Añade casos deterministas de daño, colas o estados a los módulos afectados. Usa el navegador para comprobar la integración con el bucle y los controles.
- **Táctil.** Valida movimiento, ataque, liberación y cancelación. Cuando cambies la botonera, prueba en Safari de iPad girar la pantalla y jugar con dos pulgares.
