import { test, expect } from '@playwright/test';

test.describe('Autenticación y Seguridad (Docente / Familia)', () => {
  test('Protección de rutas: Redirección forzada desde /docente', async ({ page }) => {
    // Al intentar entrar a rutas protegidas sin JWT
    await page.goto('/docente');
    
    // Supabase Auth y Middleware rebotan hacia /acceso
    // Se espera que la página actual termine en /acceso tras resolver la promesa
    await expect(page).toHaveURL(/.*\/acceso/);
  });

  test('Protección de rutas: Redirección forzada desde /familia', async ({ page }) => {
    // Iguales medidas para la información confidencial de familiares
    await page.goto('/familia');
    await expect(page).toHaveURL(/.*\/acceso/);
  });

  test('Validación estructural de la puerta lógica (Portal de Acceso)', async ({ page }) => {
    await page.goto('/acceso');
    
    // Validar el "Sovereign Academic" en la caja de login central
    await expect(page.getByText('Portal Académico')).toBeVisible();
    await expect(page.getByText('Docentes y Familias')).toBeVisible();
    await expect(page.getByText('Acceso Encriptado')).toBeVisible();

    // Verificamos id explícitos para soporte en lectores de pantalla y robustez QA
    const inputMail = page.locator('input#email');
    await expect(inputMail).toBeVisible();
    await expect(inputMail).toHaveAttribute('type', 'email');
    
    const inputPass = page.locator('input#password');
    await expect(inputPass).toBeVisible();
    await expect(inputPass).toHaveAttribute('type', 'password');
    
    // Testeamos los enlaces estáticos alternativos (estudiantes link/qr mode)
    await expect(page.locator('a[href="/acceso?mode=qr"]')).toBeVisible();
    await expect(page.locator('a[href="/acceso?mode=link"]')).toBeVisible();
  });
});
