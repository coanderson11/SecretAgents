# How Secret Agents Use Email-Task-MCP
## Direct Integration for Sellers (Plain Language + Technical Guide)

---

## The Big Picture: What Secret Agents Actually Do

**Today (Manual, 45+ min per customer inquiry):**
```
Customer emails inquiry
    ↓ (Seller reads manually)
Seller searches for relevant agent info
    ↓ (Manual search, 10-15 min)
Seller drafts response
    ↓ (Hand-written, 15-20 min)
Seller logs activity manually
    ↓ (CRM/Excel, 5-10 min)
Follow-up reminder set manually
    ↓ (Calendar, 5 min)
```

**With Email-Task-MCP (Automated, 5-10 min per inquiry):**
```
Customer emails inquiry
    ↓ (Email-Task-MCP reads + extracts)
AI identifies pain points, timeline, buying signals
    ↓ (Claude understands context)
Copilot agent recommends relevant agents/connectors
    ↓ (Instant, from database)
Draft response + talking points generated
    ↓ (Claude + context)
Follow-up task auto-created
    ↓ (Reminder + tracking)
Seller reviews & sends (1-2 min)
```

**Time saved:** 35-40 min per inquiry = 7-8 hours/week for active seller

---

## Plain Language: What Is Email-Task-MCP?

### **Think of it as a Toolkit**

Email-Task-MCP is **NOT a standalone app you install**. It's a **toolbox that powers Copilot agents**.

Think of it like this:

```
Copilot Agent (the assistant) needs to help you with email.

Without Email-Task-MCP:
  Copilot Agent: "I can't read your email. Sorry."

With Email-Task-MCP:
  Email-Task-MCP: "Here are the tools you can use:"
    - ReadEmail (get email content)
    - ExtractTasks (find action items)
    - CreateTask (make a to-do)
    - SearchKnowledge (find agent info)
    - DraftResponse (write reply)
  Copilot Agent: "Great! Now I can help you."
```

### **How It Works (Simple Version)**

```
┌──────────────────┐
│ Your Email       │
│ (in Outlook)     │
└────────┬─────────┘
         │
         │ MCP Protocol (secure connection)
         ▼
┌──────────────────────────────────────────────┐
│ Email-Task-MCP Server                        │
│ (Tools that read/process email)              │
│                                              │
│ Tool 1: Read Email (extract content)         │
│ Tool 2: Extract Tasks (find action items)    │
│ Tool 3: Get Agent Info (search knowledge)    │
│ Tool 4: Create Task (add to your to-do)      │
│ Tool 5: Draft Response (write reply)         │
│ Tool 6: Log Activity (track in database)     │
└────────┬─────────────────────────────────────┘
         │
         │ MCP Protocol (asks tools)
         ▼
┌──────────────────────────────────────────────┐
│ Copilot Agent                                │
│ (Claude running with Secret Agent prompt)    │
│                                              │
│ "Customer needs NERC compliance help.        │
│  I'll recommend the NERC Agent + suggest     │
│  a pitch email."                             │
└──────────────────────────────────────────────┘
         │
         │ Shows results
         ▼
    You (Seller)
    Review + click send
```

---

## Do We Plug Into Claude Code?

### **Short Answer: No, We Don't Modify Claude**

Here's what actually happens:

```
┌────────────────────────────────────────────┐
│ You (Secret Agent Seller)                  │
│ Using: Copilot Chat (Microsoft 365)        │
└────────────────────────────────────────────┘
         │
         │ "Help me respond to this customer"
         ▼
┌────────────────────────────────────────────┐
│ Copilot Chat                               │
│ (Claude AI running in Microsoft cloud)     │
│                                            │
│ "I can help. Let me check my tools..."    │
└────────────────────────────────────────────┘
         │
         │ "Can you read this email for me?"
         ▼
┌────────────────────────────────────────────┐
│ Email-Task-MCP (running on YOUR machine)   │
│                                            │
│ Reads email from Outlook                  │
│ Extracts customer info                    │
│ Searches knowledge base for agents        │
│ Returns results to Copilot                │
└────────────────────────────────────────────┘
         │
         │ Returns: customer pain, timeline,
         │ relevant agents, draft talking points
         ▼
┌────────────────────────────────────────────┐
│ Copilot Chat                               │
│                                            │
│ "Here's what I found:                     │
│  • Customer needs: NERC audit prep        │
│  • Timeline: 6 weeks                      │
│  • Recommended: NERC Compliance Agent     │
│  • Draft: 'Here's how we can help...'    │
└────────────────────────────────────────────┘
         │
         │ Shows to you
         ▼
    You review & send
```

