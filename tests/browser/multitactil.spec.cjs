const { test, expect, posicionX } = require('./juego.cjs');

test('un dedo mantiene la dirección, otro ataca y cancelar suelta ambos', async ({ page }) => {
  await page.goto('/');
  const direccion = page.getByRole('button', { name: 'Derecha' });
  const ataque = page.getByRole('button', { name: /Encadenar combo/ });
  const estado = page.locator('#state');

  async function contacto(locator, id) {
    const { x, y, width, height } = await locator.boundingBox();
    return { x: x + width / 2, y: y + height / 2, id };
  }

  const dedo1 = await contacto(direccion, 1);
  const dedo2 = await contacto(ataque, 2);
  const sesion = await page.context().newCDPSession(page);
  try {
    await sesion.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [dedo1] });
    await expect.poll(() => posicionX(page)).toBeGreaterThan(140);
    await expect(estado).toHaveText('Estado: WALK');
    await sesion.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [dedo1, dedo2] });
    await expect(estado).toHaveText('Estado: ATTACK 1');
    await expect(direccion).toHaveClass('down');
  } finally {
    await sesion.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await sesion.detach();
  }
  await expect(direccion).not.toHaveClass(/down/);
  await expect(estado).toHaveText('Estado: IDLE');
});
