# AI Engineering Team — Autonomous Software Delivery Platform

> **Estado e plano atuais:** consulte a [especificação do produto](docs/PRODUCT_SPEC.md), o [roadmap consolidado](docs/ROADMAP.md) e o [estado verificado](docs/STATUS.md). As fases e declarações de conclusão abaixo preservam o histórico e não comprovam funcionamento de ponta a ponta. Para trabalhar no repositório com agentes, consulte [AGENTS.md](AGENTS.md).

> **Give your AI engineering team a User Story. Get back a reviewed Pull Request.**

A production-grade platform that orchestrates autonomous AI agents to execute the complete software delivery lifecycle. The human acts as Tech Lead / CTO / Final Approver while the AI team performs the operational work.

## 🎯 Vision

Transform this:
```
User Story → 8-12 hours of human work
```

Into this:
```
User Story → 41 minutes of AI work → Reviewed PR → Human approval
```

## ✨ Current State: Phase 4 Complete

### ✅ Implemented

**Phase 4: Persistence, Real Sandbox & Analytics**
- **IndexedDB Database** — Real persistence for projects, PRs, agent runs, decisions
- **Web Worker Sandbox** — True isolated code execution in separate thread
- **File System Access API** — Real file read/write (Chrome/Edge)
- **Analytics Engine** — Historical metrics, trends, performance insights
- **Platform Dashboard** — System health, data management, export/import
- **Analytics Dashboard** — Cost trends, agent performance, activity feed
- **Data Portability** — Export/import for backup and migration

**Phase 3: Delivery Pipeline + GitHub Integration**
- **JavaScript Sandbox** — Real code execution in browser with validation
- **CI/CD Pipeline** — Build → Test → Lint → Type Check → Security → Review
- **Pull Request Generator** — Complete PRs with diffs, checklist, decisions, traceability
- **Traceability Engine** — Full chain: REQ → US → TASK → commit → test → PR
- **Disagreement Resolver** — Consensus, voting, human escalation
- **Delivery Engine** — End-to-end orchestration
- **Delivery Dashboard** — User Story → PR in one click

**Phase 2: Real Execution Layer**
- **Virtual File System** — In-memory filesystem with full CRUD operations
- **Git Manager** — Worktree creation, commits, status tracking
- **Test Runner** — Test execution, build system, linting
- **Execution Engine** — Unified interface for all execution operations
- **Execution Dashboard** — Interactive UI for file browsing, editing, testing

**Phase 1: Engine + UI**

**1. Command Center Dashboard**
- Real-time project monitoring
- Active agent tracking
- Cost breakdowns
- Attention panels for escalated decisions
- Workflow pipeline visualization

**2. Project Management**
- 13-tab detailed project view
- Requirements traceability (REQ-IDs)
- Architecture decisions
- Implementation plans
- Task management
- Risk register
- Cost tracking

**3. Work Request Intake**
- Multi-modal input (text, URL, Jira, GitHub, files)
- Repository targeting
- Analysis simulation
- Requirements extraction

**4. Review & Approval Framework**
- PR verification checklists
- Automated validation (tests, security, typecheck, lint)
- Effort savings statistics
- Escalation handling

**5. Agent Registry**
- 16 specialized agent roles
- Dynamic team assembly
- Skill matrices
- Model selection

**6. Engine (Core Execution System)**
- **Agent Harness** — Central orchestrator with circuit breakers
- **Model Router** — Intelligent model selection with escalation
- **Budget Engine** — Multi-level financial governance
- **Context Engine** — Minimal, relevant context packs with provenance
- **Workflow Engine** — Predefined delivery workflows
- **Groq Provider** — Real API integration with simulation fallback

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    COMMAND CENTER UI                          │
│  (Dashboard • Projects • Reviews • Agents • Engine)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AGENT HARNESS                              │
│  (Orchestration • Circuit Breakers • Workflows)             │
├─────────────────────────────────────────────────────────────┤
│  Model Router  │  Budget Engine  │  Context Engine          │
│  Agent Registry│  Workflows      │  Risk Register           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MODEL PROVIDERS                            │
│  Groq (Llama 3.1/3.3) • Future: OpenAI, Anthropic, etc.    │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Installation

Use Node.js **24.15.0** (see `.nvmrc`) and npm 11+. The pinned toolchain is also used in CI.

```bash
npm ci
```

### Development

