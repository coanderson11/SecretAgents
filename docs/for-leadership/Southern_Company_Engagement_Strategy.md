# Southern Company: NERC Agent Engagement Strategy
**Strategic Deep-Dive & Tactical Playbook**  
**Prepared by:** Microsoft OGE Copilot Extensibility Team  
**Date:** February 23, 2026  
**Classification:** Account Planning

---

## Executive Summary

**Southern Company is a $50B utility with 9 million customers across the Southeast—and a proven Copilot investor ready for the next wave of value.**

- ✅ Already owns **~5,000 M365 Copilot licenses** (significant commitment)
- ✅ Executive sponsor engaged (James Evans)
- ✅ Identified as **flagship pilot for NERC Compliance Agent** + Grid Operations Copilot
- ✅ High regulatory pressure = strong motivation (NERC CIP compliance is existential)
- ⚠️ **Gap:** Formal account ownership + adoption metrics not yet tracked internally
- 🎯 **Opportunity:** Position Southern as reference customer + agent template vendor

### Why Southern Company Matters

Southern Company sits at **the intersection of four strategic trends:**

1. **Regulatory Pressure** – NERC CIP compliance costs millions/year in manual audits
2. **Copilot Investment** – Already spent on 5K licenses; ready to justify ROI
3. **Grid Modernization** – Multi-year transformation (clean energy, AI-enabled ops)
4. **Referenceable Size** – ~10 peers in peer group; Southern as reference = market opportunity

---

## Part 1: Current State Assessment

### Copilot Investment & Adoption

| Metric | Status | Notes |
|--------|--------|-------|
| **M365 Copilot Licenses** | ~5,000 seats | Significant commitment; broad internal footprint |
| **Adoption Phase** | Early-stage → Growth | Users trained; Copilot integrated into Office workflows |
| **Extensibility Readiness** | Medium | Copilot is live, but agents/connectors not yet activated |
| **Executive Sponsor** | James Evans | Named stakeholder driving next steps |
| **Internal POC** | Chris Simmons | Copilot point of contact (technical liaison) |
| **MAU / Usage Metrics** | Unknown | Not documented in available sources |
| **Sentiment** | Positive | EBC participation + pilot interest indicate strong receptivity |

### Regulatory & Compliance Profile

**Primary Regulatory Driver: NERC CIP**
- Southern operates in **NERC Southeastern Electric Reliability Council (SERC) region**
- Subject to strict **CIP (Critical Infrastructure Protection) standards**
- Annual compliance audits (internal + external) are resource-intensive

**Compliance Pain Points (Inferred):**
- Manual tracking of NERC standards updates
- Audit prep = 6–12 month cycle consuming 20+ FTE hours
- Enforcement actions require rapid response (legal, operational)
- Change management = regulatory risk if missed

**Copilot Opportunity:**
- **Real-time NERC updates** → reduced manual research
- **Audit artifact readiness** → AI-summarized compliance status
- **Enforcement action alerts** → proactive mitigation
- **Estimated time savings:** 15–25% of annual compliance FTE

---

## Part 2: The Two-Agent Pilot Strategy

### Pilot 1: NERC Compliance Agent (PRIMARY)

**Business Case**

| Element | Details |
|---------|---------|
| **Problem** | Southern's compliance team manually tracks NERC standards, enforcement actions, audit status—consuming 100+ FTE-hours annually |
| **Solution** | AI agent that ingests NERC public data + Southern's internal audit artifacts; enables compliance team to query in plain English |
| **Target Personas** | Compliance Manager, Grid Security Officer, Audit Lead, Regulatory Affairs |
| **Time Savings** | 20–30% of audit prep cycle (est. 200–300 hours/year) |
| **Risk Reduction** | Lower enforcement risk via real-time regulatory intelligence |

**Agent Capabilities (Draft)**

```
User: "What are the latest NERC enforcement actions for CIP-008?"
Agent: "3 enforcement actions in the past 90 days targeting SERC utilities. 
        Most common root cause: Inadequate patch management. 
        Similar issue identified in Southern audit log [artifact]. 
        Recommend reviewing CIP-008-6 baseline."
        [Citations provided]
```

