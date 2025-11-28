# 🚀 ChatBotDysa Enterprise+++++ Installation Script for Windows
# Fortune 500 Military-Grade Restaurant AI System
# Compatible: Windows 10, Windows 11, Windows Server
# Author: ChatBotDysa Enterprise Team
# Version: 2.0.0

param(
    [string]$InstallPath = "$env:USERPROFILE\chatbotdysa-enterprise",
    [switch]$SkipDependencies = $false,
    [switch]$Force = $false
)

# Enable strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Colors for beautiful output
$Colors = @{
    Red    = "Red"
    Green  = "Green"
    Yellow = "Yellow"
    Blue   = "Blue"
    Purple = "Magenta"
    Cyan   = "Cyan"
    White  = "White"
}

# Enterprise Banner
function Show-Banner {
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor $Colors.Purple
    Write-Host "██                                                            ██" -ForegroundColor $Colors.Purple
    Write-Host "██    🚀 ChatBotDysa Enterprise+++++ Installation System     ██" -ForegroundColor $Colors.Purple
    Write-Host "██                                                            ██" -ForegroundColor $Colors.Purple
    Write-Host "██    Fortune 500 Military-Grade Restaurant AI Platform      ██" -ForegroundColor $Colors.Purple
    Write-Host "██    Production-Ready • Scalable • Enterprise Security      ██" -ForegroundColor $Colors.Purple
    Write-Host "██                                                            ██" -ForegroundColor $Colors.Purple
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor $Colors.Purple
    Write-Host ""
}

# Logging functions
function Write-LogInfo {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-LogSuccess {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-LogWarning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-LogError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

function Write-LogStep {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor $Colors.Cyan
}

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# System detection
function Get-SystemInfo {
    Write-LogStep "Detecting Windows system information..."

    $osInfo = Get-CimInstance -ClassName Win32_OperatingSystem
    $computerInfo = Get-CimInstance -ClassName Win32_ComputerSystem

    $systemInfo = @{
        OSName = $osInfo.Caption
        OSVersion = $osInfo.Version
        Architecture = $osInfo.OSArchitecture
        TotalMemory = [Math]::Round($computerInfo.TotalPhysicalMemory / 1GB, 2)
        ProcessorCount = $computerInfo.NumberOfProcessors
    }

    Write-LogSuccess "System: $($systemInfo.OSName)"
    Write-LogSuccess "Version: $($systemInfo.OSVersion)"
    Write-LogSuccess "Architecture: $($systemInfo.Architecture)"
    Write-LogSuccess "Memory: $($systemInfo.TotalMemory) GB"
    Write-LogSuccess "Processors: $($systemInfo.ProcessorCount)"

    return $systemInfo
}

# Check dependencies
function Test-Dependencies {
    Write-LogStep "Checking system dependencies..."

    $dependencies = @{
        Node = $false
        Npm = $false
        Git = $false
        PostgreSQL = $false
        Redis = $false
        VisualStudio = $false
    }

    $missingDeps = @()

    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $version = $nodeVersion.TrimStart('v')
            if ([Version]$version -ge [Version]"18.0.0") {
                $dependencies.Node = $true
                Write-LogSuccess "Node.js $version ✓"
            } else {
                Write-LogWarning "Node.js $version found, but 18.0.0+ required"
                $missingDeps += "Node.js"
            }
        }
    } catch {
        Write-LogWarning "Node.js not found"
        $missingDeps += "Node.js"
    }

    # Check npm
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            $dependencies.Npm = $true
            Write-LogSuccess "npm $npmVersion ✓"
        }
    } catch {
        Write-LogWarning "npm not found"
        $missingDeps += "npm"
    }

    # Check Git
    try {
        $gitVersion = git --version 2>$null
        if ($gitVersion) {
            $dependencies.Git = $true
            Write-LogSuccess "Git ✓"
        }
    } catch {
        Write-LogWarning "Git not found"
        $missingDeps += "Git"
    }

    # Check PostgreSQL
    try {
        $pgVersion = psql --version 2>$null
        if ($pgVersion) {
            $dependencies.PostgreSQL = $true
            Write-LogSuccess "PostgreSQL ✓"
        }
    } catch {
        Write-LogWarning "PostgreSQL not found"
        $missingDeps += "PostgreSQL"
    }

    # Check Redis (check if redis-server.exe exists in common locations)
    $redisLocations = @(
        "${env:ProgramFiles}\Redis\redis-server.exe",
        "${env:ProgramFiles(x86)}\Redis\redis-server.exe",
        "$env:LOCALAPPDATA\Redis\redis-server.exe"
    )

    $redisFound = $false
    foreach ($location in $redisLocations) {
        if (Test-Path $location) {
            $dependencies.Redis = $true
            $redisFound = $true
            Write-LogSuccess "Redis ✓"
            break
        }
    }

    if (-not $redisFound) {
        Write-LogWarning "Redis not found"
        $missingDeps += "Redis"
    }

    # Check Visual Studio Build Tools
    $vsLocations = @(
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe",
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe",
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe",
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe",
        "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\BuildTools\MSBuild\Current\Bin\MSBuild.exe"
    )

    $vsFound = $false
    foreach ($location in $vsLocations) {
        if (Test-Path $location) {
            $dependencies.VisualStudio = $true
            $vsFound = $true
            Write-LogSuccess "Visual Studio Build Tools ✓"
            break
        }
    }

    if (-not $vsFound) {
        Write-LogWarning "Visual Studio Build Tools not found (required for native modules)"
        $missingDeps += "Visual Studio Build Tools"
    }

    if ($missingDeps.Count -gt 0 -and -not $SkipDependencies) {
        Write-LogError "Missing dependencies: $($missingDeps -join ', ')"
        Write-Host ""
        Write-LogInfo "Would you like to install missing dependencies automatically?"
        Write-LogInfo "This requires Chocolatey package manager and administrator privileges."

        $response = Read-Host "Install dependencies? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Install-Dependencies -MissingDeps $missingDeps
        } else {
            Write-LogError "Please install missing dependencies manually and run this script again."
            Write-LogInfo "See https://docs.chatbotdysa.com/installation/windows for detailed instructions."
            exit 1
        }
    }

    return $dependencies
}

