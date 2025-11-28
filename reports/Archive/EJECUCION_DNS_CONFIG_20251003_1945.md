# 🚀 Ejecución: Configuración DNS - Domain Authentication

**Fecha:** 3 de Octubre, 2025
**Hora:** 19:45
**Tarea:** Configurar registros DNS en zglobalhost.com
**Estado:** 🟢 EJECUTANDO

---

## 📋 Pasos de Ejecución Inmediata

### ✅ PASO 1: Obtener Registros CNAME de SendGrid (5 minutos)

1. **Abrir SendGrid:**
   ```
   URL: https://app.sendgrid.com/settings/sender_auth/verify?link=4883431&provider=zglobalhost.com
   ```

2. **En la pantalla de SendGrid verás:**
   - Título: "Authenticate Your Domain"
   - Dominio: zgamersa.com
   - Provider: zglobalhost.com

3. **Buscar la sección "DNS Records"**
   - Habrá exactamente 3 registros CNAME
   - Cada uno tendrá: Host/Name y Value/Target

4. **Copiar EXACTAMENTE estos valores:**

   **Registro 1 (Mail CNAME):**
   ```
   Host/Name: [Copiar aquí - será algo como: em1234]
   Value:     [Copiar aquí - será algo como: u1234567.wl.sendgrid.net]
   ```

   **Registro 2 (DKIM Key 1):**
   ```
   Host/Name: [Copiar aquí - será algo como: s1._domainkey]
   Value:     [Copiar aquí - será algo como: s1.domainkey.u1234567.wl.sendgrid.net]
   ```

   **Registro 3 (DKIM Key 2):**
   ```
   Host/Name: [Copiar aquí - será algo como: s2._domainkey]
   Value:     [Copiar aquí - será algo como: s2.domainkey.u1234567.wl.sendgrid.net]
   ```

5. **⚠️ IMPORTANTE:**
   - NO cerrar esta página de SendGrid
   - Dejar la pestaña abierta para verificar después
   - Copiar valores COMPLETOS sin modificar

---

### ✅ PASO 2: Acceder al Panel DNS de zglobalhost (3 minutos)

1. **Abrir zglobalhost:**
   ```
   URL: https://customers.zglobalhost.com/clientarea.php
   ```

2. **Login:**
   - Ingresar credenciales
   - Click "Login" / "Iniciar Sesión"

3. **Navegar a DNS Management:**
   - Opción 1: Click en "Services" → "My Services"
   - Opción 2: Click en "Domains" (si está visible)
   - Buscar: zgamersa.com en la lista
   - Click en el dominio zgamersa.com

4. **Abrir DNS Zone Editor:**
   - Buscar botón: "Manage DNS" / "DNS Management" / "DNS Zone"
   - Puede estar en:
     - Botón directo "Manage DNS"
     - Pestaña "DNS Management"
     - Sección "Advanced DNS"
     - Link "Zone Editor"
   - Click para abrir el editor de DNS

5. **Verificar que estás en el lugar correcto:**
   - Debes ver una lista de registros DNS existentes
   - Puede haber registros A, MX, TXT, etc.
   - Debe haber un botón "Add Record" / "Add New Record"

---

### ✅ PASO 3: Agregar Registro CNAME 1 (3 minutos)

1. **Click en "Add Record" / "Add New Record"**

2. **Seleccionar tipo:**
   ```
   Type: CNAME
   ```

3. **Llenar campos:**
   ```
   Name/Host:        [Pegar valor del Registro 1 - Host/Name de SendGrid]
   Target/Value:     [Pegar valor del Registro 1 - Value de SendGrid]
   TTL:              Auto (o 3600 si pide número)
   ```

4. **⚠️ IMPORTANTE - Name/Host:**
   - SendGrid puede mostrar: "em1234.zgamersa.com"
   - En zglobalhost solo pon: "em1234" (sin .zgamersa.com)
   - zglobalhost agrega el dominio automáticamente
   - Si el campo ya tiene "@" o algo, reemplázalo con el valor

5. **Verificar antes de guardar:**
   ```
   Type:    CNAME
   Name:    em1234 (o el valor que SendGrid dio)
   Target:  u1234567.wl.sendgrid.net (exacto de SendGrid)
   TTL:     3600 o Auto
   ```

