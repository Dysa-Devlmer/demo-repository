# 🧹 Plan de Limpieza y Organización

**Fecha**: 11 de Octubre, 2025 - 18:17:34

---

## 🎯 Objetivos

1. Eliminar archivos temporales y de compilación innecesarios
2. Organizar estructura de carpetas
3. Limpiar archivos duplicados
4. Optimizar espacio en disco
5. Mejorar mantenibilidad del proyecto

---

## 📋 Acciones a Realizar

### 1. ✅ Archivos a MANTENER (No eliminar)

#### Código Fuente:
- `/apps/*/src/**` - Todo el código TypeScript/React
- `package.json` - Configuración de dependencias
- `tsconfig.json` - Configuración TypeScript
- `.env.example` - Plantillas de variables de entorno
- `docker-compose.yml` - Configuración Docker
- `Dockerfile` - Imágenes Docker

#### Documentación:
- `/reportes/**/*.md` - Toda la documentación
- `README.md` - Documentación principal
- `/docs/**` - Documentación adicional

#### Configuración:
- `.gitignore` - Control de versiones
- `.eslintrc.js` - Configuración de linter
- `.prettierrc` - Formato de código
- `nest-cli.json` - Configuración NestJS

---

### 2. 🗑️ Archivos a ELIMINAR

#### Archivos de Build (Se regeneran):
- `apps/*/.next/**` - Build de Next.js (~484 MB)
- `apps/backend/dist/**` - Build del backend (~3.3 MB)
- `apps/web-widget/dist/**` - Build del widget (~84 KB)

#### Archivos Log:
- Ninguno detectado actualmente

#### Archivos Temporales:
- `/tmp/*` relacionados con el proyecto
- Archivos `.log` en raíz

---

### 3. ⚠️ Archivos a CONSERVAR (Necesarios)

#### node_modules (~1.3 GB total):
**MANTENER** - Son necesarios para desarrollo
- `apps/admin-panel/node_modules` (384 MB)
- `apps/backend/node_modules` (31 MB)
- `apps/landing-page/node_modules` (347 MB)
- `apps/web-widget/node_modules` (7.9 MB)
- `apps/website/node_modules` (535 MB)

**Justificación**: Necesarios para `npm run dev` y desarrollo local

---

## 📊 Espacio a Liberar

| Categoría | Tamaño | Acción |
|-----------|--------|--------|
| `.next` builds | ~484 MB | ✅ Eliminar |
| `dist` builds | ~3.4 MB | ✅ Eliminar |
| **Total** | **~487 MB** | **A liberar** |

---

## 🔄 Reorganización de Carpetas

### Estructura Actual Problemática:
```
/reportes/
  ├── 2025-10-10_...           # Muchas carpetas con fechas
  ├── 2025-10-11_...           # Difícil de navegar
  ├── Archive/                 # 66 subcarpetas
  └── Sesiones/                # 43 subcarpetas
```

### Estructura Propuesta:
```
/reportes/
  ├── 2025-10/                           # Por mes
  │   ├── correcciones/                  # Por tema
  │   ├── verificaciones/
  │   └── organizacion/
  ├── _archivo/                          # Histórico
  └── README.md                          # Índice actualizado
```

---

## ✅ Verificaciones Post-Limpieza

1. ✅ Backend funciona correctamente
2. ✅ Frontend compila sin errores
3. ✅ Docker se levanta correctamente
4. ✅ Tests pasan (si existen)
5. ✅ Documentación accesible

---