**Key point:** We're NOT modifying Claude. We're **providing tools that Claude already knows how to use** via the MCP protocol.

---

## What's Needed: The Technical Stack

### **What Each Secret Agent Seller Needs**

| Component | What It Is | Where It Runs | Who Sets It Up |
|-----------|-----------|---------------|----------------|
| **Email-Task-MCP Server** | The toolkit (tool definitions + database) | Their local machine | IT / Admin (once) |
| **MCP Configuration** | Tells Copilot where the tools are | Their M365 Copilot settings | IT / Admin (once) |
| **Copilot Agent (with Secret Agent prompt)** | The instructions for how to use tools | Microsoft Cloud | We create (once) |
| **Their Outlook access** | Email they want to process | Their account | Already have |
| **Copilot Chat** | Where they interact | Microsoft 365 app | Already have |

**Setup complexity:** Low (mostly just config files, no code changes)

---

## How to Make It Happen: Step-by-Step

### **Step 1: Prepare Email-Task-MCP (One-Time, 2 Hours)**

We take the existing email-task-mcp and prepare it for multi-user deployment:

```powershell
# What we do:
# 1. Add "Agent Info Lookup" tool (query knowledge base of agents/connectors)
# 2. Add "Draft Response" tool (use Claude to write reply)
# 3. Add "Secret Agent Prompt" instructions
# 4. Create deployment package

# No changes needed to core email reading/task extraction
# Just ADD new tools to existing toolset
```

**What changes:**
- ✅ Add 2-3 new tool files (agent_lookup.ts, draft_response.ts)
- ✅ Create Secret Agent prompt file (tells Claude what to do)
- ✅ Build & package for distribution

**Existing code stays intact.**

---

### **Step 2: Distribute & Configure (Per Seller, 30 Minutes)**

**Each Secret Agent Seller does this (IT can automate):**

```
1. Download email-task-mcp package
   (from Teams, SharePoint, or company repo)

2. Run setup script (we provide)
   PowerShell: .\setup-for-secret-agent.ps1
   
   This:
   - Copies files to C:\Users\[username]\SecretAgents\email-task-mcp
   - Creates database (SQLite, local, encrypted)
   - Generates OAuth tokens for their Outlook
   - Configures MCP settings

3. Configure Copilot Chat
   (Add MCP Server reference to M365 Copilot settings)
   
   File: C:\Users\[username]\AppData\Microsoft\Copilot\mcp_config.json
   
   Content (already prepared, we provide):
   {
     "mcpServers": {
       "email-task-mcp": {
         "command": "node",
         "args": ["C:/Users/[username]/SecretAgents/email-task-mcp/dist/mcp-server.js"],
         "env": {
           "OUTLOOK_CLIENT_ID": "[their token]",
           "DATABASE_URL": "file:C:/Users/[username]/.email-task-mcp/dev.db"
         }
       }
     }
   }

4. Restart Copilot Chat
   (Click "Refresh Tools")

5. Done. Tools are now available.
```

**What they don't have to do:**
- ❌ Write any code
- ❌ Understand Node.js or TypeScript
- ❌ Modify configuration files manually
- ❌ Run any complex commands

**We automate this via PowerShell setup script.**

---

### **Step 3: Create the Copilot Agent (One-Time, 4 Hours)**

We build a Copilot Agent in Studio that uses the email-task-mcp tools:

```
Agent Name: "Secret Agent Assistant"
Platform: Copilot Studio (M365)
Access: All Secret Agents (via link/pinning)

Instructions (simplified):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are the Secret Agent Assistant. Your job is to help 
sellers pitch Copilot agents and connectors to customers.

When a seller says:
  "Help me respond to this customer email"

You should:
1. Read the email (using ReadEmail tool)
2. Extract customer needs (using ExtractTasks tool)
3. Look up relevant agents (using SearchAgentKnowledge tool)
4. Draft a response (using DraftResponse tool)
5. Show the seller:
   - What the customer needs
   - Which agents/connectors fit
   - A draft email they can send
   - Next steps (follow-up date, questions to ask)

Key rules:
- Always let seller review before sending
- Be specific about agent capabilities
- Suggest realistic timelines
- Track all interactions in database
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tools available:
✓ ReadEmail (built into email-task-mcp)
✓ ExtractTasks (built into email-task-mcp)
✓ SearchAgentKnowledge (NEW - we add this)
✓ DraftResponse (NEW - we add this)
✓ CreateTask (built into email-task-mcp)
✓ LogActivity (built into email-task-mcp)
```

**This agent is created once and pinned for all sellers to use.**

---

## Real-World Secret Agent Workflow

### **Scenario: Seller Gets Customer Email**

**Customer email:**
```
From: John@PowerUtility.com
Subject: Need help with NERC compliance

Hi Sarah,

We're working on our 2026 NERC audit and need help 
getting our systems ready. Our team has 50 people 
who need training on new compliance frameworks. 
Timeline is 8 weeks.

Can you point me in the right direction?

Thanks,
John
```

---

### **What Seller Does (With Email-Task-MCP):**

**Step 1: Opens Copilot Chat, Pins "Secret Agent Assistant"**
```
Seller: "I got a new customer inquiry. Can you help me respond?"
```

**Step 2: Shares Email Context**
```
Seller: "Customer needs NERC compliance help + training for 50 people,
        8-week timeline. What should I pitch?"
```

**Step 3: Agent Reads & Analyzes (Automatically)**
```
Secret Agent Assistant:
┌─────────────────────────────────────────────────┐
│ Reading your email... (2 sec)                   │
│                                                 │
│ Customer Profile:                              │
│ ├─ Company: PowerUtility                       │
│ ├─ Contact: John @ PowerUtility.com            │
│ ├─ Need: NERC compliance + training            │
│ ├─ Team size: 50 people                        │
│ ├─ Timeline: 8 weeks                           │
│ └─ Urgency: Medium-High (audit-driven)         │
│                                                 │
│ Recommended Agents:                            │
│ ┌─ NERC Compliance Agent (Primary)             │
│ │  ├─ What it does: Audit prep, standards     │
│ │  │  tracking, enforcement alerts            │
│ │  ├─ Best for: 20-100 users                  │
│ │  ├─ Training time: 2-4 hours for team      │
│ │  └─ Typical ROI: 30% audit time savings    │
│ │                                             │
│ ├─ Training Copilot Agent (Secondary)        │
│ │  ├─ What it does: Personalized NERC        │
│ │  │  training modules                       │
│ │  ├─ Scales to: 50 people (fits your need) │
│ │  └─ Timeline: Can launch in 4 weeks       │
│ │                                             │
│ └─ Grid Operations Copilot (Future)          │
│    └─ Wait until after NERC audit done      │
│                                             │
│ Draft Response:                             │
└─────────────────────────────────────────────┘

Hi John,

Great timing! We have two solutions that fit 
your timeline perfectly:

1. NERC Compliance Agent - helps your 50-person 
   team prep for audit in 8 weeks. Saves ~30% 
   time vs. manual preparation.

2. Training Copilot - personalized modules for 
   each team member. We can roll out in 4 weeks.

I'd love to set up a 30-min call this week to 
see your specific audit timeline and start 
mapping out the engagement.

Are you available Tue/Wed next week?

Best,
Sarah
```

**Step 4: Seller Reviews Draft**
```
Seller: "Perfect. I'll add one sentence about 
         our success with other utilities, 
         then send."

[Seller customizes slightly + sends in Outlook]
```

