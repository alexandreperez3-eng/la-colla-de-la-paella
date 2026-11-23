const { test, expect, geometria } = require('./juego.cjs');

test('los toques activan un golpe y el Remolí, con controles accesibles y reinicio', async ({ page }) => {
  await page.goto('/');
  const medidas = await geometria(page);
  const { width: ancho, height: alto } = page.viewportSize();
  for (const { selector, x, y, width, height } of medidas) {
    expect(x, selector).toBeGreaterThanOrEqual(0);
    expect(y, selector).toBeGreaterThanOrEqual(0);
    expect(width, selector).toBeGreaterThan(0);
    expect(height, selector).toBeGreaterThan(0);
    expect(x + width, selector).toBeLessThanOrEqual(ancho + 1);
    expect(y + height, selector).toBeLessThanOrEqual(alto + 1);
  }

  const estado = page.locator('#state');
  const remoli = page.locator('#special');
  await page.locator('#attack').tap();
  await expect(estado).toHaveText('Estado: ATTACK 1');
  await expect(page.locator('#combo')).toHaveText('Combo: 1/4');
  await expect(estado).toHaveText('Estado: IDLE');
  await remoli.tap();
  await expect(remoli).toBeDisabled();
  await expect(page.locator('#special-status')).toHaveText(/^\d+ s$/);

  await page.keyboard.down('ArrowRight');
  try {
    await expect(page.locator('#objective')).toHaveText('Combat 1/2 · Pèsols!');
  } finally {
    await page.keyboard.up('ArrowRight');
  }
  expect(await geometria(page)).toEqual(medidas);

  await page.getByRole('button', { name: /Volver a empezar/ }).tap();
  await expect(remoli).toBeEnabled();
  await expect(page.locator('#coordinates')).toHaveText('Posición: 120, 365');
  await expect(page.locator('#objective')).toHaveText('Persegueix els lladres');
});
