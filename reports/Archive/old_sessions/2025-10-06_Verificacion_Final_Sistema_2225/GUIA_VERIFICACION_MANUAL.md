# Guía de Verificación Manual del Sistema

**Fecha:** 2025-10-06
**Hora:** 22:25 PM
**Sesión:** #21 - Verificación Final del Sistema
**Tipo:** ✅ Testing Manual y Verificación

---

## 🎯 Objetivo

Verificar manualmente en el navegador que todas las correcciones realizadas funcionen correctamente y documentar el estado real de cada módulo.

---

## 🌐 Acceso al Sistema

### URL del Admin Panel
```
http://localhost:7001
```

### Credenciales de Acceso
```
Email:    admin@zgamersa.com
Password: VvuOayZOstHMhxEb6Lb/6haZYRFZMr8qoaUXb3fuuZM=
```

---

## ✅ Checklist de Verificación

### 1. Login y Autenticación

**URL:** http://localhost:7001/login

**Pasos:**
1. [ ] Abrir http://localhost:7001
2. [ ] Ingresar email: `admin@zgamersa.com`
3. [ ] Ingresar password: `VvuOayZOstHMhxEb6Lb/6haZYRFZMr8qoaUXb3fuuZM=`
4. [ ] Click en "Iniciar Sesión"
5. [ ] Verificar redirección al dashboard

**Resultado Esperado:**
- ✅ Login exitoso
- ✅ Redirigir a /dashboard
- ✅ Ver métricas del dashboard

---

### 2. Menu (Menú) - CRUD Completo

**URL:** http://localhost:7001/menu

#### 2.1 Listar Platillos
**Pasos:**
1. [ ] Navegar a /menu
2. [ ] Verificar que se muestran platillos existentes
3. [ ] Verificar categorías visibles en español

**Resultado Esperado:**
- ✅ Lista de platillos visible
- ✅ Categorías mostradas en español (Platos Principales, Entradas, etc.)
- ✅ Precio visible
- ✅ Estado (Disponible/No disponible)

#### 2.2 Crear Nuevo Platillo
**Pasos:**
1. [ ] Click en botón "Nuevo Platillo"
2. [ ] Completar formulario:
   - Nombre: "Platillo de Verificación"
   - Descripción: "Creado durante prueba manual"
   - Precio: 29.99
   - Categoría: "Platos Principales"
   - Disponible: ✓
3. [ ] Click en "Crear"

**Resultado Esperado:**
- ✅ Modal se abre correctamente
- ✅ Selector de categorías muestra opciones en español
- ✅ Platillo se crea exitosamente
- ✅ Toast de confirmación: "Platillo creado"
- ✅ Nuevo platillo aparece en la lista

#### 2.3 Editar Platillo
**Pasos:**
1. [ ] Seleccionar platillo "Platillo de Verificación"
2. [ ] Click en botón de editar (lápiz)
3. [ ] Cambiar precio a: 34.99
4. [ ] Click en "Actualizar"

**Resultado Esperado:**
- ✅ Modal de edición se abre con datos pre-cargados
- ✅ Platillo se actualiza correctamente
- ✅ Toast de confirmación: "Platillo actualizado"
- ✅ Precio actualizado visible en la lista

#### 2.4 Eliminar Platillo
**Pasos:**
1. [ ] Seleccionar platillo "Platillo de Verificación"
2. [ ] Click en botón de eliminar (basurero)
3. [ ] Confirmar eliminación

**Resultado Esperado:**
- ✅ Confirmación de eliminación
- ✅ Platillo eliminado exitosamente
- ✅ Toast de confirmación: "Platillo eliminado"
- ✅ Platillo desaparece de la lista

#### 2.5 Filtrar por Categoría
**Pasos:**
1. [ ] Click en botón "Platos Principales"
2. [ ] Verificar filtrado
3. [ ] Click en "Entradas"
4. [ ] Click en "Todos"

