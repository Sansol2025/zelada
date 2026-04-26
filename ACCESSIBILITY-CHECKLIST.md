# ✅ Checklist de Accesibilidad Continua

Este checklist debe ejecutarse en cada release y tras añadir nuevas pantallas o flujos críticos, para cumplir con **WCAG 2.2 AA**.

## 1. Percepción visual y auditiva
- [ ] **Contraste de color (AA):** Texto normal tiene contraste mínimo de `4.5:1` frente a su fondo. Texto grande (18pt o 14pt bold) tiene `3:1`.
- [ ] **Uso del color:** El color no es el único medio para transmitir información (ej. alertas tienen ícono + color + texto explicativo).
- [ ] **Alternativas de texto (Alt text):** Toda imagen no decorativa (`<img>`, `next/image`) posee atributo `alt` descriptivo. Las decorativas usan `alt=""`.
- [ ] **Redimensionamiento de texto:** La UI soporta zoom hasta el 200% sin pérdida de contenido o funcionalidad superpuesta.

## 2. Operabilidad y Navegación
- [ ] **Navegación por teclado:** Es posible navegar por todos los elementos interactivos usando exclusivamente la tecla `Tab`. Ningún flujo requiere el uso exclusivo de un mouse.
- [ ] **Foco visible:** Todo elemento interactivo tiene un estado `:focus-visible` claro y destacado (no depender solo del predeterminado del navegador si el contraste es bajo).
- [ ] **Sin trampas de teclado:** El foco nunca queda "atrapado" dentro de un modal o widget interactivo sin forma de salir con las teclas (Ej. `Escape` cierra modales).
- [ ] **Enlaces y botones con propósito claro:** Textos como "Haga clic aquí" deben reemplazarse por la acción que realizarán ("Descargar guía", "Ir a módulos").
- [ ] **Saltar al contenido principal:** Existe un enlace oculto (visible al enfocar) para saltar la navegación repetitiva.

## 3. Comprensión (Especial Infancias/Diversidad Cognitiva)
- [ ] **Lectura asistida real:** Asegurar que el modo de "lectura automática" provea el estímulo de forma auditiva y destaque el texto (Web Speech API comprobada).
- [ ] **Instrucciones unívocas:** Interfaces de actividades infantiles proveen instrucciones con un único objetivo por pantalla, reduciendo carga cognitiva.
- [ ] **Manejo de errores amigable:** Si hay un error, se describe claramente qué falló y cómo resolverlo de manera positiva (sin mensajes técnicos alarmantes).
- [ ] **Lenguaje claro:** Usar estructura gramatical sencilla. Mantener el tono constructivo y constante.

## 4. Robustez de código y validadores E2E
- [ ] Axe-core reporta `0` issues de nivel crítico o serio en los escaneos automatizados.
- [ ] Estructura semántica correcta: Etiquetas jerárquicas correctas (`h1`-`h6`), uso de `<nav>`, `<main>`, `<article>`.
- [ ] `id` únicos vinculados a `<label htmlFor="id">` en todos los inputs.
- [ ] Atributos ARIA aplicados de manera justificada solo donde los elementos semánticos de HTML no alcanzan. En general: _"La primera regla de ARIA es no usar ARIA si HTML nativo lo soporta"_.
