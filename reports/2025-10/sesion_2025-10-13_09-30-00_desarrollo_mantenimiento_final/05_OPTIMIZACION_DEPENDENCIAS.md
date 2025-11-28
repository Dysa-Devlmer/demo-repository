# 05 - OPTIMIZACIÓN DE DEPENDENCIAS
## ChatBotDysa Enterprise+++++ - Sesión 6

**Fecha:** 2025-10-13
**Hora:** 11:15:00 - 12:00:00
**Fase:** Auditoría y Optimización de Dependencias
**Estado:** ✅ EN PROGRESO

---

## 📋 RESUMEN EJECUTIVO

### Objetivo Principal
Realizar auditoría completa de dependencias en todas las aplicaciones del ecosistema, identificar conflictos de versiones, dependencias duplicadas y no utilizadas, y optimizar el consumo de espacio en node_modules.

### Hallazgos Iniciales

**Problemas Críticos Detectados:**
1. 🔴 **Conflicto de versiones React**: Admin Panel solicita React 19, pero tiene instalado React 18
2. 🔴 **@next/font deprecado**: Presente en package.json raíz (línea 91)
3. 🟡 **Tailwind CSS v4 en raíz**: Conflicto con apps que usan v3
4. 🟡 **Archivos i18n no se copiaban** durante build del backend
5. 🟢 **Duplicación de dependencias** entre raíz y apps

---

## 🔍 ANÁLISIS DETALLADO POR APLICACIÓN

### 1. Backend (NestJS)

**Ubicación:** `/Users/devlmer/ChatBotDysa/apps/backend`

#### Información General
```json
{
  "name": "backend",
  "version": "0.0.1",
  "framework": "NestJS 11.1.6",
  "node": ">=22.0.0 <23"
}
```

#### Dependencias Principales (46 total)

**Framework Core:**
- `@nestjs/common`: ^11.1.6
- `@nestjs/core`: ^11.1.6
- `@nestjs/platform-express`: ^11.1.6
- `@nestjs/platform-socket.io`: ^11.1.6 (WebSockets)

**Database & ORM:**
- `@nestjs/typeorm`: ^11.0.0
- `typeorm`: ^0.3.26 (en devDependencies)
- `pg`: ^8.16.3 (PostgreSQL)

**Authentication & Security:**
- `@nestjs/jwt`: ^11.0.0
- `@nestjs/passport`: ^11.0.5
- `passport`: ^0.7.0
- `passport-jwt`: ^4.0.1
- `passport-local`: ^1.0.0
- `bcrypt`: ^6.0.0
- `bcryptjs`: ^3.0.2 ⚠️ (DUPLICADO - eliminar)
- `helmet`: ^7.1.0

**Caching & Session:**
- `@nestjs/cache-manager`: ^3.0.1
- `cache-manager`: ^7.2.0
- `cache-manager-ioredis-yet`: ^2.1.2
- `ioredis`: ^5.7.0
- `express-session`: ^1.18.2

**Observability (OpenTelemetry):**
- `@opentelemetry/auto-instrumentations-node`: ^0.64.1
- `@opentelemetry/exporter-jaeger`: ^2.1.0
- `@opentelemetry/exporter-otlp-http`: ^0.26.0 ⚠️ (versión antigua)
- `@opentelemetry/exporter-prometheus`: ^0.205.0 ⚠️ (versión antigua)
- `@opentelemetry/sdk-node`: ^0.205.0 ⚠️ (versión antigua)
- `@opentelemetry/sdk-trace-node`: ^2.1.0
- `@opentelemetry/sdk-metrics`: ^2.1.0
- `@opentelemetry/resources`: ^2.1.0
- `@opentelemetry/semantic-conventions`: ^1.37.0
- `prom-client`: ^15.1.3

**Payment Processing:**
- `stripe`: ^18.5.0
- `mercadopago`: ^2.9.0
- `@paypal/checkout-server-sdk`: ^1.0.3

**Communication:**
- `twilio`: ^5.10.1
- `nodemailer`: ^7.0.6
- `@sendgrid/mail`: ^8.1.6

