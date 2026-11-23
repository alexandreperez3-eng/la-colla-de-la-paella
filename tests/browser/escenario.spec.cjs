const { test, expect } = require('./juego.cjs');

test('Mestre Serrano conserva el horizonte y anima solo al público y los portales', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.laminasEnEscena = new Map();
    const dibujar = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (imagen, ...args) {
      if (imagen.src?.includes('/escenarios/')) {
        window.laminasEnEscena.set(imagen.src.split('/').pop(), imagen);
      }
      return dibujar.call(this, imagen, ...args);
    };
  });

  await page.goto('/');
  await expect.poll(() => page.evaluate(() => [...window.laminasEnEscena.keys()].sort())).toEqual(
    ['arbre-alt-passeig.png', 'banc.svg', 'decorats.png', 'facanes.png', 'horitzo.png', 'passeig.svg']);
  await testInfo.attach('inicio', {
    body: await page.locator('#game').screenshot(),
    contentType: 'image/png',
  });

  // Usar el dibujante real a una cámara y un tiempo reproducibles, sin modificar el juego.
  await page.waitForFunction(() => {
    const prueba = document.createElement('canvas');
    prueba.width = 900;
    prueba.height = 480;
    window.Avenida.dibujar(prueba.getContext('2d'), 1660);
    return window.laminasEnEscena.has('locals-go-terrat-sense-arbres.png');
  });

  const canvi = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 480;
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    const camara = 1660;
    const horitzo = [...window.laminasEnEscena.values()]
      .find(imagen => imagen.src.endsWith('/horitzo.png'));
    // Punto de vista fijo y una franja de horizonte entre la última casa y los locales.
    const fondo = document.createElement('canvas');
    fondo.width = canvas.width;
    fondo.height = canvas.height;
    const referencia = fondo.getContext('2d');
    referencia.drawImage(horitzo, 0, 0, 1114, 277, -Math.round(camara * 0.11), -8, 1114, 277);
    const localsX = 1450 - Math.round(camara * 0.76);
    const imatge = temps => {
      window.Avenida.dibujar(ctx, camara, temps);
      return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const abans = imatge(0);
    const hueco = ctx.getImageData(110, 15, 70, 180).data;
    const fondoDelHueco = referencia.getImageData(110, 15, 70, 180).data;
    const huecoMuestraHorizonte = hueco.every((valor, i) => valor === fondoDelHueco[i]);
    const despres = imatge(2.1);
    const grupsDeFora = [[126, 184], [355, 425], [457, 492], [591, 624], [643, 700]];
    const pixels = {terrat: 0, go: 0, grups: [0, 0, 0, 0, 0], fixos: 0};
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        if (abans[i] === despres[i] && abans[i + 1] === despres[i + 1] &&
          abans[i + 2] === despres[i + 2]) continue;
        const dins = y >= 155 && y < 232;
        const localX = x - localsX;
        if (dins && localX >= 236 && localX < 286) pixels.terrat++;
        else if (dins && localX >= 499 && localX < 567) pixels.go++;
        else {
          const grup = y >= 164 && y < 214 ?
            grupsDeFora.findIndex(([inici, fi]) => localX >= inici && localX < fi) : -1;
          if (grup >= 0) pixels.grups[grup]++;
          else pixels.fixos++;
        }
      }
    }
    return { ...pixels, huecoMuestraHorizonte, captura: canvas.toDataURL('image/png') };
  });

  await testInfo.attach('GO y El Terrat', {
    body: Buffer.from(canvi.captura.split(',')[1], 'base64'),
    contentType: 'image/png',
  });
  expect(canvi.huecoMuestraHorizonte, 'El hueco deja ver la ilustración de fondo').toBe(true);
  expect(canvi.terrat, 'El interior de El Terrat cambia con el tiempo').toBeGreaterThan(100);
  expect(canvi.go, 'El interior de GO cambia con el tiempo').toBeGreaterThan(100);
  for (const [i, cantidad] of canvi.grups.entries()) {
    expect(cantidad, `El grupo exterior ${i + 1} se anima`).toBeGreaterThan(20);
  }
  expect(canvi.fixos, 'Las fachadas y el pavimento quedan estables').toBe(0);
});
