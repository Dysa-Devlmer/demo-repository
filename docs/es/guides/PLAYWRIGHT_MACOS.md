# Playwright en macOS (errores de permisos)

En algunos macOS (especialmente con entornos restringidos), Playwright/Chromium puede fallar con errores como:

- `FATAL: mach_port_rendezvous_mac.cc: Permission denied (1100)`

Esto suele ocurrir por restricciones del sandbox/entitlements o permisos del proceso que intenta lanzar Chromium.

## Solucion recomendada (local)
1) Reinstalar browsers de Playwright:
```bash
npx playwright install --force
```

2. En macOS, usar el navegador del sistema o ejecutar con UI (headed) para probar:

```bash
npx playwright test -c playwright.smoke.config.ts --headed
```

3. Si sigue fallando, prueba desactivar sandbox del navegador (solo local):

```bash
PLAYWRIGHT_CHROMIUM_ARGS="--no-sandbox" npx playwright test -c playwright.smoke.config.ts
```

> Nota: `--no-sandbox` es SOLO para desarrollo local. No recomendado para produccion.

## Alternativa: confiar en CI (Linux)

Los workflows `admin-smoke` y `website-smoke` corren en GitHub Actions (Linux) y no deberian verse afectados por este problema.

## Verificacion rapida

* Admin smoke:

```bash
npx playwright test -c playwright.smoke.config.ts
```

* Website smoke:

```bash
npx playwright test -c playwright.website.smoke.config.ts
```
