Write-Host "Starting frontend..."
$start = Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "C:\Users\admin\WebstormProjects\homelab_public-main" -PassThru

Start-Sleep -Seconds 2

Write-Host "Starting backend..."
$backendPath = Join-Path "C:\Users\admin\WebstormProjects\homelab_public-main" "backend"
$backend = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $backendPath -PassThru

Write-Host "Applications started on ports 3000 (frontend) and 3001 (backend)."
Write-Host "Press Ctrl+C to stop."
