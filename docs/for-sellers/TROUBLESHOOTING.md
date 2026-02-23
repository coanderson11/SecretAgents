# Email-Task-MCP Troubleshooting Reference
**Location:** Session workspace (not committed to repository)  
**Purpose:** Quick-reference guide for resolving common issues during development and testing

---

## Quick Diagnosis Flowchart

```
Issue Occurs
    ↓
Is MCP server running?
    ├─ No  → See "Server Won't Start"
    └─ Yes → Continue
         ↓
   Can Copilot find the server?
       ├─ No  → See "Connection Issues"
       └─ Yes → Continue
            ↓
        Are tools available?
            ├─ No  → See "Tools Not Available"
            └─ Yes → Continue
                 ↓
             Are tools returning data?
                 ├─ No  → See "No Data Returned"
                 └─ Yes → Success! ✅
```

---

## Issue: Server Won't Start

### Symptoms
- `npm start:mcp` shows error and exits
- No "Server ready" message
- Process exits immediately

### Root Causes & Solutions

#### 1. Build Not Complete
```powershell
# Check if dist/ folder exists
Test-Path -Path "dist\mcp-server.js"
# If False:
npm run build
npm start:mcp
```

#### 2. Missing .env File
```powershell
# Check for .env
Test-Path -Path ".env"
# If False:
Copy-Item ".env.example" -Destination ".env"
# Edit .env with your credentials
npm start:mcp
```

#### 3. Invalid .env Variables
```powershell
# Check for syntax errors in .env
Get-Content .env

# Common issues:
# ❌ Missing quotes: DATABASE_URL=file:C:/...
# ✅ With quotes: DATABASE_URL="file:C:/..."
# ❌ Spaces: VARIABLE = value
# ✅ No spaces: VARIABLE=value
```

#### 4. Database File Missing or Corrupted
```powershell
# Check database
Test-Path -Path "dev.db"

# If missing, run migrations:
npx prisma migrate deploy

# If corrupted:
Remove-Item "dev.db"
npx prisma migrate deploy
```

#### 5. Port Already in Use
```powershell
# Check what's using port 8025
netstat -ano | findstr :8025

# If something is there, kill it:
Get-Process node | Stop-Process -Force
# OR:
taskkill /PID <PID> /F
```

#### 6. Node Modules Missing or Broken
```powershell
# Reinstall
Remove-Item -Recurse -Force "node_modules"
Remove-Item "package-lock.json"
npm install
npm run build
npm start:mcp
```

---

## Issue: Connection Issues (Copilot Can't Find Server)

### Symptoms
- `copilot mcp list-servers` doesn't show email-task-agent
- "MCP server not found" error
- Connection refused or timeout

### Root Causes & Solutions

#### 1. MCP Server Not Running
```powershell
# Check if running
Get-Process node | Select-Object ProcessName, Id, CommandLine

# Start it
npm start:mcp
# (Keep window open)
```

#### 2. Incorrect Configuration Path
```powershell
# Find Copilot config location
$configPath = "$env:APPDATA\GitHub Copilot\hosts.json"
Get-Content $configPath | ConvertFrom-Json

# Verify path to mcp-server.js matches actual location
# Should be: C:/Users/YourUsername/email-task-mcp/dist/mcp-server.js
# (with forward slashes)
```

#### 3. Wrong Server Name in Config
```powershell
# Check config has correct server name
Get-Content $configPath | ConvertFrom-Json | Select-Object -ExpandProperty mcpServers

# Should show: email-task-agent
# Then use: copilot mcp list-servers
```

#### 4. Configuration Syntax Error
```powershell
# Validate JSON
$config = Get-Content $configPath
try {
    $config | ConvertFrom-Json
    Write-Host "✅ Valid JSON"
} catch {
    Write-Host "❌ Invalid JSON: $_"
}

# Fix: Use proper JSON format with quotes around all keys/values
# ❌ { mcpServers: { email-task-agent: { } } }
# ✅ { "mcpServers": { "email-task-agent": { } } }
```

#### 5. Environment Variables Not Passed
```powershell
# Verify config includes "env" section
$config = Get-Content $configPath | ConvertFrom-Json
$config.mcpServers.'email-task-agent'.env | Format-Table

# Should show: DATABASE_URL, MICROSOFT_CLIENT_ID, etc.
```

---

## Issue: Tools Not Available

### Symptoms
- `copilot mcp list-servers` shows 0 tools
- "No tools found" when trying to use them
- Tools show as undefined

### Root Causes & Solutions

#### 1. Build Errors (Tools Not Compiled)
```powershell
# Check for build errors
npm run build

# Look for error messages like:
# error TS1234: ...
# If found, fix TypeScript errors in src/mcp/tools/

# Rebuild
npm run build
```

