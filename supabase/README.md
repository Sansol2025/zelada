# Supabase Setup

Archivos incluidos:
- `migrations/20260324_init_aprender_sin_barreras.sql`: esquema completo, funciones de progreso, triggers y politicas RLS.
- `seed.sql`: datos demo para docentes, familias, estudiantes, materias, modulos y actividades.

Orden recomendado:
1. Ejecutar migracion.
2. Crear usuarios demo en Auth (emails listados en `seed.sql`).
3. Ejecutar `seed.sql`.