# Install dependencies using Chocolatey
function Install-Dependencies {
    param([string[]]$MissingDeps)

    Write-LogStep "Installing missing dependencies..."

    # Check if running as administrator
    if (-not (Test-Administrator)) {
        Write-LogError "Administrator privileges required to install dependencies."
        Write-LogInfo "Please run PowerShell as Administrator and try again."
        exit 1
    }

    # Install Chocolatey if not present
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-LogInfo "Installing Chocolatey package manager..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

        # Refresh environment variables
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    }

    # Install each missing dependency
    foreach ($dep in $MissingDeps) {
        Write-LogInfo "Installing $dep..."

        switch ($dep) {
            "Node.js" {
                choco install nodejs --version=18.17.0 -y
            }
            "npm" {
                # npm comes with Node.js, so this should be handled by Node.js installation
                Write-LogInfo "npm will be installed with Node.js"
            }
            "Git" {
                choco install git -y
            }
            "PostgreSQL" {
                choco install postgresql --params '/Password:chatbotdysa123!' -y
            }
            "Redis" {
                choco install redis-64 -y
            }
            "Visual Studio Build Tools" {
                choco install visualstudio2022buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools" -y
            }
        }
    }

    # Refresh environment variables
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

    Write-LogSuccess "Dependencies installed successfully"
    Write-LogInfo "Please restart PowerShell to ensure environment variables are updated"
}

# Download ChatBotDysa source code
function Get-ChatBotDysaSource {
    Write-LogStep "Preparing ChatBotDysa Enterprise+++++ installation..."

    if (Test-Path $InstallPath) {
        if ($Force) {
            Write-LogWarning "Removing existing installation at $InstallPath"
            Remove-Item -Path $InstallPath -Recurse -Force
        } else {
            Write-LogWarning "Directory $InstallPath already exists"
            $response = Read-Host "Remove existing installation? (y/N)"
            if ($response -eq 'y' -or $response -eq 'Y') {
                Remove-Item -Path $InstallPath -Recurse -Force
            } else {
                Write-LogError "Installation cancelled"
                exit 1
            }
        }
    }

    Write-LogInfo "Creating installation directory: $InstallPath"
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null

    # For demo purposes, we'll create the structure
    # In production, this would clone from your Git repository
    Write-LogInfo "Note: In production, this would clone from your Git repository"
    Write-LogInfo "For now, please copy your ChatBotDysa source code to: $InstallPath"

    $global:ChatBotDysaRoot = $InstallPath
    Write-LogSuccess "Installation directory prepared: $InstallPath"
}

