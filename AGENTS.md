# La Colla de la Paella

## Antes de editar

- Lee `docs/desarrollo.md` y el apartado pertinente de `docs/ACTO1.md`. Verifica la rama, el commit base y los cambios locales con Git. Conserva el trabajo ajeno.
- Crea una rama para cada misión basada en la referencia indicada. Usa la rama principal como base si la misión no especifica otra. Trabaja hasta dejar una PR revisable y reserva la fusión para el propietario.
- La entrada jugable es `index.html`, con `style.css` y scripts clásicos diferidos. Respeta el orden de carga y los nombres expuestos en `window`. Los scripts que admiten CommonJS se prueban también desde Node.
- `src/game.js` integra entradas, reloj, combate y renderizado. Usa `src/mission.js` para progreso, cámara y encuentros. Mantén sincronizados la configuración de un escenario en `src/avenida.js`, su dibujante en `src/escenario.js` y las pruebas.
- Localiza los atlas activos en el código. Conserva los sprites aprobados y los controles táctiles salvo que la misión los mencione explícitamente. Si cambias un recurso servido por la web, revisa el parámetro de caché de su URL.

## Validar y entregar

- Ejecuta `npm start` para servir la raíz y `npm test` para lógica y sprites. Ejecuta `npm ci`, `npx playwright install chromium firefox webkit` y `npm run test:browser` para navegador. En Linux, instala los requisitos del sistema con `npx playwright install --with-deps` si hacen falta.
- Para cambios de jugabilidad, cubre la regresión en el módulo más próximo y comprueba la ruta jugable afectada. Para renderizado, revisa a escala real las capturas de la zona modificada y los límites entre capas. Para controles o layout, prueba teclado y el perfil táctil apaisado. Si cambia la ergonomía, deja constancia de la revisión en iPad físico.
- Resuelve los fallos que introduzca la misión. Si el fallo ya estaba en la base, registra cómo lo reprodujiste y cuál fue su efecto en la validación.
- En la PR incluye commit base, alcance, comandos ejecutados y resultados, capturas si aportan evidencia y límites pendientes. Distingue ejecución local, CI y pruebas físicas.