**Step 5: Follow-up Task Created Automatically**
```
Task added to Seller's To-Do:
├─ Title: Follow up with John@PowerUtility 
│         re: NERC Agent + Training Copilot
├─ Due: 3 days (if no response)
├─ Linked to: Email thread + Contact record
└─ Context: Last message = proposal email

Follow-up reminder sent to seller in 3 days
```

**Total time for seller: 3-5 minutes**
**Without tool: 45+ minutes**
**Time saved: 40+ minutes to pursue other deals**

---

## What's Actually Built (Code-Level Detail)

### **Email-Task-MCP Existing Structure**

```
email-task-mcp/
├── src/
│   ├── tools/
│   │   ├── email-tools.ts          ✅ Already built (read email)
│   │   ├── task-tools.ts           ✅ Already built (create tasks)
│   │   ├── meeting-tools.ts        ✅ Already built (meeting context)
│   │   ├── draft-tools.ts          ✅ Already built (draft generation)
│   │   ├── context-tools.ts        ✅ Already built (context retrieval)
│   │   ├── base-tool.ts            ✅ Already built (base class)
│   │   │
│   │   ├── agent-lookup-tools.ts   🆕 NEW (search agent knowledge)
│   │   └── secret-agent-prompt.ts  🆕 NEW (Secret Agent instructions)
│   │
│   ├── services/
│   │   ├── outlook.service.ts      ✅ Already built
│   │   ├── claude.service.ts       ✅ Already built
│   │   ├── task.service.ts         ✅ Already built
│   │   ├── agent.service.ts        ✅ Already built
│   │   └── agent-knowledge.service.ts 🆕 NEW (lookup agents)
│   │
│   ├── db/
│   │   ├── schema.prisma           ✅ Already built
│   │   └── seed-agents.ts          🆕 NEW (populate agent knowledge)
│   │
│   └── mcp-server.ts               ✅ Already built (MCP protocol)
│
├── dist/
│   └── [compiled JavaScript]       ✅ Already built (npm run build)
│
├── SETUP.md                        ✅ Already built
├── TESTING.md                      ✅ Already built
├── INTEGRATION.md                  ✅ Already built
└── package.json                    ✅ Already built
```

### **What We ADD (Small Changes)**

**File 1: `src/services/agent-knowledge.service.ts`** (NEW, ~100 lines)
```typescript
// Service to search knowledge base of available agents/connectors

export class AgentKnowledgeService {
  
  // Hardcoded or database-backed list of agents
  private agents = [
    {
      name: "NERC Compliance Agent",
      description: "Audit prep, standards tracking, enforcement alerts",
      bestFor: "Energy/utility companies with NERC audit deadlines",
      minTeamSize: 20,
      maxTeamSize: 100,
      timeToValue: "2-4 weeks",
      typicalROI: "30% audit time savings",
      industry: "Energy"
    },
    {
      name: "Training Copilot Agent",
      description: "Personalized training modules for compliance teams",
      bestFor: "Teams needing quick upskilling",
      minTeamSize: 10,
      maxTeamSize: 500,
      timeToValue: "1-2 weeks",
      typicalROI: "40% reduction in training time",
      industry: "Multi-industry"
    },
    // ... more agents
  ];

  async findRelevantAgents(customerNeeds: string): Promise<Agent[]> {
    // Use Claude to match customer needs to agents
    // Return top 3 matches with details
  }

  async getAgentDetails(agentName: string): Promise<AgentDetails> {
    // Return full details for specific agent
  }
}
```

**File 2: `src/tools/agent-lookup-tools.ts`** (NEW, ~80 lines)
```typescript
// MCP tools that expose agent knowledge to Copilot

export const agentLookupTools = [
  {
    name: "search_agent_knowledge",
    description: "Search available Copilot agents and connectors by customer need",
    inputSchema: {
      type: "object",
      properties: {
        customerNeed: {
          type: "string",
          description: "What the customer needs help with (e.g., 'NERC audit', 'training')"
        },
        industry: {
          type: "string",
          description: "Industry vertical (e.g., 'Energy', 'Financial')"
        }
      }
    },
    execute: async (input) => {
      // Calls AgentKnowledgeService.findRelevantAgents()
      // Returns matching agents with details
    }
  },
  {
    name: "get_agent_details",
    description: "Get detailed info about a specific agent",
    inputSchema: {
      type: "object",
      properties: {
        agentName: {
          type: "string",
          description: "Name of the agent (e.g., 'NERC Compliance Agent')"
        }
      }
    },
    execute: async (input) => {
      // Returns full agent details
    }
  }
];
```