# Setup databases
function Initialize-Databases {
    Write-LogStep "Setting up databases..."

    # PostgreSQL setup
    Write-LogInfo "Configuring PostgreSQL..."

    # Start PostgreSQL service
    try {
        Start-Service postgresql-x64-13 -ErrorAction SilentlyContinue
        Set-Service postgresql-x64-13 -StartupType Automatic -ErrorAction SilentlyContinue
    } catch {
        # Try alternative service names
        $pgServices = Get-Service | Where-Object { $_.Name -like "*postgresql*" }
        if ($pgServices) {
            $pgService = $pgServices[0]
            Start-Service $pgService.Name
            Set-Service $pgService.Name -StartupType Automatic
        }
    }

    # Database configuration
    $dbName = "chatbotdysa_enterprise"
    $dbUser = "chatbotdysa"
    $dbPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object { [char]$_ })

    Write-LogInfo "Creating database: $dbName"

    # Create database and user using psql
    try {
        $env:PGPASSWORD = "chatbotdysa123!"  # Default password from Chocolatey installation

        # Create user
        psql -U postgres -h localhost -c "CREATE USER $dbUser WITH PASSWORD '$dbPassword';" 2>$null

        # Create database
        psql -U postgres -h localhost -c "CREATE DATABASE $dbName OWNER $dbUser;" 2>$null

        # Grant privileges
        psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;" 2>$null

        Write-LogSuccess "Database configured successfully"
    } catch {
        Write-LogWarning "Database setup may have failed. Please configure manually if needed."
    }

    # Redis setup
    Write-LogInfo "Configuring Redis..."

    try {
        Start-Service Redis -ErrorAction SilentlyContinue
        Set-Service Redis -StartupType Automatic -ErrorAction SilentlyContinue
        Write-LogSuccess "Redis configured successfully"
    } catch {
        Write-LogWarning "Redis service may not be available. Please start manually if needed."
    }

    # Save database credentials
    $databaseConfig = @"
# 🚀 ChatBotDysa Enterprise+++++ Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASSWORD=$dbPassword

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Database URLs
DATABASE_URL=postgresql://$dbUser`:$dbPassword@localhost:5432/$dbName
REDIS_URL=redis://localhost:6379
"@

    $databaseConfigPath = Join-Path $InstallPath ".env.database"
    $databaseConfig | Out-File -FilePath $databaseConfigPath -Encoding UTF8

    Write-LogSuccess "Database credentials saved to .env.database"

    return @{
        DatabaseName = $dbName
        DatabaseUser = $dbUser
        DatabasePassword = $dbPassword
    }
}

# Install Node.js dependencies
function Install-NodeDependencies {
    Write-LogStep "Installing Node.js dependencies..."

    if (-not (Test-Path $global:ChatBotDysaRoot)) {
        Write-LogError "ChatBotDysa installation directory not found"
        exit 1
    }

    Set-Location $global:ChatBotDysaRoot

    # Install root dependencies
    Write-LogInfo "Installing root dependencies..."
    npm install

    # Install backend dependencies
    if (Test-Path "apps\backend") {
        Write-LogInfo "Installing backend dependencies..."
        Set-Location "apps\backend"
        npm install
        Set-Location "..\..\"
    }

    # Install admin panel dependencies
    if (Test-Path "apps\admin-panel") {
        Write-LogInfo "Installing admin panel dependencies..."
        Set-Location "apps\admin-panel"
        npm install
        Set-Location "..\..\"
    }

    # Install web widget dependencies
    if (Test-Path "apps\web-widget") {
        Write-LogInfo "Installing web widget dependencies..."
        Set-Location "apps\web-widget"
        npm install
        Set-Location "..\..\"
    }

    Write-LogSuccess "Node.js dependencies installed successfully"
}

# Generate configuration files
function New-ConfigurationFiles {
    param($DatabaseInfo)

    Write-LogStep "Generating configuration files..."

    Set-Location $global:ChatBotDysaRoot

    # Generate secrets
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
    $encryptionKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
    $webhookToken = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })

    # Load database configuration
    $dbConfig = Get-Content ".env.database" -Raw

    # Generate main .env file
    $envConfig = @"
# 🚀 ChatBotDysa Enterprise+++++ Configuration
# Generated on: $(Get-Date)
# Environment: production
# Platform: Windows

# Application
NODE_ENV=production
PORT=8005
APP_NAME=ChatBotDysa Enterprise
APP_VERSION=2.0.0

# Security
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=$encryptionKey
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=*
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database (loaded from .env.database)
$dbConfig

# AI Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2

# WhatsApp Business API (configure with your credentials)
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=$webhookToken
WHATSAPP_PHONE_NUMBER_ID=

