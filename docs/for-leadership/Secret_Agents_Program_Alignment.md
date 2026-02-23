# How Email-Task-MCP Relates to Jane Koh's Secret Agent Program
**Strategic Alignment & Automation Opportunity**

---

## Jane Koh's Secret Agent Program (Summary)

**What it is:**
A GTM pilot where 5–10 "secret agent" sellers per industry socialize partner-built **Copilot agents and connectors** while providing structured feedback to product/GTM.

**Current state:**
- Manual processes: form intake, email attachments, SharePoint repo, Teams coordination
- No AI automation yet
- Focus on **learning**, not immediate scale

**Why it exists:**
- Sellers can't explain Copilot extensibility at "Level 300"
- Partner information is fragmented
- Need repeatable, structured enablement model

---

## How Email-Task-MCP Aligns

### **1. Email-Task-MCP Solves a Current Pain Point**

**Jane's stated problem:**
> "Partner intake form submission → separate email exchanges for BOMs and attachments"  
> "This is clunky and manual"

**Email-Task-MCP solution:**
- **Automate form receipt** → automatically process attachments
- **Extract metadata** from partner emails (BOM structure, key contacts)
- **Generate summaries** of intake submissions
- **Organize by industry** using task extraction

**Example workflow:**
```
1. Partner submits form via external form tool
2. Form receipt email arrives
3. Email-Task-MCP:
   - Extracts attachment metadata
   - Creates structured intake task
   - Tags by industry/solution type
   - Alerts Jane (or designated reviewer)
4. No manual forwarding or reorganization needed
```

---

### **2. Email-Task-MCP Enables Automation of "Manual" Processes**

**Current manual tasks in Secret Agent program:**

| Task | Current | With Email-Task-MCP |
|------|---------|-------------------|
| **Intake routing** | Jane manually reviews email, extracts info, puts in SharePoint | Auto-extract, tag, route |
| **BOM tracking** | Manual Excel sheet updates | Auto-create structured task for tracking |
| **Partner contact management** | Manual Outlook + email searching | Auto-extract contacts, link to agent records |
| **Kickoff communications** | Hand-drafted emails | AI-draft using context from intake |
| **Status summaries** | Manual check of emails + Teams | Auto-summarize activity per agent cohort |

---

### **3. Email-Task-MCP + Copilot Agents = The "Secret Agent AI" Loop**

Here's the strategic insight: **Email-Task-MCP + Copilot agents could automate the Secret Agent program ITSELF.**

**Scenario: An AI-Powered Secret Agent Program Manager**

```
┌─────────────────────────────────────────────┐
│ Partner sends agent/connector intake email  │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ Email-Task-MCP                              │
│ - Receives email                            │
│ - Extracts: BOM, contacts, elevator pitch  │
│ - Creates intake task                      │
│ - Links to industry category               │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ Copilot Secret Agent Program Manager        │
│ (AI Agent)                                  │
│ - Reviews extracted intake                 │
│ - Checks readiness (GA, compliance)        │
│ - Generates seller briefing                │
│ - Creates assignment tasks for cohorts     │
│ - Schedules partner kick-off calls         │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│ Jane's inbox (high-level summary only)      │
│ - "3 new partners added this week"          │
│ - "Cohort readiness: 8/10 agents GA"        │
│ - Escalations flagged                       │
└─────────────────────────────────────────────┘
```

---

## Strategic Fit: Why This Matters

### **For Jane Koh's Program:**

✅ **Reduce manual overhead** – Intake & tracking fully automated  
✅ **Scale to more cohorts** – Can handle 3+ industries simultaneously  
✅ **Accelerate learning loops** – Structured data → faster insights  
✅ **Higher data quality** – Consistent extraction vs. manual notes  

### **For the Copilot Extensibility Narrative:**

This is **meta-powerful**: 
- Secret Agent program is driving Copilot extensibility adoption in the field
- Email-Task-MCP + Copilot agents automate Secret Agent program itself
- **Proves Copilot extensibility value internally first**

