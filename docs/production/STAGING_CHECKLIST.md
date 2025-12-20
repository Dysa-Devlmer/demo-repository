# Staging checklist (pre-producción)

## Objetivo
Checklist para habilitar producción real en restaurantes con operación estable.

---

## 1) Entorno y despliegue
- [ ] Dominio configurado (admin + api + website)
- [ ] TLS activo (certificados, renovación)
- [ ] Variables de entorno gestionadas en un Secret Manager (no en repo)
- [ ] Deploy reproducible (comando/CI)
- [ ] Rollback documentado y probado

## 2) Base de datos (Postgres)
- [ ] Migraciones: plan + prueba en staging
- [ ] Backups automáticos configurados
- [ ] Restore probado (paso a paso + tiempo estimado)
- [ ] Retención definida (ej: 7/30/90 días)
- [ ] Monitoreo de conexiones, espacio, locks

## 3) Redis
- [ ] Persistencia/estrategia definida (si aplica)
- [ ] Monitoreo de memoria, eviction, latencia

## 4) Observabilidad
- [ ] Logs estructurados (JSON) + correlación (request id)
- [ ] Métricas mínimas (latencia p95, 5xx rate, uptime)
- [ ] Alertas mínimas:
  - [ ] backend down
  - [ ] 5xx > X/min
  - [ ] DB connections high
  - [ ] Disk usage high
- [ ] Dashboard básico (Grafana o similar)

## 5) Seguridad
- [ ] Rate limiting habilitado y validado
- [ ] CORS/CSRF validado en producción
- [ ] JWT/Session rotation definida
- [ ] Auditoría de acciones sensibles (admin)
- [ ] Escaneo de secretos (gitleaks) en CI

## 6) Integraciones (WhatsApp/Twilio/Email/Pagos)
- [ ] Credenciales reales en Secret Manager
- [ ] Webhooks configurados + verificación de firma
- [ ] Reintentos + idempotencia validados
- [ ] Modo degradado definido (qué pasa si proveedor cae)

## 7) Operación restaurante
- [ ] Flujo de “horario comercial” validado
- [ ] Mensajes fuera de horario definidos
- [ ] Plantillas aprobadas (WhatsApp)
- [ ] Roles/permisos (dueño/empleado) revisados
- [ ] Soporte: canal y SLA interno definidos

## 8) Pruebas mínimas para “Go Live”
- [ ] Smoke API (CI): OK
- [ ] Smoke UI admin/website (CI): OK
- [ ] Prueba end-to-end real (staging):
  - [ ] inbound message
  - [ ] respuesta bot
  - [ ] creación de pedido/reserva
  - [ ] notificación al panel
  - [ ] cierre del ciclo

---

## Estado
- Fecha:
- Responsable:
- Bloqueos actuales:
