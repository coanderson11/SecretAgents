Write-Host "Configuring Claude Desktop..." -ForegroundColor Cyan

$mcpDir = "email-task-mcp"
$username = $env:USERNAME
$claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$basePathTinkering = "c:/Users/$username/OneDrive - Microsoft/Desktop/Tinkering"

if (-not (Test-Path "$mcpDir\.env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item "$mcpDir\.env.example" "$mcpDir\.env"
    Write-Host "Please edit $mcpDir\.env with your credentials!" -ForegroundColor Red
    notepad "$mcpDir\.env"
    Read-Host "Press Enter after saving .env"
}

Write-Host "Reading configuration..." -ForegroundColor Cyan
$envContent = Get-Content "$mcpDir\.env"
$envVars = @{}

foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim('"')
        $envVars[$key] = $value
    }
}

$mcpConfig = @{
    mcpServers = @{
        "email-task-agent" = @{
            command = "node"
            args = @("$basePathTinkering/$mcpDir/dist/mcp-server.js")
            env = @{
                DATABASE_URL = $envVars["DATABASE_URL"]
                ANTHROPIC_API_KEY = $envVars["ANTHROPIC_API_KEY"]
                MICROSOFT_CLIENT_ID = $envVars["MICROSOFT_CLIENT_ID"]
                MICROSOFT_CLIENT_SECRET = $envVars["MICROSOFT_CLIENT_SECRET"]
                BACKEND_URL = $envVars["BACKEND_URL"]
                LOG_FILE = "$basePathTinkering/$mcpDir/mcp.log"
                ENABLE_SCHEDULER = "false"
            }
        }
    }
}

if (Test-Path $claudeConfigPath) {
    $backup = "$env:APPDATA\Claude\claude_desktop_config.backup.json"
    Copy-Item $claudeConfigPath $backup -Force
    Write-Host "Backup created: $backup" -ForegroundColor Green
    
    $existingConfig = Get-Content $claudeConfigPath -Raw | ConvertFrom-Json
    if (-not $existingConfig.mcpServers) {
        $existingConfig | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue @{} -Force
    }
    $existingConfig.mcpServers | Add-Member -NotePropertyName "email-task-agent" -NotePropertyValue $mcpConfig.mcpServers."email-task-agent" -Force
    $existingConfig | ConvertTo-Json -Depth 10 | Set-Content $claudeConfigPath
} else {
    $claudeDir = Split-Path $claudeConfigPath
    if (-not (Test-Path $claudeDir)) {
        New-Item -ItemType Directory -Force -Path $claudeDir | Out-Null
    }
    $mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $claudeConfigPath
}

Write-Host "✓ Claude Desktop configured!" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Restart Claude Desktop completely" -ForegroundColor Yellow
