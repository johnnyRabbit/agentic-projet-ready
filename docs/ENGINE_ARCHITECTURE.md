# AI Engineering Team — Engine Architecture

## Overview

The Engine is the core execution system that orchestrates autonomous AI agents to deliver software. It implements the complete loop: **User Story → Reviewed Pull Request**.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT HARNESS                              │
│  (Central orchestrator — agents must NOT bypass this)        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Model Router  │  │Budget Engine │  │Context Engine│      │
│  │              │  │              │  │              │      │
│  │ • Selects    │  │ • Tracks     │  │ • Builds     │      │
│  │   optimal    │  │   costs at   │  │   minimal    │      │
│  │   model per  │  │   multiple   │  │   context    │      │
│  │   task       │  │   levels     │  │   packs      │      │
│  │ • Escalation │  │ • Alerts at  │  │ • Provenance │      │
│  │   path       │  │   thresholds │  │   tracking   │      │
│  │ • Multi-     │  │ • Hard       │  │ • Token      │      │
│  │   model      │  │   limits     │  │   budgeting  │      │
│  │   review     │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Agent Registry│  │  Workflows   │  │    Risk      │      │
│  │              │  │              │  │  Register    │      │
│  │ • 8 agent    │  │ • User Story │  │              │      │
│  │   roles      │  │ • Bug Fix    │  │ • Identify   │      │
│  │ • System     │  │ • Feature    │  │ • Assess     │      │
│  │   prompts    │  │ • Custom     │  │ • Mitigate   │      │
│  │ • Skills     │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MODEL PROVIDERS                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Groq Provider                         │   │
│  │                                                        │   │
│  │  • llama-3.1-8b-instant (Fast/Cheap)                  │   │
│  │  • llama-3.3-70b-versatile (Default/Reasoning)        │   │
│  │  • llama-3.1-70b-versatile (Alternative)              │   │
│  │  • gemma2-9b-it (Fast/Creative)                       │   │
│  │  • mixtral-8x7b-32768 (Fast/Code)                     │   │
│  │                                                        │   │
│  │  Real API integration with fallback to simulation      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Future: OpenAI, Anthropic, DeepSeek, OpenRouter, Local     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Agent Harness (`src/engine/harness/AgentHarness.ts`)

The central orchestrator. Controls all agent execution and enforces policies.

**Responsibilities:**
- Agent lifecycle management (start, monitor, complete, fail)
- Circuit breaker pattern (stops agents after repeated failures)
- Workflow execution (step-by-step with dependency checking)
- Event logging (every action is tracked)
- Approval gating (escalates to human when needed)
- Cost enforcement (blocks execution when budget exceeded)

### 2. Model Router (`src/engine/models/ModelRouter.ts`)

Intelligently selects the optimal model for each task.

**Decision factors:**
- Task type (code generation, review, planning, etc.)
- Complexity (low, medium, high)
- Risk level (low, medium, high)
- Budget constraints (minimal, standard, premium)
- Historical performance

**Features:**
- Automatic escalation (tries stronger models if confidence is low)
- Multi-model review (gets independent opinions from multiple models)
- Performance tracking (learns from past executions)

### 3. Budget Engine (`src/engine/budget/BudgetEngine.ts`)

Financial governance at multiple levels.

**Budget hierarchy:**
```
Organization Budget (€1000/month)
  └── Project Budget (€25)
        └── Task Budget (€5)
              └── Agent Run Budget (€2)
```

**Features:**
- Real-time cost tracking
- Alert thresholds (50%, 75%, 90%, 100%)
- Hard limits (blocks execution when exceeded)
- Cost breakdown by phase/agent
- Token counting

### 4. Context Engine (`src/engine/context/ContextEngine.ts`)

Builds minimal, relevant context packs for agents.

**Principles:**
- Never send entire repository to agents
- Only include relevant information
- Track provenance (FACT, REQUIREMENT, ASSUMPTION, etc.)
- Token budgeting (stay within model limits)

**Context types:**
- Requirements
- Architecture
- Task
- Code
- Test
- Decision
- Risk

### 5. Agent Registry (`src/engine/agents/AgentRegistry.ts`)

Defines all available agent roles with capabilities and constraints.

**Agent roles:**
1. **Engineering Lead** — Orchestration & delegation
2. **Requirements Analyst** — Extract & validate requirements
3. **Implementation Planner** — Task decomposition & estimation
4. **Software Developer** — Code implementation
5. **Code Reviewer** — Independent review
6. **Test Engineer** — Write & execute tests
7. **Security Analyst** — Security review
8. **Risk Analyst** — Risk identification & mitigation

Each agent has:
- System prompt (personality & instructions)
- Preferred model capability
- Skills list
- Max retries
- Max budget

### 6. Workflow Engine (`src/engine/workflows/WorkflowEngine.ts`)

Predefined delivery workflows.

**Workflows:**
1. **User Story Delivery** (7 steps)
   - Requirements → Risk → Planning → Development → Testing → Review → Security

