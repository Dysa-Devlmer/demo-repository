# 🔧 SOLUCIÓN: Error al Crear Plato en el Menú

## ❌ El Problema

Cuando intentas crear un plato seleccionando **"Platos Principales"** en la categoría, el backend rechaza la solicitud.

**Motivo:** El frontend muestra las categorías en español, pero el backend espera los valores en inglés.

---

## ✅ SOLUCIÓN RÁPIDA

### Mapeo de Categorías (Español → Inglés)

Cuando crees un plato, usa estos valores según la categoría:

| Lo que VES (Frontend) | Lo que DEBES enviar (Backend) |
|----------------------|-------------------------------|
| **Entradas** | `appetizer` |
| **Platos Principales** | `main_course` |
| **Postres** | `dessert` |
| **Bebidas** | `beverage` |
| **Especiales** | `special` |

---

## 🛠️ SOLUCIÓN TEMPORAL (Usando la API Directamente)

Mientras arreglamos el frontend, puedes crear platos directamente con la API:

### Paso 1: Obtener tu Token

Ya tienes el login funcionando, así que:

```bash
# Obtener token
TOKEN=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}' \
  | jq -r '.data.accessToken')

echo "Token: $TOKEN"
```

### Paso 2: Crear el Plato (Lomo Saltado)

```bash
curl -X POST http://localhost:8005/api/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Lomo Saltado",
    "description": "Carne con verduras salteadas",
    "price": 14800,
    "category": "main_course",
    "available": true
  }'
```

**✅ Esto debería funcionar correctamente**

### Paso 3: Verificar que se creó

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8005/api/menu | jq .
```

---

## 🔧 SOLUCIÓN PERMANENTE (Arreglar el Frontend)

El problema está en el componente del formulario del Admin Panel. Necesitamos:

1. **Ubicar el archivo del formulario**
2. **Agregar mapeo de categorías español → inglés**
3. **Enviar el valor correcto al backend**

### Archivos a Revisar:

```
apps/admin-panel/src/app/menu/page.tsx
apps/admin-panel/src/components/menu/MenuForm.tsx (si existe)
```

### Código a Agregar:

```typescript
// Mapeo de categorías
const categoryMap = {
  'Entradas': 'appetizer',
  'Platos Principales': 'main_course',
  'Postres': 'dessert',
  'Bebidas': 'beverage',
  'Especiales': 'special'
};

// Al enviar el formulario:
const dataToSend = {
  ...formData,
  category: categoryMap[formData.category] || formData.category
};
```

---

## 📝 CREACIÓN MANUAL DE PLATOS (Para Ahora)

Aquí hay ejemplos listos para copiar y pegar:

### Ejemplo 1: Lomo Saltado
```bash
curl -X POST http://localhost:8005/api/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Lomo Saltado",
    "description": "Tiras de lomo salteadas con cebolla, tomate y papas fritas",
    "price": 14800,
    "category": "main_course",
    "available": true
  }'
```

### Ejemplo 2: Ceviche
```bash
curl -X POST http://localhost:8005/api/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Ceviche de Pescado",
    "description": "Pescado fresco marinado en limón con cebolla morada",
    "price": 12500,
    "category": "appetizer",
    "available": true
  }'
```

### Ejemplo 3: Suspiro Limeño
```bash
curl -X POST http://localhost:8005/api/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Suspiro Limeño",
    "description": "Postre tradicional peruano con merengue",
    "price": 5500,
    "category": "dessert",
    "available": true
  }'
```

### Ejemplo 4: Chicha Morada
```bash
curl -X POST http://localhost:8005/api/menu \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Chicha Morada",
    "description": "Bebida refrescante de maíz morado",
    "price": 3500,
    "category": "beverage",
    "available": true
  }'
```

---

## 🧪 SCRIPT COMPLETO PARA CREAR MÚLTIPLES PLATOS

Guarda esto como `create_menu_items.sh`:

```bash
#!/bin/bash

# Obtener token
echo "🔐 Obteniendo token..."
TOKEN=$(curl -s -X POST http://localhost:8005/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@zgamersa.com","password":"Admin123!"}' \
  | jq -r '.data.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Error al obtener token"
  exit 1
fi

echo "✅ Token obtenido"
echo ""

# Array de platos
declare -a dishes=(
  '{"name":"Lomo Saltado","description":"Tiras de lomo salteadas","price":14800,"category":"main_course","available":true}'
  '{"name":"Ají de Gallina","description":"Pollo desmenuzado en salsa cremosa","price":13500,"category":"main_course","available":true}'
  '{"name":"Ceviche de Pescado","description":"Pescado marinado en limón","price":12500,"category":"appetizer","available":true}'
  '{"name":"Causa Limeña","description":"Papa amarilla rellena","price":8500,"category":"appetizer","available":true}'
  '{"name":"Suspiro Limeño","description":"Postre tradicional","price":5500,"category":"dessert","available":true}'
  '{"name":"Mazamorra Morada","description":"Postre de maíz morado","price":4500,"category":"dessert","available":true}'
  '{"name":"Chicha Morada","description":"Bebida de maíz morado","price":3500,"category":"beverage","available":true}'
  '{"name":"Pisco Sour","description":"Cóctel tradicional peruano","price":6500,"category":"beverage","available":true}'
)

# Crear cada plato
for dish in "${dishes[@]}"; do
  name=$(echo "$dish" | jq -r '.name')
  echo "📝 Creando: $name"

  response=$(curl -s -X POST http://localhost:8005/api/menu \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$dish")

  if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ $name creado exitosamente"
  else
    error=$(echo "$response" | jq -r '.message // .error // "Error desconocido"')
    echo "❌ Error al crear $name: $error"
  fi
  echo ""
done

echo "🎉 Proceso completado"
```

**Ejecutar:**
```bash
chmod +x create_menu_items.sh
./create_menu_items.sh
```

---

## 🎯 PRÓXIMOS PASOS

1. **Opción A (Rápida):** Usa los scripts de arriba para crear platos vía API
2. **Opción B (Permanente):** Te ayudo a arreglar el componente del frontend

**¿Cuál prefieres?**

---

## 📞 Debugging Adicional

Si necesitas ver exactamente qué está enviando el frontend:

1. **Abrir DevTools del navegador** (F12)
2. **Ir a la pestaña "Network"**
3. **Intentar crear un plato**
4. **Ver la petición POST a `/api/menu`**
5. **Ver el "Payload" enviado**

Esto te mostrará exactamente qué categoría está enviando el frontend.

---

**Creado:** 2025-10-22
**Archivo:** `/Users/devlmer/ChatBotDysa/SOLUCION_ERROR_MENU.md`