**Utilities:**
- `archiver`: ^7.0.1
- `tar`: ^7.5.1
- `aws-sdk`: ^2.1692.0 ⚠️ (deprecado, migrar a AWS SDK v3)
- `compression`: ^1.8.1
- `cookie-parser`: ^1.4.7
- `express-rate-limit`: ^8.1.0
- `uuid`: ^8.3.2
- `socket.io`: ^4.8.1

**Logging:**
- `nest-winston`: ^1.10.2
- `winston`: ^3.17.0
- `winston-daily-rotate-file`: ^5.0.0

**Validation:**
- `class-transformer`: ^0.5.1
- `class-validator`: ^0.14.2

**Reflection:**
- `reflect-metadata`: ^0.2.2

**Async:**
- `rxjs`: ^7.8.1

#### DevDependencies (29 total)

**NestJS Tooling:**
- `@nestjs/cli`: ^11.0.10
- `@nestjs/schematics`: ^11.0.0
- `@nestjs/testing`: ^11.0.1

**TypeScript & ESLint:**
- `typescript`: ^5.9.2
- `eslint`: ^9.18.0
- `typescript-eslint`: ^8.20.0
- `@eslint/eslintrc`: ^3.2.0
- `@eslint/js`: ^9.36.0
- `eslint-config-prettier`: ^10.0.1
- `eslint-plugin-prettier`: ^5.5.4
- `prettier`: ^3.4.2
- `globals`: ^16.0.0

**Testing:**
- `jest`: ^30.2.0
- `jest-cli`: ^30.2.0
- `ts-jest`: ^29.2.5
- `supertest`: ^7.0.0
- `@types/supertest`: ^6.0.2

**Build Tools:**
- `ts-node`: ^10.9.2
- `ts-loader`: ^9.5.2
- `tsconfig-paths`: ^4.2.0
- `source-map-support`: ^0.5.21

**Type Definitions:**
- `@types/node`: ^22.10.0
- `@types/express`: ^4.17.23
- `@types/jest`: ^30.0.0
- `@types/bcrypt`: ^5.0.2
- `@types/passport-jwt`: ^3.0.13
- `@types/socket.io`: ^3.0.1
- `@types/uuid`: ^10.0.0
- `@types/aws-sdk`: ^2.7.4
- `@types/compression`: ^1.8.1
- `@types/express-session`: ^1.18.2
- `@types/mercadopago`: ^1.5.11
- `@types/nodemailer`: ^7.0.2
- `@types/tar`: ^6.1.13

#### Problemas Identificados

1. **Duplicación bcrypt/bcryptjs**
   - `bcrypt`: ^6.0.0
   - `bcryptjs`: ^3.0.2 ⚠️
   - **Acción:** Eliminar bcryptjs, usar solo bcrypt