6. **Click "Save" / "Add Record" / "Guardar"**

7. **Confirmar que apareció en la lista de registros**

---

### ✅ PASO 4: Agregar Registro CNAME 2 (3 minutos)

1. **Click en "Add Record" / "Add New Record" nuevamente**

2. **Seleccionar tipo:**
   ```
   Type: CNAME
   ```

3. **Llenar campos:**
   ```
   Name/Host:        [Pegar valor del Registro 2 - Host/Name de SendGrid]
   Target/Value:     [Pegar valor del Registro 2 - Value de SendGrid]
   TTL:              Auto (o 3600)
   ```

4. **⚠️ IMPORTANTE - Name/Host:**
   - SendGrid puede mostrar: "s1._domainkey.zgamersa.com"
   - En zglobalhost solo pon: "s1._domainkey" (sin .zgamersa.com)
   - El "_domainkey" es importante, NO lo borres

5. **Verificar antes de guardar:**
   ```
   Type:    CNAME
   Name:    s1._domainkey
   Target:  s1.domainkey.u1234567.wl.sendgrid.net (exacto de SendGrid)
   TTL:     3600 o Auto
   ```

6. **Click "Save" / "Add Record" / "Guardar"**

7. **Confirmar que apareció en la lista**

---

### ✅ PASO 5: Agregar Registro CNAME 3 (3 minutos)

1. **Click en "Add Record" / "Add New Record" una vez más**

2. **Seleccionar tipo:**
   ```
   Type: CNAME
   ```

3. **Llenar campos:**
   ```
   Name/Host:        [Pegar valor del Registro 3 - Host/Name de SendGrid]
   Target/Value:     [Pegar valor del Registro 3 - Value de SendGrid]
   TTL:              Auto (o 3600)
   ```

4. **⚠️ IMPORTANTE - Name/Host:**
   - SendGrid puede mostrar: "s2._domainkey.zgamersa.com"
   - En zglobalhost solo pon: "s2._domainkey" (sin .zgamersa.com)

5. **Verificar antes de guardar:**
   ```
   Type:    CNAME
   Name:    s2._domainkey
   Target:  s2.domainkey.u1234567.wl.sendgrid.net (exacto de SendGrid)
   TTL:     3600 o Auto
   ```

6. **Click "Save" / "Add Record" / "Guardar"**

7. **Confirmar que apareció en la lista**

---

### ✅ PASO 6: Verificar Registros Agregados (2 minutos)

1. **En la lista de registros DNS de zglobalhost, verificar que aparecen los 3:**

   ```
   CNAME   em1234             → u1234567.wl.sendgrid.net
   CNAME   s1._domainkey      → s1.domainkey.u1234567.wl.sendgrid.net
   CNAME   s2._domainkey      → s2.domainkey.u1234567.wl.sendgrid.net
   ```

2. **Verificar que NO hay errores:**
   - No debe haber mensajes de error rojos
   - Los registros deben estar "activos" o "enabled"
   - TTL debe mostrar un valor (3600 o Auto)

3. **Tomar screenshot (opcional pero recomendado):**
   - Captura de la lista de registros DNS
   - Para referencia futura

---

### ✅ PASO 7: Verificar en SendGrid (2 minutos)

1. **Volver a la pestaña de SendGrid que dejaste abierta:**
   ```
   https://app.sendgrid.com/settings/sender_auth/verify?link=4883431&provider=zglobalhost.com
   ```

2. **Buscar botón "Verify" / "Verificar"**
   - Debe estar al final de la página
   - Después de los 3 registros CNAME

3. **Click en "Verify" / "Verificar"**

4. **Posibles resultados:**

   **✅ Resultado A: Verificación Exitosa Inmediata**
   ```
   "Domain authenticated successfully"
   "Your domain has been verified"
   ```
   - ¡PERFECTO! Continuar al PASO 8

   **⏳ Resultado B: Pendiente de Propagación**
   ```
   "We could not verify your DNS records yet"
   "DNS records not found"
   "Please allow up to 48 hours for DNS propagation"
   ```
   - NORMAL - Los DNS pueden tardar
   - Esperar 30 minutos
   - Volver a hacer click en "Verify"
   - Repetir cada 30 minutos hasta que verifique

   **❌ Resultado C: Error en Registros**
   ```
   "Incorrect CNAME value"
   "CNAME mismatch"
   ```
   - Revisar que los valores estén exactos
   - Verificar en zglobalhost
   - Corregir si es necesario
   - Click "Verify" nuevamente

