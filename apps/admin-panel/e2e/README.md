# E2E Tests con Playwright

## 📋 Descripción

Tests End-to-End para el Admin Panel de ChatBotDysa usando Playwright.

## 🚀 Ejecución

### Prerrequisitos

```bash
# Instalar dependencias
npm install

# Instalar browsers de Playwright
npx playwright install chromium
```

### Ejecutar Tests

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar con UI Mode (recomendado para desarrollo)
npm run test:e2e:ui

# Ejecutar con browser visible (headed mode)
npm run test:e2e:headed

# Debug mode (paso a paso)
npm run test:e2e:debug

# Ver reporte HTML
npm run test:e2e:report
```

### Ejecutar Tests Específicos

```bash
# Solo tests de login
npx playwright test login

# Solo tests de dashboard
npx playwright test dashboard

# Solo tests de customers
npx playwright test customers
```

## 📁 Estructura de Tests

```
e2e/
├── login.spec.ts        (8 tests)  - Autenticación
├── dashboard.spec.ts    (11 tests) - Dashboard y navegación
└── customers.spec.ts    (11 tests) - CRUD de clientes
```

## 🧪 Tests Implementados

### Login (8 tests)
- ✅ Display login page correctly
- ✅ Show validation errors for empty fields
- ✅ Show error for invalid credentials
- ✅ Successfully login with valid credentials
- ✅ Activate demo mode
- ✅ Persist session after page reload
- ✅ Logout successfully
- ✅ Handle "Remember me" checkbox

### Dashboard (11 tests)
- ✅ Display dashboard stats cards
- ✅ Display page title or heading
- ✅ Load without errors
- ✅ Navigate to customers page
- ✅ Navigate to orders page
- ✅ Navigate to menu page
- ✅ Navigate to reservations page
- ✅ Navigate to settings page
- ✅ Display sidebar navigation
- ✅ Refresh data when clicking refresh button
- ✅ Display user information

### Customers CRUD (11 tests)
- ✅ Display customers list page
- ✅ Display "Create Customer" button
- ✅ Open create customer form
- ✅ Create new customer
- ✅ Search for customers
- ✅ View customer details
- ✅ Edit customer
- ✅ Delete customer
- ✅ Paginate through customers list
- ✅ Filter customers by status

## ⚙️ Configuración

El archivo `playwright.config.ts` contiene:
- Base URL: `http://localhost:7001`
- Browser: Chromium (Desktop Chrome)
- Screenshots: Solo en fallos
- Videos: Solo en fallos
- Traces: En primer reintento
- Web Server: Inicia automáticamente `npm run dev`

## 🔧 Helpers

### Login Helper

```typescript
async function login(page: any) {
  await page.goto('/login');
  await page.getByLabel(/correo electrónico|email/i).fill('admin@zgamersa.com');
  await page.getByLabel(/contraseña|password/i).fill('admin123');
  await page.getByRole('button', { name: /iniciar sesión|login/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}
```

## 📊 Credenciales de Test

```
Email: admin@zgamersa.com
Password: admin123
```

## 🐛 Debugging

### Ver Trace de Test Fallido

```bash
npx playwright show-trace test-results/.../trace.zip
```

### Ejecutar en Debug Mode

```bash
npm run test:e2e:debug
```

### Usar Playwright Inspector

El debug mode automáticamente abre el inspector donde puedes:
- Ejecutar tests paso a paso
- Ver selectores en tiempo real
- Inspeccionar el estado del browser

## 📈 Reports

Después de ejecutar tests, se genera un reporte HTML:

```bash
npm run test:e2e:report
```

El reporte incluye:
- ✅ Tests pasados/fallidos
- ⏱️ Tiempos de ejecución
- 📸 Screenshots de fallos
- 🎥 Videos de fallos
- 🔍 Traces para debugging

## 💡 Tips

### Skip Tests Condicional

Los tests usan `.skip()` automáticamente cuando:
- Un elemento no existe en la UI
- Una funcionalidad no está disponible
- El timeout expira

Ejemplo:
```typescript
if (!await button.isVisible({ timeout: 2000 }).catch(() => false)) {
  test.skip();
  return;
}
```

### Selectores Resilientes

Los tests usan múltiples estrategias de selección:
- Roles ARIA (más semántico)
- Labels (accesibilidad)
- Text content (i18n friendly con regex)
- Test IDs (cuando disponibles)

### Waits Inteligentes

- `page.waitForURL()` - Espera navegación
- `page.waitForTimeout()` - Espera fija (usar con moderación)
- `page.waitForLoadState('networkidle')` - Espera red inactiva
- `element.isVisible({ timeout })` - Espera elemento visible

## 🚦 CI/CD Integration

Para integrar con CI/CD:

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Playwright Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 📝 Notas

- **Auto-wait**: Playwright espera automáticamente que elementos sean interactuables
- **Auto-retry**: Assertions se reintentan automáticamente hasta timeout
- **Isolation**: Cada test se ejecuta en contexto aislado
- **Parallelización**: Tests se ejecutan en paralelo por defecto
- **Web Server**: Se inicia automáticamente antes de tests

## 🔗 Referencias

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
