const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const imagenes = [];
class PNG {
  set src(ruta) {
    const bytes = fs.readFileSync(ruta);
    assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
    this.nombre = ruta.split('/').pop();
    this.naturalWidth = bytes.readUInt32BE(16);
    this.naturalHeight = bytes.readUInt32BE(20);
    this.complete = true;
    imagenes.push(this);
  }
}
const mundo = {Image: PNG};
mundo.window = mundo;
for (const ruta of ['src/escenario.js', 'src/avenida.js']) {
  vm.runInNewContext(fs.readFileSync(ruta, 'utf8'), mundo);
}
const ancho = 900, alto = 480;
let sueloHasta, cieloHasta, llamadas, maxLlamadas = 0;
const ctx = {
  canvas: {width: ancho, height: alto},
  fillRect() {},
  drawImage(img, sx, sy, sw, sh, x, y, w, h) {
    llamadas++;
    assert(img.complete && img.naturalWidth);
    assert(sx >= 0 && sy >= 0 && sw > 0 && sh > 0);
    assert(sx + sw <= img.naturalWidth && sy + sh <= img.naturalHeight);
    assert([x, y, w, h].every(Number.isInteger));
    assert(x < ancho && x + w > 0, 'solo se dibuja lo que entra en pantalla');
    if (img.nombre === 'paviment.png') {
      assert(x <= sueloHasta && y + h === alto, 'pavimento continuo hasta el borde inferior');
      sueloHasta = x + w;
    }
    if (img.nombre === 'horitzo.png') {
      assert(x <= 0 && y <= 0);
      cieloHasta = x + w;
    }
  }
};
for (let camara = 0; camara <= 1780; camara++) {
  sueloHasta = cieloHasta = llamadas = 0;
  mundo.Avenida.dibujar(ctx, camara);
  assert(sueloHasta >= ancho && cieloHasta >= ancho, 'cobertura de extremo a extremo');
  maxLlamadas = Math.max(llamadas, maxLlamadas);
}
assert.equal(imagenes.length, 4, 'las imágenes solo se cargan una vez');
for (const imagen of imagenes) {
  imagen.naturalWidth = 0; // Error de red tras completar la petición.
  mundo.Avenida.dibujar(ctx, 1780);
}
console.log('Escenario 1.1d: recortes, cobertura, carga parcial y 1.781 posiciones de cámara. Máximo de dibujos por cuadro:', maxLlamadas);
