# =============================================================================
# 🚀 CHATBOTDYSA ENTERPRISE+++++ DEPENDENCY VERIFICATION (WINDOWS)
# Fortune 500 System Readiness Checker - PowerShell Edition
# =============================================================================

param(
    [switch]$Verbose,
    [switch]$FixIssues
)

# Set error action preference
$ErrorActionPreference = "SilentlyContinue"

# Enterprise Configuration
$script:EnterpriseVersion = "1.0.0"
$script:MinNodeVersion = "18.0.0"
$script:MinNpmVersion = "8.0.0"
$script:RequiredPostgresVersion = "13"
$script:RequiredRedisVersion = "6"

# Status tracking
$script:TotalChecks = 0
$script:PassedChecks = 0
$script:Warnings = 0
$script:Errors = @()

# Color functions
function Write-Header($text) {
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "                     CHATBOTDYSA ENTERPRISE+++++" -ForegroundColor Magenta
    Write-Host "                   DEPENDENCY VERIFICATION SYSTEM" -ForegroundColor Magenta
    Write-Host "                        Fortune 500 Ready" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host ""
}

function Write-Check($text) {
    $script:TotalChecks++
    Write-Host "[CHECK $($script:TotalChecks)]" -ForegroundColor Blue -NoNewline
    Write-Host " $text"
}

function Write-Success($text) {
    $script:PassedChecks++
    Write-Host "  ✅ PASS: " -ForegroundColor Green -NoNewline
    Write-Host $text
}

function Write-Warning($text) {
    $script:Warnings++
    Write-Host "  ⚠️  WARN: " -ForegroundColor Yellow -NoNewline
    Write-Host $text
}

function Write-Error($text) {
    $script:Errors += $text
    Write-Host "  ❌ FAIL: " -ForegroundColor Red -NoNewline
    Write-Host $text
}

function Write-Info($text) {
    Write-Host "  ℹ️  INFO: " -ForegroundColor Cyan -NoNewline
    Write-Host $text
}

# Version comparison function
function Compare-Version {
    param([string]$Version1, [string]$Version2)

    $v1 = [System.Version]::Parse($Version1)
    $v2 = [System.Version]::Parse($Version2)

    return $v1.CompareTo($v2)
}

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check Node.js
function Test-NodeJs {
    Write-Check "Node.js Installation and Version"

    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $nodeVersion = $nodeVersion.TrimStart('v')
            Write-Info "Found Node.js version: $nodeVersion"

            $comparison = Compare-Version $nodeVersion $script:MinNodeVersion
            if ($comparison -ge 0) {
                Write-Success "Node.js version is compatible (>= $($script:MinNodeVersion))"
            } else {
                Write-Error "Node.js version $nodeVersion is below minimum required $($script:MinNodeVersion)"
            }
        } else {
            Write-Error "Node.js not found. Please install Node.js >= $($script:MinNodeVersion)"
        }
    } catch {
        Write-Error "Error checking Node.js: $($_.Exception.Message)"
    }
}

# Check NPM
function Test-Npm {
    Write-Check "NPM Installation and Version"

    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-Info "Found NPM version: $npmVersion"

            $comparison = Compare-Version $npmVersion $script:MinNpmVersion
            if ($comparison -ge 0) {
                Write-Success "NPM version is compatible (>= $($script:MinNpmVersion))"
            } else {
                Write-Error "NPM version $npmVersion is below minimum required $($script:MinNpmVersion)"
            }
        } else {
            Write-Error "NPM not found. Please install NPM >= $($script:MinNpmVersion)"
        }
    } catch {
        Write-Error "Error checking NPM: $($_.Exception.Message)"
    }
}

# Check PostgreSQL
function Test-PostgreSQL {
    Write-Check "PostgreSQL Installation and Service"

    try {
        $psqlOutput = psql --version 2>$null
        if ($psqlOutput) {
            $pgVersion = ($psqlOutput -split ' ')[2] -replace '(\d+\.\d+).*', '$1'
            Write-Info "Found PostgreSQL version: $pgVersion"

            if ([double]$pgVersion -ge [double]$script:RequiredPostgresVersion) {
                Write-Success "PostgreSQL version is compatible (>= $($script:RequiredPostgresVersion))"
            } else {
                Write-Error "PostgreSQL version $pgVersion is below minimum required $($script:RequiredPostgresVersion)"
            }

            # Check PostgreSQL service
            $pgService = Get-Service -Name "*postgresql*" -ErrorAction SilentlyContinue
            if ($pgService -and $pgService.Status -eq "Running") {
                Write-Success "PostgreSQL service is running"
            } else {
                Write-Warning "PostgreSQL service is not running"
            }
        } else {
            Write-Error "PostgreSQL not found. Please install PostgreSQL >= $($script:RequiredPostgresVersion)"
        }
    } catch {
        Write-Error "Error checking PostgreSQL: $($_.Exception.Message)"
    }
}

