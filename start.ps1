# Check if Node.js and npm are available
function Test-NodeJsAvailable {
    try {
        $null = Get-Command npm -ErrorAction Stop
        $null = Get-Command node -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-NodeJsAvailable)) {
    Write-Error "Node.js and npm are not available. Please install Node.js from https://nodejs.org/"
    Write-Host "Recommended version: Node.js 20.x LTS"
    exit 1
}

Write-Host "Starting frontend..."
$start = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "C:\Users\admin\WebstormProjects\homelab_public-main" -PassThru

Start-Sleep -Seconds 2

Write-Host "Starting backend..."
$backendPath = Join-Path "C:\Users\admin\WebstormProjects\homelab_public-main" "backend"
$backend = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendPath -PassThru

Write-Host "Applications started on ports 3000 (frontend) and 3001 (backend)."
Write-Host "Press Ctrl+C to stop."