#### 2. Server Crashed During Initialization
```powershell
# Check logs
Get-Content -Path "mcp.log" | Select-Object -Last 50

# Look for error messages starting with [ERROR]
# Common: "Cannot find module", "TypeError", "ReferenceError"

# Fix and rebuild:
npm run build
npm start:mcp
```

#### 3. Tool Classes Not Instantiated
```powershell
# Check source code
Get-Content -Path "src\mcp-server.ts" | Select-String -Pattern "toolInstances"

# Should see:
# const toolInstances = [
#   new FetchEmailsTool(...),
#   new GetEmailDetailsTool(...),
#   new SearchEmailsTool(...),
# ];

# If missing, add them to src/mcp-server.ts
```

#### 4. Tools Not Registered with MCP Server
```powershell
# Check MCP tool registration code
Get-Content -Path "src\mcp-server.ts" | Select-String -Pattern "server.setRequestHandler\|registerTool"

# Should register each tool with MCP server
# If missing, add registration code
```

---

## Issue: No Data Returned (Tools Return Empty)

### Symptoms
- Tools run without error
- But return no emails or empty results
- Database seems empty

### Root Causes & Solutions

#### 1. No Test Data in Database
```powershell
# Check if data exists
npx prisma studio
# Visit http://localhost:5555
# Go to "Email" table
# If empty, load test data:

node create-test-emails.mjs
# Should output: "Created 3 test emails"
```

#### 2. Wrong Session ID
```powershell
# Check which session the tools are querying
Get-Content -Path "mcp.log" | Select-String "sessionId"

# Verify session exists in database
npx prisma studio
# Go to "Session" table
# Should show at least one session

# If no sessions, create one:
node create-test-emails.mjs
```

#### 3. Database Connection Failing Silently
```powershell
# Test database connection
npx prisma db execute --stdin < "SELECT COUNT(*) as email_count FROM email;"

# If error, check:
Get-Content ".env" | Select-String "DATABASE_URL"
# Verify file path exists
Test-Path -Path "dev.db"
```

#### 4. Query Filters Too Strict
```powershell
# Check search tool parameters
# If search is too specific, no results found

# Test with broader search:
copilot chat "Fetch my recent emails"
# Instead of:
copilot chat "Find emails about xyz from 2020"
```

---

## Issue: Database Errors

### Symptoms
- "Cannot connect to database"
- "SQLITE_CANTOPEN"
- "database is locked"

### Root Causes & Solutions

#### 1. Database File Not Found
```powershell
# Check if file exists
Test-Path -Path "dev.db"

# If False, create it:
npx prisma migrate deploy
```

#### 2. Database Path in .env Is Wrong
```powershell
# Check .env
Get-Content ".env" | Select-String "DATABASE_URL"

# Verify path exists:
Test-Path -Path "C:\Users\YourUsername\email-task-mcp\dev.db"

# Fix path if needed, then:
npm start:mcp
```

#### 3. Database File Locked by Another Process
```powershell
# Kill all Node processes
Get-Process node | Stop-Process -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Restart
npm start:mcp
```

#### 4. File Permissions Issue
```powershell
# Check file is readable/writable
Get-Item -Path "dev.db" -ErrorAction Stop

# If permission denied, reset permissions:
icacls "dev.db" /grant:r "$env:USERNAME:(F)"

# Or recreate:
Remove-Item "dev.db"
npx prisma migrate deploy
```

#### 5. Corrupted Database File
```powershell
# Backup and delete
Copy-Item "dev.db" "dev.db.backup"
Remove-Item "dev.db"

# Recreate
npx prisma migrate deploy

# Verify
npx prisma studio
```

---

## Issue: Authentication/OAuth Errors

### Symptoms
- "Invalid OAuth credentials"
- "Authentication failed"
- "Unauthorized"

### Root Causes & Solutions

#### 1. Wrong Client ID or Secret
```powershell
# Verify credentials in .env
Get-Content ".env" | Select-String "MICROSOFT_CLIENT"

# Cross-check with Azure AD:
# 1. Go to portal.azure.com
# 2. Azure Active Directory → App registrations
# 3. Find your app (e.g., "email-task-mcp")
# 4. Copy Application (client) ID
# 5. Check Certificates & secrets for secret value

# Update .env if needed
npm start:mcp
```

#### 2. Secret Expired (Azure AD)
```powershell
# Secrets expire after 1-2 years
# Check Azure Portal → App registrations → Certificates & secrets

# If expired:
# 1. Delete old secret
# 2. Create new secret
# 3. Copy new value to .env MICROSOFT_CLIENT_SECRET
# 4. Restart: npm start:mcp
```

#### 3. App Missing Required Permissions
```powershell
# Check Azure Portal:
# 1. Azure Active Directory → App registrations → Your app
# 2. API permissions
# 3. Should include: Mail.Read, Mail.Send

# If missing:
# 1. Add a permission
# 2. Select Microsoft Graph
# 3. Add delegated permissions: Mail.Read, Mail.Send
# 4. Click "Grant admin consent"
# 5. Restart: npm start:mcp
```

