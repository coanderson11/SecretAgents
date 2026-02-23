# Email-Task-MCP Testing & Validation Guide

This guide covers how to test and validate the email-task-mcp connector after building it. Follow these procedures to ensure the connector is working correctly before integrating with M365 Copilot.

## Table of Contents
- [Pre-Testing Checklist](#pre-testing-checklist)
- [Test 1: Build Verification](#test-1-build-verification)
- [Test 2: MCP Server Startup](#test-2-mcp-server-startup)
- [Test 3: Tool Availability](#test-3-tool-availability)
- [Test 4: Database Connectivity](#test-4-database-connectivity)
- [Test 5: Email Tool Functionality](#test-5-email-tool-functionality)
- [Test 6: End-to-End Integration](#test-6-end-to-end-integration)
- [Validation Checklist](#validation-checklist)
- [Debugging Guide](#debugging-guide)

---

## Pre-Testing Checklist

Before running tests, verify:

- [ ] **SETUP.md completed** - Environment configured, dependencies installed, build successful
- [ ] **.env file exists** with all required variables filled in
- [ ] **Build succeeded** - `npm run build` completed without errors
- [ ] **Database file created** - `dev.db` exists at the path specified in `DATABASE_URL`
- [ ] **No other instances running** - Kill any existing `npm` or Node.js processes on port 8025
- [ ] **Log file path exists** - Directory for `LOG_FILE` is accessible
- [ ] **Network connectivity** - Internet connection available (for Microsoft Graph API)

---

## Test 1: Build Verification

Verify that TypeScript compiled successfully to JavaScript.

### Step 1a: Check Compiled Output

```powershell
# List all compiled JavaScript files
Get-ChildItem -Path "dist" -Recurse -Filter "*.js" | Select-Object FullName
```

**Expected output:**
```
FullName
--------
C:\...\email-task-mcp\dist\mcp-server.js
C:\...\email-task-mcp\dist\config\database.js
C:\...\email-task-mcp\dist\config\mcp-config.js
C:\...\email-task-mcp\dist\mcp\tools\email-tools.js
C:\...\email-task-mcp\dist\mcp\user-context.js
... (more files)
```

### Step 1b: Verify Main Entry Point

```powershell
# Check that main MCP server file exists
Test-Path -Path "dist\mcp-server.js"
```

**Expected output:** `True`

### ✅ Test 1 Result
If both checks pass, the build is valid.

---

## Test 2: MCP Server Startup

Test that the MCP server can initialize and start correctly.

### Step 2a: Start the Server

```powershell
# Start the MCP server
npm start:mcp
```

### Step 2b: Watch for Startup Messages

Within 3–5 seconds, you should see output similar to:

```
[INFO] MCP Server initializing...
[INFO] User context created
[INFO] MCP Server ready on stdio transport
```

**OR in debug/verbose mode (if enabled):**

```
[DEBUG] Loading configuration...
[DEBUG] Initializing Prisma client...
[DEBUG] Setting up MCP tools...
[INFO] Server ready
```

### Step 2c: Verify No Errors

Look for error messages like:
- ❌ `ENOENT` (file not found)
- ❌ `EACCES` (permission denied)
- ❌ `Error: Cannot connect to database`
- ❌ `SyntaxError` (parse errors)

If you see any of these, the server failed to start. See [Debugging Guide](#debugging-guide).

### Step 2d: Stop the Server

Press `Ctrl+C` to gracefully shut down the server.

```
[INFO] Server shutting down...
```

### ✅ Test 2 Result
If the server starts without errors and shuts down cleanly, startup is working.

---

## Test 3: Tool Availability

Verify that all email tools are registered and available in the MCP server.

### Step 3a: Check Tool Registration Code

```powershell
# Search for tool definitions in source
Select-String -Path "src\mcp\tools\email-tools.ts" -Pattern "class.*Tool"
```

**Expected output:**
```
FetchEmailsTool
GetEmailDetailsTool
SearchEmailsTool
```

### Step 3b: Review Tool Names in Code

Open `src/mcp/tools/email-tools.ts` and verify:

```typescript
// Should contain:
class FetchEmailsTool { ... }        // Retrieves emails
class GetEmailDetailsTool { ... }    // Gets email details
class SearchEmailsTool { ... }       // Searches emails
```

### Step 3c: Verify Tool Registration

Open `src/mcp-server.ts` and search for tool initialization:

```typescript
// Should see:
const toolInstances = [
  new FetchEmailsTool(...),
  new GetEmailDetailsTool(...),
  new SearchEmailsTool(...),
];
```

### ✅ Test 3 Result
If all three tools are defined and registered, tools are available.

---

## Test 4: Database Connectivity

Verify that the database is accessible and properly initialized.

### Step 4a: Check Database File

```powershell
# Verify dev.db file exists
Test-Path -Path "dev.db"
```

**Expected output:** `True`

### Step 4b: Check Database Size

```powershell
# Get file properties
Get-Item -Path "dev.db" | Select-Object Length, LastWriteTime
```

**Expected output:**
```
Length       LastWriteTime
------       --------
142000       2026-02-23 17:00:00
```

(Size depends on how much data is stored; new database is ~50–100 KB)

### Step 4c: Test Prisma Connection

```powershell
# Use Prisma CLI to check database
npx prisma db execute --stdin < "SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table';"
```

**OR use Prisma Studio (visual database explorer):**

```powershell
# Open Prisma Studio in browser
npx prisma studio
```

This opens `http://localhost:5555` with a visual database explorer.

### Step 4d: Verify Tables Exist

Using Prisma Studio or database tool, check for these tables:
- [ ] `Session`
- [ ] `Email`
- [ ] `Task`
- [ ] `Draft`
- [ ] `Meeting`
- [ ] `MeetingPrep`
- [ ] `AgentActivity`
- [ ] `UploadedFile`
- [ ] `Insight`
- [ ] `RecommendedCampaign`
- [ ] `UserPoints`

### ✅ Test 4 Result
If database file exists, is accessible, and contains all tables, database connectivity is working.

---

## Test 5: Email Tool Functionality

Test the core email tools with sample/test data.

### Step 5a: Load Test Data (if not already done)

```powershell
# Create sample emails in database
node create-test-emails.mjs
```

**Expected output:**
```
✅ Session created: ed102335-1481-4210-b4b9-6c02ee31fae9
Created 3 test emails
```

### Step 5b: Start the Server in Development Mode

For testing, use development mode which is easier to debug:

```powershell
# Start in watch/dev mode
npm run dev
```

The server will start and watch for changes.

### Step 5c: Test FetchEmailsTool

In another PowerShell window (keeping the server running):

```powershell
# Query the database directly to verify test data
npx prisma studio
```

Or via Node.js script:

```powershell
# Create a test script
@"
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const emails = await prisma.email.findMany({ take: 3 });
  console.log('Emails found:', emails.length);
  emails.forEach(e => console.log(`- ${e.subject}`));
  await prisma.\$disconnect();
}
test();
"@ | Out-File -FilePath "test-email-fetch.mjs"

node test-email-fetch.mjs
```

**Expected output:**
```
Emails found: 3
- Q1 Project Update & Timeline Discussion
- Budget Review Required - Urgent Action Needed
- Team Collaboration Meeting Next Wednesday
```

### Step 5d: Verify Database Changes

After test data is created, check with:

```powershell
# Count emails in session
npx prisma db execute --stdin < "SELECT COUNT(*) FROM email;"
```

**Expected output:** `3` (or your test data count)

### ✅ Test 5 Result
If test data loads and emails are accessible in the database, email tools are functional.

---

## Test 6: End-to-End Integration

Test the complete flow from server startup to tool execution.

### Step 6a: Setup Test Environment

```powershell
# Ensure clean state
npm run build
```

### Step 6b: Start Server with Logging

```powershell
# Start with output visible
npm start:mcp 2>&1 | Tee-Object -FilePath "test-run.log"
```

### Step 6c: Monitor Logs

Open the log file specified in your `.env` (e.g., `mcp.log`):

```powershell
# Watch log file in real-time
Get-Content -Path "mcp.log" -Wait
```

**Expected patterns:**
```
[INFO] Server initialized
[DEBUG] Tools registered: 3
[INFO] Waiting for client connections
```

### Step 6d: Simulate Client Request (optional)

If you have an MCP client (like Copilot or a test script):

1. Connect to the MCP server on stdio
2. Request list of tools
3. Call FetchEmailsTool with parameters
4. Verify response format

**Expected tool response structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "subject": "email subject",
      "from": "sender@example.com",
      "createdAt": "2026-02-23T17:00:00Z"
    }
  ]
}
```

### Step 6e: Shutdown Gracefully

```powershell
# Press Ctrl+C in the terminal running npm start:mcp
```

Check logs for clean shutdown:
```
[INFO] Server shutting down
[DEBUG] Disconnecting database...
[INFO] Shutdown complete
```

### ✅ Test 6 Result
If server starts, logs are clean, and tools respond correctly, E2E integration is working.

---

## Validation Checklist

Use this checklist to confirm all tests passed:

### Build & Compilation
- [ ] `dist/mcp-server.js` exists
- [ ] All TypeScript files compiled to JavaScript
- [ ] No build errors in console

### Server Initialization
- [ ] Server starts without errors
- [ ] Initial log messages appear within 3 seconds
- [ ] No ENOENT, EACCES, or connection errors
- [ ] Server shuts down gracefully with Ctrl+C

### Tools & Configuration
- [ ] 3 tools registered (FetchEmailsTool, GetEmailDetailsTool, SearchEmailsTool)
- [ ] Tool names match source code
- [ ] Tool initialization code is present in mcp-server.ts

### Database
- [ ] `dev.db` file exists and has size > 50 KB
- [ ] All 11 Prisma tables exist in database
- [ ] Can connect via Prisma Studio (`npx prisma studio`)

### Data & Functionality
- [ ] Test data can be created: `node create-test-emails.mjs`
- [ ] Emails appear in database after test data creation
- [ ] Email count queries return correct results
- [ ] No database access errors in logs

### Logging
- [ ] Log file path is accessible
- [ ] Log messages appear in configured log file
- [ ] Log contains startup and operation messages
- [ ] No permission errors on log file writes

### ✅ All Tests Passed
If all checkboxes are marked, the connector is ready for integration with M365 Copilot.

---

## Debugging Guide

### Common Test Failures

#### "Server fails to start - Port 8025 in use"
**Symptom:** Error: "listen EADDRINUSE :::8025"
```powershell
# Kill process on port 8025
Get-Process | Where-Object { $_.Name -like "*node*" } | Stop-Process -Force

# Or find by port:
netstat -ano | findstr :8025
taskkill /PID <PID> /F
```

#### "Database locked error"
**Symptom:** "SQLITE_CANTOPEN: unable to open database file"
```powershell
# Check if another instance has the database open
Get-Process | Where-Object { $_.Name -like "*node*" }

# Delete corrupted database and restart (loses test data)
Remove-Item -Path "dev.db"
npx prisma migrate deploy
```

#### "Log file permission denied"
**Symptom:** "EACCES: permission denied, open 'mcp.log'"
```powershell
# Create log directory with proper permissions
New-Item -ItemType Directory -Path "C:/logs" -Force
icacls "C:/logs" /grant:r "$env:USERNAME:(F)"
```

#### "Email tool returns empty results"
**Symptom:** Tools respond but no emails in results
```powershell
# Check if test data exists
node create-test-emails.mjs

# Or verify session exists
npx prisma studio
# Go to Session table, confirm records exist
```

### Enabling Verbose Logging

Edit `src/utils/logger.ts` to increase log level:

```typescript
const logLevel = process.env.LOG_LEVEL || 'DEBUG'; // Change from 'INFO' to 'DEBUG'
```

Then rebuild and retest:
```powershell
npm run build
npm start:mcp
```

### Checking Logs

View the MCP log file:

```powershell
# Real-time log viewing
Get-Content -Path "mcp.log" -Wait

# Or tail last 50 lines
Get-Content -Path "mcp.log" | Select-Object -Last 50

# Search for errors
Select-String -Path "mcp.log" -Pattern "ERROR|WARN"
```

### Performance Testing

Monitor resource usage during tests:

```powershell
# Open Task Manager and check:
# - Memory usage (should be <300 MB)
# - CPU usage (should be <10% at idle)

# Or use PowerShell:
Get-Process node | Select-Object ProcessName, PrivateMemorySize, CPU | Format-Table -AutoSize
```

---

## Next Steps

After successful testing:

1. **All tests passed?** → Proceed to [INTEGRATION.md](INTEGRATION.md)
2. **Some failures?** → Review [Debugging Guide](#debugging-guide) and retry
3. **Need detailed logs?** → Enable verbose logging (see above)
4. **Ready for Copilot?** → Follow INTEGRATION.md for Copilot setup

---

## Support & Resources

- **Prisma Documentation:** https://www.prisma.io/docs/
- **MCP Protocol:** https://modelcontextprotocol.io/
- **Microsoft Graph API:** https://learn.microsoft.com/en-us/graph/
- **Node.js Debugging:** https://nodejs.org/en/docs/guides/debugging-getting-started/
