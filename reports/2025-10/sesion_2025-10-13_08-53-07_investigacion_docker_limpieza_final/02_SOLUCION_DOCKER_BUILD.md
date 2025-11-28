# 🔧 Guía de Solución - Error Docker Build Backend

**Fecha**: 13 de Octubre, 2025
**Prioridad**: ⚡ CRÍTICA
**Tiempo Estimado**: 1-2 horas
**Estado**: 📋 PENDIENTE DE IMPLEMENTAR

---

## 🎯 OBJETIVO

Resolver el error de build del backend en Docker que falla en la línea 31 con `npm run build` y exit code 1.

---

## ❌ PROBLEMA ACTUAL

### Síntoma

```dockerfile
# apps/backend/Dockerfile - Línea 31
RUN npm run build
# Error: exit code 1
```

**Output del error**:
```
failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
```

### Contexto

- ✅ Build local funciona: `cd apps/backend && npm run build` → Éxito
- ❌ Build en Docker falla: `docker-compose build backend` → Error línea 31
- ✅ Backend dev mode funciona (fuera de Docker)
- ⚠️ Bloquea producción y endpoint PATCH /users/me

---

## 🔍 DIAGNÓSTICO

### Paso 1: Obtener Logs Completos

**Objetivo**: Ver el error exacto de TypeScript/NestJS

**Comando**:
```bash
cd /Users/devlmer/ChatBotDysa

# Build con logs completos sin caché
docker-compose build --no-cache --progress=plain backend 2>&1 | tee logs/docker-build-$(date +%Y%m%d-%H%M%S).log
```

**Qué buscar en los logs**:
- Errores de TypeScript (`TS2xxx`)
- Archivos faltantes (`ENOENT`)
- Errores de dependencias (`Cannot find module`)
- Variables de entorno faltantes
- Errores de permisos

**Ejemplo de logs útiles**:
```
#10 [builder 5/6] RUN npm run build
#10 1.234
#10 1.234 > backend@0.0.1 build
#10 1.234 > nest build
#10 1.234
#10 2.345 Error: Cannot find module 'xxx'
#10 2.345     at Function.Module._resolveFilename (...)
```

---

### Paso 2: Build Interactivo (Debugging)

**Objetivo**: Ejecutar build paso a paso dentro del container

**Comandos**:
```bash
# 1. Entrar al container Alpine (mismo que Dockerfile)
docker run -it --rm -v $(pwd)/apps/backend:/app node:20-alpine sh

# 2. Dentro del container:
cd /app

# 3. Verificar archivos copiados
ls -la
# Debe mostrar: package.json, package-lock.json, src/, etc.

# 4. Instalar dependencias
npm install
# ¿Funciona? ✅/❌

# 5. Intentar build
npm run build
# ¿Qué error específico muestra?

# 6. Verificar variables de entorno
env | grep NODE
# ¿Faltan variables necesarias?

# 7. Verificar permisos
ls -la dist/
# ¿Se creó carpeta dist/?

# 8. Salir
exit
```

**Qué verificar**:
- [ ] `npm install` completa sin errores
- [ ] `npm run build` funciona o da error específico
- [ ] Carpeta `dist/` se crea
- [ ] Archivos `dist/src/i18n/**/*.json` existen
- [ ] Variables de entorno están presentes

---

### Paso 3: Verificar .dockerignore

**Objetivo**: Asegurar que archivos necesarios no se excluyen

**Comando**:
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend

# Ver contenido de .dockerignore
cat .dockerignore
```

**Archivo esperado** (.dockerignore):
```
# Dependencias
node_modules
npm-debug.log

# Build
dist
*.tsbuildinfo

# Tests
coverage
.nyc_output

# IDE
.idea
.vscode
*.swp
*.swo

# Sistema
.DS_Store
.env
.env.local
.env.*.local

# Git
.git
.gitignore