#### 4. Client ID/Secret Mismatch
```powershell
# Ensure they're from same Azure AD app
# Check: Get-Content ".env" | Select-String "MICROSOFT"

# Get fresh credentials:
# 1. Create new app in Azure AD
# 2. Get new Client ID
# 3. Get new Client Secret
# 4. Update .env
# 5. Restart: npm start:mcp
```

---

## Issue: Log File Errors

### Symptoms
- "Cannot write to log file"
- "Permission denied"
- Log file not created

### Root Causes & Solutions

#### 1. Log Directory Doesn't Exist
```powershell
# Check path from .env
Get-Content ".env" | Select-String "LOG_FILE"

# Create directory
$logDir = "C:\Users\YourUsername\email-task-mcp"
New-Item -ItemType Directory -Path $logDir -Force

# Create log file
New-Item -ItemType File -Path "$logDir\mcp.log" -Force

# Restart
npm start:mcp
```

#### 2. Permission Denied on Directory
```powershell
# Grant permissions
$logDir = "C:\Users\YourUsername\email-task-mcp"
icacls $logDir /grant:r "$env:USERNAME:(F)"

# Restart
npm start:mcp
```

#### 3. Log File Already Open
```powershell
# Close any applications reading the log
# (Notepad, VS Code, Get-Content -Wait, etc.)

# Then restart
npm start:mcp
```

---

## Issue: Performance/Memory Problems

### Symptoms
- Server uses lots of memory (>500 MB)
- Server is slow to respond
- High CPU usage

### Root Causes & Solutions

#### 1. Large Database
```powershell
# Check database size
(Get-Item "dev.db").Length / 1MB

# If >100 MB, clean up:
Remove-Item "dev.db"
npx prisma migrate deploy
npm start:mcp
```

#### 2. Memory Leak in Code
```powershell
# Monitor memory over time
while($true) {
    $mem = (Get-Process node | Measure-Object -Property WorkingSet -Sum).Sum / 1MB
    Write-Host "$(Get-Date): $mem MB"
    Start-Sleep -Seconds 5
}

# If memory keeps growing, restart server
Get-Process node | Stop-Process -Force
npm start:mcp
```

#### 3. Too Many Email Objects
```powershell
# Check email count
npx prisma db execute --stdin < "SELECT COUNT(*) as count FROM email;"

# If >10,000, archive or delete old emails
# Or optimize query in email-tools.ts
```

---

## Quick Commands Reference

```powershell
# Check server running
Get-Process node | Select-Object ProcessName, Id

# Kill all node processes
Get-Process node | Stop-Process -Force

# View last 50 log lines
Get-Content mcp.log | Select-Object -Last 50

# Monitor log in real-time
Get-Content mcp.log -Wait

# Search log for errors
Select-String -Path "mcp.log" -Pattern "ERROR|WARN"

# Check database
npx prisma studio

# Load test data
node create-test-emails.mjs

# Rebuild project
npm run build

# Start in dev mode
npm run dev

# Start in production mode
npm start:mcp

# Check open ports
netstat -ano | findstr :8025

# Verify Copilot sees server
copilot mcp list-servers

# Test Copilot chat
copilot chat "List available tools"
```

---

## When to Restart vs Rebuild

| Scenario | Action |
|----------|--------|
| Changed `.env` values | Restart server: `Ctrl+C`, then `npm start:mcp` |
| Changed TypeScript source code | Rebuild: `npm run build`, then restart |
| Changed Prisma schema | Migrate: `npx prisma migrate deploy`, then rebuild |
| Database corrupted | Delete `dev.db`, migrate, reload test data |
| Server hung/unresponsive | Kill: `Get-Process node \| Stop-Process -Force`, restart |
| Memory leak | Restart server |
| Port in use | Kill process on port, restart |

---

## Escalation Path

If basic troubleshooting doesn't work:

1. **Check detailed logs:**
   ```powershell
   Select-String -Path "mcp.log" -Pattern "ERROR" -Context 3
   ```

2. **Enable verbose logging:**
   - Edit `src/utils/logger.ts`
   - Change `logLevel` to `'DEBUG'`
   - Rebuild: `npm run build`
   - Restart: `npm start:mcp`

3. **Verify prerequisites:**
   - Run through SETUP.md checklist
   - Run through TESTING.md checklist

4. **Check third-party services:**
   - Microsoft Graph API status
   - Azure AD availability
   - Network connectivity

5. **Review source code:**
   - Trace error to source in `src/`
   - Add console.log() for debugging
   - Rebuild and restart

---

**Last Updated:** 2026-02-23  
**Version:** 1.0.0
