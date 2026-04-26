import { test, expect } from '@playwright/test';

test.describe('Autenticación y Accesos', () => {
  test('Landing page carga correctamente', async ({ page }) => {
    await page.goto('/');
    // Check main title or some distinct element
    await expect(page.locator('text="Educación sin barreras"')).toBeVisible();
  });

  test('Página de acceso disponible', async ({ page }) => {
    await page.goto('/acceso/login');
    // Check if the form is present
    await expect(page.locator('form')).toBeVisible();
  });
});
