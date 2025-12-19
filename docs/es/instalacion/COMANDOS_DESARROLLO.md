# Comandos oficiales de desarrollo (Docker)

Estos comandos son la forma recomendada y soportada de levantar y validar el entorno local.

## Requisitos
- Docker Desktop instalado y corriendo
- Node.js (segun el repo)
- Variables de entorno configuradas en `.env` (ver `.env.example`)

## Comandos principales (recomendados)

### 1) Reset completo (recomendado)
Baja y vuelve a levantar el stack dev, y ejecuta health-check con retry:

```bash
./scripts/operations/dev-reset.sh
```

> Opcional: limpieza de cache/imagenes (cuidado: puede tardar y borrar cache de builds)

```bash
./scripts/operations/dev-reset.sh --prune
```

### 2) Levantar stack dev

```bash
./scripts/operations/dev-up.sh
```

### 3) Bajar stack dev

```bash
./scripts/operations/dev-down.sh
```

### 4) Health-check (HTTP 200)

Valida backend/admin/website con retry:

```bash
./scripts/operations/health.sh
```

Puedes ajustar retry:

```bash
MAX_RETRIES=40 SLEEP_SECONDS=2 ./scripts/operations/health.sh
```

## Website (compose separado)

El website se levanta con un compose separado para no bloquear el stack principal:

```bash
docker compose -f infrastructure/docker-compose.web.yml up -d --build
```

Bajar website:

```bash
docker compose -f infrastructure/docker-compose.web.yml down
```

## URLs utiles (Dev)

* Backend health: [http://127.0.0.1:8005/health](http://127.0.0.1:8005/health)
* Backend docs:  [http://127.0.0.1:8005/docs](http://127.0.0.1:8005/docs)
* Admin health:  [http://127.0.0.1:7001/api/health](http://127.0.0.1:7001/api/health)
* Website:       [http://127.0.0.1:3004](http://127.0.0.1:3004)

## Troubleshooting rapido

* Ver estado de contenedores:

```bash
docker compose -f infrastructure/docker-compose.yml ps
docker compose -f infrastructure/docker-compose.web.yml ps
```

* Logs backend/admin:

```bash
docker compose -f infrastructure/docker-compose.yml logs --tail=200 backend
docker compose -f infrastructure/docker-compose.yml logs --tail=200 admin-panel
```

* Si algo queda "raro", usa reset:

```bash
./scripts/operations/dev-reset.sh
```