```bash
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build
```

### Groq API (Optional)

The system works in **simulation mode** by default with realistic mock responses.

To use the real Groq API:
1. Get an API key from https://console.groq.com
2. Enter it in the Engine Dashboard
3. Click "Test Connection"

Without an API key, the system simulates agent execution with realistic outputs.

## 📊 Engine Dashboard

The Engine Dashboard (`/engine`) is where you can:

1. **Execute Workflows**
   - User Story Delivery (7 steps)
   - Bug Fix (4 steps)
   - Feature Delivery (8 steps)

2. **Monitor Execution**
   - Real-time agent activity
   - Step-by-step progress
   - Execution log
   - Cost tracking

3. **View Outputs**
   - Agent responses (expandable)
   - Model calls
   - Token usage
   - Confidence scores

4. **Configure**
   - Groq API key
   - Budget limits
   - Model selection

## 🤖 Agent Roles

| Agent | Role | Responsibility |
|-------|------|----------------|
| 🧠 Engineering Lead | Orchestration | Team assembly, delegation, monitoring |
| 📋 Requirements Analyst | Analysis | Extract requirements, detect ambiguities |
| 📝 Implementation Planner | Planning | Task decomposition, estimation |
| 💻 Software Developer | Implementation | Code writing, debugging |
| 🔍 Code Reviewer | Review | Independent code review |
| 🧪 Test Engineer | Testing | Write & execute tests |
| 🛡️ Security Analyst | Security | Security audit |
| ⚠️ Risk Analyst | Risk | Risk identification & mitigation |

## 💰 Cost Tracking

**Example Execution (User Story):**
```
Requirements Analysis:  €0.31
Risk Assessment:        €0.19
Planning:               €0.24
Implementation:         €1.42
Testing:                €0.38
Code Review:            €0.15
Security Review:        €0.05
────────────────────────────────
Total:                  €2.74
Tokens:                 301k
Duration:               41 minutes
Human effort saved:     8-12 hours
```

## 🔄 Workflow Example

**Input:**
```
US-124: Smart Charging Timeline
As an EV owner, I want to see a 7-day charging schedule 
so that I can optimize my charging costs.
```

**Execution:**
1. Requirements Agent → 6 requirements, 2 ambiguities
2. Risk Agent → 2 risks identified
3. Planner Agent → 4-phase plan
4. Developer Agent → XState implementation
5. Tester Agent → 38 tests passing
6. Reviewer Agent → Score: 87/100 (PASS)
7. Security Agent → No vulnerabilities

**Output:**
```
READY FOR REVIEW

✓ Requirements satisfied
✓ Implementation complete
✓ 38 tests passing
✓ Typecheck passing
✓ Lint passing
✓ Agent review complete
✓ Security review complete

Files changed: 12
Lines added: 684
Lines removed: 91

Estimated human effort: 8–12h
Agent execution: 41 minutes
AI cost: €2.74

[Approve & Merge] [Review Code] [Request Changes]
```

## 📁 Project Structure

```
/
├── src/
│   ├── engine/              # Core execution engine
│   │   ├── types.ts         # Type definitions
│   │   ├── providers/       # Model providers (Groq)
│   │   ├── models/          # Model Router
│   │   ├── budget/          # Budget Engine
│   │   ├── context/         # Context Engine
│   │   ├── agents/          # Agent Registry
│   │   ├── harness/         # Agent Harness
│   │   └── workflows/       # Workflow Engine
│   ├── store/               # Zustand state management
│   ├── components/          # React components
│   ├── pages/               # Page components
│   │   ├── CommandCenter    # Main dashboard
│   │   ├── ProjectDetail    # Project view
│   │   ├── WorkRequest      # New work intake
│   │   ├── Reviews          # PR reviews
│   │   ├── Agents           # Agent registry
│   │   └── EngineDashboard  # Engine control panel
│   ├── data/                # Mock data
│   └── types/               # UI types
├── docs/
│   └── ENGINE_ARCHITECTURE.md  # Detailed engine docs
└── README.md                # This file
```

## 🎯 Success Criteria

**Primary KPI:**
> "How much trustworthy engineering work was completed before the human had to intervene?"

**Metrics:**
- Human intervention time
- First-pass success rate
- PR acceptance rate
- AI cost per completed task
- Time to reviewed PR

## 🛣️ Roadmap

