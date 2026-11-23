// Run against the static game, served from its repository root.
const assert = require('node:assert/strict');
const { webkit, devices } = require('playwright');

async function main() {
  const browser = await webkit.launch();
  try {
    const page = await browser.newPage({
      ...devices['iPad Pro 11 landscape'],
      viewport: {width: 1376, height: 1032}, screen: {width: 1376, height: 1032}
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) errors.push(response.url());
    });
    await page.addInitScript(() => {
      window.laminasDibujadas = new Set();
      const dibujar = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function (img, ...args) {
        if (img.src?.includes('/escenarios/')) {
          window.laminasDibujadas.add(img.src.split('/').pop());
        }
        return dibujar.call(this, img, ...args);
      };
    });
    await page.goto('http://127.0.0.1:4173/');
    await page.waitForFunction(() => window.laminasDibujadas.size >= 5);
    assert.deepEqual(await page.evaluate(() => [...window.laminasDibujadas].sort()),
      ['banc.svg', 'decorats.png', 'facanes.png', 'horitzo.png', 'passeig.svg']);

    assert(!await page.evaluate(() => window.laminasDibujadas.has('locals-go-terrat-escala-1.1h.jpg')),
      'los locales no aparecen al principio');

    // Cargar explícitamente el tramo avanzado: el JPEG del boceto escalado debe decodificar en WebKit.
    await page.waitForFunction(() => {
      const prueba = document.createElement('canvas');
      prueba.width = 900; prueba.height = 480;
      window.Avenida.dibujar(prueba.getContext('2d'), 1400);
      return window.laminasDibujadas.has('locals-go-terrat-escala-1.1h.jpg');
    });

    const canvi = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 480;
      const ctx = canvas.getContext('2d', {willReadFrequently: true});
      const camara = 1660;
      const localsX = 1450 - Math.round(camara * 0.76);
      const imatge = temps => {
        window.Avenida.dibujar(ctx, camara, temps);
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const abans = imatge(0);
      const despres = imatge(0.31);
      const pixels = {terrat: 0, go: 0, fora: 0};
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          if (abans[i] === despres[i] && abans[i + 1] === despres[i + 1] &&
            abans[i + 2] === despres[i + 2]) continue;
          const dins = y >= 155 && y < 232;
          const localX = x - localsX;
          if (dins && localX >= 236 && localX < 286) pixels.terrat++;
          else if (dins && localX >= 499 && localX < 567) pixels.go++;
          else pixels.fora++;
        }
      }
      return pixels;
    });
    assert(canvi.terrat > 100 && canvi.go > 100, 'els dos interiors canvien amb el temps');
    assert.equal(canvi.fora, 0, 'els rètols, la façana i el paviment són estables');

    const geometria = () => page.evaluate(() =>
      ['header', '#game', '.pad', '#attack', '#special'].map(selector => {
        const {x, y, width, height} = document.querySelector(selector).getBoundingClientRect();
        return [x, y, width, height];
      }));
    const inicio = await geometria();
    const pantalla = page.viewportSize();
    for (const [x, y, w, h] of inicio) {
      assert(x >= 0 && y >= 0 && w > 0 && h > 0);
      assert(x + w <= pantalla.width + 1 && y + h <= pantalla.height + 1);
    }

    await page.locator('[data-move=right]').tap();
    await page.locator('#attack').tap();
    await page.waitForFunction(() => document.querySelector('#state').textContent.includes('ATTACK'));
    await page.waitForFunction(() => document.querySelector('#state').textContent.includes('IDLE'));
    await page.locator('#special').tap();
    await page.waitForFunction(() => document.querySelector('#special').disabled);

    await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => document.querySelector('#objective').textContent.includes('Combat 1/2'));
    await page.keyboard.up('ArrowRight');
    assert.deepEqual(await geometria(), inicio);
    await page.locator('#reset').tap();
    await page.waitForFunction(() => document.querySelector('#coordinates').textContent === 'Posición: 120, 365');
    assert.equal(await page.locator('#objective').textContent(), 'Persegueix els lladres');
    assert.deepEqual(errors, []);
    console.log('WebKit en iPad emulado: paseo e interiores animados, controles táctiles, combate, cabecera estable y reinicio.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