**File 3: `src/tools/secret-agent-prompt.ts`** (NEW, ~50 lines)
```typescript
// Instructions for how to use the toolkit

export const secretAgentPrompt = `
You are the Secret Agent Assistant, powered by Copilot extensibility.

Your goal: Help Copilot sellers pitch relevant agents and connectors 
to customers faster and more effectively.

When a seller shares a customer email or need:

1. READ the email (use ReadEmail tool)
2. EXTRACT customer needs (use ExtractTasks tool)
3. MATCH to agents (use SearchAgentKnowledge tool)
4. DRAFT a response (use DraftResponse tool, referencing agent details)
5. CREATE follow-up task (use CreateTask tool)
6. SUMMARIZE for seller (show all above in structured format)

Key behaviors:
- Always be specific about agent capabilities
- Provide realistic timelines and ROI
- Suggest next steps (meeting, trial, etc.)
- Track all interactions automatically

Available tools:
- ReadEmail: Extract email content and metadata
- ExtractTasks: Find action items and customer needs
- SearchAgentKnowledge: Find relevant agents for customer need
- DraftResponse: Write professional reply email
- CreateTask: Add to-do to seller's task list
- LogActivity: Record interaction in database
`;
```

### **What We DON'T Change**

```
✅ mcp-server.ts          - No changes (already handles MCP protocol correctly)
✅ email-tools.ts         - No changes (already reads email)
✅ task-tools.ts          - No changes (already creates tasks)
✅ draft-tools.ts         - No changes (already drafts)
✅ outlook.service.ts     - No changes (already handles OAuth)
✅ claude.service.ts      - No changes (already calls Claude)
✅ package.json           - No changes (all deps already present)
✅ SETUP.md               - Update only to mention agent knowledge seeding
✅ TESTING.md             - Add one section for testing agent lookup
✅ INTEGRATION.md         - No changes needed
```

**Total new code: ~230 lines of TypeScript**

---

## Deployment: How We Roll This Out

### **For IT/Admin (One-Time Setup, 2 Hours)**

```powershell
# Step 1: Download & prepare package
git clone https://github.com/your-org/email-task-mcp.git
cd email-task-mcp
npm install
npm run build

# Step 2: Create deployment package
New-Item -ItemType Directory -Path "\\share\Deployments\email-task-mcp-secret-agent"
Copy-Item -Path dist/* -Destination "\\share\Deployments\email-task-mcp-secret-agent\"
Copy-Item -Path setup-scripts/* -Destination "\\share\Deployments\email-task-mcp-secret-agent\"

# Step 3: Create Copilot Agent in Studio (one-time)
# [Manual: Create agent with secret-agent-prompt.ts instructions]

# Step 4: Distribute to sellers
# Option A: Email deployment link
# Option B: Auto-deploy via Intune
# Option C: Sellers self-serve from SharePoint
```

### **For Each Secret Agent Seller (One-Time Setup, 30 Minutes)**

```powershell
# Step 1: Run setup script (IT sends link)
\\share\Deployments\email-task-mcp-secret-agent\setup-for-secret-agent.ps1

# This script automatically:
# ✓ Creates C:\Users\[username]\SecretAgents\email-task-mcp
# ✓ Copies files
# ✓ Creates local database
# ✓ Generates OAuth tokens (interactive popup)
# ✓ Creates MCP config file
# ✓ Tests connection

# Step 2: Pin Copilot Agent (in Copilot Chat)
# Seller: "Pin the Secret Agent Assistant agent I shared"
# [Agent appears in Copilot Chat sidebar]

# Step 3: Start using
# Seller: "Help me respond to this customer email"
# [Agent uses email-task-mcp tools to help]
```

