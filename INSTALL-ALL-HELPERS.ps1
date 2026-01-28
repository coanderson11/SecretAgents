# ========================================
# ALL-IN-ONE HELPER SCRIPTS INSTALLER
# ========================================
# This script creates all helper scripts and documentation for the MCP server setup
# Save as: C:\Users\coander\OneDrive - Microsoft\Desktop\Tinkering\INSTALL-ALL-HELPERS.ps1
# Run: .\INSTALL-ALL-HELPERS.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MCP Helper Scripts Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will create all helper scripts in the current directory." -ForegroundColor Yellow
Write-Host ""

$scripts = @(
    "QUICKSTART.md",
    "configure-claude.ps1",
    "test-connection.ps1",
    "rebuild.ps1",
    "check-setup.ps1",
    "view-logs.ps1",
    "QUICK-INSTALL.ps1"
)

Write-Host "Files to be created:" -ForegroundColor Cyan
foreach ($script in $scripts) {
    Write-Host "  - $script" -ForegroundColor White
}
Write-Host ""

$confirm = Read-Host "Continue? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Installation cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Creating files..." -ForegroundColor Green
Write-Host ""

# ========================================
# 1. QUICKSTART.md
# ========================================
@'
# Email Task Agent MCP Server - Quick Start Guide

Get up and running in 10 minutes! This guide provides the fastest path to getting your MCP server working with Claude Desktop.

## Prerequisites Checklist

Before starting, ensure you have:

- ✅ **Node.js v18+** - Run `node --version` to check
- ✅ **Email Task App Backend** - Already installed at `c:\Users\coander\email-task-app\backend`
- ✅ **Authenticated User** - You've completed OAuth via the Express server
- ✅ **Claude Desktop** - Installed and running
- ✅ **Anthropic API Key** - Get from https://console.anthropic.com/

## 🚀 Quick Setup (5 Steps)

### Step 1: Run Setup Scripts (2 minutes)

```powershell
cd "C:\Users\coander\OneDrive - Microsoft\Desktop\Tinkering"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\SETUP-ALL.ps1