# Logs
logs
*.log
```

**Verificar que NO se excluya**:
- ❌ NO debe excluir: `src/`
- ❌ NO debe excluir: `tsconfig.json`
- ❌ NO debe excluir: `nest-cli.json`
- ❌ NO debe excluir: `package.json`
- ❌ NO debe excluir: `package-lock.json`

**Si se excluye algo necesario**: Remover de .dockerignore

---

## 🔧 SOLUCIONES PROPUESTAS

### Solución 1: Cambiar de Alpine a Debian (Más Compatible)

**Razón**: Alpine usa musl libc en lugar de glibc, puede causar problemas con dependencias nativas

**Modificación en Dockerfile**:

**ANTES**:
```dockerfile
FROM node:20-alpine AS builder
```

**DESPUÉS**:
```dockerfile
FROM node:20 AS builder
```

**También cambiar en stage 2**:

**ANTES**:
```dockerfile
FROM node:20-alpine
RUN apk add --no-cache dumb-init
```

**DESPUÉS**:
```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*
```

**Ventajas**:
- ✅ Mejor compatibilidad con dependencias
- ✅ Menos problemas con módulos nativos
- ✅ glibc en lugar de musl

**Desventajas**:
- Imagen ~50 MB más grande
- Build ligeramente más lento

**Comando para probar**:
```bash
# Modificar apps/backend/Dockerfile primero
docker-compose build --no-cache backend
```

---

### Solución 2: Agregar Variables de Entorno al Build

**Razón**: Build puede necesitar variables de entorno específicas

**Modificación en Dockerfile** (después de línea 28):

```dockerfile
# Copy source code
COPY . .

# Agregar variables de entorno necesarias para build
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Build application
RUN npm run build
```

**O en docker-compose.yml**:

```yaml
services:
  backend:
    build:
      context: ./apps/backend
      args:
        NODE_ENV: production
```

**Comando para probar**:
```bash
docker-compose build --no-cache --build-arg NODE_ENV=production backend
```

---

### Solución 3: Instalar Dependencias de Build en Alpine

**Razón**: Algunas dependencias necesitan herramientas de compilación

**Modificación en Dockerfile** (antes de `npm install`):

**ANTES**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
```

**DESPUÉS**:
```dockerfile
FROM node:20-alpine AS builder

# Instalar dependencias de build
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm install
```

**Comando para probar**:
```bash
docker-compose build --no-cache backend
```

---

### Solución 4: Copiar dist/ Precompilado (Workaround Temporal)

**Razón**: Si build en Docker sigue fallando, usar build local

**Pasos**:

1. **Build local**:
```bash
cd /Users/devlmer/ChatBotDysa/apps/backend
rm -rf dist
npm run build
# Verificar que dist/ se creó correctamente
ls -la dist/
```

2. **Modificar Dockerfile**:

**ANTES** (líneas 27-31):
```dockerfile
# Copy source code
COPY . .

# Build application
RUN npm run build
```

**DESPUÉS**:
```dockerfile
# Copy pre-built dist (build hecho localmente)
COPY dist ./dist
```

3. **Modificar .dockerignore** (comentar exclusión de dist):
```
# dist  ← Comentar esta línea
```

4. **Build Docker**:
```bash
docker-compose build --no-cache backend
```

**⚠️ Nota**: Esta es una solución temporal. El build debería funcionar dentro de Docker.

---

### Solución 5: Revisar nest-cli.json

**Razón**: Asegurar que configuración de assets esté correcta

**Verificar archivo**:
```bash
cat /Users/devlmer/ChatBotDysa/apps/backend/nest-cli.json
```

**Configuración esperada**:
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [
      {
        "include": "i18n/**/*",
        "outDir": "dist/src"
      }
    ]
  }
}
```

**Si falta o está mal**: Corregir y rebuild

---

## 📝 PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Diagnóstico (15-30 min)

```bash
# 1. Logs completos
docker-compose build --no-cache --progress=plain backend 2>&1 | tee logs/docker-build-diagnostic.log

# 2. Revisar logs
less logs/docker-build-diagnostic.log
# Buscar: Error, TS2, Cannot find, ENOENT

# 3. Build interactivo
docker run -it --rm -v $(pwd)/apps/backend:/app node:20-alpine sh
# Dentro: cd /app && npm install && npm run build

# 4. Verificar .dockerignore
cat apps/backend/.dockerignore
```

**Resultado esperado**: Error específico identificado

---

### Fase 2: Implementar Solución (30-60 min)

**Opción A**: Si error es por Alpine:
```bash
# Cambiar Dockerfile a node:20 (Debian)
# Rebuild
docker-compose build --no-cache backend
```

**Opción B**: Si error es por variables de entorno:
```bash
# Agregar ARG/ENV al Dockerfile
# Rebuild con build-arg
docker-compose build --no-cache --build-arg NODE_ENV=production backend
```

**Opción C**: Si error es por dependencias:
```bash
# Agregar python3, make, g++ al Dockerfile
# Rebuild
docker-compose build --no-cache backend
```

**Opción D**: Si nada funciona (temporal):
```bash
# Build local
cd apps/backend && npm run build
# Copiar dist/ precompilado
# Modificar Dockerfile para COPY dist
# Rebuild
docker-compose build --no-cache backend
```

---

### Fase 3: Verificación (15 min)

```bash
# 1. Build exitoso
docker-compose build backend
# ¿Exit code 0? ✅