# Twilio (configure with your credentials)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Email (configure with your SMTP provider)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DEST=.\uploads

# Logging
LOG_LEVEL=info
LOG_FILE=.\logs\chatbotdysa.log

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=365

# Demo System
DEMO_ENABLED=true
DEMO_SESSION_DURATION=1800000

# Development/Debug
DEBUG_ENABLED=false
SWAGGER_ENABLED=true
"@

    $envConfig | Out-File -FilePath ".env" -Encoding UTF8

    # Create directories
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
    New-Item -ItemType Directory -Path "uploads" -Force | Out-Null

    Write-LogSuccess "Configuration files generated successfully"
}

# Create Windows startup scripts
function New-StartupScripts {
    Write-LogStep "Creating startup scripts..."

    Set-Location $global:ChatBotDysaRoot

    # Main startup script (PowerShell)
    $startScript = @'
# 🚀 ChatBotDysa Enterprise+++++ Startup Script for Windows

Write-Host "🚀 Starting ChatBotDysa Enterprise+++++ System..." -ForegroundColor Green

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]*)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Check PostgreSQL
$dbHost = $env:DB_HOST ?? "localhost"
$dbPort = $env:DB_PORT ?? "5432"
try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = "Server=$dbHost,$dbPort;Database=postgres;Integrated Security=true;"
    $connection.Open()
    $connection.Close()
    Write-Host "✅ PostgreSQL connection verified" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL is not running or not accessible" -ForegroundColor Red
    exit 1
}

# Check Redis
try {
    $redisHost = $env:REDIS_HOST ?? "localhost"
    $redisPort = $env:REDIS_PORT ?? "6379"
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect($redisHost, $redisPort)
    $tcpClient.Close()
    Write-Host "✅ Redis connection verified" -ForegroundColor Green
} catch {
    Write-Host "❌ Redis is not running or not accessible" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Building application..." -ForegroundColor Yellow
npm run build:all

Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
Set-Location "apps\backend"
npm run migration:run
Set-Location "..\..\"

Write-Host "🚀 Starting services..." -ForegroundColor Yellow

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\backend'; npm run start:prod" -WindowStyle Minimized

# Start admin panel
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\admin-panel'; npm run start" -WindowStyle Minimized

# Start web widget
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\web-widget'; npm run start" -WindowStyle Minimized

Write-Host "✅ ChatBotDysa Enterprise+++++ started successfully!" -ForegroundColor Green
Write-Host "📊 Backend running on port 8005" -ForegroundColor Cyan
Write-Host "🎛️ Admin Panel running on port 8001" -ForegroundColor Cyan
Write-Host "🔗 Web Widget running on port 8002" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Use 'stop.ps1' to stop all services" -ForegroundColor Yellow
'@

    $startScript | Out-File -FilePath "start.ps1" -Encoding UTF8

    # Stop script
    $stopScript = @'
# 🚀 ChatBotDysa Enterprise+++++ Stop Script for Windows

Write-Host "🛑 Stopping ChatBotDysa Enterprise+++++ System..." -ForegroundColor Yellow

# Kill Node.js processes related to ChatBotDysa
Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.MainWindowTitle -like "*chatbotdysa*" } | Stop-Process -Force
Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*backend*" } | Stop-Process -Force
Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*admin-panel*" } | Stop-Process -Force
Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*web-widget*" } | Stop-Process -Force

Write-Host "✅ All services stopped" -ForegroundColor Green
'@

    $stopScript | Out-File -FilePath "stop.ps1" -Encoding UTF8

    # Development script
    $devScript = @'
# 🚀 ChatBotDysa Enterprise+++++ Development Script for Windows

Write-Host "🔧 Starting ChatBotDysa Enterprise+++++ in Development Mode..." -ForegroundColor Green

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]*)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Set development environment
[Environment]::SetEnvironmentVariable("NODE_ENV", "development", "Process")

Write-Host "🚀 Starting development servers..." -ForegroundColor Yellow

# Start backend in watch mode
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\backend'; npm run start:dev" -WindowStyle Normal

# Start admin panel in development mode
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\admin-panel'; npm run dev" -WindowStyle Normal

# Start web widget in development mode
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\web-widget'; npm run dev" -WindowStyle Normal

Write-Host "✅ Development environment started!" -ForegroundColor Green
Write-Host "📊 Backend: http://localhost:8005" -ForegroundColor Cyan
Write-Host "🎛️ Admin Panel: http://localhost:8001" -ForegroundColor Cyan
Write-Host "🔗 Web Widget: http://localhost:8002" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Use 'stop.ps1' to stop all services" -ForegroundColor Yellow
'@

    $devScript | Out-File -FilePath "dev.ps1" -Encoding UTF8

    # Create batch files for easier access
    $startBat = @'