# Check Redis
function Test-Redis {
    Write-Check "Redis Installation and Service"

    try {
        $redisOutput = redis-server --version 2>$null
        if ($redisOutput) {
            $redisVersion = ($redisOutput -split 'v=')[1] -split ' ')[0]
            Write-Info "Found Redis version: $redisVersion"

            if ([double]$redisVersion -ge [double]$script:RequiredRedisVersion) {
                Write-Success "Redis version is compatible (>= $($script:RequiredRedisVersion))"
            } else {
                Write-Error "Redis version $redisVersion is below minimum required $($script:RequiredRedisVersion)"
            }

            # Check Redis service
            $redisService = Get-Service -Name "*redis*" -ErrorAction SilentlyContinue
            if ($redisService -and $redisService.Status -eq "Running") {
                Write-Success "Redis service is running"
            } else {
                Write-Warning "Redis service is not running"
            }
        } else {
            Write-Error "Redis not found. Please install Redis >= $($script:RequiredRedisVersion)"
        }
    } catch {
        Write-Error "Error checking Redis: $($_.Exception.Message)"
    }
}

# Check Git
function Test-Git {
    Write-Check "Git Installation"

    try {
        $gitVersion = git --version 2>$null
        if ($gitVersion) {
            $version = ($gitVersion -split ' ')[2]
            Write-Info "Found Git version: $version"
            Write-Success "Git is installed and available"
        } else {
            Write-Error "Git not found. Please install Git"
        }
    } catch {
        Write-Error "Error checking Git: $($_.Exception.Message)"
    }
}

# Check system requirements
function Test-SystemRequirements {
    Write-Check "System Requirements"

    try {
        # Check available memory
        $totalMemory = [math]::Round((Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum / 1GB, 2)
        Write-Info "Total system memory: ${totalMemory}GB"

        if ($totalMemory -ge 4) {
            Write-Success "Sufficient memory available (>= 4GB)"
        } else {
            Write-Warning "Low memory detected. Recommend at least 4GB for optimal performance"
        }

        # Check available disk space
        $disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'"
        $freeSpaceGB = [math]::Round($disk.FreeSpace / 1GB, 2)
        Write-Info "Available disk space: ${freeSpaceGB}GB"

        if ($freeSpaceGB -ge 10) {
            Write-Success "Sufficient disk space available (>= 10GB)"
        } else {
            Write-Error "Insufficient disk space. Need at least 10GB free"
        }
    } catch {
        Write-Error "Error checking system requirements: $($_.Exception.Message)"
    }
}

# Check project dependencies
function Test-ProjectDependencies {
    Write-Check "ChatBotDysa Project Dependencies"

    try {
        # Check if package.json exists
        if (Test-Path "package.json") {
            Write-Success "package.json found"

            # Check if node_modules exists
            if (Test-Path "node_modules") {
                Write-Success "node_modules directory exists"
            } else {
                Write-Warning "node_modules not found. Run 'npm install' to install dependencies"
            }

            # Check specific enterprise dependencies
            $deps = @("@nestjs/core", "@nestjs/common", "typeorm", "pg", "redis", "jsonwebtoken", "bcryptjs")
            foreach ($dep in $deps) {
                $result = npm list $dep 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Enterprise dependency '$dep' is installed"
                } else {
                    Write-Error "Missing enterprise dependency: $dep"
                }
            }
        } else {
            Write-Error "package.json not found. Please run this script from the ChatBotDysa root directory"
        }
    } catch {
        Write-Error "Error checking project dependencies: $($_.Exception.Message)"
    }
}

# Check network connectivity
function Test-Network {
    Write-Check "Network Connectivity"

    try {
        # Check NPM registry
        $npmTest = Test-NetConnection -ComputerName "registry.npmjs.org" -Port 443 -InformationLevel Quiet
        if ($npmTest) {
            Write-Success "NPM registry is reachable"
        } else {
            Write-Warning "Cannot reach NPM registry. May affect package installation"
        }

        # Check GitHub
        $githubTest = Test-NetConnection -ComputerName "github.com" -Port 443 -InformationLevel Quiet
        if ($githubTest) {
            Write-Success "GitHub is reachable"
        } else {
            Write-Warning "Cannot reach GitHub. May affect Git operations"
        }
    } catch {
        Write-Warning "Network connectivity tests failed. Check internet connection"
    }
}

# Check ports availability
function Test-Ports {
    Write-Check "Required Ports Availability"

    $ports = @{
        8001 = "Admin Panel"
        8002 = "Web Widget"
        8005 = "Backend API"
        5432 = "PostgreSQL"
        6379 = "Redis"
    }

    foreach ($port in $ports.Keys) {
        $name = $ports[$port]
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

        if ($connection) {
            Write-Warning "Port $port ($name) is already in use"
        } else {
            Write-Success "Port $port ($name) is available"
        }
    }
}

