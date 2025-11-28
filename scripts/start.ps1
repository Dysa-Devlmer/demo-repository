# ChatBotDysa Enterprise - Start Script for Windows
# Version: 1.0.0

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting ChatBotDysa Enterprise..." -ForegroundColor Green
Write-Host ""

try {
    # Start Docker services
    Write-Host "Starting Docker services..." -ForegroundColor Blue
    docker-compose up -d postgres redis ollama
    
    # Wait for services
    Write-Host "Waiting for services to be ready..." -ForegroundColor Blue
    Start-Sleep -Seconds 5
    
    # Start backend in background
    Write-Host "Starting backend service..." -ForegroundColor Blue
    $backendPath = Join-Path $PSScriptRoot "apps\backend"
    Start-Process powershell -ArgumentList "-Command", "cd '$backendPath'; npm start" -WindowStyle Hidden
    
    # Start admin panel in background  
    Write-Host "Starting admin panel..." -ForegroundColor Blue
    $adminPath = Join-Path $PSScriptRoot "apps\admin-panel"
    Start-Process powershell -ArgumentList "-Command", "cd '$adminPath'; npm start" -WindowStyle Hidden
    
    # Wait a moment for services to start
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "✅ ChatBotDysa Enterprise started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "🌐 Backend API: http://localhost:8005" -ForegroundColor Yellow
    Write-Host "🖥️  Admin Panel: http://localhost:8001" -ForegroundColor Yellow  
    Write-Host "📚 API Documentation: http://localhost:8005/api-docs" -ForegroundColor Yellow
    Write-Host "🏥 Health Check: http://localhost:8005/api/health" -ForegroundColor Yellow
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening admin panel in your browser..." -ForegroundColor Blue
    
    # Wait a bit more for full startup
    Start-Sleep -Seconds 2
    
    # Open admin panel in browser
    Start-Process "http://localhost:8001"
    
    Write-Host ""
    Write-Host "To stop the system, run: .\stop.ps1" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "❌ Failed to start ChatBotDysa Enterprise: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Docker is running" -ForegroundColor Yellow
    Write-Host "2. Check if ports 8001, 8005 are available" -ForegroundColor Yellow
    Write-Host "3. Run health check: node health-check.js" -ForegroundColor Yellow
    exit 1
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")