#
# Windows PowerShell installer for Homelab Public
# Performs these steps:
# 1. Installs npm dependencies for frontend
# 2. Installs npm dependencies for backend (if exists)
# 3. Generates start.ps1 and start.bat scripts
#

param(
    [string]$ProjectDir = (Get-Location),
    [switch]$SkipNpmInstall = $false
)

Write-Host "======================================"
Write-Host "Homelab Public - Installer"
Write-Host "======================================"
Write-Host "Project directory: $ProjectDir"

# Check if project directory exists
if (-not (Test-Path $ProjectDir -PathType Container)) {
    Write-Error "Project directory does not exist: $ProjectDir"
    exit 1
}

# Install frontend dependencies
if (-not $SkipNpmInstall) {
    Write-Host ""
    Write-Host "Installing npm dependencies for frontend..."
    Push-Location $ProjectDir

    if (Test-Path "package.json" -PathType Leaf) {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install failed for frontend"
            Pop-Location
            exit 1
        }
    } else {
        Write-Warning "package.json not found in project root"
    }

    Pop-Location
} else {
    Write-Host "Skipping npm install (--SkipNpmInstall)"
}

# Install backend dependencies (if backend directory exists)
$backendDir = Join-Path $ProjectDir "backend"
if ((Test-Path $backendDir -PathType Container) -and -not $SkipNpmInstall) {
    Write-Host ""
    Write-Host "Installing npm dependencies for backend..."
    Push-Location $backendDir

    if (Test-Path "package.json" -PathType Leaf) {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "npm install failed for backend - continuing anyway"
        }
    }

    Pop-Location
} else {
    Write-Warning "Backend directory does not exist. Skipping backend installation."
}

# Generate start.ps1
$startPs1Template = @'
Write-Host "Starting frontend..."
$start = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "___PROJECTDIR___" -PassThru

Start-Sleep -Seconds 2

Write-Host "Starting backend..."
$backendPath = Join-Path "___PROJECTDIR___" "backend"
$backend = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendPath -PassThru

Write-Host "Applications started on ports 3000 (frontend) and 3001 (backend)."
Write-Host "Press Ctrl+C to stop."
'@

$startPs1 = $startPs1Template -replace "___PROJECTDIR___", $ProjectDir

$startPath = Join-Path $ProjectDir "start.ps1"
$startPs1 | Out-File -FilePath $startPath -Encoding UTF8
Write-Host "Generated start.ps1"

# Generate start.bat
$startBat = "@echo off`r`nREM Wrapper to launch start.ps1`r`npowershell -ExecutionPolicy RemoteSigned -File `"%~dp0start.ps1`" %*"
$startBatPath = Join-Path $ProjectDir "start.bat"
$startBat | Out-File -FilePath $startBatPath -Encoding ASCII
Write-Host "Generated start.bat"

Write-Host ""
Write-Host "===================================="
Write-Host "Installation completed successfully"
Write-Host "===================================="
Write-Host "Run: .\start.ps1 or double-click start.bat"

exit 0

