<#
Windows PowerShell installer for Homelab Public
Performs these steps:
- checks for Node.js (prints instructions if not found)
- runs npm install in root and backend
- creates backend\uploaded_documents
- creates .env if missing
- generates start.ps1 and start.bat
#>

Set-StrictMode -Version Latest

Write-Host "=================================="
Write-Host "   HOMELAB WINDOWS INSTALLER"
Write-Host "=================================="

$ProjectDir = (Get-Location).Path
Write-Host "Projekt w: $ProjectDir"

# Check Node
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Warning "Node.js nie jest zainstalowany lub nie jest na PATH. Proszę zainstalować Node.js 20.x LTS z https://nodejs.org/ i ponowić instalację."
    exit 1
}

Write-Host "Node version: " (node -v)
Write-Host "NPM version: " (npm -v)

# Create uploaded_documents
$uploaded = Join-Path $ProjectDir "backend\uploaded_documents"
if (-not (Test-Path $uploaded)) {
    Write-Host "Tworzenie katalogu backend\uploaded_documents..."
    New-Item -ItemType Directory -Path $uploaded | Out-Null
} else {
    Write-Host "Katalog backend\uploaded_documents już istnieje"
}

# .env
$envFile = Join-Path $ProjectDir ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "Tworzenie .env..."
    @"
HOST=0.0.0.0
PORT=3000
REACT_APP_API_URL=http://localhost:3001
"@ | Out-File -FilePath $envFile -Encoding UTF8
} else {
    Write-Host ".env już istnieje"
}

# npm install frontend
Write-Host "Instalowanie zależności frontend (root)..."
Push-Location $ProjectDir
try {
    npm install
} catch {
    Write-Warning "Błąd podczas npm install w katalogu głównym: $_"
    Pop-Location
    exit 1
}
Pop-Location

# npm install backend
$backendDir = Join-Path $ProjectDir "backend"
if (Test-Path $backendDir) {
    Write-Host "Instalowanie zależności backend..."
    Push-Location $backendDir
    try {
        npm install
    } catch {
        Write-Warning "Błąd podczas npm install w katalogu backend: $_"
        Pop-Location
        exit 1
    }
    Pop-Location
} else {
    Write-Warning "Katalog backend nie istnieje. Pomiń instalację backendu."
}

# Generate start.ps1
$startPs1 = @'
Write-Host "Uruchamianie frontendu..."
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "{PROJECTDIR}" -NoNewWindow

Start-Sleep -Seconds 2

Write-Host "Uruchamianie backendu..."
$backendPath = Join-Path "{PROJECTDIR}" "backend"
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendPath -NoNewWindow

Write-Host "Aplikacje uruchomione. Zamknij okno lub użyj Ctrl+C aby zakończyć."'@

$startPs1 = $startPs1 -replace "{PROJECTDIR}", ($ProjectDir -replace "\\","\\\\")

$startPath = Join-Path $ProjectDir "start.ps1"
$startPs1 | Out-File -FilePath $startPath -Encoding UTF8
Write-Host "Wygenerowano start.ps1"

# Generate start.bat
$startBat = "@echo off`r`nREM Wrapper uruchamiajacy start.ps1`r`npowershell -ExecutionPolicy RemoteSigned -File \"%~dp0start.ps1\" %*"
$startBatPath = Join-Path $ProjectDir "start.bat"
$startBat | Out-File -FilePath $startBatPath -Encoding ASCII
Write-Host "Wygenerowano start.bat"

Write-Host "=================================="
Write-Host " INSTALACJA ZAKOŃCZONA"
Write-Host "=================================="
Write-Host "Uruchom aplikację: .\start.ps1 lub dwuklik start.bat"

exit 0