**Resultado Esperado:**
- ✅ Filtra correctamente por categoría
- ✅ Botón activo cambia de estilo
- ✅ "Todos" muestra todos los platillos

#### 2.6 Buscar Platillos
**Pasos:**
1. [ ] En buscador, escribir "pasta"
2. [ ] Verificar resultados
3. [ ] Limpiar búsqueda

**Resultado Esperado:**
- ✅ Búsqueda funciona correctamente
- ✅ Muestra platillos que coinciden
- ✅ Búsqueda en tiempo real

---

### 3. Customers (Clientes) - CRUD Completo

**URL:** http://localhost:7001/customers

#### 3.1 Listar Clientes
**Pasos:**
1. [ ] Navegar a /customers
2. [ ] Verificar lista de clientes
3. [ ] Verificar información visible

**Resultado Esperado:**
- ✅ Lista de clientes visible
- ✅ Nombre, email, teléfono visibles
- ✅ Badge de origen (WhatsApp, Web, etc.)

#### 3.2 Crear Nuevo Cliente
**Pasos:**
1. [ ] Click en "Nuevo Cliente"
2. [ ] Completar formulario:
   - Nombre: "Cliente Verificación"
   - Email: "verificacion@test.com"
   - Teléfono: "+56912345678"
   - Origen: "Admin"
3. [ ] Click en "Crear"

**Resultado Esperado:**
- ✅ Modal se abre
- ✅ Cliente se crea exitosamente
- ✅ Toast de confirmación
- ✅ Cliente aparece en lista

#### 3.3 Editar Cliente
**Pasos:**
1. [ ] Seleccionar "Cliente Verificación"
2. [ ] Click en botón editar
3. [ ] Cambiar nombre a "Cliente Verificación Editado"
4. [ ] Click en "Actualizar"

**Resultado Esperado:**
- ✅ Modal de edición con datos pre-cargados
- ✅ Cliente actualizado correctamente
- ✅ Toast de confirmación
- ✅ Cambios visibles en lista

#### 3.4 Eliminar Cliente
**Pasos:**
1. [ ] Seleccionar "Cliente Verificación Editado"
2. [ ] Click en botón eliminar
3. [ ] Confirmar eliminación

**Resultado Esperado:**
- ✅ Confirmación mostrada
- ✅ Cliente eliminado
- ✅ Toast de confirmación
- ✅ Cliente removido de lista

#### 3.5 Filtrar por Origen
**Pasos:**
1. [ ] Seleccionar filtro "WhatsApp"
2. [ ] Verificar filtrado
3. [ ] Seleccionar "Todos"

**Resultado Esperado:**
- ✅ Filtra correctamente
- ✅ Muestra solo clientes del origen seleccionado

#### 3.6 Buscar Cliente
**Pasos:**
1. [ ] Escribir nombre en buscador
2. [ ] Verificar resultados

**Resultado Esperado:**
- ✅ Búsqueda funciona
- ✅ Resultados en tiempo real

---

### 4. Reservations (Reservas) - Verificación

**URL:** http://localhost:7001/reservations

**Pasos:**
1. [ ] Navegar a /reservations
2. [ ] Verificar que carga la página
3. [ ] Intentar crear nueva reserva
4. [ ] Intentar editar reserva existente
5. [ ] Intentar eliminar reserva de prueba

**Resultado Esperado:**
- ✅ Página carga correctamente
- ✅ Operaciones CRUD funcionan
- ✅ Sin errores 403 Forbidden

**Resultado Real:**
- [ ] A completar durante verificación

---

### 5. Conversations (Conversaciones) - Verificación de Botones

**URL:** http://localhost:7001/conversations

**Pasos:**
1. [ ] Navegar a /conversations
2. [ ] Click en "Nueva Conversación"
3. [ ] Seleccionar una conversación existente
4. [ ] Click en "Cerrar Conversación"
5. [ ] Click en "Asignar Agente"
6. [ ] Click en "Ver Historial"