# 2. Iniciar container
docker-compose up backend
# ¿Inicia sin errores? ✅

# 3. Verificar health
curl http://localhost:8005/health
# ¿Responde 200 OK? ✅

# 4. Probar endpoint PATCH
JWT="tu_token_aqui"
curl -X PATCH http://localhost:8005/api/users/me \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Test", "lastName": "User"}'
# ¿Responde correctamente? ✅
```

---

## ✅ CHECKLIST DE SOLUCIÓN

### Diagnóstico
- [ ] Logs completos obtenidos
- [ ] Error específico identificado
- [ ] Build interactivo probado
- [ ] .dockerignore verificado
- [ ] Variables de entorno revisadas

### Implementación
- [ ] Solución seleccionada
- [ ] Dockerfile modificado
- [ ] docker-compose.yml actualizado si necesario
- [ ] Build ejecutado sin errores

### Verificación
- [ ] Docker build exitoso (exit code 0)
- [ ] Container inicia correctamente
- [ ] Backend responde en /health
- [ ] Endpoint PATCH /users/me funciona
- [ ] i18n carga correctamente
- [ ] Sin errores en logs

### Documentación
- [ ] Solución documentada
- [ ] Dockerfile actualizado en repo
- [ ] Cambios committeados
- [ ] README actualizado si necesario

---

## 📊 MÉTRICAS DE ÉXITO

### Antes de la Solución
```
Docker Build Backend:
├── Estado: ❌ Falla en línea 31
├── Exit Code: 1
├── Build Time: ~30s (hasta fallar)
├── Producción: ❌ Bloqueada
└── PATCH /users/me: ❌ No disponible

Calificación: ⭐ (1/5)
```

### Después de la Solución
```
Docker Build Backend:
├── Estado: ✅ Exitoso
├── Exit Code: 0
├── Build Time: 2-3 min
├── Producción: ✅ Desbloqueada
└── PATCH /users/me: ✅ Disponible

Calificación: ⭐⭐⭐⭐⭐ (5/5)
```

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DE RESOLVER

### 1. Probar en Producción
```bash
# Deploy a ambiente de staging
docker-compose -f docker-compose.prod.yml up -d backend

# Verificar
curl https://staging.chatbotdysa.com/health
```

### 2. Actualizar Documentación
- Documentar solución aplicada
- Actualizar TROUBLESHOOTING.md
- Agregar a CHANGELOG.md

### 3. Crear Tests
```bash
# Test de build automatizado
./scripts/test-docker-build.sh
```

### 4. Monitoreo
- Configurar alertas de build
- Monitorear logs de producción
- Verificar rendimiento

---

## 💡 TIPS ADICIONALES

### Si Build Sigue Fallando

1. **Revisar versiones**:
```bash
# En local
node --version  # v20.x.x
npm --version   # 10.x.x

# En Docker
docker run --rm node:20-alpine node --version
docker run --rm node:20-alpine npm --version
```

2. **Limpiar cachés**:
```bash
# Local
cd apps/backend
rm -rf node_modules dist
npm cache clean --force
npm install

# Docker
docker system prune -a --volumes
docker-compose build --no-cache backend
```

3. **Verificar disk space**:
```bash
df -h
# Asegurar que hay >5GB libres
```

4. **Revisar logs de Docker Desktop**:
- Abrir Docker Desktop
- Ver "Troubleshoot" → "Get support"
- Revisar logs del build

---

## 📞 SOPORTE

### Si Necesitas Ayuda

**Documentación Relevante**:
- NestJS Docker: https://docs.nestjs.com/recipes/docker
- Node Alpine Issues: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
- TypeScript Compiler: https://www.typescriptlang.org/docs/handbook/compiler-options.html

**Logs a Compartir**:
- `logs/docker-build-diagnostic.log`
- `apps/backend/Dockerfile`
- `apps/backend/.dockerignore`
- `apps/backend/nest-cli.json`
- `apps/backend/tsconfig.json`

---

## 🎯 CONCLUSIÓN

**Problema**: Docker build backend falla en línea 31
**Soluciones**: 5 propuestas (Debian, env vars, build deps, precompiled, nest-cli)
**Tiempo Estimado**: 1-2 horas
**Prioridad**: ⚡ CRÍTICA
**Impacto**: Desbloquea producción y endpoint PATCH /users/me

**Próximo Paso**: Ejecutar Fase 1 (Diagnóstico) para identificar error exacto

---

**FIN DE LA GUÍA DE SOLUCIÓN**

✅ Guía completa creada
✅ 5 soluciones propuestas
✅ Plan de acción definido
✅ Checklist preparada
🎯 Lista para implementar
⏱️ Estimación: 1-2 horas