### Phase 1 ✅
- [x] Command Center UI
- [x] Engine architecture
- [x] Groq integration
- [x] Model Router
- [x] Budget Engine
- [x] Context Engine
- [x] Agent Harness
- [x] Workflow execution
- [x] Simulation mode

### Phase 2 ✅
- [x] Virtual File System
- [x] Git worktree management
- [x] Test Runner (build, lint, test execution)
- [x] Execution Engine (unified interface)
- [x] Execution Dashboard (interactive UI)
- [x] File browsing and editing
- [x] Commit workflow
- [x] Architecture ready for Docker/Node.js backend

### Phase 3 ✅
- [x] JavaScript Sandbox (real code execution)
- [x] CI/CD Pipeline (build → test → lint → security → review)
- [x] Pull Request Generator (with diffs, checklist, decisions)
- [x] Traceability Engine (REQ → US → TASK → commit → test → PR)
- [x] Disagreement Resolver (consensus, voting, escalation)
- [x] Delivery Engine (end-to-end orchestration)
- [x] Delivery Dashboard (User Story → PR visualization)
- [x] GitHub Integration Layer (simulated, ready for real API)

### Phase 4 ✅ (Current)
- [x] IndexedDB Database (real persistence)
- [x] Web Worker Sandbox (true isolated execution)
- [x] File System Access API (real file read/write)
- [x] Analytics Engine (historical metrics & insights)
- [x] Platform Dashboard (system health & data management)
- [x] Analytics Dashboard (cost trends & performance)
- [x] Export/Import (data portability & backup)
- [x] Multi-project management
- [x] Session management (survives page reloads)

### Phase 5: Backend + Team Collaboration (Next)
- [ ] Node.js backend API
- [ ] Docker sandbox for real code execution
- [ ] Real filesystem operations
- [ ] Actual test execution (Jest, Vitest)
- [ ] Real git operations (simple-git)
- [ ] GitHub API integration (create real PRs)
- [ ] PostgreSQL for team persistence
- [ ] Webhook integration
- [ ] Multi-user support
- [ ] Team collaboration features

### Phase 3: GitHub Integration
- [ ] OAuth authentication
- [ ] Create branches
- [ ] Commit changes
- [ ] Create Pull Requests
- [ ] Webhook integration

### Phase 4: Additional Providers
- [ ] OpenAI (GPT-4, GPT-3.5)
- [ ] Anthropic (Claude)
- [ ] DeepSeek
- [ ] OpenRouter
- [ ] Local models

### Phase 5: Advanced Features
- [ ] Multi-model consensus
- [ ] Agent disagreement resolution
- [ ] Learning from past executions
- [ ] Predictive cost estimation
- [ ] Automatic team optimization

## 🔒 Security

- Agents operate in isolated sandboxes (Phase 2)
- External content treated as untrusted
- Approval required for high-risk operations
- Budget limits prevent runaway costs
- Circuit breakers stop infinite loops
- Full audit trail of all actions

## 📚 Documentation

- [Engine Architecture](docs/ENGINE_ARCHITECTURE.md) — Detailed technical documentation
- [Master Prompt](MASTER_PROMPT.md) — Original vision & requirements

## 🤝 Design Principles

1. **AI executes, AI reviews AI, software validates, human governs**
2. **Agents propose, software validates** — Never trust blindly
3. **Context is minimal and relevant** — Never send entire repository
4. **Every decision has provenance** — Track FACT vs ASSUMPTION
5. **Every model call has measurable cost** — Full tracking
6. **Every workflow is resumable** — State persistence
7. **Every autonomous loop needs limits** — Circuit breakers
8. **Implementation and review are separated** — Independent review
9. **Humans govern consequences, not every keystroke**
10. **Optimize for completed software, not agent activity**

## 💡 Key Insight

The goal is NOT to build a chatbot or coding assistant.

The goal is to build an **autonomous AI software engineering company** capable of receiving work and executing most of the delivery lifecycle autonomously.

The human acts as Tech Lead / CTO, focusing on:
- Unresolved requirements
- Significant architectural decisions
- Scope changes
- Security decisions
- Budget overruns
- High-risk operations
- Final approval

Everything else is handled autonomously by the AI team.

## 📄 License

MIT

---

**Built with:** React • TypeScript • Tailwind CSS • Zustand • Groq API

**Status:** Phase 1 Complete — Engine operational with simulation mode