**Resultado Esperado:**
- ✅ Botón "Nueva Conversación" funciona
- ✅ Botones dentro de conversación responden
- ✅ Sin errores en consola

**Resultado Real:**
- [ ] A completar durante verificación

---

### 6. Notificaciones - Verificación

**Ubicación:** Botón de campanita en navbar

**Pasos:**
1. [ ] Ubicar botón de notificaciones (campanita)
2. [ ] Click en campanita
3. [ ] Verificar si se despliega menú
4. [ ] Verificar si hay notificaciones

**Resultado Esperado:**
- ✅ Menú se despliega
- ✅ Muestra notificaciones o mensaje "Sin notificaciones"

**Resultado Real:**
- [ ] A completar durante verificación

---

### 7. Menú de Perfil - Verificación

**Ubicación:** Icono de usuario en navbar (esquina superior derecha)

**Pasos:**
1. [ ] Ubicar icono de usuario
2. [ ] Click en icono
3. [ ] Verificar si se despliega menú
4. [ ] Verificar opciones (Perfil, Configuración, Cerrar Sesión)

**Resultado Esperado:**
- ✅ Menú se despliega
- ✅ Opciones visibles y clickeables

**Resultado Real:**
- [ ] A completar durante verificación

---

### 8. AI Chat - Verificación

**URL:** http://localhost:7001/ai-chat

**Pasos:**
1. [ ] Navegar a /ai-chat
2. [ ] Escribir mensaje: "Hola"
3. [ ] Esperar respuesta
4. [ ] Escribir: "¿Cuántos platos hay en el menú?"
5. [ ] Verificar si responde con número o lista
6. [ ] Escribir: "Lista todos los platos"
7. [ ] Verificar respuesta

**Resultado Esperado:**
- ✅ Chat carga correctamente
- ✅ Responde a mensajes
- ✅ Diferencia entre "cuántos" (número) y "lista" (items)
- ✅ Sin respuestas repetitivas

**Resultado Real:**
- [ ] A completar durante verificación

---

## 📊 Tabla de Resultados

| # | Módulo | Funcionalidad | Estado | Notas |
|---|--------|---------------|--------|-------|
| 1 | Login | Autenticación | ⏳ | |
| 2.1 | Menu | Listar | ⏳ | |
| 2.2 | Menu | Crear | ⏳ | |
| 2.3 | Menu | Editar | ⏳ | |
| 2.4 | Menu | Eliminar | ⏳ | |
| 2.5 | Menu | Filtrar | ⏳ | |
| 2.6 | Menu | Buscar | ⏳ | |
| 3.1 | Customers | Listar | ⏳ | |
| 3.2 | Customers | Crear | ⏳ | |
| 3.3 | Customers | Editar | ⏳ | |
| 3.4 | Customers | Eliminar | ⏳ | |
| 3.5 | Customers | Filtrar | ⏳ | |
| 3.6 | Customers | Buscar | ⏳ | |
| 4 | Reservations | CRUD | ⏳ | |
| 5 | Conversations | Botones | ⏳ | |
| 6 | Notificaciones | Click | ⏳ | |
| 7 | Perfil | Menú | ⏳ | |
| 8 | AI Chat | Respuestas | ⏳ | |

**Leyenda:**
- ⏳ Pendiente de verificación
- ✅ Funciona correctamente
- ⚠️ Funciona parcialmente
- ❌ No funciona

---

## 🐛 Registro de Errores Encontrados

### Error 1: [Título]
- **Módulo:**
- **Descripción:**
- **Pasos para reproducir:**
- **Mensaje de error:**
- **Severidad:** Alta/Media/Baja

*(Agregar según se encuentren)*

---

## 📝 Notas de Verificación

*(Espacio para anotar observaciones durante la verificación manual)*

---

**Inicio de Verificación:** 2025-10-06 22:25 PM
**Verificador:** Usuario
**Estado:** Pendiente de completar