---

## Plain Language Explanation: How "Plugging In" Works

### **It's NOT Like Traditional Integration**

```
❌ WRONG (traditional API integration):
───────────────────────────────────────────────
You modify Claude's code to add email reading capability.
"Dear Claude, here's a new function: ReadEmail()"
Claude's code changes. Microsoft ships new Claude build.
Everyone gets new capability.
PROBLEM: Long timelines, risky, needs testing at scale.

✅ RIGHT (MCP Protocol):
───────────────────────────────────────────────
You run email-task-mcp on your own machine.
It says: "I have these tools available for you to use."
Claude (running in cloud) says: "Great! I'll call them when needed."
You get new capability immediately, no changes to Claude code.
BENEFIT: Fast, safe, each person controls their own tools.
```

### **It's Like Restaurant Delivery Apps**

```
Analogy:
──────
DoorDash doesn't modify restaurants' kitchen code.
Instead:
1. Restaurant says: "Here are our menu items & prices"
2. DoorDash says: "Great, I'll show customers & take orders"
3. When customer orders, DoorDash calls the restaurant
4. Restaurant prepares food & gives to driver
5. Customer gets food

MCP works the same way:
────────────────────────
1. Email-Task-MCP says: "Here are the tools I offer"
   - ReadEmail
   - ExtractTasks
   - SearchAgentKnowledge
   - DraftResponse
   etc.

2. Copilot says: "Great, I'll use those when sellers ask"

3. When seller says "Help me", Copilot calls email-task-mcp tools

4. Email-Task-MCP does the work (reads email, extracts info, etc.)
   and returns results

5. Copilot shows results to seller
```

---

## Complete Implementation Checklist

### **Phase 1: Code (2 Weeks, 30 Hours)**

- [ ] Create AgentKnowledgeService (~100 lines TypeScript)
- [ ] Create agent-lookup-tools.ts (~80 lines)
- [ ] Create secret-agent-prompt.ts (~50 lines)
- [ ] Add seed-agents.ts to populate knowledge base
- [ ] Test: npm run build (compiles to JavaScript)
- [ ] Test: npm test (verify tools work)
- [ ] Create setup-for-secret-agent.ps1 (deployment automation)
- [ ] Update SETUP.md with "For Secret Agents" section

**Output:** Deploy-ready package in dist/ folder

---

### **Phase 2: Agent Creation (1 Week, 8 Hours)**

- [ ] Create Copilot Agent in Studio
  - [ ] Name: "Secret Agent Assistant"
  - [ ] Base prompt: secret-agent-prompt.ts content
  - [ ] Attach email-task-mcp tools via MCP config
  - [ ] Test end-to-end with sample emails
- [ ] Create user documentation (plain language)
- [ ] Create troubleshooting guide
- [ ] Record 5-minute demo video

**Output:** Agent ready for all Secret Agents to use

---

### **Phase 3: Deployment (1 Week, 10 Hours)**

- [ ] Package code for distribution
  - [ ] Create \\share\Deployments\email-task-mcp-secret-agent
  - [ ] Include setup script + instructions
  - [ ] Include documentation
- [ ] Pilot with 2-3 sellers (validate setup script, gather feedback)
- [ ] Create IT deployment guide (for helpdesk)
- [ ] Create seller quick-start guide (1 page)

**Output:** Ready to roll out to all Secret Agents

---

### **Phase 4: Rollout (2 Weeks)**

- [ ] Email all Secret Agents with setup instructions
- [ ] Offer 1:1 setup help sessions (optional, for adoption)
- [ ] Collect feedback from early adopters
- [ ] Iterate on setup script if needed
- [ ] Track adoption metrics

**Output:** Email-Task-MCP available to all Secret Agents

---

## Expected Impact (After Rollout)

### **Per Secret Agent Seller**

| Metric | Without Tool | With Tool | Savings |
|--------|-------------|-----------|---------|
| Time per inquiry | 45 min | 5 min | 40 min (89%) |
| Inquiries handled/week | ~8 | ~50 | 42 more (~5x) |
| Response quality | Hand-crafted | AI-enhanced, agent-specific | Better |
| Follow-up tracking | Manual | Automated | 100% coverage |
| Deal velocity | Slow | 5x faster | More deals closed |