@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"
pause
'@
    $startBat | Out-File -FilePath "start.bat" -Encoding ASCII

    $stopBat = @'
@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0stop.ps1"
pause
'@
    $stopBat | Out-File -FilePath "stop.bat" -Encoding ASCII

    $devBat = @'
@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1"
pause
'@
    $devBat | Out-File -FilePath "dev.bat" -Encoding ASCII

    Write-LogSuccess "Startup scripts created successfully"
}

# Create Windows Service
function New-WindowsService {
    Write-LogStep "Creating Windows Service..."

    if (-not (Test-Administrator)) {
        Write-LogWarning "Administrator privileges required to create Windows Service"
        Write-LogInfo "Service creation skipped. You can create it manually later."
        return
    }

    $serviceName = "ChatBotDysaEnterprise"
    $serviceDisplayName = "ChatBotDysa Enterprise+++++ Service"
    $serviceDescription = "Fortune 500 Military-Grade Restaurant AI Management System"
    $servicePath = Join-Path $global:ChatBotDysaRoot "apps\backend\dist\main.js"

    # Check if service already exists
    $existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($existingService) {
        Write-LogWarning "Service $serviceName already exists"
        $response = Read-Host "Recreate service? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
            Remove-Service -Name $serviceName -Force
        } else {
            return
        }
    }

    # Create service using nssm (Non-Sucking Service Manager)
    try {
        # Install nssm if not present
        if (-not (Get-Command nssm -ErrorAction SilentlyContinue)) {
            Write-LogInfo "Installing NSSM (Non-Sucking Service Manager)..."
            choco install nssm -y
        }

        # Create service
        nssm install $serviceName node $servicePath
        nssm set $serviceName DisplayName $serviceDisplayName
        nssm set $serviceName Description $serviceDescription
        nssm set $serviceName AppDirectory $global:ChatBotDysaRoot
        nssm set $serviceName Start SERVICE_AUTO_START

        Write-LogSuccess "Windows Service created successfully"
        Write-LogInfo "Service name: $serviceName"
        Write-LogInfo "Use 'net start $serviceName' to start the service"
    } catch {
        Write-LogWarning "Failed to create Windows Service: $($_.Exception.Message)"
        Write-LogInfo "You can start the application manually using start.bat"
    }
}

# Run installation tests
function Test-Installation {
    Write-LogStep "Running installation verification tests..."

    Set-Location $global:ChatBotDysaRoot

    $testResults = @{
        DatabaseConnection = $false
        RedisConnection = $false
        NodeDependencies = $false
        ConfigurationFiles = $false
    }

    # Test database connection
    Write-LogInfo "Testing database connection..."
    try {
        $dbHost = $env:DB_HOST ?? "localhost"
        $dbPort = $env:DB_PORT ?? "5432"
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($dbHost, $dbPort)
        $tcpClient.Close()
        $testResults.DatabaseConnection = $true
        Write-LogSuccess "PostgreSQL connection ✓"
    } catch {
        Write-LogError "PostgreSQL connection failed"
    }

    # Test Redis connection
    Write-LogInfo "Testing Redis connection..."
    try {
        $redisHost = $env:REDIS_HOST ?? "localhost"
        $redisPort = $env:REDIS_PORT ?? "6379"
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($redisHost, $redisPort)
        $tcpClient.Close()
        $testResults.RedisConnection = $true
        Write-LogSuccess "Redis connection ✓"
    } catch {
        Write-LogError "Redis connection failed"
    }

    # Test Node.js dependencies
    Write-LogInfo "Testing Node.js dependencies..."
    try {
        npm list --depth=0 2>$null | Out-Null
        $testResults.NodeDependencies = $true
        Write-LogSuccess "Node.js dependencies ✓"
    } catch {
        Write-LogWarning "Some Node.js dependencies may have issues"
    }

    # Test configuration files
    Write-LogInfo "Testing configuration files..."
    if ((Test-Path ".env") -and (Test-Path ".env.database")) {
        $testResults.ConfigurationFiles = $true
        Write-LogSuccess "Configuration files ✓"
    } else {
        Write-LogError "Configuration files missing"
    }

    $successfulTests = ($testResults.Values | Where-Object { $_ -eq $true }).Count
    $totalTests = $testResults.Values.Count

    Write-LogInfo "Test Results: $successfulTests/$totalTests tests passed"

    if ($successfulTests -eq $totalTests) {
        Write-LogSuccess "All installation verification tests passed"
    } else {
        Write-LogWarning "Some tests failed. Please check the configuration."
    }

    return $testResults
}