5. **SI verifica exitosamente, SendGrid mostrará:**
   - Checkmark verde ✅
   - "Authenticated" o "Verified"
   - Estado: "Valid"

---

### ⏸️ SI DNS NO VERIFICA INMEDIATAMENTE

**Esto es NORMAL - No te preocupes**

1. **Propagación DNS toma tiempo:**
   - Mínimo: 5-10 minutos
   - Normal: 30 minutos - 2 horas
   - Máximo: 48 horas (raro)

2. **Mientras esperas:**
   - Dejar registros como están
   - NO modificar nada
   - NO borrar registros

3. **Verificar manualmente con herramientas:**
   ```bash
   # En terminal:
   dig CNAME em1234.zgamersa.com
   dig CNAME s1._domainkey.zgamersa.com
   dig CNAME s2._domainkey.zgamersa.com
   ```

4. **O usar herramienta web:**
   ```
   https://dnschecker.org
   - Ingresar: em1234.zgamersa.com
   - Type: CNAME
   - Click "Search"
   ```

5. **Volver a SendGrid cada 30 minutos:**
   - Click "Verify" nuevamente
   - Esperar resultado

---

### ✅ PASO 8: Actualizar Backend (SOLO SI VERIFICÓ EXITOSAMENTE)

**⚠️ NO hacer esto hasta que SendGrid muestre "Verified" ✅**

1. **Abrir archivo de configuración:**
   ```bash
   /Users/devlmer/ChatBotDysa/apps/backend/.env.development
   ```

2. **Buscar la línea:**
   ```bash
   SENDGRID_FROM_EMAIL=bpier@zgamersa.com
   ```

3. **Cambiar a:**
   ```bash
   SENDGRID_FROM_EMAIL=noreply@zgamersa.com
   ```

4. **Guardar archivo**

---

### ✅ PASO 9: Reiniciar Backend (SOLO SI ACTUALIZASTE .env)

1. **Detener backend actual:**
   ```bash
   # Encontrar proceso en puerto 8005
   lsof -i :8005 | grep LISTEN | awk '{print $2}' | xargs kill

   # O simplemente Ctrl+C en la terminal donde corre
   ```

2. **Iniciar backend nuevamente:**
   ```bash
   cd /Users/devlmer/ChatBotDysa/apps/backend
   npm run start:dev
   ```

3. **Esperar que inicie (30-60 segundos):**
   ```
   Buscar en logs:
   "Application is running on: http://localhost:8005"
   "18/18 modules initialized"
   ```

4. **Verificar health:**
   ```bash
   curl http://localhost:8005/health
   ```

   Debe responder:
   ```json
   {
     "status": "ok",
     "info": {...}
   }
   ```

---

### ✅ PASO 10: Test de Email con Nuevo FROM (SOLO SI BACKEND REINICIÓ)

1. **Enviar email de prueba:**
   ```bash
   curl "http://localhost:8005/api/payments/test-email?email=benites.pier@gmail.com"
   ```

2. **Verificar respuesta:**
   ```json
   {
     "success": true,
     "message": "Email de prueba enviado"
   }
   ```

3. **Revisar inbox (benites.pier@gmail.com):**
   - Email debe llegar en 10-30 segundos
   - **FROM debe ser: noreply@zgamersa.com** ← IMPORTANTE
   - Subject: Email de Prueba - ChatBotDysa
   - NO debe ir a spam (verificar bandeja principal)

4. **Si todo correcto:**
   - ✅ Domain Authentication funcionando
   - ✅ Cualquier email @zgamersa.com ahora disponible

---

## 📊 Timeline de Ejecución

