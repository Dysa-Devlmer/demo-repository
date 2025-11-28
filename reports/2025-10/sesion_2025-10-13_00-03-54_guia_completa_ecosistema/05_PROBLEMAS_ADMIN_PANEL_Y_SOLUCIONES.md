# 🔧 Problemas del Admin Panel y Sus Soluciones

**Fecha**: 13 de Octubre, 2025 - 00:35
**Versión**: 1.0.0
**Estado**: 📝 DOCUMENTADO - Pendiente de corrección

---

## 📋 RESUMEN DE PROBLEMAS ENCONTRADOS

Se encontraron **6 problemas principales** en el Admin Panel:

| # | Problema | Severidad | Estado |
|---|----------|-----------|--------|
| 1 | Rutas 404 (orders, menu, reservations con /dashboard prefix) | 🔴 Alta | Pendiente |
| 2 | AI Chat responde siempre igual (no usa Ollama) | 🔴 Alta | Pendiente |
| 3 | Error en /reservations (customer.name is null) | 🔴 Alta | Pendiente |
| 4 | Datos falsos/mock en dashboard (conversaciones, stats) | 🟡 Media | Pendiente |
| 5 | Imagen admin.png 404 | 🟢 Baja | Pendiente |
| 6 | No hay conversaciones reales en /conversations | 🟡 Media | Pendiente |

---

## 🔴 PROBLEMA 1: Rutas 404 con `/dashboard/` Prefix

### Descripción

Las notificaciones en el header intentan navegar a rutas con `/dashboard/` prefix que no existen:

**URLs que fallan**:
- ❌ `/dashboard/orders/1234` → 404
- ❌ `/dashboard/reservations` → 404
- ❌ `/dashboard/menu` → 404

**URLs correctas**:
- ✅ `/orders/1234`
- ✅ `/reservations`
- ✅ `/menu`

### Causa

Las rutas en Next.js App Router están en:
```
/apps/admin-panel/src/app/
├── orders/page.tsx         → /orders
├── menu/page.tsx           → /menu
├── reservations/page.tsx   → /reservations
```

Pero las notificaciones están generando links con `/dashboard/` prefix