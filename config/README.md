# 🔧 Configuration Files

Este directorio contiene todos los archivos de configuración del sistema.

## Archivos de Entorno

- `.env` - Configuración actual (NO COMMITEAR)
- `.env.example` - Plantilla de configuración
- `.env.production` - Configuración de producción
- `.env.cloud.example` - Ejemplo para deploy en cloud
- `.env.local` - Configuración local de desarrollo

## Uso

Copia el archivo de ejemplo correspondiente:

```bash
# Para desarrollo local
cp config/.env.example .env

# Para producción
cp config/.env.production .env
```

## Nota de Seguridad

⚠️  **NUNCA** commites archivos `.env` con credenciales reales al repositorio.
Todos los archivos `.env` están en el .gitignore.