```
19:45 - Inicio de configuración DNS
19:50 - Registros CNAME copiados de SendGrid
19:53 - Acceso a zglobalhost DNS panel
19:56 - Registro 1 agregado
19:59 - Registro 2 agregado
20:02 - Registro 3 agregado
20:04 - Verificación en SendGrid iniciada
20:05 - [ESPERA] Propagación DNS (variable)
20:30 - [Verificar nuevamente]
21:00 - [Si aún no verifica, verificar nuevamente]
[Una vez verificado:]
XX:XX - .env actualizado
XX:XX - Backend reiniciado
XX:XX - Test de email exitoso
XX:XX - ✅ COMPLETADO
```

---

## ✅ Checklist de Ejecución

### Pre-ejecución
- [ ] SendGrid link abierto
- [ ] zglobalhost panel abierto
- [ ] Ambos logins exitosos

### Configuración DNS
- [ ] Registro CNAME 1 copiado de SendGrid
- [ ] Registro CNAME 2 copiado de SendGrid
- [ ] Registro CNAME 3 copiado de SendGrid
- [ ] Registro 1 agregado en zglobalhost
- [ ] Registro 2 agregado en zglobalhost
- [ ] Registro 3 agregado en zglobalhost
- [ ] Los 3 registros visibles en lista DNS

### Verificación
- [ ] Click "Verify" en SendGrid
- [ ] Estado: Verificado ✅ (o esperando propagación ⏳)
- [ ] Screenshot de verificación (opcional)

### Backend Update (Solo si verificó)
- [ ] .env.development actualizado (noreply@zgamersa.com)
- [ ] Backend detenido
- [ ] Backend reiniciado
- [ ] Health check OK

### Testing (Solo si backend OK)
- [ ] Test email enviado
- [ ] Email recibido
- [ ] FROM correcto: noreply@zgamersa.com
- [ ] No fue a spam

---

## 🚨 Troubleshooting Rápido

### zglobalhost no muestra "Add Record"
- Buscar: "Add DNS Record", "New Record", "+"
- Puede estar en pestaña separada "DNS Records"
- Algunos panels usan iconos en vez de botones

### Error: "Host record already exists"
- Ya existe un registro con ese nombre
- Verificar si el registro ya estaba
- Si era incorrecto, eliminarlo primero
- Agregar el correcto

### No puedo pegar valores completos
- Algunos campos tienen límite de caracteres
- Verificar que el valor NO esté truncado
- Si se trunca, contactar soporte zglobalhost

### SendGrid dice "Incorrect value"
- Copiar nuevamente los valores
- Verificar que no hay espacios extra
- Verificar que no hay punto "." al final
- Revisar que el tipo sea CNAME (no A, TXT, etc.)

---

## 📞 Links de Referencia

### SendGrid
```
Verification: https://app.sendgrid.com/settings/sender_auth/verify?link=4883431&provider=zglobalhost.com
Dashboard:    https://app.sendgrid.com
```

### zglobalhost
```
Panel:        https://customers.zglobalhost.com/clientarea.php
```

### DNS Checkers
```
DNSChecker:   https://dnschecker.org
MXToolbox:    https://mxtoolbox.com
WhatsMyDNS:   https://www.whatsmydns.net
```

---

## 🎯 Estado Actual

```
Hora:              19:45
Tarea:             Configuración DNS para Domain Authentication
Dominio:           zgamersa.com
Proveedor DNS:     zglobalhost.com
Email Service:     SendGrid
Registros a crear: 3 CNAME
Estado:            🟢 LISTO PARA EJECUTAR
```

---

**ChatBotDysa Enterprise+++++**
*Ejecución DNS Configuration*

© 2025 ChatBotDysa
**Fecha:** 3 de Octubre, 2025 - 19:45
**Dominio:** zgamersa.com
**Proveedor:** zglobalhost.com

---

## 🚀 COMIENZA AQUÍ

**Paso 1:** Abre estas dos URLs en pestañas separadas:
1. https://app.sendgrid.com/settings/sender_auth/verify?link=4883431&provider=zglobalhost.com
2. https://customers.zglobalhost.com/clientarea.php

**Paso 2:** Sigue los pasos 1-7 en orden

**Paso 3:** Si verifica exitoso → Pasos 8-10

**Paso 4:** Si no verifica → Esperar propagación DNS y reintentar

**Todo listo para comenzar** ✅
