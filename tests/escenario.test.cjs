const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const imagenes = [];
const locals = 'locals-go-terrat-sense-arbres.png';
const arbre = 'arbre-alt-passeig.png';
class Arte {
  set src(ruta) {
    const bytes = fs.readFileSync(ruta);
    const archivo = ruta.split('/').pop();
    if (archivo.endsWith('.png')) {
      assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
      this.naturalWidth = bytes.readUInt32BE(16);
      this.naturalHeight = bytes.readUInt32BE(20);
    } else {
      const svg = bytes.toString('utf8');
      assert.match(svg, /<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
      this.naturalWidth = Number(svg.match(/\bwidth="(\d+)"/)[1]);
      this.naturalHeight = Number(svg.match(/\bheight="(\d+)"/)[1]);
    }
    this.nombre = archivo;
    this.complete = true;
    imagenes.push(this);
  }
}
const mundo = {Image: Arte};
mundo.window = mundo;
for (const ruta of ['src/escenario.js', 'src/avenida.js'])
  vm.runInNewContext(fs.readFileSync(ruta, 'utf8'), mundo);

const ancho = 900, alto = 480;
let sueloHasta, cieloHasta, llamadas, localesEnCuadro, bancosEnCuadro;
let edificios, animaciones, gentDeFora, haces;
let localesAlInicio = null, localesAlAvanzar = false, maxLlamadas = 0;
let camaraActual = 0;
const casesAlPrincipi = [];
const mobiliario = new Map();
const ctx = {
  canvas: {width: ancho, height: alto},
  fillRect() {},
  beginPath() {},
  moveTo() {},
  lineTo() {},
  closePath() {},
  save() {},
  restore() {},
  fill() {
    if (this.fillStyle !== '#625c65' && this.fillStyle !== '#a08e86') {
      assert(this.globalAlpha > 0 && this.globalAlpha < 0.2, 'llums sense flaixos opacs');
      haces++;
    }
  },
  drawImage(img, sx, sy, sw, sh, x, y, w, h) {
    llamadas++;
    assert(img.complete && img.naturalWidth);
    assert(sx >= 0 && sy >= 0 && sw > 0 && sh > 0);
    assert(sx + sw <= img.naturalWidth && sy + sh <= img.naturalHeight);
    assert([x, y, w, h].every(Number.isInteger));
    if (img.nombre === locals && sw < 1020 && y < 184) {
      assert(x < ancho && x + w > 0, 'només s’anima el públic exterior visible');
      assert(sy + sh === y + h && y + h <= 214, 'la cintura queda ancorada');
      gentDeFora.push([sx, sy]);
      return;
    }
    if (img.nombre === locals && sw < 1020) {
      assert(sy >= 182 && sy + sh === 232 && y === 184);
      assert((sx >= 236 && sx + sw <= 286) || (sx >= 499 && sx + sw <= 567),
        'ball només a l’interior de cada porta');
      animaciones.push([sx, sy]);
      return;
    }
    assert(x < ancho && x + w > 0, 'solo se dibuja arte dentro del visor');
    if (img.nombre === 'passeig.svg') {
      assert(x <= sueloHasta && y === 249 && y + h === alto,
        'pavimento continuo por debajo de los personajes hasta el borde inferior');
      sueloHasta = x + w;
    }
    if (img.nombre === 'horitzo.png') {
      assert(x <= 0 && y <= 0);
      cieloHasta = x + w;
    }
    if (img.nombre === locals) {
      localesEnCuadro++;
      assert.equal(y, 0, 'la fachada queda alineada con los edificios');
      edificios.push([x, x + w]);
    }
    if (img.nombre === 'facanes.png') {
      // Les façanes mantenen la proporció del seu atlas i reposen al
      // mateix nivell que els accessos de GO / El Terrat.
      assert.equal(y + h, 250, 'cases i locals comparteixen la línia de planta baixa');
      assert(Math.abs(w / sw - h / sh) < 0.01,
        'ampliació residencial proporcional, sense deformar portes ni finestres');
      assert(w / sw >= 1.34 && w / sw <= 1.36, 'les cases augmenten un 35%');
      edificios.push([x, x + w]);
      if (camaraActual === 0) casesAlPrincipi.push([x, x + w]);
    }
    if (img.nombre === locals) {
      assert.equal(w, 1020, "l'art conceptual dels locals continua a la mida validada");
      assert.equal(h, 250);
    }
    if (img.nombre === arbre) {
      assert(y <= -85 && y + h >= 270 && y + h <= 275, 'copa tallada i base a la vorera');
      assert(Math.abs(w / sw - h / sh) < 0.01, 'arbre sense deformacions');
      // El rectangle transparent de la copa és més ample que la base.
      mobiliario.set(x + camaraActual + Math.round(w / 4), {tipo: 'arbre', ancho: Math.round(w / 2)});
    }
    const tipo = img.nombre === 'banc.svg' ? 'banc' :
      img.nombre === 'decorats.png' && sx === 342 ? 'fanal' :
      img.nombre === 'decorats.png' && sy === 221 ? 'sales' : undefined;
    if (tipo === 'banc') bancosEnCuadro++;
    if (tipo) mobiliario.set(x + camaraActual, {tipo, ancho: w});
  }
};
for (let camara = 0; camara <= 1780; camara++) {
  camaraActual = camara;
  sueloHasta = cieloHasta = llamadas = localesEnCuadro = bancosEnCuadro = 0;
  edificios = [];
  animaciones = [];
  gentDeFora = [];
  haces = 0;
  mundo.Avenida.dibujar(ctx, camara, camara / 60);
  assert(sueloHasta >= ancho && cieloHasta >= ancho, 'cobertura de extremo a extremo');
  for (let i = 1; i < edificios.length; i++) {
    assert(edificios[i][0] - edificios[i - 1][1] >= 60,
      'les façanes deixen un pas obert sense solapaments');
  }
  assert.equal(animaciones.length * 2, haces * 3);
  assert(haces <= 4 && animaciones.length <= 6);
  assert(gentDeFora.length <= 7);
  if (camara === 0) {
    localesAlInicio = localesEnCuadro;
    assert(bancosEnCuadro > 0, 'los bancos ya acompañan el paseo inicial');
  }
  if (camara >= 1100 && localesEnCuadro > 0) localesAlAvanzar = true;
  if (camara === 1660) {
    assert.equal(animaciones.length, 6, 'els dos públics ballen');
    assert.equal(gentDeFora.length, 7, 'els grups de fora i els porters s’animen');
    const primerPas = animaciones;
    const gentPrimerPas = gentDeFora;
    animaciones = [];
    gentDeFora = [];
    haces = llamadas = 0;
    mundo.Avenida.dibujar(ctx, camara, 0);
    for (const inicio of [0, 3]) {
      assert.notDeepEqual(animaciones.slice(inicio, inicio + 3), primerPas.slice(inicio, inicio + 3));
    }
    assert.notDeepEqual(gentDeFora, gentPrimerPas);
  }
  maxLlamadas = Math.max(llamadas, maxLlamadas);
}
assert.equal(casesAlPrincipi.length, 2, 'dos trams de cases al primer visor');
assert(casesAlPrincipi[0][1] + 50 < casesAlPrincipi[1][0],
  'es manté una obertura cap a l horitzó entre les façanes');
assert.equal(localesAlInicio, 0, 'GO! y El Terrat no se ven desde el comienzo');
assert(localesAlAvanzar, 'GO! y El Terrat aparecen al avanzar lateralmente');
assert(maxLlamadas <= 27, 'el decorat manté un nombre acotat de blits per fotograma');
assert.equal([...mobiliario.values()].filter(pieza => pieza.tipo === 'banc').length, 7);
assert.equal([...mobiliario.values()].filter(pieza => pieza.tipo === 'fanal').length, 5);
assert.equal([...mobiliario.values()].filter(pieza => pieza.tipo === 'arbre').length, 3);
const piezas = [...mobiliario].sort(([a], [b]) => a - b);
for (let i = 1; i < piezas.length; i++) {
  const [x, pieza] = piezas[i - 1];
  assert(piezas[i][0] - (x + pieza.ancho) >= 12,
    `espai entre ${pieza.tipo} x=${x} i ${piezas[i][1].tipo} x=${piezas[i][0]}`);
}
assert.equal(imagenes.length, 7, 'las siete láminas se cargan una sola vez');
assert(!imagenes.some(i => i.nombre === 'paviment.png'),
  'la calle asfaltada anterior deja de utilizarse');
const suelo = fs.readFileSync('assets/escenarios/mestre-serrano/passeig.svg', 'utf8');
assert(!/blur|feGaussianBlur|filter=/.test(suelo), 'juntas nítidas, sin difuminados');
assert.match(suelo, /width="600" height="231"/, 'módulo del suelo de ancho exacto');
const imatge = imagenes.find(img => img.nombre === locals);
assert.equal(imatge.naturalWidth, 1020, 'amplada validada del fons del tram');
assert.equal(imatge.naturalHeight, 250, 'alçada validada del fons del tram');
const avenida = fs.readFileSync('src/avenida.js', 'utf8');
assert(!avenida.includes("tipo: 'placa'"), 'sin cartel callejero innecesario');
for (const imagen of imagenes) {
  imagen.naturalWidth = 0; // Error de red tras completar la petición.
  mundo.Avenida.dibujar(ctx, 1780);
}
console.log('Escenario 1.1k: paseo continuo en 1.781 cámaras, árboles altos, mobiliario separado y público animado. Blits máximos por cuadro:', maxLlamadas);
