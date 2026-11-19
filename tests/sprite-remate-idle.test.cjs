/* 03P: reutilización literal del atlas 03J, sin volver a generar el personaje. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('src/remate.js','utf8'),sandbox);
const r=sandbox.window.Remate;
assert.deepEqual(JSON.parse(JSON.stringify(r.pose(0))),{fila:0,columna:0},
  'preparación idéntica al fotograma IDLE original');
assert.deepEqual(JSON.parse(JSON.stringify(r.pose(1))),{fila:1,columna:2},
  'preparación con brazo alzado tomada de los ataques del pack');
assert.deepEqual(JSON.parse(JSON.stringify(r.pose(2))),{fila:3,columna:1},
  'impacto usa ambos brazos del mismo llaurador');
assert.deepEqual(JSON.parse(JSON.stringify(r.pose(3))),{fila:3,columna:3},
  'recuperación del mismo pack');
assert.equal(r.pose(999).columna,3,'sin salirse del atlas');
let saves=0,rests=0,curves=0,strokes=0;
const ctx={
  save(){saves++},restore(){rests++},
  beginPath(){},moveTo(){},bezierCurveTo(){curves++},
  stroke(){strokes++},arc(){},fill(){},
};
r.dibujarEstelas(ctx);
assert.equal(saves,1);assert.equal(rests,1);
assert.equal(curves,6,'dos estelas con tres capas cada una');
assert.equal(strokes,6);
const game=fs.readFileSync('src/game.js','utf8'),
 html=fs.readFileSync('index.html','utf8');
assert(game.includes("assets/llaurador_combo_pack_03j.png?v=03j"),
  'carga el atlas realmente publicado');
assert(game.includes('usingFiel?unifiedPackImage:') &&
  game.includes('const imagen=usingNewIdle?idleGuardImage:'),
  'el remate sigue reutilizando el atlas original aunque el reposo tenga sprites propios');
assert(game.includes('const rematePose=usingFiel?Remate.pose(frame):null;'));
assert(game.includes('Remate.dibujarEstelas(ctx)'));
assert(html.includes('src/remate.js?v='),'el módulo remate debe estar cargado');
assert(html.includes('id="remate-fiel"'));
assert(!game.includes('llaurador_remate_desde_idle_03p.png'),
  'sin copia recoloreada del personaje');
const conf=fs.readFileSync('src/config.js','utf8');
assert(conf.includes("id:'descendente'"));
assert(conf.includes('impacto:0.20'));
assert(conf.includes('dano:2, alcance:128, retroceso:38'));
console.log('03P: remate desde el atlas original 03J, estelas frontales, mecánica intacta.');
