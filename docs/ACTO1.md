# Acto 1 — La persecució dels ingredients
## Subfase 1.1: Avinguda Mestre Serrano (primer prototipo)

La paella iba a prepararse al final de la Avinguda Mestre Serrano en Sueca. Los ingredientes son robados y el Llaurador sale tras los ladrones.

**Alcance de este prototipo:** un recorrido horizontal de 2.680 px con decorado provisional en Canvas, cámara que acompaña al jugador, dos encuentros al alcanzar posiciones concretas y aviso **«TIRA-LI! →»** cuando se despeja el camino. No hay oleadas automáticas por temporizador. Los 2 y 3 Pèsols que se encuentran respectivamente comparten la IA y el atlas aprobado 04C. Sus corbelladas y el Remolí pueden alcanzar a varios objetivos, cada uno una sola vez por impacto.

**Reglas:** los combates se disparan al alcanzar X=640 y X=1580; el avance queda bloqueado temporalmente en X=1040 y X=2010 hasta derrotar a todos. La cámara se estabiliza en cada encuentro y vuelve a seguir al Llaurador al concluir. Se permite retroceder, pero los encuentros completados no reaparecen. El progreso termina en una pantalla de transición «Cap a l’Església de Sales». El saco de arroz todavía **no** se recupera: eso corresponde al final del acto en La Via.

**Controles:** cruceta táctil en iPad, combo ×4 y Remolí; flechas/WASD, J/espacio y K en escritorio. El menú de ajustes permanece disponible.

**Estado de arte:** las fachadas, el tenderete de paella y los árboles son dibujo Canvas temporal. Queda pendiente el fondo pixel art aprobado, basado en fotografías y detalles reales de la avenida; no se ha modificado ningún sprite aprobado.

### Recorrido acordado para el acto completo
1. Avinguda Mestre Serrano (esta entrega)
2. Església de Sales
3. Carrer Mare de Déu
4. Plaça de l’Ajuntament
5. Carrer Sequial
6. La Via (jefe del acto)

**Fuera de alcance:** la persecución en Derbi hacia la playa, la Albufera y las PR #30 y #31, todavía independientes.

### Pruebas
Ejecutar \`npm test\`. \`tests/avenida.test.cjs\` valida con un reloj manual la transición de estados, que los encuentros no aparecen sin avanzar, el límite del escenario, la cámara, el daño múltiple, el mensaje «TIRA-LI!», el reinicio y el cierre del primer tramo. Sigue pendiente una prueba manual en un iPad físico.
