# Email-Task-MCP Setup & Build Guide

This guide walks you through setting up and building the email-task-mcp connector on Windows. The email-task-mcp is an MCP (Model Context Protocol) server that enables M365 Copilot to access and manage emails through Outlook integration.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Overview](#project-overview)
- [Step 1: Environment Setup](#step-1-environment-setup)
- [Step 2: Install Dependencies](#step-2-install-dependencies)
- [Step 3: Database Setup](#step-3-database-setup)
- [Step 4: Build the Project](#step-4-build-the-project)
- [Step 5: Verify the Build](#step-5-verify-the-build)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, ensure you have the following installed on your Windows machine:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
  - Includes npm (Node Package Manager)
  - Verify: Open PowerShell and run `node --version` and `npm --version`

- **Git** (optional, but recommended for version control)
  - [Download Git for Windows](https://git-scm.com/download/win)

### Required Microsoft Services
- **Microsoft Azure AD Account** with OAuth credentials
  - Client ID
  - Client Secret
  - (See [Configuration Reference](#configuration-reference) for setup details)

- **Outlook/Microsoft 365 Account** (for email integration testing)

### System Requirements
- **Disk Space:** ~500 MB (node_modules + compiled output)
- **RAM:** 2 GB minimum (4 GB recommended)
- **Network:** Internet connection required for OAuth and Microsoft Graph API

---

## Project Overview

**Project Name:** email-task-mcp-server  
**Version:** 1.0.0  
**Type:** MCP Server (TypeScript)  
**Primary Use:** Email task management with Outlook integration for M365 Copilot

### Key Components
| Component | Purpose |
|-----------|---------|
| **MCP Server** | Implements Model Context Protocol for Copilot integration |
| **Microsoft Graph Client** | Communicates with Outlook/Exchange |
| **Prisma ORM** | Manages SQLite database for sessions and data |
| **TypeScript** | Type-safe development language |
| **Anthropic SDK** | Claude integration (optional) |

### Available Tools (after build)
- **FetchEmailsTool** - Retrieve emails from mailbox
- **GetEmailDetailsTool** - Get details of a specific email
- **SearchEmailsTool** - Search emails by keyword or criteria

---

## Step 1: Environment Setup

### 1a. Clone or Download the Project
```powershell
# If using Git
git clone <repository-url> email-task-mcp
cd email-task-mcp

# OR manually download and extract the project folder
cd C:\path\to\email-task-mcp
```

### 1b. Create the .env File

Copy the `.env.example` file to create your own `.env` file:

```powershell
Copy-Item -Path ".env.example" -Destination ".env"
```

### 1c. Configure Environment Variables

Edit the `.env` file (open in Notepad or your preferred editor) and fill in your actual values:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Path to SQLite database file (use absolute Windows path with forward slashes)
DATABASE_URL="file:C:/Users/YourUsername/email-task-mcp/dev.db"

# ============================================
# MICROSOFT AZURE AD OAUTH
# ============================================
# Get these from Azure AD app registration
# See "Getting Microsoft OAuth Credentials" below
MICROSOFT_CLIENT_ID=your_actual_client_id_here
MICROSOFT_CLIENT_SECRET=your_actual_client_secret_here

# ============================================
# ANTHROPIC API (Optional, for Claude integration)
# ============================================
ANTHROPIC_API_KEY=sk-ant-your_actual_api_key_here

# ============================================
# BACKEND URL
# ============================================
# Local backend URL for re-authentication
BACKEND_URL=http://localhost:8025

# ============================================
# MCP LOGGING
# ============================================
# Absolute path to log file (forward slashes)
LOG_FILE=C:/Users/YourUsername/email-task-mcp/mcp.log

# ============================================
# SCHEDULER
# ============================================
# Set to false for on-demand mode (recommended for testing)
ENABLE_SCHEDULER=false
```

### Important Windows Path Notes
⚠️ **Use forward slashes (/) in DATABASE_URL and LOG_FILE paths, even on Windows.**

✅ Good:
```env
DATABASE_URL="file:C:/Users/YourUsername/email-task-mcp/dev.db"
LOG_FILE=C:/Users/YourUsername/email-task-mcp/mcp.log
```

❌ Avoid (backslashes in DATABASE_URL):
```env
DATABASE_URL="file:C:\Users\YourUsername\email-task-mcp\dev.db"
```

### Getting Microsoft OAuth Credentials

You'll need Azure AD app credentials to run the connector. Here's how to get them:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Fill in:
   - **Name:** email-task-mcp (or your choice)
   - **Supported account types:** Choose based on your organization
   - **Redirect URI:** `http://localhost:8025/auth/callback` (for local testing)
4. Click **Register**
5. In the app overview, copy:
   - **Application (client) ID** → paste into `MICROSOFT_CLIENT_ID`
6. Go to **Certificates & secrets** → **New client secret**
7. Create a secret and copy its value → paste into `MICROSOFT_CLIENT_SECRET`
8. Go to **API permissions** → **Add a permission**
   - Select **Microsoft Graph**
   - Add permissions: `Mail.Read`, `Mail.Send` (depending on your use case)
9. Click **Grant admin consent**

---

## Step 2: Install Dependencies

Run npm to install all project dependencies:

```powershell
# Navigate to project directory if not already there
cd C:\path\to\email-task-mcp

# Install dependencies
npm install
```

This command will:
- Download and install all packages listed in `package.json`
- Install dev dependencies (TypeScript, tsx, etc.)
- Create a `node_modules` folder (~300 MB)
- Generate a `package-lock.json` file (ensures reproducible installs)

**Expected duration:** 2–5 minutes depending on internet speed

**Verify success:** You should see "added X packages" and no errors.

---

## Step 3: Database Setup

The project uses Prisma ORM with SQLite for data storage.

### 3a. Run Prisma Migrations

```powershell
# Generate Prisma client and run migrations
npx prisma migrate deploy
```

This will:
- Create the SQLite database file (`dev.db`) at the path you specified in `DATABASE_URL`
- Create tables for: Sessions, Emails, Tasks, Drafts, Meetings, etc.
- Ensure schema is up-to-date

**Verify success:** You should see "Success" message and a `dev.db` file created.

### 3b. (Optional) Load Test Data

If you want to seed the database with sample emails for testing:

```powershell
# Run the test data script
node create-test-emails.mjs
```

**Expected output:**
```
✅ Session created: <uuid>
Created 3 test emails
```

This creates:
- One test session
- 3 sample emails with realistic content for testing the email tools

**Note:** This step is optional; you can test with real Outlook emails later.

---

## Step 4: Build the Project

Convert TypeScript to JavaScript and prepare the connector for running:

```powershell
# Compile TypeScript to JavaScript
npm run build
```

This command will:
- Compile all `.ts` files in `src/` to `.js` in `dist/`
- Generate sourcemaps for debugging
- Validate TypeScript types

**Expected output:** No errors, files compiled to `dist/` folder

**Expected duration:** 10–30 seconds

### 4a. Verify Build Output

Check that the build succeeded:

```powershell
# List compiled files
Get-ChildItem -Path "dist" -Recurse -Filter "*.js"
```

You should see:
- `dist/mcp-server.js` (main entry point)
- `dist/mcp/` (MCP tool definitions)
- `dist/services/` (service implementations)
- `dist/config/` (configuration modules)
- `dist/utils/` (utility functions)

---

## Step 5: Verify the Build

Test that the connector can start and is ready to use:

### 5a. Start the MCP Server (Test Mode)

```powershell
# Start the MCP server
npm start:mcp
```

**Expected output (first 2–3 seconds):**
```
[MCP Server] Initializing email-task-agent...
[MCP Server] Listening on stdio...
```

If you see these messages, the server is running. Press `Ctrl+C` to stop.

### 5b. (Optional) Development Mode with Watch

For development, use the watch mode to automatically rebuild on file changes:

```powershell
# Start in watch mode (recompiles on file changes)
npm run dev
```

Press `Ctrl+C` to stop.

---

## Configuration Reference

### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite database file location | `file:C:/Users/User/email-task-mcp/dev.db` |
| `MICROSOFT_CLIENT_ID` | Azure AD app client ID | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `MICROSOFT_CLIENT_SECRET` | Azure AD app secret | `abc123XYZ~_-abcDEF123456` |
| `ANTHROPIC_API_KEY` | Claude AI API key (optional) | `sk-ant-...` |
| `BACKEND_URL` | Local backend server URL | `http://localhost:8025` |
| `LOG_FILE` | Path to MCP log file | `C:/Users/User/email-task-mcp/mcp.log` |
| `ENABLE_SCHEDULER` | Enable background scheduling | `false` or `true` |

### Database Models

The SQLite database includes these main tables:

- **Session** - User session container (parent for all data)
- **Email** - Email messages from Outlook
- **Task** - Tasks created from or related to emails
- **Draft** - Email drafts
- **Meeting** - Calendar meetings
- **MeetingPrep** - Meeting preparation documents

---

## Development vs Production

### Development Mode
```powershell
npm run dev
```
- Runs TypeScript directly with `tsx`
- Auto-recompiles on file changes
- Better for local testing and debugging
- Use during development

### Production Mode
```powershell
npm run build
npm start:mcp
```
- Pre-compiled JavaScript (faster startup)
- Smaller memory footprint
- Use for Copilot integration and deployment

---

## Troubleshooting

### Build Errors

**Error: "tsc command not found"**
- Solution: Ensure TypeScript is installed: `npm install`
- Then try: `npm run build` again

**Error: "DATABASE_URL not found"**
- Ensure `.env` file exists in project root
- Verify `DATABASE_URL` is set in the `.env` file
- No spaces around the `=` sign

**Error: Prisma schema mismatch**
- Solution: Run migrations: `npx prisma migrate deploy`
- Or regenerate client: `npx prisma generate`

### Startup Errors

**Error: "Cannot find module '@modelcontextprotocol/sdk'"**
- Solution: Run `npm install` again
- Delete `node_modules` and try again: `rm -r node_modules`, then `npm install`

**Error: "Database file is locked"**
- Check if another instance is running
- Ensure `DATABASE_URL` path is correct and accessible
- Verify the database file isn't corrupted: try deleting `dev.db` and restarting (you'll lose test data)

**Error: "ENOENT: no such file or directory" for log file**
- Ensure the directory in `LOG_FILE` path exists
- Create it manually if needed: `mkdir C:\Users\YourUsername\email-task-mcp`

### Configuration Issues

**Error: "Invalid OAuth credentials"**
- Verify `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` in `.env`
- Ensure credentials come from Azure AD app registration (not Azure storage keys)
- Check that the app has required permissions: `Mail.Read`

**Error: "BACKEND_URL refused connection"**
- This is normal if you're not running a separate backend
- For testing MCP server standalone, this error can be ignored
- Backend URL is used for OAuth re-authentication flows

### Performance Issues

**Server starting slowly:**
- First start is slower (building Prisma client, initializing DB)
- Subsequent starts should be faster
- Check available disk space and RAM

**High memory usage:**
- Normal for Node.js (typically 100–200 MB)
- If exceeding 500 MB, check for memory leaks in logs
- Restart the server if needed

---

## Next Steps

After successful setup and build:

1. **Review** `TESTING.md` for validation and test procedures
2. **Review** `INTEGRATION.md` for connecting to M365 Copilot
3. **Check logs** in your `LOG_FILE` path for debugging
4. **Customize** database models in `prisma/schema.prisma` if needed

---

## Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Review the **TESTING.md** guide for validation steps
3. Check the **mcp.log** file for error details
4. Consult the [Prisma documentation](https://www.prisma.io/docs/) for ORM questions
5. See [MCP documentation](https://modelcontextprotocol.io/) for protocol questions
