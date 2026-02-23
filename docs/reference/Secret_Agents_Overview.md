# Secret Agents Project Overview
**What's in the Directory & How Email-Task-MCP Works**

---

## 📁 Directory Structure

```
C:\Users\coander\secretagents\
├── .git/                          # Git repository
├── email-task-mcp/                # THE MAIN PROJECT (your focus)
│   ├── src/
│   │   ├── mcp-server.ts          # Main MCP server entry point
│   │   ├── mcp/
│   │   │   ├── tools/             # All tool implementations
│   │   │   │   ├── email-tools.ts
│   │   │   │   ├── task-tools.ts
│   │   │   │   ├── meeting-tools.ts
│   │   │   │   ├── draft-tools.ts
│   │   │   │   ├── agent-tools.ts
│   │   │   │   └── context-tools.ts
│   │   │   └── user-context.ts
│   │   ├── services/              # Business logic layer
│   │   │   ├── outlook.service.ts (Outlook API integration)
│   │   │   ├── claude.service.ts  (Claude AI for task extraction)
│   │   │   ├── meeting.service.ts (Meeting extraction)
│   │   │   ├── draft.service.ts   (Email draft creation)
│   │   │   ├── task.service.ts    (Task management)
│   │   │   ├── agent.service.ts   (AI agent orchestration)
│   │   │   └── context.service.ts (Context management)
│   │   ├── config/
│   │   │   ├── database.ts        (Prisma setup)
│   │   │   └── mcp-config.ts
│   │   └── utils/
│   │       └── logger.ts
│   ├── prisma/
│   │   └── schema.prisma          # Database schema (11 models)
│   ├── dist/                      # Compiled JavaScript (generated)
│   ├── node_modules/              # Dependencies
│   ├── data/                      # Sample data / pilot artifacts
│   ├── dashboard/                 # Web UI (optional)
│   ├── SETUP.md                   # Build & setup guide ✅ (we created)
│   ├── TESTING.md                 # Test procedures ✅ (we created)
│   ├── INTEGRATION.md             # Copilot integration ✅ (we created)
│   ├── MCP_CONFIG_EXAMPLE.json    # Example Copilot config
│   ├── package.json               # Dependencies
│   ├── tsconfig.json              # TypeScript config
│   └── .env.example               # Environment template
├── check-setup.ps1                # PowerShell setup checker
├── configure-claude.ps1           # Claude configuration script
└── INSTALL-ALL-HELPERS.ps1        # Installation helper

```

---

## 🎯 What is Email-Task-MCP?

**Email-Task-MCP** is an **MCP (Model Context Protocol) server** that acts as a bridge between **M365 Copilot** and **your Outlook email** + **task management system**.

### Core Purpose
Enable AI agents (Claude, Copilot) to:
- ✅ Read and search your emails
- ✅ Extract actionable tasks from emails
- ✅ Create draft responses automatically
- ✅ Extract meeting information
- ✅ Manage your tasks and to-dos
- ✅ Prepare meeting agendas

### Architecture

```
┌─────────────────┐
│ M365 Copilot    │
└────────┬────────┘
         │ (MCP Protocol)
         ▼
┌─────────────────────────────────┐
│  email-task-mcp Server          │ ◄─── THIS IS THE PROJECT
│  (MCP Protocol Implementation)   │
└────────┬────────────────────────┘
         │
         ├─── Email Tools ──────┐
         │                      ▼
         │              ┌──────────────────┐
         │              │ Outlook Service  │
         │              │ (Microsoft Graph)│
         │              └──────────────────┘
         │
         ├─── Task Tools ───────┐
         │                      ▼
         │              ┌──────────────────┐
         │              │ Task Service     │
         │              │ (Claude AI)      │
         │              └──────────────────┘
         │
         └─── Meeting Tools ────┐
                                ▼
                       ┌──────────────────┐
                       │ Meeting Service  │
                       │ (Data extraction)│
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  SQLite Database │
                       │ (via Prisma ORM) │
                       └──────────────────┘
```

---

## 🛠️ What Tools Does It Provide?

### Email Tools
| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| **FetchEmailsTool** | Get recent emails | `maxResults`, `unreadOnly` | List of emails with preview |
| **GetEmailDetailsTool** | Get full email content | `emailId` | Full email body, metadata |
| **SearchEmailsTool** | Search emails by keyword | `query`, `limit` | Matching emails |

**Example Usage:**
```
User: "Show me my unread emails"
→ Copilot calls FetchEmailsTool(maxResults=10, unreadOnly=true)
→ Returns: [Email1, Email2, Email3...]
→ Copilot displays results
```

### Task Tools
| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| **ExtractTasksTool** | AI extracts actionable tasks from email | `emailId` | Structured tasks (title, priority, dueDate) |
| **ListTasksTool** | Get tasks with filters | `status`, `priority`, `category` | Filtered task list |
| **CreateTaskTool** | Create a new task | `title`, `description`, `priority` | Confirmation + task ID |
| **UpdateTaskTool** | Update task status/details | `taskId`, `updates` | Updated task |

