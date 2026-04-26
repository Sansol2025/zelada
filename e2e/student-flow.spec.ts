import { test, expect } from '@playwright/test';

test.describe('Flujo Estudiante', () => {
  test('Pantalla de ingreso de alumnos carga el entorno amigable', async ({ page }) => {
    await page.goto('/ingreso/alumnos');
    
    // Verificamos elementos clave orientados a UX amigable
    await expect(page.locator('h1')).toContainText('¡Hola, Estudiante!');
    await expect(page.getByText('Tus datos')).toBeVisible();
    
    // Chequeo de inputs de validación para alumnos
    const inputNombre = page.locator('input#first_name');
    await expect(inputNombre).toBeVisible();
    await expect(inputNombre).toHaveAttribute('placeholder', 'Ejemplo: Juan');
    
    const inputDni = page.locator('input#dni');
    await expect(inputDni).toBeVisible();
    await expect(inputDni).toHaveAttribute('placeholder', 'Sin puntos ni espacios');
    
    // Botón de acción principal
    const btnEntrar = page.locator('button[type="submit"]');
    await expect(btnEntrar).toBeVisible();
    await expect(btnEntrar).toContainText('Entrar a mi perfil');
  });

  test('El formulario tiene los campos obligatorios blindados', async ({ page }) => {
    await page.goto('/ingreso/alumnos');
    
    // Verificar requerimientos nativos para evitar envíos vacíos al servidor RPC
    await expect(page.locator('input#first_name')).toHaveAttribute('required', '');
    await expect(page.locator('input#dni')).toHaveAttribute('required', '');
  });
});
