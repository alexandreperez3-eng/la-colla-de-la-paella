const { test, expect, posicionX, geometria } = require('./juego.cjs');

test('el teclado mueve al Llaurador, activa el encuentro y permite reiniciar', async ({ page }) => {
  await page.goto('/');
  const objetivo = page.locator('#objective');
  await expect(objetivo).toHaveText('Persegueix els lladres');
  const inicio = await geometria(page);

  await page.keyboard.down('ArrowRight');
  try {
    await expect(objetivo).toHaveText('Combat 1/2 · Pèsols!');
    await expect.poll(() => posicionX(page)).toBeGreaterThan(340);
  } finally {
    await page.keyboard.up('ArrowRight');
  }
  await expect(page.locator('#state')).toHaveText('Estado: IDLE');
  const detenida = await posicionX(page);
  // Dejar pasar dos cuadros reales distingue un keyup correcto de una tecla enganchada.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await posicionX(page)).toBe(detenida);
  expect(await geometria(page)).toEqual(inicio);

  await page.getByRole('button', { name: /Volver a empezar/ }).click();
  await expect(objetivo).toHaveText('Persegueix els lladres');
  await expect(page.locator('#coordinates')).toHaveText('Posición: 120, 365');
});

test('cuatro pulsaciones encadenan cuatro golpes y el Remolí entra en recarga', async ({ page }) => {
  // Avanzar el reloj recorre cientos de cuadros y WebKit puede tardar más de 30 s.
  test.slow();
  const inicio = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: inicio });
  await page.clock.pauseAt(new Date(+inicio + 1000));
  await page.goto('/');

  await page.evaluate(() => {
    const estado = document.querySelector('#state');
    window.pasosDeCombo = [];
    new MutationObserver(() => {
      const paso = estado.textContent.match(/^Estado: ATTACK (\d)$/)?.[1];
      if (paso && window.pasosDeCombo.at(-1) !== paso) window.pasosDeCombo.push(paso);
    }).observe(estado, { childList: true });
  });

  for (let paso = 0; paso < 4; paso++) await page.keyboard.press('j');
  await page.clock.runFor(1500);
  expect(await page.evaluate(() => window.pasosDeCombo)).toEqual(['1', '2', '3', '4']);
  await expect(page.locator('#state')).toHaveText('Estado: IDLE');

  await page.keyboard.press('k');
  await page.clock.runFor(32);
  await expect(page.locator('#state')).toHaveText('Estado: SPECIAL');
  await expect(page.locator('#special')).toBeDisabled();
  await page.clock.runFor(6000);
  await expect(page.locator('#special')).toBeEnabled();
});