2. **AWS SDK v2 (Deprecado)**
   - `aws-sdk`: ^2.1692.0 ⚠️
   - **Acción:** Migrar a @aws-sdk/* (v3) modular

3. **OpenTelemetry Versiones Inconsistentes**
   - Algunas en v0.205.0, otras en v2.1.0
   - **Acción:** Actualizar todas a v2.x

4. **TypeORM en devDependencies**
   - Debería estar en dependencies
   - **Acción:** Mover a dependencies

5. **Archivos i18n no se copiaban**
   - nest-cli.json configurado correctamente
   - **Acción:** ✅ Resuelto con npm run build

#### Tamaño node_modules
```bash
Estimado: ~220 MB
```

---

### 2. Admin Panel (Next.js 15)

**Ubicación:** `/Users/devlmer/ChatBotDysa/apps/admin-panel`

#### Información General
```json
{
  "name": "@chatbotdysa/admin-panel",
  "version": "1.0.0",
  "framework": "Next.js 15.5.2",
  "react": "19.0.0"
}
```

#### Dependencias (25 total)

**Framework Core:**
- `next`: ^15.5.2
- `react`: ^19.0.0
- `react-dom`: ^19.0.0

**UI Components (Radix UI):**
- `@radix-ui/react-avatar`: ^1.1.10
- `@radix-ui/react-dialog`: ^1.0.5
- `@radix-ui/react-dropdown-menu`: ^2.1.16
- `@radix-ui/react-label`: ^2.1.7
- `@radix-ui/react-scroll-area`: ^1.2.10
- `@radix-ui/react-select`: ^2.2.6
- `@radix-ui/react-separator`: ^1.1.7
- `@radix-ui/react-slot`: ^1.0.2
- `@radix-ui/react-tabs`: ^1.1.13
- `@radix-ui/react-toast`: ^1.1.5

**Forms & Validation:**
- `@hookform/resolvers`: ^3.7.0
- `react-hook-form`: ^7.52.1
- `zod`: ^3.23.8

**Styling:**
- `class-variance-authority`: ^0.7.1
- `clsx`: ^2.1.1
- `tailwind-merge`: ^2.6.0
- `tailwindcss-animate`: ^1.0.7

**Charts:**
- `recharts`: ^3.2.1

**Utilities:**
- `axios`: ^1.7.2
- `date-fns`: ^4.1.0
- `lucide-react`: ^0.427.0

**Build Optimization:**
- `critters`: ^0.0.23 (Critical CSS inlining)

#### DevDependencies (9 total)

**TypeScript:**
- `typescript`: 5.5.4
- `@types/node`: ^22.10.0
- `@types/react`: ^19.0.0 ⚠️ (instalado ^18.3.3)
- `@types/react-dom`: ^19.0.0 ⚠️ (instalado ^18.3.0)

**Styling:**
- `tailwindcss`: 3.4.7
- `autoprefixer`: 10.4.19
- `postcss`: 8.4.40

**Linting:**
- `eslint`: 8.57.0
- `eslint-config-next`: 14.2.5

#### Problemas Identificados

1. 🔴 **Conflicto de Versiones React Types**
   ```bash
   Solicitado: @types/react@^19.0.0
   Instalado: @types/react@18.3.3

   Solicitado: @types/react-dom@^19.0.0
   Instalado: @types/react-dom@18.3.0
   ```
   - **Causa:** Incompatibilidad entre package.json y npm install
   - **Acción:** Forzar instalación de versiones correctas

2. 🟡 **eslint-config-next desactualizado**
   - Solicitado: 14.2.5
   - Next.js actual: 15.5.2
   - **Acción:** Actualizar a ^15.5.2

3. 🟢 **Lucide React versión diferente a Website**
   - Admin Panel: 0.427.0
   - Website: 0.294.0
   - **Acción:** Unificar versión (usar 0.427.0)

#### Tamaño node_modules
```bash
Estimado: ~580 MB
```

---

### 3. Website (Next.js 14)

**Ubicación:** `/Users/devlmer/ChatBotDysa/apps/website`

#### Información General
```json
{
  "name": "@chatbotdysa/website",
  "version": "1.0.0",
  "framework": "Next.js 14.0.3",
  "react": "18.2.0",
  "node": ">=18.0.0"
}
```

#### Dependencias (31 total)

**Framework Core:**
- `next`: ^14.0.3
- `react`: ^18.2.0
- `react-dom`: ^18.2.0

**UI Components (Radix UI):**
- `@radix-ui/react-accordion`: ^1.1.2
- `@radix-ui/react-avatar`: ^1.0.4
- `@radix-ui/react-dialog`: ^1.0.5
- `@radix-ui/react-dropdown-menu`: ^2.0.6
- `@radix-ui/react-form`: ^0.0.3
- `@radix-ui/react-label`: ^2.0.2
- `@radix-ui/react-select`: ^2.0.0
- `@radix-ui/react-separator`: ^1.0.3
- `@radix-ui/react-slot`: ^1.0.2
- `@radix-ui/react-tabs`: ^1.0.4
- `@radix-ui/react-toast`: ^1.1.5

**Forms & Validation:**
- `@hookform/resolvers`: ^3.3.2
- `react-hook-form`: ^7.48.2
- `zod`: ^3.22.4

**Styling:**
- `class-variance-authority`: ^0.7.0
- `clsx`: ^2.0.0
- `tailwind-merge`: ^2.0.0
- `tailwindcss-animate`: ^1.0.7

**Animations:**
- `framer-motion`: ^10.16.5
- `canvas-confetti`: ^1.9.3

**Payment (Stripe):**
- `@stripe/react-stripe-js`: ^2.4.0
- `@stripe/stripe-js`: ^2.2.0
- `stripe`: ^14.7.0

**Utilities:**
- `lucide-react`: ^0.294.0
- `next-themes`: ^0.2.1
- `react-countup`: ^6.4.2
- `react-intersection-observer`: ^9.5.3

#### DevDependencies (10 total)

**TypeScript:**
- `typescript`: ^5.3.2
- `@types/node`: ^20.10.0
- `@types/react`: ^18.2.39
- `@types/react-dom`: ^18.2.17
- `@types/canvas-confetti`: ^1.9.0

**Styling:**
- `tailwindcss`: ^3.4.18 (✅ downgraded from v4)
- `autoprefixer`: ^10.4.16
- `postcss`: ^8.4.32

**Linting:**
- `eslint`: ^8.54.0
- `eslint-config-next`: ^14.0.3
- `prettier`: ^3.1.0

#### Problemas Identificados

1. ✅ **Tailwind CSS v4 → v3 (RESUELTO)**
   - Migrado exitosamente a v3.4.18

2. ✅ **@next/font deprecado (RESUELTO)**
   - Removido del proyecto

3. 🟡 **Versiones antiguas de @types/node**
   - Website: ^20.10.0
   - Admin Panel: ^22.10.0
   - Backend: ^22.10.0
   - **Acción:** Actualizar a ^22.10.0

4. 🟡 **Stripe desactualizado**
   - Website: ^14.7.0
   - Backend: ^18.5.0
   - **Acción:** Actualizar a ^18.5.0

5. 🟢 **Lucide React versión antigua**
   - Website: 0.294.0
   - Admin Panel: 0.427.0
   - **Acción:** Actualizar a 0.427.0

#### Tamaño node_modules
```bash
Estimado: ~596 MB
```

---

### 4. Package.json Raíz (Monorepo)

**Ubicación:** `/Users/devlmer/ChatBotDysa/package.json`

#### Información General
```json
{
  "name": "chatbotdysa",
  "version": "1.0.0",
  "type": "commonjs",
  "packageManager": "yarn@1.22.22",
  "workspaces": ["apps/*", "external-servers/*"]
}
```

#### Dependencias (28 total)

**Problemas Críticos:**
1. 🔴 **@next/font deprecado**
   ```json
   "@next/font": "^14.2.15"  // Línea 91
   ```
   - **Acción:** ❌ ELIMINAR INMEDIATAMENTE

2. 🔴 **Tailwind CSS v4 en raíz**
   ```json
   "tailwindcss": "^4.1.13"  // Línea 114
   ```
   - Conflicto con apps que usan v3
   - **Acción:** Remover o downgrade a ^3.4.18

3. 🔴 **Duplicación masiva de dependencias**
   - Muchas dependencias del raíz están duplicadas en apps
   - **Ejemplos:**
     - `@hookform/resolvers`: ^5.2.1 (raíz), ^3.7.0 (admin-panel), ^3.3.2 (website)
     - `@types/react`: ^19.1.12 (raíz), ^19.0.0 (admin-panel), ^18.2.39 (website)
     - `lucide-react`: ^0.544.0 (raíz), ^0.427.0 (admin-panel), ^0.294.0 (website)
     - `next`: ^15.5.3 (raíz), ^15.5.2 (admin-panel), ^14.0.3 (website)

#### DevDependencies (16 total)

**Electron:**
- `electron`: ^38.0.0
- `electron-builder`: ^26.0.12
- `electron-is-dev`: ^3.0.1
- `electron-log`: ^5.4.3
- `electron-updater`: ^6.6.2
- `electron-window-state`: ^5.0.3
- `@electron/notarize`: ^3.1.0

**Testing:**
- `@playwright/test`: ^1.55.0
- `playwright`: ^1.55.0

**Utilities:**
- `concurrently`: ^8.2.2
- `wait-on`: ^8.0.4
- `ts-node`: ^10.9.2
- `typescript`: ^5.9.2
- `prettier`: ^3.6.2
- `eslint`: ^9.35.0
- `@types/node`: ^24.3.1

#### Overrides

El raíz define overrides de NestJS para todo el monorepo:

```json
"overrides": {
  "@nestjs/common": "^11.1.6",
  "@nestjs/core": "^11.1.6",
  "@nestjs/platform-express": "^11.1.6",
  "@nestjs/websockets": "^11.1.6",
  "@nestjs/platform-socket.io": "^11.1.6",
  "@nestjs/jwt": "^11.0.0",
  "@nestjs/passport": "^11.0.0",
  "@nestjs/typeorm": "^11.0.0",
  "@nestjs/cache-manager": "^3.0.0",
  "@nestjs/mapped-types": "^2.0.0",
  "rxjs": "^7.8.1",
  "typeorm": "^0.3.20",
  "class-validator": "^0.14.1",
  "class-transformer": "^0.5.1"
}
```

**Nota:** ⚠️ El override de `typeorm: ^0.3.20` es menor que la versión en backend (^0.3.26)

---

## 📊 TABLA COMPARATIVA DE VERSIONES

### Dependencias Compartidas Entre Apps

| Paquete | Backend | Admin Panel | Website | Raíz | Recomendado |
|---------|---------|-------------|---------|------|-------------|
| **TypeScript** | 5.9.2 | 5.5.4 | 5.3.2 | 5.9.2 | 5.9.2 |
| **@types/node** | 22.10.0 | 22.10.0 | 20.10.0 | 24.3.1 | 22.10.0 |
| **eslint** | 9.18.0 | 8.57.0 | 8.54.0 | 9.35.0 | 9.35.0 |
| **prettier** | 3.4.2 | - | 3.1.0 | 3.6.2 | 3.6.2 |
| **tailwindcss** | - | 3.4.7 | 3.4.18 | 4.1.13 ❌ | 3.4.18 |
| **lucide-react** | - | 0.427.0 | 0.294.0 | 0.544.0 | 0.544.0 |
| **next** | - | 15.5.2 | 14.0.3 | 15.5.3 | App-specific |
| **react** | - | 19.0.0 | 18.2.0 | 19.1.1 | App-specific |
| **@hookform/resolvers** | - | 3.7.0 | 3.3.2 | 5.2.1 | 5.2.1 |
| **react-hook-form** | - | 7.52.1 | 7.48.2 | - | 7.62.0 |
| **zod** | - | 3.23.8 | 3.22.4 | - | 3.23.8 |
| **axios** | - | 1.7.2 | - | - | 1.12.0 |
| **bcrypt** | 6.0.0 | - | - | 6.0.0 | 6.0.0 |
| **stripe** | 18.5.0 | - | 14.7.0 | - | 18.5.0 |

### Leyenda
- ✅ = Versión correcta
- ⚠️ = Versión desactualizada
- ❌ = Versión incorrecta/conflictiva
- `-` = No aplicable

---

## 🔧 ACCIONES CORRECTIVAS PRIORITARIAS

### Prioridad 1: CRÍTICAS (Ejecutar Inmediatamente)

#### 1.1 Eliminar @next/font del raíz
```bash
cd /Users/devlmer/ChatBotDysa
npm uninstall @next/font
```

**Razón:** Paquete deprecado desde Next.js 13. Usar `next/font` built-in.

#### 1.2 Resolver conflicto Tailwind CSS en raíz
```bash
cd /Users/devlmer/ChatBotDysa
npm uninstall tailwindcss
# Tailwind debe estar solo en las apps que lo necesitan
```

**Razón:** Conflicto entre v4.1.13 (raíz) y v3.4.x (apps)

#### 1.3 Actualizar @types/react en Admin Panel
```bash
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm install --save-dev @types/react@^19.0.0 @types/react-dom@^19.0.0
```

**Razón:** Mismatch entre versión solicitada (19) e instalada (18)

#### 1.4 Eliminar bcryptjs del Backend
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend
npm uninstall bcryptjs
```

**Razón:** Duplicado con bcrypt nativo (mejor performance)

### Prioridad 2: ALTAS (Ejecutar Esta Semana)

#### 2.1 Unificar versiones de TypeScript
```bash
# Admin Panel
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm install --save-dev typescript@^5.9.2

# Website
cd /Users/devlmer/ChatBotDysa/apps/website
npm install --save-dev typescript@^5.9.2
```

#### 2.2 Actualizar @types/node en Website
```bash
cd /Users/devlmer/ChatBotDysa/apps/website
npm install --save-dev @types/node@^22.10.0
```

#### 2.3 Unificar lucide-react en todas las apps
```bash
# Website
cd /Users/devlmer/ChatBotDysa/apps/website
npm install lucide-react@^0.544.0

# Admin Panel
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm install lucide-react@^0.544.0
```

#### 2.4 Actualizar Stripe en Website
```bash
cd /Users/devlmer/ChatBotDysa/apps/website
npm install stripe@^18.5.0
```

#### 2.5 Mover TypeORM a dependencies en Backend
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend
# Editar package.json manualmente:
# Mover "typeorm": "^0.3.26" de devDependencies a dependencies
npm install
```

### Prioridad 3: MEDIAS (Ejecutar Este Mes)

#### 3.1 Migrar AWS SDK v2 → v3 en Backend
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend
npm uninstall aws-sdk @types/aws-sdk
npm install @aws-sdk/client-s3 @aws-sdk/client-ses
```

**Nota:** Requiere cambios en código. AWS SDK v2 será descontinuado en 2025.

#### 3.2 Actualizar OpenTelemetry en Backend
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend
npm install \
  @opentelemetry/exporter-otlp-http@^0.56.0 \
  @opentelemetry/exporter-prometheus@^0.56.0 \
  @opentelemetry/sdk-node@^0.56.0
```

#### 3.3 Unificar eslint en todas las apps
```bash
# Admin Panel
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm install --save-dev eslint@^9.35.0

# Website
cd /Users/devlmer/ChatBotDysa/apps/website
npm install --save-dev eslint@^9.35.0
```

**Nota:** Requiere actualización de configuración ESLint a formato flat config.

### Prioridad 4: BAJAS (Optimizaciones Futuras)

#### 4.1 Remover dependencias duplicadas del raíz

Evaluar si estas dependencias en el raíz son necesarias:
- `@hookform/resolvers`
- `framer-motion`
- `react`, `react-dom`
- `autoprefixer`
- `postcss`

**Estrategia:** Mover a apps individuales si no son compartidas.

#### 4.2 Actualizar eslint-config-next en Admin Panel
```bash
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm install --save-dev eslint-config-next@^15.5.2
```

---

## 📈 ESPACIO EN DISCO: ANÁLISIS

### node_modules por Aplicación

```
Total node_modules: ~2.4 GB

Desglose:
├── Raíz (monorepo)    ~1.0 GB  (42%)
├── Admin Panel        ~580 MB  (24%)
├── Website            ~596 MB  (25%)
└── Backend            ~220 MB  (9%)
```

### Oportunidades de Optimización

**Hoisting de Dependencias:**
- Workspaces ya configurados
- npm debería hacer hoisting automático
- **Verificación:** ¿Hay duplicados en apps/?

**Dependencias Duplicadas Estimadas:**
```
lucide-react (3 versiones):     ~15 MB
react-hook-form (2 versiones):  ~8 MB
@hookform/resolvers:            ~5 MB
@radix-ui/* (versiones mixed):  ~30 MB
Total estimado ahorrable:       ~60 MB (2.5%)
```

**Impacto:** Bajo, pero mejora mantenibilidad.

---

## ✅ CHECKLIST DE ACCIONES

### Fase 1: Correcciones Críticas (HOY)
- [ ] Eliminar @next/font del package.json raíz
- [ ] Resolver conflicto Tailwind CSS (remover del raíz)
- [ ] Actualizar @types/react@19 en Admin Panel
- [ ] Eliminar bcryptjs del Backend
- [ ] Verificar build exitoso en las 3 apps

### Fase 2: Unificación de Versiones (ESTA SEMANA)
- [ ] Unificar TypeScript a 5.9.2
- [ ] Unificar @types/node a 22.10.0
- [ ] Unificar lucide-react a 0.544.0
- [ ] Actualizar Stripe en Website a 18.5.0
- [ ] Mover TypeORM a dependencies

### Fase 3: Migraciones (ESTE MES)
- [ ] Migrar AWS SDK v2 → v3
- [ ] Actualizar OpenTelemetry packages
- [ ] Unificar ESLint a 9.35.0
- [ ] Actualizar Prettier a 3.6.2

### Fase 4: Optimización (FUTURO)
- [ ] Evaluar remover deps duplicadas del raíz
- [ ] Verificar hoisting de node_modules
- [ ] Actualizar eslint-config-next
- [ ] Audit npm vulnerabilities

---

## 🚨 PROBLEMAS DETECTADOS: RESUMEN

### Críticos (4)
1. ❌ @next/font deprecado en raíz
2. ❌ Tailwind CSS v4 en raíz conflicto con v3 en apps
3. ❌ @types/react mismatch en Admin Panel (19 solicitado, 18 instalado)
4. ❌ bcrypt/bcryptjs duplicado en Backend

### Altos (5)
5. ⚠️ TypeScript versiones inconsistentes (5.3.2 / 5.5.4 / 5.9.2)
6. ⚠️ @types/node versiones inconsistentes (20.10.0 / 22.10.0 / 24.3.1)
7. ⚠️ lucide-react 3 versiones diferentes (0.294.0 / 0.427.0 / 0.544.0)
8. ⚠️ Stripe versiones diferentes (14.7.0 en Website, 18.5.0 en Backend)
9. ⚠️ TypeORM en devDependencies (debería estar en dependencies)

### Medios (3)
10. 🟡 AWS SDK v2 deprecado en Backend
11. 🟡 OpenTelemetry versiones mezcladas (0.205.0 / 2.1.0)
12. 🟡 ESLint versiones muy diferentes (8.54.0 / 8.57.0 / 9.18.0 / 9.35.0)

### Bajos (2)
13. 🟢 eslint-config-next desactualizado en Admin Panel
14. 🟢 Dependencias duplicadas entre raíz y apps (~60 MB)

**Total: 14 problemas identificados**

---

## 📝 COMANDOS DE EJECUCIÓN COMPLETA

### Script de Corrección Automática

```bash
#!/bin/bash
# Archivo: /Users/devlmer/ChatBotDysa/scripts/fix-dependencies.sh

set -e

echo "🔧 ChatBotDysa - Corrección de Dependencias"
echo "=========================================="
echo ""

# Fase 1: Críticas
echo "📌 Fase 1: Correcciones Críticas"
echo ""

echo "1/4 - Eliminando @next/font del raíz..."
cd /Users/devlmer/ChatBotDysa
npm uninstall @next/font

echo "2/4 - Eliminando Tailwind v4 del raíz..."
npm uninstall tailwindcss

echo "3/4 - Actualizando @types/react en Admin Panel..."
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm install --save-dev @types/react@^19.0.0 @types/react-dom@^19.0.0

echo "4/4 - Eliminando bcryptjs del Backend..."
cd /Users/devlmer/ChatBotDysa/apps/backend
npm uninstall bcryptjs

echo ""
echo "✅ Fase 1 completada"
echo ""

# Fase 2: Altas
echo "📌 Fase 2: Unificación de Versiones"
echo ""

echo "1/5 - Actualizando TypeScript..."
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm install --save-dev typescript@^5.9.2
cd /Users/devlmer/ChatBotDysa/apps/website
npm install --save-dev typescript@^5.9.2

echo "2/5 - Actualizando @types/node en Website..."
cd /Users/devlmer/ChatBotDysa/apps/website
npm install --save-dev @types/node@^22.10.0

echo "3/5 - Unificando lucide-react..."
cd /Users/devlmer/ChatBotDysa/apps/website
npm install lucide-react@^0.544.0
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm install lucide-react@^0.544.0

echo "4/5 - Actualizando Stripe en Website..."
cd /Users/devlmer/ChatBotDysa/apps/website
npm install stripe@^18.5.0

echo "5/5 - Nota: TypeORM debe moverse manualmente a dependencies"

echo ""
echo "✅ Fase 2 completada"
echo ""

# Verificación
echo "📌 Verificación de Builds"
echo ""

echo "Building Backend..."
cd /Users/devlmer/ChatBotDysa/apps/backend
npm run build

echo "Building Admin Panel..."
cd /Users/devlmer/ChatBotDysa/apps/admin-panel
npm run build

echo "Building Website..."
cd /Users/devlmer/ChatBotDysa/apps/website
npm run build

echo ""
echo "🎉 ¡Corrección de dependencias completada!"
echo ""
echo "Siguiente paso: Revisar manualmente package.json del Backend"
echo "  - Mover typeorm de devDependencies a dependencies"
echo ""
```

**Guardado en:** `scripts/fix-dependencies.sh`

**Ejecutar:**
```bash
chmod +x scripts/fix-dependencies.sh
./scripts/fix-dependencies.sh
```

---

## 🎯 ESTADO FINAL ESPERADO

### Después de Fase 1 y 2

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Problemas críticos | 4 | 0 | ✅ -100% |
| Problemas altos | 5 | 0 | ✅ -100% |
| Versiones TypeScript | 3 diferentes | 1 unificada | ✅ |
| Versiones lucide-react | 3 diferentes | 1 unificada | ✅ |
| Dependencias deprecadas | 2 | 0 | ✅ |
| Conflictos de versiones | 4 | 0 | ✅ |

### Beneficios

1. ✅ **Estabilidad Mejorada**
   - Sin conflictos de versiones
   - Sin dependencias deprecadas
   - Builds consistentes

2. ✅ **Mantenibilidad**
   - Versiones unificadas
   - Más fácil actualizar
   - Menos bugs por incompatibilidades

3. ✅ **Performance**
   - Eliminación de bcryptjs duplicado
   - Menos código duplicado
   - Builds más rápidos

4. ✅ **Seguridad**
   - Versiones actualizadas
   - Menos vulnerabilidades
   - Mejor soporte

---

## 📞 PRÓXIMOS PASOS

### Inmediatos (Hoy)
1. Revisar este documento completo
2. Aprobar plan de corrección
3. Ejecutar Fase 1 (Críticas)
4. Verificar que todos los servers arranquen
5. Hacer commit de cambios

### Corto Plazo (Esta Semana)
1. Ejecutar Fase 2 (Altas)
2. Crear tests de integración
3. Actualizar documentación
4. Capacitar equipo en nuevas versiones

### Mediano Plazo (Este Mes)
1. Planificar migración AWS SDK v3
2. Actualizar OpenTelemetry
3. Migrar a ESLint 9 (flat config)
4. Optimizar node_modules

### Largo Plazo (Próximos 3 Meses)
1. Monitorear nuevas versiones
2. Establecer política de actualización
3. Automatizar auditorías de dependencias
4. Implementar renovate/dependabot

---

## 📄 DOCUMENTACIÓN RELACIONADA

**Sesión Actual:**
- `REPORTE_2025-10-13_09-30-00.md` - Análisis inicial
- `01_VERIFICACION_SERVIDORES.md` - Verificación servidores
- `02_CONSOLIDACION_FINAL.md` - Consolidación landing page
- `03_COMPLETITUD_WEBSITE.md` - Website al 100%
- `04_ORGANIZACION_FINAL.md` - Organización de archivos
- `05_OPTIMIZACION_DEPENDENCIAS.md` - Este documento

**Referencias Externas:**
- [Next.js Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading)
- [AWS SDK v3 Migration](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrating-to-v3.html)
- [OpenTelemetry JS](https://opentelemetry.io/docs/instrumentation/js/)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)

---

**Fin del Documento**
**Generado:** 2025-10-13 12:00:00
**Versión:** 1.0
**Estado:** ✅ COMPLETO
