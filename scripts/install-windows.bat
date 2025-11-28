@echo off
REM ============================================
REM ChatBotDysa Enterprise - Instalador para Windows
REM ============================================
REM Actualizado: 2025-10-11
REM Version: 2.0
REM ============================================

echo ============================================
echo ChatBotDysa Enterprise - Instalador Windows
echo ============================================
echo.

REM Verificar si se ejecuta como administrador
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ADVERTENCIA: Se recomienda ejecutar como Administrador
    echo Continuar de todas formas? (S/N)
    set /p ADMIN_CONFIRM=
    if /i not "%ADMIN_CONFIRM%"=="S" exit /b 1
)
echo.

REM Verificar Docker
echo [1/7] Verificando Docker Desktop...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker Desktop no esta instalado
    echo.
    echo Por favor instalar Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)
echo OK: Docker Desktop encontrado
docker --version
echo.

REM Verificar que Docker este corriendo
echo [2/7] Verificando que Docker este corriendo...
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker Desktop no esta corriendo
    echo Por favor iniciar Docker Desktop y volver a ejecutar este script
    pause
    exit /b 1
)
echo OK: Docker Desktop esta corriendo
echo.

REM Verificar docker-compose
echo [3/7] Verificando Docker Compose...
docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker Compose no esta disponible
    pause
    exit /b 1
)
echo OK: Docker Compose encontrado
docker-compose --version
echo.

REM Verificar archivo .env
echo [4/7] Verificando configuracion...
if not exist .env (
    echo Archivo .env no encontrado. Copiando desde .env.example...
    if exist .env.example (
        copy .env.example .env
    ) else (
        echo ERROR: Archivo .env.example no encontrado
        echo Por favor asegurese de estar en el directorio correcto
        pause
        exit /b 1
    )
    echo.
    echo IMPORTANTE: Debe editar el archivo .env con los datos del restaurante
    echo.
    echo Configuraciones importantes:
    echo   - RESTAURANT_NAME
    echo   - DATABASE_PASSWORD
    echo   - JWT_SECRET
    echo.
    echo Presionar cualquier tecla para abrir el archivo .env...
    pause
    notepad .env
    echo.
    echo Ha completado la configuracion? (S/N)
    set /p CONFIG_CONFIRM=
    if /i not "%CONFIG_CONFIRM%"=="S" (
        echo Por favor completar la configuracion antes de continuar
        exit /b 1
    )
)
echo OK: Configuracion lista
echo.

REM Limpiar contenedores y volumenes anteriores si existen
echo [5/7] Limpiando instalacion anterior (si existe)...
docker-compose down -v 2>nul
echo OK: Limpieza completada
echo.

REM Construir y descargar imagenes Docker
echo [6/7] Preparando componentes del sistema...
echo Esto puede tomar 10-15 minutos la primera vez...
echo.
echo [6.1] Descargando imagenes base (PostgreSQL, Redis, Ollama)...
docker-compose pull postgres redis ollama
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al descargar imagenes base
    pause
    exit /b 1
)
echo OK: Imagenes base descargadas
echo.

echo [6.2] Construyendo aplicaciones (Backend, Landing Page)...
echo Esto tomara varios minutos...
docker-compose build --no-cache backend landing-page
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al construir aplicaciones
    pause
    exit /b 1
)
echo OK: Aplicaciones construidas exitosamente
echo.

REM Iniciar servicios
echo [7/7] Iniciando ChatBotDysa Enterprise...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al iniciar servicios
    pause
    exit /b 1
)
echo.

REM Esperar a que los servicios esten listos
echo Esperando a que los servicios esten listos...
echo (Esto puede tomar 1-2 minutos)
timeout /t 60 /nobreak >nul

REM Verificar estado
echo.
echo ============================================
echo Estado de los servicios:
echo ============================================
docker-compose ps
echo.

REM Verificar health checks
echo Verificando salud de los servicios...
timeout /t 5 /nobreak >nul
echo.

REM Mostrar URLs de acceso
echo ============================================
echo INSTALACION COMPLETADA EXITOSAMENTE!
echo ============================================
echo.
echo El sistema ChatBotDysa Enterprise esta accesible en:
echo.
echo   BACKEND API (NestJS):
echo   - URL: http://localhost:8005
echo   - Docs: http://localhost:8005/api
echo   - Health: http://localhost:8005/health
echo.
echo   LANDING PAGE:
echo   - URL: http://localhost:3004
echo.
echo   ADMIN PANEL (Desarrollo):
echo   - Ejecutar: cd apps/admin-panel ^&^& npm run dev
echo   - URL: http://localhost:7001
echo.
echo   BASES DE DATOS:
echo   - PostgreSQL: localhost:15432
echo   - Redis: localhost:16379
echo   - Ollama AI: localhost:21434
echo.
echo ============================================
echo COMANDOS UTILES:
echo ============================================
echo.
echo   Ver logs de todos los servicios:
echo     docker-compose logs -f
echo.
echo   Ver logs de un servicio especifico:
echo     docker-compose logs -f backend
echo     docker-compose logs -f postgres
echo.
echo   Detener todos los servicios:
echo     docker-compose down
echo.
echo   Reiniciar todos los servicios:
echo     docker-compose restart
echo.
echo   Reiniciar un servicio especifico:
echo     docker-compose restart backend
echo.
echo   Ver estado de servicios:
echo     docker-compose ps
echo.
echo   Limpiar todo (CUIDADO: borra datos):
echo     docker-compose down -v
echo.
echo ============================================
echo PROXIMOS PASOS:
echo ============================================
echo.
echo 1. Abrir http://localhost:8005/health para verificar backend
echo 2. Abrir http://localhost:3004 para ver landing page
echo 3. Revisar logs: docker-compose logs -f
echo.
echo Para mas informacion, consultar la documentacion en:
echo   /docs o /reportes
echo.
pause
