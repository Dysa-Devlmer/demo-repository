# Scripts de Base de Datos - ChatBotDysa

Scripts para gestión y mantenimiento de la base de datos del sistema.

---

## 📁 Scripts Disponibles

### 1. `reset-database.sh`
Script básico para limpiar datos de prueba.

**Uso:**
```bash
./scripts/database/reset-database.sh
```

**Qué hace:**
- ✅ Elimina todas las órdenes
- ✅ Elimina todas las reservas
- ✅ Elimina todas las conversaciones
- ✅ Elimina clientes de prueba (mantiene el primero)
- ℹ️ Mantiene el menú intacto (para desarrollo)

---

### 2. `reset-for-production.sh` ⭐ **RECOMENDADO PARA NUEVOS RESTAURANTES**
Script completo con confirmaciones de seguridad para preparar el sistema completamente limpio para un nuevo restaurante.

**Uso:**
```bash
./scripts/database/reset-for-production.sh
```

**Características:**
- 🔐 Solicita confirmación antes de ejecutar
- 🔒 Pide contraseña de base de datos de forma segura
- 🗑️ **ELIMINA TODO** (órdenes, reservas, conversaciones, clientes, menú, usuarios, mensajes)
- ✅ Mantiene solo el usuario administrador por defecto
- 📊 Muestra resumen de lo eliminado
- 📝 Lista los próximos pasos después de limpiar

**Qué hace:**
- ✅ Elimina TODAS las órdenes
- ✅ Elimina TODAS las reservas
- ✅ Elimina TODAS las conversaciones
- ✅ **Elimina TODOS los clientes** (el restaurante crea los suyos desde cero)
- ✅ **Elimina TODO el menú** (el nuevo restaurante crea el suyo)
- ✅ **Elimina TODOS los usuarios** (excepto admin)
- ✅ Elimina TODOS los mensajes

**Salida esperada:**
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        ChatBotDysa - Preparación para Producción          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de prueba

Se eliminarán:
  • Todas las órdenes
  • Todas las reservas
  • Todas las conversaciones
  • Todos los clientes (excepto el admin)

¿Estás seguro de continuar? (escribe 'SI' para confirmar):
```

---

## 📊 Comparación de Scripts

| **Dato**        | **Script Básico** | **Script Producción** |
|-----------------|-------------------|-----------------------|
| Órdenes         | ✅ Elimina        | ✅ Elimina            |
| Reservas        | ✅ Elimina        | ✅ Elimina            |
| Conversaciones  | ✅ Elimina        | ✅ Elimina            |
| Clientes        | ✅ (excepto admin)| ✅ **ELIMINA TODOS**  |
| Mensajes        | ❌ Mantiene       | ✅ Elimina            |
| **Menú**        | ❌ **Mantiene**   | ✅ **ELIMINA TODO**   |
| **Usuarios**    | ❌ **Mantiene**   | ✅ **ELIMINA TODO (excepto admin)** |

**Nota importante:** El script de producción elimina TODO para que el nuevo restaurante empiece completamente limpio.

---

## 🚀 Cuándo Usar Cada Script

### Script Básico (`reset-database.sh`)
**Para desarrollo:**
- Cuando necesites datos limpios para testing
- Para probar migraciones de base de datos
- Para resetear estado después de pruebas
- **Mantiene el menú** para no tener que recrearlo

### Script de Producción (`reset-for-production.sh`) ⭐
**Para nuevos restaurantes:**
- **SIEMPRE** ejecutar antes de entregar a un cliente
- Cuando instales el sistema en un nuevo restaurante
- Para limpiar TODO (incluido menú y usuarios)
- El restaurante crea su propio menú desde cero

---

## ⚠️ PRECAUCIONES IMPORTANTES

### ❌ NO USAR EN PRODUCCIÓN CON DATOS REALES
Estos scripts **ELIMINARÁN PERMANENTEMENTE** todos los datos. Solo usar:
- En ambiente de desarrollo
- En instalaciones nuevas
- Cuando estés 100% seguro de querer borrar todo

### ✅ Antes de Ejecutar
1. Verifica que estás conectado a la base de datos correcta
2. Haz un backup si hay datos importantes
3. Confirma con el cliente/usuario que quiere eliminar todo

---

## 🔧 Configuración

Los scripts usan estas credenciales por defecto:
- **Host:** 127.0.0.1
- **Puerto:** 15432
- **Usuario:** postgres
- **Base de datos:** chatbotdysa

Para cambiar estas configuraciones, edita la línea de conexión en cada script:
```bash
PGPASSWORD=$DB_PASSWORD psql -h 127.0.0.1 -p 15432 -U postgres -d chatbotdysa
```

---

## 📋 Checklist Post-Reset

### Después de ejecutar `reset-database.sh` (desarrollo):
- [ ] Sistema arranca correctamente
- [ ] Login funciona con usuario admin
- [ ] Menú está presente (se mantiene para desarrollo)
- [ ] No hay órdenes en la lista
- [ ] No hay clientes (excepto admin)
- [ ] Dashboard muestra ceros en estadísticas

### Después de ejecutar `reset-for-production.sh` (nuevo restaurante):
- [ ] Sistema arranca correctamente
- [ ] Login funciona con usuario admin
- [ ] **Menú está VACÍO** (el restaurante debe crear el suyo)
- [ ] **No hay clientes** (0 clientes, el restaurante los crea)
- [ ] No hay órdenes en la lista
- [ ] Solo existe 1 usuario (admin)
- [ ] Dashboard muestra ceros en estadísticas
- [ ] Configuración del restaurante está lista para personalizar

---

## 🆘 Solución de Problemas

### Error: "permission denied"
```bash
chmod +x scripts/database/reset-for-production.sh
```

### Error: "psql: command not found"
Instala PostgreSQL client:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

### Error: "password authentication failed"
Verifica la contraseña en `.env`:
```
DB_PASSWORD=supersecret
```

---

## 📞 Soporte

Si tienes problemas con estos scripts, contacta al equipo de desarrollo.