### **Across All Secret Agents** (assume 50 active sellers)

| Metric | Impact |
|--------|--------|
| **Weekly time saved** | 50 sellers × 40 min = 33 hours/week |
| **Monthly time saved** | ~132 hours/month (3.3 FTE) |
| **Additional deals** | 2,100 more inquiries handled/month |
| **Data captured** | 100% of interactions tracked (audit trail) |

**Bottom line:** You're adding 3+ FTE of seller productivity without hiring.

---

## No Code Changes to Claude Needed

**Critical clarification:**

We do NOT modify Claude or Copilot code. Here's why:

1. **Claude already understands MCP protocol** – It's designed to work with external tools
2. **Email-Task-MCP is a separate service** – Runs on each seller's machine
3. **We just add new tools to the toolbox** – A few hundred lines of TypeScript
4. **Copilot automatically discovers tools** – Via MCP configuration (JSON file)

```
Think of it like this:

Claude = Swiss Army Knife (versatile tool)
Email-Task-MCP = Additional blades/tools you attach

When you attach new blades, Claude doesn't change.
The knife just has more capabilities.
```

---

## What Happens When Seller Asks for Help

```
WORKFLOW:

Seller: "Help me respond to this customer inquiry"
           ↓
Copilot (running Claude): "I can help. Let me check what tools I have."
           ↓
[Copilot looks at MCP config file on seller's machine]
MCP config says: "email-task-mcp is available at [path]"
           ↓
Copilot: "Great! email-task-mcp tools are available.
         Let me start with ReadEmail..."
           ↓
[Copilot calls: ReadEmail("John@PowerUtility.com" email)]
           ↓
Email-Task-MCP (on seller's machine) responds:
"From: John@PowerUtility.com
 Subject: Need NERC compliance help
 Content: 50 people, 8-week timeline..."
           ↓
[Copilot processes response, decides next step]
Copilot: "I need to find relevant agents..."
           ↓
[Copilot calls: SearchAgentKnowledge("NERC compliance")]
           ↓
Email-Task-MCP responds:
"Found: NERC Compliance Agent, Training Copilot Agent"
           ↓
[Copilot compiles response]
Copilot: "Here's what I recommend:
         • NERC Compliance Agent
         • Training Copilot Agent
         • Draft email for your review"
           ↓
Seller reviews & sends (or edits first)
```

**No Claude code changes.** Just using existing MCP protocol.

---

## Summary: What You're Actually Deploying

### **To Each Secret Agent Seller:**

```
1. Email-Task-MCP Server
   (small executable + database, runs on their machine)

2. MCP Configuration File
   (tells Copilot where email-task-mcp is)

3. Copilot Agent Access
   (pre-built agent pinned in their Copilot Chat)

4. Documentation
   (how to use)
```

### **No Changes Needed To:**
```
✗ Claude
✗ Copilot platform
✗ Microsoft infrastructure
✗ Seller's other M365 tools
```

### **Benefits:**
```
✓ 89% time savings per inquiry
✓ 5x more inquiries handled
✓ 100% audit trail
✓ Instant agent recommendations
✓ AI-powered draft responses
✓ Automated follow-ups
```

---

## Your Next Steps

1. **Review this plan** – Does the technical approach make sense?
2. **Confirm scope** – Which features are Phase 1 vs. nice-to-have?
   - Must-have: Read email, extract needs, recommend agents, draft response, create task
   - Nice-to-have: Meeting scheduling, CRM integration, analytics
3. **Identify pilot sellers** – Want to pilot with 2-3 sellers first?
4. **Schedule kickoff** – Get engineering + Jane Koh on same page

**Questions for you:**

1. **Does the "plug into email-task-mcp, not Claude" model make sense?**
2. **Which seller pain points are most important to solve first?**
3. **Should we pilot with a specific cohort of Secret Agents, or roll out to all 50?**
4. **Is the 4-week implementation timeline realistic for your needs?**

