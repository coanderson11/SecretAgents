# Email-Task-MCP M365 Copilot Integration Guide

This guide walks you through integrating the email-task-mcp connector with M365 Copilot on Windows. After completing this guide, your Copilot instance will be able to access email management tools through the MCP server.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Overview: How Integration Works](#overview-how-integration-works)
- [Step 1: Verify MCP Server Setup](#step-1-verify-mcp-server-setup)
- [Step 2: Configure MCP in Copilot](#step-2-configure-mcp-in-copilot)
- [Step 3: Start the MCP Server](#step-3-start-the-mcp-server)
- [Step 4: Test Copilot Connection](#step-4-test-copilot-connection)
- [Step 5: Troubleshoot Connection Issues](#step-5-troubleshoot-connection-issues)
- [Using the Tools in Copilot](#using-the-tools-in-copilot)
- [Production Deployment](#production-deployment)

---

## Prerequisites

Before integrating with Copilot, ensure:

### From SETUP.md
- [ ] Environment configured (.env file complete)
- [ ] All dependencies installed (`npm install` successful)
- [ ] Database initialized (Prisma migrations run)
- [ ] Project built (`npm run build` successful)

### From TESTING.md
- [ ] All tests passed (validation checklist complete)
- [ ] MCP server can start without errors
- [ ] Database connectivity verified
- [ ] Email tools are functional

### For Copilot Integration
- [ ] M365 account with Copilot access
- [ ] GitHub Copilot CLI installed (for Copilot Lab testing)
- [ ] Administrator access to configure Copilot extensions (if enterprise)
- [ ] Windows command line access (PowerShell or CMD)

---

## Overview: How Integration Works

The email-task-mcp connector integrates with M365 Copilot using the Model Context Protocol (MCP):

```
┌──────────────┐
│ M365 Copilot │
└──────┬───────┘
       │ (requests tools)
       │
       ▼
┌──────────────────────────────────────┐
│  MCP Configuration (mcpServers config) │
│  Points to: node dist/mcp-server.js   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  email-task-mcp Server (stdio)   │
│  - FetchEmailsTool               │
│  - GetEmailDetailsTool           │
│  - SearchEmailsTool              │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Microsoft Graph API             │
│  (Outlook/Exchange)              │
└──────────────────────────────────┘
```

### Key Components

| Component | Role |
|-----------|------|
| **Copilot CLI** | Client that connects to MCP servers |
| **MCP Configuration** | JSON config that tells Copilot how to reach your MCP server |
| **stdio Transport** | Communication method (standard input/output pipes) |
| **Email Tools** | Business logic for email operations |
| **Microsoft Graph** | Outlook email data source |

---

## Step 1: Verify MCP Server Setup

Before configuring Copilot, ensure the MCP server is ready.

### 1a. Verify Build Complete

```powershell
# Check that compiled MCP server exists
Test-Path -Path "dist\mcp-server.js"
```

**Expected:** `True`

### 1b. Start Server and Verify Startup

```powershell
# Start the server
npm start:mcp
```

**Expected output within 3 seconds:**
```
[INFO] MCP Server initialized
[INFO] Server ready
```

**Press Ctrl+C to stop.**

### 1c. Check Log File Access

Verify your log file path is writable:

```powershell
# Check log file (from your .env LOG_FILE setting)
Test-Path -Path "C:\Users\YourUsername\email-task-mcp\mcp.log"

# If not found, create the directory
New-Item -ItemType File -Path "C:\Users\YourUsername\email-task-mcp\mcp.log" -Force
```

### ✅ Verification Complete
If all checks pass, your MCP server is ready to integrate.

---

## Step 2: Configure MCP in Copilot

Configure Copilot to recognize and use your MCP server.

### 2a. Understand the Configuration File

The MCP configuration tells Copilot how to launch and communicate with your MCP server. Look at the example:

**File:** `MCP_CONFIG_EXAMPLE.json`

```json
{
  "mcpServers": {
    "email-task-agent": {
      "command": "node",
      "args": [
        "C:/Users/YourUsername/email-task-mcp/dist/mcp-server.js"
      ],
      "env": {
        "DATABASE_URL": "file:C:/Users/YourUsername/email-task-mcp/dev.db",
        "MICROSOFT_CLIENT_ID": "your-client-id",
        "MICROSOFT_CLIENT_SECRET": "your-client-secret",
        "BACKEND_URL": "http://localhost:8025",
        "LOG_FILE": "C:/Users/YourUsername/email-task-mcp/mcp.log",
        "ENABLE_SCHEDULER": "false"
      }
    }
  }
}
```

### Key Configuration Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `command` | How to run the server | `"node"` |
| `args` | Path to MCP server entry point | `["C:/path/to/dist/mcp-server.js"]` |
| `env` | Environment variables for the server | All variables from `.env` |

### 2b. Create Your Configuration File

For **GitHub Copilot CLI**, the config goes in your Copilot settings:

```powershell
# Copilot CLI config location (Windows)
$copilotConfigPath = "$env:APPDATA\GitHub Copilot\hosts.json"

# Or in VS Code, it's managed through extensions settings
```

**For M365 Copilot / Copilot Pro**, the configuration is typically:

```powershell
# Check if you're using GitHub Copilot CLI or enterprise Copilot
copilot --version
```

### 2c. Register the MCP Server

If using **Copilot CLI**, add your server to `hosts.json`:

```powershell
# Open Copilot CLI settings
$configPath = "$env:APPDATA\GitHub Copilot\hosts.json"

# If file doesn't exist, create it with this structure:
@{
    "mcpServers" = @{
        "email-task-agent" = @{
            "command" = "node"
            "args" = @("C:\Users\YourUsername\email-task-mcp\dist\mcp-server.js")
            "env" = @{
                "DATABASE_URL" = "file:C:/Users/YourUsername/email-task-mcp/dev.db"
                "MICROSOFT_CLIENT_ID" = "your-actual-client-id"
                "MICROSOFT_CLIENT_SECRET" = "your-actual-client-secret"
                "BACKEND_URL" = "http://localhost:8025"
                "LOG_FILE" = "C:/Users/YourUsername/email-task-mcp/mcp.log"
                "ENABLE_SCHEDULER" = "false"
            }
        }
    }
} | ConvertTo-Json | Set-Content -Path $configPath
```

### ⚠️ Important Configuration Notes

**Windows Paths:** Use forward slashes (/) in JSON, even on Windows:
```json
✅ "C:/Users/YourUsername/email-task-mcp/dist/mcp-server.js"
❌ "C:\Users\YourUsername\email-task-mcp\dist\mcp-server.js"
```

**Environment Variables:** Must match your `.env` file exactly:
```json
{
  "env": {
    "DATABASE_URL": "file:C:/path/to/dev.db",
    "MICROSOFT_CLIENT_ID": "copy-from-.env",
    "MICROSOFT_CLIENT_SECRET": "copy-from-.env"
  }
}
```

**Server Name:** The key `"email-task-agent"` is your server identifier. Use this to reference the server in Copilot commands.

### ✅ Configuration Complete
Your MCP server is registered with Copilot.

---

## Step 3: Start the MCP Server

The MCP server must be running for Copilot to use the email tools.

### 3a. Start in Production Mode (Recommended)

```powershell
# Build first (if not already built)
npm run build

# Start the server
npm start:mcp
```

**Keep this window open while using Copilot.**

**Expected output:**
```
[INFO] MCP Server initialized...
[INFO] Listening on stdio...
```

### 3b. OR Start in Development Mode (for testing)

```powershell
# Development mode with auto-reload
npm run dev
```

**Keep this window open.** Press Ctrl+C to stop.

### 3c: Verify Server is Running

In another PowerShell window:

```powershell
# Check for Node.js process
Get-Process | Where-Object { $_.Name -like "*node*" }
```

**Expected output:**
```
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
    500      45   180000     250000      15.2   12345   1 node
```

### 3d: Monitor the Log File

Keep an eye on the log file for errors:

```powershell
# Watch logs in real-time
Get-Content -Path "mcp.log" -Wait
```

---

## Step 4: Test Copilot Connection

Verify that Copilot can reach and use your MCP server.

### 4a. List Available MCP Servers

```powershell
# Using Copilot CLI
copilot mcp list-servers
```

**Expected output:**
```
name: email-task-agent
version: 1.0.0
status: ready
tools: 3
  - FetchEmailsTool
  - GetEmailDetailsTool
  - SearchEmailsTool
```

### 4b. Test Tool Invocation via Copilot CLI

```powershell
# Ask Copilot to list available tools
copilot chat "What email tools are available from the email-task-agent?"
```

**Expected response:** Copilot should describe the three email tools.

### 4c. Test Tool with Sample Request

```powershell
# Ask Copilot to fetch emails
copilot chat "Using the email-task-agent, fetch my recent emails"
```

**Expected behavior:**
1. Copilot sends request to MCP server
2. MCP server queries database
3. Emails returned to Copilot
4. Copilot displays results

**Check server log for:**
```
[INFO] Tool call: FetchEmailsTool
[DEBUG] Query executed: SELECT * FROM email...
[INFO] Returned 3 emails
```

### 4d: Test Search Functionality

```powershell
# Ask Copilot to search emails
copilot chat "Search my emails for 'Q1 budget'"
```

**Expected:** Copilot uses SearchEmailsTool to find matching emails.

### 4e: Test Email Details

```powershell
# Ask for email details
copilot chat "Get details for the first email"
```

**Expected:** Copilot retrieves and displays full email content.

### ✅ Connection Verified
If all tests pass, Copilot is successfully connected to your MCP server.

---

## Step 5: Troubleshoot Connection Issues

### Server Not Found

**Symptom:** Copilot says "MCP server not found" or "email-task-agent unavailable"

**Solutions:**
```powershell
# 1. Verify server is running
Get-Process node

# 2. Check configuration
$configPath = "$env:APPDATA\GitHub Copilot\hosts.json"
Get-Content -Path $configPath | ConvertFrom-Json

# 3. Verify paths in config are correct
# (should use forward slashes and absolute paths)

# 4. Restart Copilot CLI
copilot --restart

# 5. Restart MCP server
# (Kill node process, then restart npm start:mcp)
```

### Connection Timeout

**Symptom:** "MCP server timeout" or "Connection refused"

**Solutions:**
```powershell
# 1. Check if port 8025 is already in use
netstat -ano | findstr :8025

# 2. Kill any existing Node processes
Get-Process node | Stop-Process -Force

# 3. Ensure database is not locked
Get-Item -Path "dev.db" | Select-Object -Property LastWriteTime

# 4. Restart MCP server
npm start:mcp
```

### Tools Not Available

**Symptom:** "No tools found" or only seeing 0 tools

**Solutions:**
```powershell
# 1. Verify build succeeded
Test-Path -Path "dist\mcp-server.js"

# 2. Check for build errors
npm run build

# 3. Verify tools are defined in source
Select-String -Path "src\mcp-server.ts" -Pattern "toolInstances"

# 4. Check log file for initialization errors
Select-String -Path "mcp.log" -Pattern "ERROR|Tool"
```

### Authentication Failed

**Symptom:** "Invalid OAuth credentials" or "Authentication failed"

**Solutions:**
```powershell
# 1. Verify .env file has correct credentials
Get-Content -Path ".env" | Select-String "MICROSOFT"

# 2. Verify credentials match Azure AD app
# (Check Azure Portal > App registrations > Your app)

# 3. Ensure secret hasn't expired
# (Azure AD secrets expire after 1-2 years)

# 4. Regenerate secret if needed
# (Azure Portal > Certificates & secrets > New client secret)

# 5. Update .env and restart server
npm start:mcp
```

### Database Connection Error

**Symptom:** "Cannot connect to database" or "SQLITE_CANTOPEN"

**Solutions:**
```powershell
# 1. Verify database file exists
Test-Path -Path "dev.db"

# 2. Check file permissions
Get-Item -Path "dev.db" | Select-Object -Property Attributes

# 3. Verify DATABASE_URL in .env is correct
Get-Content -Path ".env" | Select-String "DATABASE_URL"

# 4. Check if database is locked
# (Close any other processes using db.db)

# 5. Reinitialize database
npx prisma migrate deploy
```

### Logs Show Errors

**Symptom:** Errors in `mcp.log` file

**Solutions:**
```powershell
# 1. View error messages
Select-String -Path "mcp.log" -Pattern "ERROR" -Context 2

# 2. Check for common errors:
Select-String -Path "mcp.log" -Pattern "ENOENT|EACCES|EADDRINUSE"

# 3. Enable verbose logging (edit src/utils/logger.ts)
# Set: const logLevel = 'DEBUG'

# 4. Rebuild and restart
npm run build
npm start:mcp
```

---

## Using the Tools in Copilot

Once integrated, you can use email tools in natural language:

### FetchEmailsTool Examples

```
"Show me my recent emails"
"Get my last 5 emails"
"List emails from [recipient]"
"Fetch emails from today"
```

**Tool parameters:**
- `limit` (optional): Number of emails to retrieve (default: 10)
- `offset` (optional): Skip first N emails (for pagination)

### GetEmailDetailsTool Examples

```
"Show me the details of email ID [id]"
"Get the full content of that email"
"What's in the first email?"
"Expand that email"
```

**Tool parameters:**
- `emailId` (required): UUID of the email from FetchEmailsTool

### SearchEmailsTool Examples

```
"Search for emails about Q1 budget"
"Find emails from John Doe"
"Look for emails mentioning 'urgent'"
"Search for emails with 'meeting'"
```

**Tool parameters:**
- `query` (required): Search term or phrase
- `limit` (optional): Max results (default: 20)

---

## Production Deployment

### Before Going to Production

- [ ] All tests passed from TESTING.md
- [ ] MCP server runs for 1+ hours without errors
- [ ] Database is backed up
- [ ] OAuth credentials are from production Azure AD app
- [ ] Log file path is on reliable storage
- [ ] Error monitoring is set up

### Production Start Script

Create a start script for production use:

**File: `start-mcp.ps1`**

```powershell
# Email-Task-MCP Production Start Script

# Configuration
$ProjectPath = "C:\path\to\email-task-mcp"
$LogFile = "C:\path\to\logs\mcp.log"
$Port = 8025

# Navigation
Set-Location $ProjectPath

# Check if already running
$existingProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*mcp-server.js*"
}

if ($existingProcess) {
    Write-Error "MCP server already running (PID: $($existingProcess.Id))"
    exit 1
}

# Build
Write-Host "Building MCP server..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

# Start with logging
Write-Host "Starting MCP server on port $Port..."
Write-Host "Logs: $LogFile"

npm start:mcp 2>&1 | Tee-Object -FilePath $LogFile

# If we get here, server stopped
Write-Host "MCP server stopped"
```

Run with:
```powershell
.\start-mcp.ps1
```

### Monitoring in Production

```powershell
# Create a monitoring script that checks server health
# (Check if process is running, verify log file updates, etc.)

# Example: Check if server is responding
function Test-MCPServer {
    $process = Get-Process node -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*mcp-server.js*" }
    
    if ($process) {
        return "Running (PID: $($process.Id))"
    } else {
        return "Not Running"
    }
}

Test-MCPServer
```

### Updating in Production

To deploy a new version:

```powershell
# 1. Stop the running server
Get-Process node | Where-Object { $_.CommandLine -like "*mcp-server.js*" } | Stop-Process -Force

# 2. Pull new code
git pull origin main

# 3. Install dependencies
npm install

# 4. Rebuild
npm run build

# 5. Restart
npm start:mcp
```

---

## Next Steps

### ✅ Integration Complete
Your email-task-mcp connector is now integrated with M365 Copilot!

### For Continued Development
- Monitor logs for errors: `Get-Content -Path "mcp.log" -Wait`
- Test new email scenarios in Copilot
- Extend tools as needed (see source code in `src/mcp/tools/`)
- Scale to multiple users (enterprise deployment)

### For Issues or Support
1. Check troubleshooting section above
2. Review logs in `mcp.log`
3. Verify all steps in SETUP.md and TESTING.md
4. Consult MCP documentation: https://modelcontextprotocol.io/
5. Check Microsoft Graph docs: https://learn.microsoft.com/en-us/graph/

---

## Support Resources

- **MCP Protocol Spec:** https://modelcontextprotocol.io/
- **GitHub Copilot CLI:** https://github.com/github/copilot-cli
- **Microsoft Graph API:** https://learn.microsoft.com/en-us/graph/
- **Prisma ORM:** https://www.prisma.io/
- **Node.js Documentation:** https://nodejs.org/docs/