# Check environment configuration
function Test-Environment {
    Write-Check "Environment Configuration"

    try {
        if (Test-Path ".env") {
            Write-Success ".env file exists"

            # Check for required environment variables
            $content = Get-Content ".env" -Raw
            $requiredVars = @("DATABASE_URL", "JWT_SECRET", "REDIS_URL")

            foreach ($var in $requiredVars) {
                if ($content -match "^$var=") {
                    Write-Success "Environment variable '$var' is configured"
                } else {
                    Write-Error "Missing environment variable: $var"
                }
            }
        } else {
            Write-Error ".env file not found. Please create environment configuration"
        }
    } catch {
        Write-Error "Error checking environment: $($_.Exception.Message)"
    }
}

# Check Windows-specific requirements
function Test-WindowsRequirements {
    Write-Check "Windows-specific Requirements"

    try {
        # Check if running as administrator
        if (Test-Administrator) {
            Write-Success "Running as Administrator"
        } else {
            Write-Warning "Not running as Administrator. Some features may require elevated privileges"
        }

        # Check PowerShell version
        $psVersion = $PSVersionTable.PSVersion
        Write-Info "PowerShell version: $psVersion"

        if ($psVersion.Major -ge 5) {
            Write-Success "PowerShell version is compatible (>= 5.0)"
        } else {
            Write-Error "PowerShell version is too old. Requires PowerShell 5.0 or later"
        }

        # Check for Chocolatey
        $chocoPath = Get-Command choco -ErrorAction SilentlyContinue
        if ($chocoPath) {
            Write-Success "Chocolatey package manager is installed"
        } else {
            Write-Warning "Chocolatey not found. May be needed for automatic dependency installation"
        }

        # Check for Visual Studio Build Tools or Visual Studio
        $vsBuildTools = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\VisualStudio\*" -Name "InstallDir" -ErrorAction SilentlyContinue
        if ($vsBuildTools) {
            Write-Success "Visual Studio Build Tools detected"
        } else {
            Write-Warning "Visual Studio Build Tools not detected. May be needed for native module compilation"
        }
    } catch {
        Write-Error "Error checking Windows requirements: $($_.Exception.Message)"
    }
}

# Main function
function Main {
    Clear-Host
    Write-Header

    Write-Host "Starting Enterprise+++++ dependency verification..." -ForegroundColor White
    Write-Host ""

    Test-WindowsRequirements
    Write-Host ""

    Test-NodeJs
    Write-Host ""

    Test-Npm
    Write-Host ""

    Test-PostgreSQL
    Write-Host ""

    Test-Redis
    Write-Host ""

    Test-Git
    Write-Host ""

    Test-SystemRequirements
    Write-Host ""

    Test-ProjectDependencies
    Write-Host ""

    Test-Network
    Write-Host ""

    Test-Ports
    Write-Host ""

    Test-Environment
    Write-Host ""

    # Final report
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "                           VERIFICATION REPORT" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host ""

    Write-Host "📊 SUMMARY:" -ForegroundColor White
    Write-Host "   Total Checks: $($script:TotalChecks)"
    Write-Host "   " -NoNewline
    Write-Host "Passed: $($script:PassedChecks)" -ForegroundColor Green
    Write-Host "   " -NoNewline
    Write-Host "Warnings: $($script:Warnings)" -ForegroundColor Yellow
    Write-Host "   " -NoNewline
    Write-Host "Errors: $($script:Errors.Count)" -ForegroundColor Red
    Write-Host ""

    if ($script:Errors.Count -eq 0) {
        Write-Host "🎉 ENTERPRISE+++++ SYSTEM READY!" -ForegroundColor Green
        Write-Host "   All critical dependencies are satisfied." -ForegroundColor Green
        Write-Host "   ChatBotDysa is ready for Fortune 500 deployment." -ForegroundColor Green

        if ($script:Warnings -gt 0) {
            Write-Host "   ⚠️  Some warnings detected. Review for optimal performance." -ForegroundColor Yellow
        }

        exit 0
    } else {
        Write-Host "❌ ENTERPRISE READINESS FAILED" -ForegroundColor Red
        Write-Host "   Critical issues must be resolved:" -ForegroundColor Red
        Write-Host ""

        foreach ($error in $script:Errors) {
            Write-Host "   • $error" -ForegroundColor Red
        }

        Write-Host ""
        Write-Host "🔧 RECOMMENDED ACTIONS:" -ForegroundColor White
        Write-Host "   1. Run the installation script: ./install.ps1"
        Write-Host "   2. Install missing dependencies manually"
        Write-Host "   3. Re-run this verification: ./verify-dependencies.ps1"

        exit 1
    }
}

# Execute main function
Main