**Example Usage:**
```
User: "Extract tasks from that email about Q1 budget"
→ Copilot calls ExtractTasksTool(emailId=email-123)
→ Claude AI parses email, finds actionable items:
   - Task 1: "Review budget proposal" (HIGH, due Fri)
   - Task 2: "Get manager approval" (MEDIUM, due Mon)
→ Copilot displays + offers to create tasks
```

### Meeting Tools
| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| **ExtractMeetingInfoTool** | Extract meeting details from email | `emailId` | Structured meeting info (title, time, location, attendees) |
| **ListMeetingsTool** | Get upcoming meetings | `filter`, `limit` | Meeting list |
| **PrepareMeetingAgendaTool** | Generate agenda from emails + context | `meetingId`, `emailIds` | Auto-generated agenda |

**Example Usage:**
```
User: "Prepare an agenda for my 2 PM meeting with the board"
→ Copilot calls PrepareMeetingAgendaTool(meetingId=meeting-456)
→ System gathers related emails + context
→ Claude AI generates structured agenda
→ Copilot displays agenda + offers to export to document
```

### Draft Tools
| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| **GenerateDraftTool** | Generate email draft reply | `emailId`, `tone` | Draft response |
| **CreateDraftTool** | Save draft for later | `subject`, `body`, `to` | Saved draft |
| **ListDraftsTool** | Get all saved drafts | `status`, `limit` | Draft list |

**Example Usage:**
```
User: "Draft a reply to John's email saying we'll meet next Tuesday"
→ Copilot calls GenerateDraftTool(emailId=email-789, tone='professional')
→ System reads John's original email
→ Claude AI generates contextual response
→ Copilot shows draft
→ User approves & sends
```

### Context Tools
| Tool | Purpose | Input | Output |
|------|---------|-------|--------|
| **GetContextTool** | Summarize recent emails/meetings/tasks | `timeframe` | Context snapshot |
| **SearchContextTool** | Search across all data | `query` | Matching results |

---

## 💾 Database Schema (SQLite)

The email-task-mcp stores everything in a **SQLite database** with 11 models:

| Model | Purpose |
|-------|---------|
| **Session** | User session container (ties everything together) |
| **Email** | Email messages (from Outlook) |
| **Task** | Tasks extracted from emails or created manually |
| **Draft** | Email drafts (saved but not sent) |
| **Meeting** | Calendar meetings extracted from emails |
| **MeetingPrep** | Meeting preparation documents |
| **AgentActivity** | Log of AI agent actions & decisions |
| **UploadedFile** | Uploaded documents for context |
| **Insight** | Extracted insights from emails/files |
| **RecommendedCampaign** | Recommended follow-up campaigns |
| **UserPoints** | Gamification points (optional) |

---

## 🚀 How to Use Email-Task-MCP

### **Use Case 1: Enable Copilot to Read Your Email**

**Setup:**
1. Run `npm install` + `npm run build` (see SETUP.md)
2. Configure `.env` with Microsoft OAuth credentials
3. Register MCP server in Copilot config (INTEGRATION.md)

**Usage:**
```
copilot chat> "What emails did I get about the Q2 planning meeting?"
→ Copilot queries FetchEmailsTool + SearchEmailsTool
→ Returns: "You have 3 emails about Q2 planning from John, Sarah, and the team"
```

### **Use Case 2: Automatic Task Extraction**

**Setup:**
1. Same as above (MCP server running)
2. Claude service configured (optional, for AI extraction)

**Usage:**
```
copilot chat> "Extract actionable tasks from my latest emails"
→ Copilot calls ExtractTasksTool on recent emails
→ Returns:
   ✓ Review quarterly budget (HIGH)
   ✓ Schedule follow-up with finance team (MEDIUM)
   ✓ Update project timeline (MEDIUM)
```

### **Use Case 3: AI-Powered Draft Responses**

**Setup:**
1. MCP server running
2. Draft service initialized

**Usage:**
```
copilot chat> "Help me draft a response to John's email about the roadmap"
→ Copilot retrieves John's email
→ Claude generates contextual draft
→ Shows you draft for approval
→ You can approve/modify before sending
```

### **Use Case 4: Meeting Prep Automation**

**Setup:**
1. MCP server running
2. Meeting service initialized

**Usage:**
```
copilot chat> "Prepare an agenda for my board meeting next Tuesday"
→ Copilot calls PrepareMeetingAgendaTool
→ Gathers related emails + recent context
→ Generates structured agenda:
   - Opening remarks (5 min)
   - Q1 performance review (15 min)
   - Budget discussion (20 min)
   - Q&A (10 min)
→ Offers to export to document
```

---

## 🔧 How Email-Task-MCP Integrates with Copilot

### **Step 1: Register the MCP Server**

Copilot needs to know where to find your MCP server.

**Config file:** `MCP_CONFIG_EXAMPLE.json` (or `hosts.json` on Windows)

