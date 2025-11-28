# ChatBotDysa Enterprise - Stop Script for Windows
# Version: 1.0.0

$ErrorActionPreference = "Continue"

Write-Host "🛑 Stopping ChatBotDysa Enterprise..." -ForegroundColor Red
Write-Host ""

try {
    # Stop Node.js processes
    Write-Host "Stopping Node.js services..." -ForegroundColor Blue
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "✅ Node.js processes stopped" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No Node.js processes found" -ForegroundColor Blue
    }
    
    # Stop Docker services
    Write-Host "Stopping Docker services..." -ForegroundColor Blue
    docker-compose down
    Write-Host "✅ Docker services stopped" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "✅ ChatBotDysa Enterprise stopped successfully!" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "⚠️  Some services may still be running: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual cleanup:" -ForegroundColor Yellow
    Write-Host "1. Check Task Manager for node.exe processes" -ForegroundColor Yellow
    Write-Host "2. Run: docker-compose down" -ForegroundColor Yellow
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")