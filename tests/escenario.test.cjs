const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const imagenes = [];
class Arte {
  set src(ruta) {
    const bytes = fs.readFileSync(ruta);
    const archivo = ruta.split('/').pop();
    if (archivo.endsWith('.png')) {
      assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
      this.naturalWidth = bytes.readUInt32BE(16);
      this.naturalHeight = bytes.readUInt32BE(20);
    } else if (archivo.endsWith('.jpg')) {
      assert.equal(bytes.readUInt16BE(0), 0xffd8, 'JPEG vàlid');
      const sof = bytes.indexOf(Buffer.from([0xff, 0xc0]));
      assert(sof > 0, 'JPEG base amb marcador SOF');
      this.naturalHeight = bytes.readUInt16BE(sof + 5);
      this.naturalWidth = bytes.readUInt16BE(sof + 7);
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
let localesAlInicio = null, localesAlAvanzar = false, maxLlamadas = 0;
const ctx = {
  canvas: {width: ancho, height: alto},
  fillRect() {},
  drawImage(img, sx, sy, sw, sh, x, y, w, h) {
    llamadas++;
    assert(img.complete && img.naturalWidth);
    assert(sx >= 0 && sy >= 0 && sw > 0 && sh > 0);
    assert(sx + sw <= img.naturalWidth && sy + sh <= img.naturalHeight);
    assert([x, y, w, h].every(Number.isInteger));
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
    if (img.nombre === 'locals-go-terrat-concepte.jpg') {
      localesEnCuadro++;
      assert.equal(y, 0, 'la fachada queda alineada con los edificios');
    }
    if (img.nombre === 'banc.svg') bancosEnCuadro++;
  }
};
for (let camara = 0; camara <= 1780; camara++) {
  sueloHasta = cieloHasta = llamadas = localesEnCuadro = bancosEnCuadro = 0;
  mundo.Avenida.dibujar(ctx, camara);
  assert(sueloHasta >= ancho && cieloHasta >= ancho, 'cobertura de extremo a extremo');
  if (camara === 0) {
    localesAlInicio = localesEnCuadro;
    assert(bancosEnCuadro > 0, 'los bancos ya acompañan el paseo inicial');
  }
  if (camara >= 1100 && localesEnCuadro > 0) localesAlAvanzar = true;
  maxLlamadas = Math.max(llamadas, maxLlamadas);
}
assert.equal(localesAlInicio, 0, 'GO! y El Terrat no se ven desde el comienzo');
assert(localesAlAvanzar, 'GO! y El Terrat aparecen al avanzar lateralmente');
assert.equal(imagenes.length, 6, 'las seis láminas se cargan una sola vez');
assert(!imagenes.some(i => i.nombre === 'paviment.png'),
  'la calle asfaltada anterior deja de utilizarse');
const suelo = fs.readFileSync('assets/escenarios/mestre-serrano/passeig.svg', 'utf8');
assert(!/blur|feGaussianBlur|filter=/.test(suelo), 'juntas nítidas, sin difuminados');
assert.match(suelo, /width="600" height="231"/, 'módulo del suelo de ancho exacto');
// Art aprovat: ara es reprodueixen els píxels de la il·lustració, no formes SVG.
const art = fs.readFileSync('assets/escenarios/mestre-serrano/locals-go-terrat-concepte.jpg');
assert.equal(art.readUInt16BE(0), 0xffd8, 'asset JPEG real');
assert(art.length > 40000, 'el bocet no és una icona plana ni un substitut de baixa resolució');
const imatge = imagenes.find(img => img.nombre === 'locals-go-terrat-concepte.jpg');
assert.equal(imatge.naturalWidth, 1020, 'amplada validada del fons del tram');
assert.equal(imatge.naturalHeight, 250, 'alçada validada del fons del tram');
const avenida = fs.readFileSync('src/avenida.js', 'utf8');
assert(!avenida.includes("tipo: 'placa'"), 'sin cartel callejero innecesario');
for (const imagen of imagenes) {
  imagen.naturalWidth = 0; // Error de red tras completar la petición.
  mundo.Avenida.dibujar(ctx, 1780);
}
console.log('Escenario 1.1g: paseo sin cortes en 1.781 cámaras, GO!/El Terrat al avanzar y bancos. Dibujos/cuadro máx.:', maxLlamadas);
