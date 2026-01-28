Write-Host "Checking prerequisites..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
}

if (Test-Path "email-task-mcp") {
    Write-Host "✓ email-task-mcp folder exists" -ForegroundColor Green
} else {
    Write-Host "❌ email-task-mcp folder not found" -ForegroundColor Red
    Write-Host "Run the SETUP-ALL scripts first" -ForegroundColor Yellow
}