2. **Bug Fix** (4 steps)
   - Analyze → Fix → Test → Review

3. **Feature Delivery** (8 steps)
   - Requirements → Architecture → Risk → Planning → Development → Testing → Review → Security

### 7. Groq Provider (`src/engine/providers/GroqProvider.ts`)

Real integration with Groq API.

**Features:**
- Direct API calls to Groq
- Automatic model selection based on task
- Cost calculation per model
- Fallback to simulation mode (for development/testing)
- Realistic response generation in simulation

## Data Flow

```
User Input (User Story / Bug / Feature)
    ↓
Context Engine (builds context pack)
    ↓
Agent Harness (orchestrates execution)
    ↓
Model Router (selects optimal model)
    ↓
Groq Provider (executes model call)
    ↓
Budget Engine (tracks cost)
    ↓
Agent Output (structured response)
    ↓
Next Step (or complete workflow)
```

## Execution Example

**Input:** User Story US-124

**Execution:**
1. Requirements Agent → Extracts 6 requirements, 2 ambiguities
2. Risk Agent → Identifies 2 risks (WebSocket drops, API rate limits)
3. Planner Agent → Creates 4-phase plan with estimates
4. Developer Agent → Implements charging state machine (XState)
5. Tester Agent → Writes 38 tests (all passing)
6. Reviewer Agent → Reviews code (score: 87/100, PASS)
7. Security Agent → Security audit (PASS, no vulnerabilities)

**Output:**
- Total cost: €2.74
- Total tokens: 301k
- Duration: 41 minutes
- Human effort saved: 8-12 hours
- Confidence: 73-89%

## Configuration

### Environment Variables

```bash
# Groq API (optional — simulation mode if not provided)
GROQ_API_KEY=gsk_...

# Budget limits
DEFAULT_PROJECT_BONUS=25.0
DEFAULT_TASK_BONUS=5.0

# Model selection
DEFAULT_MODEL=llama-3.3-70b-versatile
FAST_MODEL=llama-3.1-8b-instant
```

### Model Selection Rules

```typescript
if (risk === 'high') {
  model = 'llama-3.3-70b-versatile'; // Always use strongest
} else if (budget === 'minimal') {
  model = 'llama-3.1-8b-instant'; // Use cheapest
} else if (taskType === 'code-generation') {
  model = 'llama-3.3-70b-versatile'; // Code needs strong reasoning
} else if (complexity === 'low') {
  model = 'llama-3.1-8b-instant'; // Fast is sufficient
} else {
  model = 'llama-3.3-70b-versatile'; // Default: balanced
}
```

## Circuit Breaker

Agents have automatic circuit breakers to prevent infinite loops:

```typescript
if (failureCount >= 3) {
  circuitBreaker.state = 'open'; // Stop agent
  // Escalate to human or stronger model
}
```

## Approval System

Certain actions require human approval:

- Architecture decisions with confidence < 60%
- Budget overruns
- Scope changes
- Security-sensitive operations
- Merge to main
- Production deployment

## Observability

Every action is logged:

```typescript
interface EngineEvent {
  type: string;
  timestamp: string;
  agentId?: string;
  taskId?: string;
  projectId: string;
  data: Record<string, unknown>;
}
```

Events include:
- `agent.started`
- `agent.completed`
- `agent.failed`
- `agent.budget_exceeded`
- `workflow.started`
- `workflow.completed`
- `approval.requested`
- `approval.resolved`

## Future Extensions

### Phase 2: Real Execution
- Docker sandbox for code execution
- Git worktree management
- Actual file system operations
- Test execution in isolated environment

### Phase 3: GitHub Integration
- OAuth authentication
- Create branches
- Commit changes
- Create Pull Requests
- Webhook integration

### Phase 4: Additional Providers
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- DeepSeek
- OpenRouter (unified access)
- Local models (Ollama, LM Studio)

### Phase 5: Advanced Features
- Multi-model consensus
- Agent disagreement resolution
- Learning from past executions
- Predictive cost estimation
- Automatic team optimization

## Success Metrics

**Primary KPI:**
> "How much trustworthy engineering work was completed before the human had to intervene?"

**Secondary metrics:**
- Human intervention time
- First-pass success rate
- PR acceptance rate
- Defects after review
- Estimate accuracy
- AI cost per completed task
- Agent retries
- Escalation rate
- Time to reviewed PR

## Design Principles

1. **Agents propose, software validates** — Never trust agent output blindly
2. **Context is minimal and relevant** — Never send entire repository
3. **Every decision has provenance** — Track FACT vs ASSUMPTION vs DECISION
4. **Every model call has measurable cost** — Full cost tracking
5. **Every workflow is resumable** — State persistence
6. **Every autonomous loop needs limits** — Circuit breakers, budgets, timeouts
7. **Implementation and review are separated** — Independent review
8. **External content is untrusted** — Security-first approach
9. **Humans govern consequences, not every keystroke** — Appropriate autonomy
10. **Optimize for completed software, not agent activity** — Results matter