> "We use our own Copilot agents to run the program that drives Copilot adoption."

### **For the Product Roadmap:**

Demonstrates:
- **Real use case** for Copilot agents in GTM/sales operations
- **Manual workflow → automated workflow** = ROI story
- **Foundation for replicable patterns** (can apply to other programs)

---

## Additional Information Needed

To fully flesh this out, we need:

### **From Jane / GTM:**
1. ✅ **Current intake form structure** – What fields exactly?
2. ✅ **Partner attachment types** – What formats? (PDF, PPT, Excel?)
3. ✅ **Industry taxonomy** – How are agents/connectors categorized?
4. ✅ **Readiness criteria** – What makes an agent "GA ready"?
5. ✅ **Seller briefing format** – What info do agents need from intake?
6. ✅ **Success metrics** – How is Secret Agent program measured?

### **From You (Cotishea):**
7. **Automation scope** – Which tasks are highest-pain to automate first?
8. **Data sensitivity** – Any confidential info that can't be in AI processing?
9. **Integration touchpoints** – Does this connect to Dynamics, Seismic, or other systems?
10. **Timeline** – When would Jane want to pilot this?

### **From Engineering:**
11. **Copilot Agent platform readiness** – Can we build a "Secret Agent Program Manager" agent in Studio?
12. **Privacy/DLP** – What guardrails needed for processing partner emails?
13. **Integration APIs** – Can we connect to SharePoint, Teams, Outlook programmatically?

---

## Proposed Next Steps

### **Phase 1: Validation (Next 2 Weeks)**
- [ ] Review this alignment with Jane Koh directly
- [ ] Confirm pain points + priorities
- [ ] Sketch the "Secret Agent Program Manager" agent spec

### **Phase 2: Design (Weeks 3-4)**
- [ ] Create intake email parser (Email-Task-MCP extension)
- [ ] Define agent instructions for program manager
- [ ] Map intake → partner briefing → seller assignment workflow

### **Phase 3: Prototype (Weeks 5-8)**
- [ ] Build Email-Task-MCP enhancement for intake processing
- [ ] Create Copilot agent for program orchestration
- [ ] Test with 1 partner intake

### **Phase 4: Operationalize (Weeks 9+)**
- [ ] Roll out to Secret Agent program
- [ ] Measure manual time saved
- [ ] Document pattern for other GTM programs

---

## Why This Is Important (Strategic Context)

Jane's Secret Agent program is a **field-learning bridge** between Copilot investments and actual seller behavior. **Making it AI-native** does two things:

1. **Proves the value** of Copilot extensibility to skeptical stakeholders
   - "Here's how we use our own product to run our GTM motion"

2. **Creates a scalable template** for similar programs
   - ISV onboarding
   - Partner enablement
   - Field certification
   - Sales operations workflows

This is the **meta-story** that wins internally + builds confidence externally.

---

## Recommendation

**Before building anything, schedule time with Jane Koh to:**

1. **Validate the problem** – Is intake/partner management automation top 3 pain point?
2. **Define the scope** – What's Phase 1 vs. nice-to-have?
3. **Confirm readiness** – Is Copilot agent platform mature enough for this?
4. **Set expectations** – Timeline, resource commitment, success criteria

**If Jane says "yes," this becomes:**
- A **proof point** for Copilot extensibility
- A **reference pattern** for GTM automation
- A **use case** that demonstrates email-task-mcp value in production

---

## Questions for You

1. **Does this alignment feel right?** Or is there a different angle Jane is driving?
2. **What's the highest-pain task in the Secret Agent program that automation could target first?**
3. **Should this be positioned as "Email-Task-MCP extension" or "Copilot agent for GTM operations"?**
4. **Who should own this project** – you (Copilot PM), Jane (GTM), or jointly?

**Let me know and I can help draft the proposal to Jane.**