```json
{
  "mcpServers": {
    "email-task-agent": {
      "command": "node",
      "args": ["C:/path/to/dist/mcp-server.js"],
      "env": {
        "DATABASE_URL": "file:C:/path/to/dev.db",
        "MICROSOFT_CLIENT_ID": "your-id",
        "MICROSOFT_CLIENT_SECRET": "your-secret",
        "ANTHROPIC_API_KEY": "your-key"
      }
    }
  }
}
```

### **Step 2: Start the MCP Server**

```bash
npm start:mcp
# Server listens on stdio (pipes to Copilot)
```

### **Step 3: Use in Copilot**

```bash
copilot chat> "Show me my recent emails"
# Copilot calls email-task-agent tools automatically
```

---

## 📊 Real-World Workflow Example

**Scenario:** You're busy and need to quickly understand what's on your plate.

**Without MCP:**
```
1. Open Outlook
2. Scan 20+ emails manually
3. Open task app
4. Manually extract items from emails
5. Schedule meetings by hand
⏱️ 30+ minutes
```

**With Email-Task-MCP + Copilot:**
```
1. copilot chat> "Give me a status update on my workload"
2. Copilot calls:
   - FetchEmailsTool (gets recent emails)
   - ListTasksTool (gets current tasks)
   - ListMeetingsTool (gets scheduled meetings)
3. Copilot summarizes:
   "You have 12 new emails (3 urgent), 8 tasks (5 due this week), 
    and 5 meetings scheduled. Top priority: Q2 budget review from John."
4. copilot chat> "Create tasks from the budget email"
5. Copilot calls ExtractTasksTool
6. Displays extracted tasks; you approve with 1 click
⏱️ 2-3 minutes
```

---

## 🎓 Example: Building on Top of Email-Task-MCP

The architecture is extensible. You can add new tools by:

1. **Create a new tool** in `src/mcp/tools/`:
```typescript
export class MyCustomTool extends BaseTool {
  name = 'my_custom_tool';
  description = 'Does something cool';
  inputSchema = { /* schema */ };
  
  async execute(params: any) {
    // Your logic here
  }
}
```

2. **Register it** in `src/mcp-server.ts`
3. **Use it** in Copilot immediately

**Example extensions:**
- 🤖 **Meeting transcription tool** – Summarize meeting recordings
- 📈 **Analytics tool** – Analyze email patterns (response time, volume)
- 🔗 **CRM integration** – Link emails to Salesforce/Dynamics contacts
- 🎯 **Priority tool** – AI-rank emails by importance
- 📧 **Spam filter** – Use ML to categorize emails
- ✍️ **Grammar checker** – Check drafts before sending

---

## 📚 Documentation We Created

We created **3 comprehensive guides** for the email-task-mcp:

| Guide | Purpose | When to Use |
|-------|---------|-----------|
| **SETUP.md** | Prerequisites, build, environment config | First time setup |
| **TESTING.md** | Validation & testing procedures | After building, verify it works |
| **INTEGRATION.md** | Configure Copilot, connect, troubleshoot | Connect to M365 Copilot |

---

## 🚦 Quick Start (5 Minutes)

**Goal:** Get email-task-mcp running and talking to Copilot

```powershell
# 1. Setup
cd C:\Users\coander\secretagents\email-task-mcp
Copy-Item .env.example -Destination .env
# Edit .env with your Microsoft OAuth credentials

# 2. Install & Build
npm install
npm run build

# 3. Test it
npm start:mcp
# Should see: "[INFO] MCP Server initialized"
# Press Ctrl+C to stop

# 4. Configure Copilot (see INTEGRATION.md)
# Update hosts.json with path to dist/mcp-server.js

# 5. Use it
copilot chat> "Show me my recent emails"
```

---

## 🔐 Security Considerations

- **OAuth credentials** – Stored in `.env` (never commit to git)
- **Database encryption** – SQLite data stored locally
- **Email data** – Remains on-device; not sent to external services
- **DLP compliance** – Integrate with Microsoft DLP policies

---

## 🎯 The Secret Agents Vision

**"Secret Agents"** is about **AI agents that work invisibly in your workflow:**

- 👁️ **See** your emails, tasks, meetings (via MCP)
- 🧠 **Understand** what's important (Claude AI extraction)
- ⚡ **Act** proactively (auto-generate drafts, extract tasks, prep meetings)
- 🔐 **Stay private** (everything on-device, secure)

**Email-Task-MCP is the foundation** that enables this. It's the bridge between your data (Outlook) and your AI assistant (Copilot).

---

## 📞 Next Steps

**What would you like to do?**

- [ ] **Run the setup** – Follow SETUP.md to build it
- [ ] **Test it locally** – Follow TESTING.md validation
- [ ] **Connect to Copilot** – Follow INTEGRATION.md
- [ ] **Build a custom tool** – Extend with your own functionality
- [ ] **Deploy to production** – Get it running for real work
- [ ] **Something else?** – Ask me!

---

**Owner:** Cotishea Anderson  
**Last Updated:** 2026-02-23  
**Status:** Ready to use