**Data Architecture**

| Data Source | Integration Type | Notes |
|-------------|-----------------|-------|
| NERC Public Standards | Graph Connector (indexed) | Standards, CIP specs, enforcement actions |
| Southern Audit Logs | Federated (Nexla) | Confidential; stays on-prem; queried live |
| Regulatory Updates | Graph Connector (indexed) | RSS, email digests, official NERC channels |
| Internal Compliance Docs | Federated (Nexla) | Policies, procedures, remediation tracking |

**Pilot Scope (MVP)**

Phase 1 (Weeks 1–4):
- Ingest NERC public data (last 12 months of standards + enforcement)
- Build agent with sample Southern data
- Test with 5–10 compliance team members
- Collect feedback on response quality & relevance

Phase 2 (Weeks 5–8):
- Integrate Southern's actual audit data (via Nexla federated connector)
- Expand to 30–50 users in compliance organization
- Measure time savings + quality metrics
- Refine agent instructions based on feedback

Phase 3 (Weeks 9+):
- Expand to other utility functions (Grid Security, Reliability)
- Plan productization as **Utilities NERC Compliance Agent** template
- Prepare customer testimonial & case study

---

### Pilot 2: Grid Operations Copilot (SECONDARY, PARALLEL)

**Business Case**

| Element | Details |
|---------|---------|
| **Problem** | Grid operators & dispatchers spend 30–40% of time manually correlating outage status, load, generation—missing patterns & anomalies |
| **Solution** | AI copilot that queries live operational data; summarizes status + reliability insights; surfaces anomalies |
| **Target Personas** | Grid Operator, Dispatcher, Reliability Engineer, Operations Manager |
| **Time Savings** | 15–20% reduction in manual correlation time (est. 5–10 hours/day per shift) |
| **Risk Reduction** | Faster outage detection + mitigation decision support |

**Agent Capabilities (Draft)**

```
User: "Summarize today's outage activity and any reliability risks."
Agent: "4 significant outages (30+ min) today. Highest impact: 
        Substation 112 (lost 45 MW during peak demand). 
        Correlation: High wind conditions + aging line equipment. 
        Recommendation: Expedite equipment replacement per capital plan. 
        Peer comparison: 30% higher outage rate vs. industry avg. 
        Trend: Worsening without mitigation. [Dashboard link]"
```

**Data Architecture**

| Data Source | Integration Type | Notes |
|-------------|-----------------|-------|
| Outage Management System (OMS) | Federated (Nexla) | Real-time operational data |
| SCADA / Load Data | Federated (Nexla) | Live feed; high volume |
| Reliability Dataset | Graph Connector (indexed) | Historical trends, peer benchmarks |
| Weather / External | Graph Connector (indexed) | Correlated risk factors |

**Pilot Approach (Lighter-Weight than NERC)**

