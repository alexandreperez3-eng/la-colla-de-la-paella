const { test: base, expect } = require('@playwright/test');

const test = base.extend({
  vigilarErrores: [async ({ page }, use) => {
    const errores = [];
    page.on('pageerror', error => errores.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) errores.push(`${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', request => {
      if (request.resourceType() === 'image' || request.resourceType() === 'script' ||
          request.resourceType() === 'stylesheet') {
        errores.push(`${request.failure()?.errorText} ${request.url()}`);
      }
    });
    await use();
    expect(errores, 'Errores de JavaScript o de carga de recursos').toEqual([]);
  }, { auto: true }],
});

async function posicionX(page) {
  const coordenadas = await page.locator('#coordinates').textContent();
  return Number(coordenadas.match(/^Posición: (\d+),/)[1]);
}

async function geometria(page) {
  return page.evaluate(() =>
    ['header', '#game', '.pad', '#attack', '#special'].map(selector => {
      const { x, y, width, height } = document.querySelector(selector).getBoundingClientRect();
      return { selector, x, y, width, height };
    }));
}

module.exports = { test, expect, posicionX, geometria };