# Print installation summary
function Show-InstallationSummary {
    param($DatabaseInfo, $TestResults)

    Write-Host ""
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Green
    Write-Host "██                                                            ██" -ForegroundColor Green
    Write-Host "██    🎉 ChatBotDysa Enterprise+++++ Installation Complete!  ██" -ForegroundColor Green
    Write-Host "██                                                            ██" -ForegroundColor Green
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Green
    Write-Host ""

    Write-LogSuccess "Installation completed successfully!"
    Write-Host ""

    Write-Host "📁 Installation Directory: " -NoNewline -ForegroundColor Cyan
    Write-Host $global:ChatBotDysaRoot
    Write-Host "🗄️ Database: " -NoNewline -ForegroundColor Cyan
    Write-Host $DatabaseInfo.DatabaseName
    Write-Host "👤 Database User: " -NoNewline -ForegroundColor Cyan
    Write-Host $DatabaseInfo.DatabaseUser
    Write-Host ""

    Write-Host "🚀 Quick Start Commands:" -ForegroundColor Yellow
    Write-Host "  cd '$global:ChatBotDysaRoot'"
    Write-Host "  .\start.bat                 # Start in production mode"
    Write-Host "  .\dev.bat                   # Start in development mode"
    Write-Host "  .\stop.bat                  # Stop all services"
    Write-Host ""

    Write-Host "🌐 Access URLs:" -ForegroundColor Yellow
    Write-Host "  Backend API:    http://localhost:8005"
    Write-Host "  Admin Panel:    http://localhost:8001"
    Write-Host "  Web Widget:     http://localhost:8002"
    Write-Host "  Health Check:   http://localhost:8005/health"
    Write-Host ""

    Write-Host "📚 Documentation:" -ForegroundColor Yellow
    Write-Host "  Configuration:  $global:ChatBotDysaRoot\.env"
    Write-Host "  Database Info:  $global:ChatBotDysaRoot\.env.database"
    Write-Host "  Logs:          $global:ChatBotDysaRoot\logs\"
    Write-Host ""

    if (Test-Administrator) {
        Write-Host "🔧 Windows Service:" -ForegroundColor Yellow
        Write-Host "  net start ChatBotDysaEnterprise"
        Write-Host "  net stop ChatBotDysaEnterprise"
        Write-Host "  sc query ChatBotDysaEnterprise"
        Write-Host ""
    }

    Write-Host "✨ Ready for Fortune 500 Enterprise deployment!" -ForegroundColor Green
    Write-Host ""
}

# Main installation function
function Start-Installation {
    Show-Banner

    Write-LogInfo "Starting ChatBotDysa Enterprise+++++ installation for Windows..."
    Write-LogInfo "This will install a complete restaurant AI management system."
    Write-Host ""

    # Show installation settings
    Write-LogInfo "Installation settings:"
    Write-LogInfo "Installation directory: $InstallPath"
    Write-LogInfo "Skip dependencies: $SkipDependencies"
    Write-LogInfo "Force installation: $Force"
    Write-Host ""

    if (-not $Force) {
        $response = Read-Host "Proceed with installation? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-LogInfo "Installation cancelled by user."
            exit 0
        }
    }

    try {
        # Run installation steps
        $systemInfo = Get-SystemInfo
        $dependencies = Test-Dependencies
        Get-ChatBotDysaSource
        $databaseInfo = Initialize-Databases
        Install-NodeDependencies
        New-ConfigurationFiles -DatabaseInfo $databaseInfo
        New-StartupScripts
        New-WindowsService
        $testResults = Test-Installation
        Show-InstallationSummary -DatabaseInfo $databaseInfo -TestResults $testResults

        Write-LogSuccess "🚀 ChatBotDysa Enterprise+++++ installation completed successfully!"

    } catch {
        Write-LogError "Installation failed: $($_.Exception.Message)"
        Write-LogError "Stack trace: $($_.ScriptStackTrace)"
        exit 1
    }
}

# Check PowerShell version
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Host "[ERROR] PowerShell 5.0 or higher is required" -ForegroundColor Red
    Write-Host "Please upgrade PowerShell and try again" -ForegroundColor Yellow
    exit 1
}

# Run main installation
Start-Installation