Phase 1 (Weeks 2–4):
- **Pick ONE data source** (e.g., outage data) to integrate via Nexla
- Build minimal agent (summarize today's events)
- Pilot with 1 grid operations center (20–30 operators)
- Measure time savings + user satisfaction

Phase 2 (Weeks 5–8):
- Add second data source (load data) to agent
- Expand to 2nd operations center if successful
- Refine anomaly detection & alerting

Phase 3 (Weeks 9+):
- Evaluate for broader rollout; consider productization

---

## Part 3: Tactical Engagement Plan (Next 90 Days)

### Week 1–2: Executive Alignment & Scope Lock

**Goal:** Confirm pilot scope + resource commitments from both sides

**Activities:**
- [ ] **Kick-off call:** Cotishea Anderson + Valene Samuels (MS) ↔ James Evans + Chris Simmons (Southern)
  - **Agenda:** Southern's compliance & operations challenges; confirm NERC + Grid Ops pilots
  - **Duration:** 45 min; executive-level message (ROI, timeline, resource needs)
  - **Outcome:** Signed pilot charter

- [ ] **Technical intake:** Valene Samuels + Gladys Jimenez (MS) ↔ Chris Simmons + IT/Security (Southern)
  - **Topics:** Data architecture, security requirements, Nexla connector scope, timelines
  - **Duration:** 60 min technical deep-dive
  - **Outcome:** Data access agreements drafted; security questions documented

- [ ] **Win-wire draft:** Cotishea Anderson prepares deal summary + forecast
  - **By end of Week 2:** Southern committed to pilot; metrics baseline defined

**Owner:** Cotishea Anderson  
**Support:** Valene Samuels  
**Success Criteria:** Signed pilot charter, resource commitments confirmed

---

### Week 3–4: Data Access & Agent Scoping

**Goal:** Secure data access; finalize agent scope & success metrics

**Activities:**
- [ ] **Data access agreement:** Southern IT provides:
  - NERC public data URLs (standards.nerc.net, enforcement portal)
  - Audit artifact sample (100–200 docs; de-identified)
  - OMS/SCADA interface specs (for Grid Ops pilot)
  - Security + DLP requirements

- [ ] **Agent design workshop:** MS + Southern collaborate on:
  - Sample questions the NERC agent should answer
  - Agent output format (summaries, citations, links)
  - Success metrics (time savings, quality, adoption)
  - Rollout plan (pilot groups, timeline)

- [ ] **Nexla setup:** Gladys Jimenez + Valene Samuels with Southern IT:
  - Scope federated connectors (audit logs, OMS data)
  - Security review (encryption, access controls)
  - Test data flow

**Owner:** Valene Samuels (CSA)  
**Support:** Gladys Jimenez (SME)  
**Success Criteria:** Data access confirmed; Nexla connectors in test

---

### Week 5–8: Pilot Execution (Phase 1)

**Goal:** Deploy agents; collect feedback; measure impact

**Activities:**

**NERC Agent (Primary Focus)**
- [ ] Deploy agent with sample NERC data + de-identified Southern audit artifacts
- [ ] Onboard 5–10 compliance team members (test group)
- [ ] Weekly feedback sessions (user experience, accuracy, relevance)
- [ ] Collect metrics:
  - # of queries/user/day
  - User satisfaction (NPS)
  - Time per query
  - # of times agent results influenced decision

**Grid Operations Agent (Secondary)**
- [ ] Deploy minimal Grid Ops agent with 1 data source (OMS)
- [ ] Onboard 1 operations center (20–30 operators)
- [ ] Daily standups with ops managers (feedback, issues)
- [ ] Metrics: Outage detection time, adoption

**Stakeholder Meetings:**
- [ ] Bi-weekly check-ins: Cotishea Anderson ↔ James Evans (executive health)
- [ ] Weekly technical syncs: Valene Samuels ↔ Chris Simmons (blockers, progress)
- [ ] Feedback loops: Gladys Jimenez ↔ Southern SMEs (quality, data accuracy)

**Owner:** Valene Samuels (CSA) + Gladys Jimenez (SME)  
**Success Criteria:**
- 100+ agent queries from pilot group
- >80% user satisfaction
- Identified 3–5 data quality issues (fixable)
- 15%+ time savings validated

---

### Week 9–12: Scale & Plan Next Phase

**Goal:** Expand pilot; prepare for production; position for reference

**Activities:**
- [ ] **Expand NERC pilot** to full compliance team (30–50 users)
- [ ] **Refine agent** based on Phase 1 feedback
- [ ] **Integrate live audit data** (Nexla federated connector goes live)
- [ ] **Prepare Grid Ops for broader rollout** (add 2nd data source if Phase 1 successful)
- [ ] **Document wins:**
  - Case study / win-wire for GTM
  - Customer quote from James Evans or ops lead
  - Metrics snapshot (time savings, adoption, ROI)
- [ ] **Plan Agent Studio expansion:** Southern → Tenant Copilot enablement for customization

**Owner:** Cotishea Anderson (GTM) + Valene Samuels (technical)  
**Success Criteria:**
- 50+ daily active NERC agent users
- 25%+ reported time savings (audit prep)
- Grid Ops pilot decision made (scale or iterate)
- Customer case study drafted

---

## Part 4: Success Metrics & Tracking

### Pilot-Level KPIs

| Metric | Baseline | Target (Week 12) | Definition |
|--------|----------|------------------|-----------|
| **NERC Agent Daily Users** | 0 | 50+ | # of unique users querying agent/day |
| **Queries/User/Day** | 0 | 3–5 | Average query volume per active user |
| **User Satisfaction (NPS)** | N/A | >70 | Net Promoter Score for agent usefulness |
| **Time Savings (Reported)** | N/A | 20–30% | % reduction in manual audit prep time |
| **Data Quality Score** | N/A | >90% | % of agent responses with accurate citations |
| **Grid Ops Adoption** | 0 | 20–30 | # of operators actively using Grid Ops copilot |

### Account-Level KPIs

| Metric | Current | Target (FY26) | Owner |
|--------|---------|---------------|-------|
| **Copilot Seat Utilization** | ~5K seats (unknown MAU) | 40%+ MAU | Chris Simmons |
| **Agents Deployed** | 0 | 2 (NERC + Grid Ops) | Cotishea Anderson |
| **Extensibility Footprint** | None | 100+ users across 2 agents | Valene Samuels |
| **Copilot Expansion Revenue** | $2M (est. 5K × $400) | $3M+ (additional seats + agents) | Sales |
| **Reference Case Readiness** | Pre-pilot | Publishable | Cotishea Anderson |

---

## Part 5: Resource Plan & Team Structure

### Microsoft Team Allocation

| Role | Name | Allocation | Key Responsibilities |
|------|------|-----------|----------------------|
| **Account Leadership** | Cotishea Anderson (PM) | 60% | Strategy, customer alignment, GTM, scope |
| **Principal CSA** | Valene Samuels | 80% | Technical delivery lead, CSA coordination, blockers |
| **Technical SME** | Gladys Jimenez | 50% | Architecture, NERC compliance expertise, data quality |
| **Copilot POC** | Chris Simmons | 20% | Southern internal liaison, enablement, feedback loop |
| **Partner Manager** | TBD | 30% | Nexla coordination, connector build support |

**Total Microsoft FTE:** ~2.3 FTE across 3 people

### Partner Support (Nexla)

- **Federated Connector Development:** 4–6 weeks
  - Audit data connector (NERC agent)
  - OMS/SCADA connector (Grid Ops agent)
- **Estimated Cost:** $30–40K

### Southern Company Commitments

| Role | Count | Commitment |
|------|-------|-----------|
| **Project Sponsor** | 1 (James Evans) | Monthly check-ins, escalation path |
| **Technical Leads** | 2–3 | Weekly syncs, data access, security reviews |
| **Pilot Users** | 50–100 | 4–6 hrs/week feedback; production use |
| **Data Stewards** | 1–2 | Data governance, quality assurance |

**Total Southern FTE:** ~1.5–2 FTE across 4–6 people

---

## Part 6: Risk Mitigation & Contingencies

### Key Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Data access delays** | Medium | High | Early legal agreement; sample data provided in Week 1 |
| **Nexla connector complexity** | Medium | Medium | Parallel MS connector dev; reduce feature scope if needed |
| **Pilot user adoption (low utilization)** | Low | High | Executive sponsorship; incentivize participation; start with enthusiasts |
| **Security/DLP concerns from Southern IT** | Medium | Medium | Early security reviews; partner with CELA if needed; demonstrate controls |
| **Agent accuracy (hallucinations on NERC data)** | Low | High | Heavy validation; human review in loops; transparent citations |
| **Valene Samuels bottleneck** | High | High | Distribute workload to Gladys Jimenez; hire contractor SME if needed |

### Contingency Plans

**If Nexla connector delayed 4+ weeks:**
- Shift to Graph Connector for public NERC data only (Pilot Phase 1)
- Defer live audit data integration to Phase 2
- Still achievable, but limits Pilot Phase 1 impact

**If pilot users show low adoption:**
- Pivot to smaller, more engaged user group (5–10 subject matter experts)
- Increase training + support
- Focus on quality over volume

**If security concerns block live data integration:**
- Keep Nexla connector in test environment
- Use de-identified sample data for initial phase
- Plan security review with CELA + DLP specialists

---

## Part 7: Messaging & Positioning

### Executive Pitch (C-Suite)

**Opening:**
> "Southern Company has invested in M365 Copilot. Now let's prove the ROI by solving your #1 pain: NERC compliance automation. Our NERC Compliance Agent will save your team 300+ hours/year on audit prep—while reducing regulatory risk."

**Key Points:**
- NERC compliance = existential cost for utilities
- Copilot agents = force multiplier for compliance teams
- Southern as **reference customer** = competitive advantage
- Multi-horizon roadmap: compliance → grid ops → customer service

**Timeline:**
- Pilot (12 weeks) → Reference case (FY26) → Productization (FY27)

### Technical Pitch (Chris Simmons / IT)

**Opening:**
> "We're building NERC and Grid Operations agents using Copilot Studio + Nexla connectors. Federated approach keeps your data on-prem, secure, while enabling real-time insights."

**Key Points:**
- Architecture: Federated + indexed (hybrid approach)
- Security: DLP controls, admin governance, audit logging
- Data residency: Sensitive data stays on-prem via Nexla
- Extensibility: Southern can build custom agents using same platform

### Sales Pitch (Expansion Revenue)

**Opening:**
> "Southern Company signed a deal 12 months ago for 5K Copilot seats. Usage is steady. Now we're co-investing in agents that unlock the next $1M+ in value through operational efficiency. Let's expand the seat footprint + add Agent Studio for IT to build custom agents."

**Key Points:**
- NERC agent = use case validation
- Grid Ops agent = 2nd win → broader rollout
- Agent Studio = platform play (customers build agents)
- Reference case = market expansion (market size = 10+ utilities)

---

## Part 8: Timeline & Milestones (90-Day View)

```
FEB 23 (Today)          Week 1-2: Executive Alignment
 ├─ Kick-off call (James Evans + Cotishea)
 ├─ Technical intake (Chris Simmons + Valene)
 └─ Pilot charter signed

FEB 28                  Week 3-4: Data Access & Scoping
 ├─ Data agreements signed
 ├─ Agent requirements defined
 └─ Nexla setup begins

MAR 7                   Week 5-8: Phase 1 Deployment
 ├─ NERC agent live (sample data)
 ├─ 5-10 compliance users onboarded
 ├─ Grid Ops agent (1 data source)
 ├─ 1 ops center (20-30 users)
 └─ Weekly feedback cycles

MAR 28                  Week 9-12: Scale & Reference
 ├─ Expand to 50+ users (NERC)
 ├─ Integrate live audit data (Nexla live)
 ├─ Grid Ops expansion decision
 ├─ Case study drafted
 └─ Customer testimonial collected

MAY 23 (End of Pilot)   Post-Pilot: Productization & GTM
 ├─ Utilities NERC Agent template finalized
 ├─ Documented time savings & ROI
 ├─ Southern as reference customer launched
 └─ Next cohort (Entergy, Duke, Xcel) onboarded
```

---

## Part 9: Decision Checkpoints & Go/No-Go Criteria

### Checkpoint 1: Scope Lock (Week 2)
**Decision:** Proceed to pilot?

**Go Criteria:**
- ✅ Pilot charter signed by both sides
- ✅ Resource commitments confirmed (James Evans, Chris Simmons named)
- ✅ Data access roadmap clear
- ✅ Success metrics defined

**No-Go Triggers:**
- ❌ Southern not willing to commit pilot users
- ❌ Data access impossible or too complex
- ❌ James Evans unavailable (exec sponsorship required)

---

### Checkpoint 2: Phase 1 Results (Week 8)
**Decision:** Expand to Phase 2 (live data + scale)?

**Go Criteria:**
- ✅ 80%+ user satisfaction (NPS > 70)
- ✅ 50+ queries from pilot group
- ✅ 15%+ time savings validated
- ✅ Data accuracy > 90%
- ✅ No critical security issues found

**No-Go / Pivot Triggers:**
- ❌ Adoption stalled (<20 users; <5 queries/day)
- ❌ User satisfaction < 50% (poor quality or relevance)
- ❌ Time savings not materializing (<5%)
- ⚠️ Security issues require redesign (pivot to limited scope)

---

### Checkpoint 3: Productization (Week 12)
**Decision:** Take reference case to market?

**Go Criteria:**
- ✅ 50+ daily active users (NERC)
- ✅ 25%+ time savings documented
- ✅ Customer quote from James Evans obtained
- ✅ Case study draft completed
- ✅ Grid Ops decision made (scale or defer)

**No-Go Triggers:**
- ❌ Usage fell below pilot period levels (suggests not sticking)
- ❌ Time savings inflated or unverifiable
- ❌ Southern unwilling to be public reference

---

## Part 10: FAQ & Guardrails

### Q: Why focus on Southern when Xcel & Duke are higher priority?

**A:** Southern is **lowest risk, highest probability of success:**
- Already owns 5K Copilot licenses (showing commitment)
- Executive sponsor (James Evans) engaged
- Regulatory pressure is urgent (NERC CIP)
- Referenceable size (peers will see Southern + follow)
- Parallel to Xcel/Duke efforts (not sequential)

---

### Q: What if Nexla connector delays the pilot?

**A:** We have a **fallback path:**
- Week 1–4: Use public NERC data only (no live audit data)
- Week 5–8: Pilot with compliance team on public agent
- Week 9+: Integrate live audit data when Nexla ready
- Pilot moves but doesn't stall.

---

### Q: How do we prevent this from becoming a 6-month project?

**A:**
- **Time-boxes per phase** (Weeks 1–2, 3–4, 5–8, 9–12)
- **Go/No-Go decisions** at each checkpoint
- **CSA accountability:** Valene Samuels owns timeline + escalation
- **Partner commitment:** Nexla has 6-week SLA

---

### Q: What's the revenue opportunity here?

**A:**
- **Current:** ~5K Copilot seats × $400 = $2M/year
- **Expansion opportunity:** Add 2K seats (Grid Ops, Security) + Agent Studio = $2.8M/year
- **Productization upside:** Reference case → 5–10 peer utilities = $20M+ TAM

---

## Appendix: Contact Map

### Southern Company

| Name | Title | Role in Pilot | Contact | Notes |
|------|-------|---------------|---------|-------|
| **James Evans** | Executive | Sponsor | TBD | Primary relationship; monthly updates |
| **Chris Simmons** | Technical Lead | POC | TBD | Weekly syncs; data access coordination |

### Microsoft

| Name | Title | Role | Contact |
|------|-------|------|---------|
| **Cotishea Anderson** | PM, OGE | Account Lead | cotishea@microsoft.com |
| **Valene Samuels** | Principal CSA | Technical Lead | valene.samuels@microsoft.com |
| **Gladys Jimenez** | Technical SME | Architecture | gladys.jimenez@microsoft.com |

---

## Appendix: Success Case Study Template (for Week 12)

```
TITLE: "How Southern Company Reduced NERC Audit Prep by 25% Using AI"

EXECUTIVE SUMMARY:
- Southern Company deployed a custom NERC Compliance Agent 
  in Microsoft 365 Copilot
- Results: 300+ hours/year saved on audit prep; 
  50+ compliance users actively using agent
- Regulatory risk reduced through real-time NERC intelligence

CUSTOMER QUOTE:
"[James Evans or compliance lead quote about impact]"

METRICS:
- Time savings: 25% reduction in audit prep cycle
- Adoption: 50+ daily active users after 8 weeks
- NPS: [score]
- Next phase: Grid Operations Agent rollout Q3

IMPLEMENTATION:
- 12-week pilot with Microsoft + Nexla
- Federated data architecture (audit data stays on-prem)
- Copilot Studio for agent orchestration
- [Diagram of architecture]
```

---

**Next Action:** Schedule kick-off call with James Evans + Cotishea Anderson for Week 1.

**Owner:** Cotishea Anderson  
**Last Updated:** 2026-02-23
