# Phase 3: Delivery Pipeline + GitHub Integration

## Overview

Phase 3 completes the autonomous delivery loop: **User Story → Pull Request**.

This phase implements:
- **GitHub Integration Layer** (simulated, ready for real API)
- **JavaScript Sandbox** (real code execution in browser)
- **CI/CD Pipeline** (build → test → lint → security → review → PR)
- **Pull Request Generator** (with diffs, checklist, decisions, traceability)
- **Traceability Engine** (REQ → US → TASK → commit → test → PR)
- **Disagreement Resolver** (when agents disagree)
- **Delivery Dashboard** (end-to-end delivery visualization)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 DELIVERY DASHBOARD UI                         │
│  (User Story Input → PR Visualization)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DELIVERY ENGINE                             │
│  (Orchestrates complete delivery pipeline)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pipeline   │  │Traceability  │  │Disagreement  │      │
│  │   Runner     │  │   Engine     │  │  Resolver    │      │
│  │              │  │              │  │              │      │
│  │ • Build      │  │ • REQ → PR   │  │ • Consensus  │      │
│  │ • Test       │  │ • Backtrace  │  │ • Vote       │      │
│  │ • Lint       │  │ • Matrix     │  │ • Escalate   │      │
│  │ • Security   │  │ • Explain    │  │              │      │
│  │ • Review     │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │     PR       │  │  JavaScript  │                         │
│  │  Generator   │  │   Sandbox    │                         │
│  │              │  │              │                         │
│  │ • Diffs      │  │ • Execute JS │                         │
│  │ • Checklist  │  │ • Validate   │                         │
│  │ • Cost       │  │ • Metrics    │                         │
│  │ • Decisions  │  │ • Diff gen   │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              EXECUTION ENGINE (Phase 2)                       │
│  (Virtual Filesystem • Git Manager • Test Runner)           │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. JavaScript Sandbox (`src/engine/sandbox/JavaScriptSandbox.ts`)

Executes JavaScript code safely in the browser using Function constructor.

**Features:**
- Real code execution with timeout protection
- Sandboxed environment (restricted globals)
- Code validation (syntax + static analysis)
- Code metrics (lines, functions, complexity)
- Diff generation between code versions

**API:**
```typescript
execute(code: string, context?: Record<string, unknown>): Promise<SandboxResult>
validate(code: string): ValidationResult
generateDiff(original: string, modified: string, filename?: string): string
```

**Example:**
```typescript
const sandbox = new JavaScriptSandbox();

// Execute code
const result = await sandbox.execute(`
  const add = (a, b) => a + b;
  console.log(add(2, 3));
  return add(10, 20);
`);
// { success: true, output: '5', returnValue: 30, logs: ['5'] }

// Validate code
const validation = sandbox.validate(`
  function test() {
    eval('dangerous');
    console.log('test');
  }
`);
// { valid: true, warnings: ['Avoid using eval()', 'Remove console.log'] }
```

### 2. Pull Request Generator (`src/engine/github/PullRequestGenerator.ts`)

Generates complete Pull Requests with all metadata.

**Features:**
- Title, description, body with checklist
- File changes with diffs
- Stats (additions, deletions, files)
- Check runs (build, test, lint, security)
- Reviews with findings
- Traceability links
- Decision records
- Risk assessment
- Cost report
- Labels (size, type, ai-generated, risk)

**API:**
```typescript
generate(input: PRInput): PullRequest
generateDiffSummary(files: FileChange[]): string
```

**Example Output:**
```markdown
## Summary

As a user, I want to filter notifications by unread status...

## Checklist

- [x] All checks passing
- [x] Code review completed
- [x] Tests written and passing
- [x] Security review completed
- [x] No breaking changes

## Changes

- **Files changed:** 3
- **Lines added:** +142
- **Lines removed:** -0
- **Commits:** 1

## Files Modified

- 🆕 `src/feature.ts` (+45/-0)
- 🆕 `src/feature.test.ts` (+38/-0)
- 🆕 `README.md` (+59/-0)

## Traceability

| Requirement | User Story | Task | Commit | Test |
|-------------|------------|------|--------|------|
| REQ-123 | US-456 | TASK-789 | `abc1234` | TEST-012 |

## Architecture Decisions

### Implementation approach

**Context:** Multiple approaches considered...

**Options:**
- **Developer Agent:** Use existing patterns
- **Architect Agent:** Create custom solution
- **Critic Agent:** Use existing patterns (simpler)

**Final decision:** Use existing patterns
**Confidence:** 85%

## Cost Report

- **Total AI cost:** €0.42
- **Total tokens:** 4,200
- **Agent execution time:** 5m
- **Estimated human effort:** 3h
- **Time saved:** 3h → 5m

---

*This PR was generated autonomously by the AI Engineering Team.*
```

### 3. Pipeline Runner (`src/engine/delivery/PipelineRunner.ts`)

Executes the complete CI/CD pipeline.

**Stages:**
1. **Build** — Compile TypeScript
2. **Test** — Run test suite
3. **Lint** — Check code quality
4. **Type Check** — Validate types
5. **Security Scan** — Check for vulnerabilities
6. **Code Review** — AI review with findings

**API:**
```typescript
run(worktreeId: string): Promise<PipelineResult>
```

**Example:**
```typescript
const runner = new PipelineRunner(executionEngine);
const result = await runner.run('wt-1');

// {
//   stages: [
//     { name: 'Build', status: 'success', duration: 234 },
//     { name: 'Test', status: 'success', duration: 567 },
//     { name: 'Lint', status: 'success', duration: 123 },
//     { name: 'Type Check', status: 'success', duration: 89 },
//     { name: 'Security Scan', status: 'success', duration: 156 },
//     { name: 'Code Review', status: 'success', duration: 234 }
//   ],
//   checks: [...],
//   reviews: [...],
//   success: true,
//   totalDuration: 1403
// }
```

### 4. Traceability Engine (`src/engine/delivery/TraceabilityEngine.ts`)

Tracks the complete chain from requirement to PR.

**Features:**
- Build traceability graph (nodes + edges)
- Trace forward: REQ → US → TASK → commit → test → PR
- Trace backward: file → commit → task → US → REQ
- Answer: "Why was this line of code introduced?"
- Generate traceability matrix
- Export reports

**API:**
```typescript
addNode(node: Omit<TraceabilityNode, 'children'>): TraceabilityNode
createLink(link: TraceabilityLink): void
traceFromRequirement(requirementId: string): TraceResult
traceToFile(fileId: string): TraceResult
explainCodeOrigin(fileId: string, line?: number): string
generateReport(): string
```

**Example:**
```typescript
const traceability = new TraceabilityEngine();

// Build graph
traceability.addNode({ id: 'REQ-001', type: 'requirement', title: 'Filter notifications' });
traceability.addNode({ id: 'US-123', type: 'user-story', title: 'As a user...', parent: 'REQ-001' });
traceability.addNode({ id: 'TASK-456', type: 'task', title: 'Implement filter', parent: 'US-123' });
traceability.addNode({ id: 'abc123', type: 'commit', title: 'feat: add filter', parent: 'TASK-456' });
traceability.addNode({ id: 'src/filter.ts', type: 'file', title: 'filter.ts', parent: 'abc123' });

// Trace forward
const forward = traceability.traceFromRequirement('REQ-001');
// { requirement, userStories: [US-123], tasks: [TASK-456], commits: [abc123], ... }

// Trace backward
const backward = traceability.traceToFile('src/filter.ts');
// { file, commits: [abc123], tasks: [TASK-456], userStories: [US-123], requirements: [REQ-001] }

// Explain origin
const explanation = traceability.explainCodeOrigin('src/filter.ts', 42);
// "Line 42 was introduced through: commit abc123 → task TASK-456 → US-123 → REQ-001"
```

### 5. Disagreement Resolver (`src/engine/delivery/DisagreementResolver.ts`)

Handles cases where agents disagree on decisions.

**Resolution Strategies:**
1. **Consensus** — All agents agree with high confidence (>80%)
2. **Lead Decision** — Lead agent makes final call
3. **Vote** — Weighted vote by confidence
4. **Human Escalation** — Escalate to human if confidence <70%

**API:**
```typescript
recordDisagreement(topic: string, context: string, positions: AgentPosition[]): Disagreement
resolve(disagreementId: string, leadAgentDecision?: string): Promise<Resolution | null>
resolveWithHuman(disagreementId: string, humanDecision: string): Resolution
generateReport(): string
```

**Example:**
```typescript
const resolver = new DisagreementResolver();

// Record disagreement
const disagreement = resolver.recordDisagreement(
  'State management approach',
  'Multiple approaches viable',
  [
    { agent: 'Mobile Dev', role: 'developer', position: 'Use XState', confidence: 0.85, reasoning: '...' },
    { agent: 'Architect', role: 'architect', position: 'Use Zustand', confidence: 0.75, reasoning: '...' },
    { agent: 'Critic', role: 'critic', position: 'Use XState', confidence: 0.9, reasoning: '...' }
  ]
);

// Resolve
const resolution = await resolver.resolve(disagreement.id);
// { method: 'vote', decision: 'Use XState', confidence: 0.83, ... }
```

### 6. Delivery Engine (`src/engine/delivery/DeliveryEngine.ts`)

Orchestrates the complete delivery from User Story to PR.

**Pipeline:**
1. Create worktree
2. Write code files
3. Build traceability graph
4. Run CI/CD pipeline
5. Commit changes
6. Generate file changes
7. Create traceability link
8. Generate cost report
9. Generate decisions
10. Generate Pull Request

**API:**
```typescript
deliver(input: DeliveryInput): Promise<DeliveryResult>
getTraceability(): TraceabilityEngine
getDisagreementResolver(): DisagreementResolver
```

**Example:**
```typescript
const engine = new DeliveryEngine();

const result = await engine.deliver({
  userStory: 'As a user, I want to filter notifications by unread status',
  requirements: ['Filter button', 'Toggle all/unread', 'Persist preference'],
  plan: 'Implementation plan',
  code: {
    'src/filter.ts': 'export class Filter { ... }',
    'src/filter.test.ts': 'describe("Filter", () => { ... })'
  }
});

// {
//   success: true,
//   pullRequest: { number: 184, title: '...', description: '...', ... },
//   pipeline: { stages: [...], success: true, ... },
//   traceability: [{ requirement: 'REQ-123', userStory: 'US-456', ... }],
//   decisions: [{ title: '...', finalDecision: '...', ... }],
//   costReport: { totalCost: 0.42, estimatedHumanEffort: '3h', ... }
// }
```

### 7. Delivery Dashboard (`src/pages/DeliveryDashboard.tsx`)

Interactive UI for end-to-end delivery.

**Features:**
- User story input
- One-click delivery
- Real-time progress
- PR visualization with all metadata
- Pipeline stages with status
- Traceability matrix
- Architecture decisions
- Cost report
- Error handling

**Usage:**
1. Navigate to "Delivery" in sidebar
2. Enter user story
3. Click "Deliver to Pull Request"
4. View generated PR with all details
5. Approve, review, or copy description

## Data Flow

```
User Story (input)
    ↓
Delivery Engine (orchestrator)
    ↓
┌─────────────────────────────────────────────────────────┐
│  1. Create Worktree                                      │
│  2. Write Code Files                                     │
│  3. Build Traceability Graph                             │
│  4. Run CI/CD Pipeline                                   │
│     ├─ Build                                             │
│     ├─ Test                                              │
│     ├─ Lint                                              │
│     ├─ Type Check                                        │
│     ├─ Security Scan                                     │
│     └─ Code Review                                       │
│  5. Commit Changes                                       │
│  6. Generate File Changes                                │
│  7. Create Traceability Link                             │
│  8. Generate Cost Report                                 │
│  9. Generate Decisions                                   │
│  10. Generate Pull Request                               │
└─────────────────────────────────────────────────────────┘
    ↓
Pull Request (output)
    ├─ Title, description, body
    ├─ File changes with diffs
    ├─ Checklist
    ├─ Stats (additions, deletions, files)
    ├─ Check runs (build, test, lint, security)
    ├─ Reviews with findings
    ├─ Traceability links
    ├─ Decision records
    ├─ Risk assessment
    └─ Cost report
```

## Example Delivery

**Input:**
```
User Story:
As a user, I want to filter notifications by unread status 
so that I can focus on important messages.

Acceptance Criteria:
- Filter button in notification list
- Toggle between all/unread
- Persist filter preference
```

**Output:**
```
Pull Request #184: feat: filter notifications by unread status

Status: approved
Files changed: 3
Lines added: +142
Commits: 1

Checks:
✓ Build (234ms)
✓ Test (567ms)
✓ Lint (123ms)
✓ Type Check (89ms)
✓ Security Scan (156ms)
✓ Code Review (234ms)

Traceability:
REQ-123 → US-456 → TASK-789 → abc1234 → TEST-012 → PR-184

Decisions:
- Implementation approach: Use existing patterns (confidence: 85%)

Cost:
- AI cost: €0.42
- Agent time: 5m
- Human effort saved: 3h

[Approve & Merge] [Review Code] [Copy PR Description]
```

## Integration with Previous Phases

### Phase 1 Integration
- Uses **Model Router** for agent execution
- Uses **Budget Engine** for cost tracking
- Uses **Context Engine** for requirement context

### Phase 2 Integration
- Uses **Execution Engine** for file operations
- Uses **Git Manager** for worktree management
- Uses **Test Runner** for test execution

### Complete Stack
```
Phase 1: Engine + UI (Groq, Model Router, Budget, Context, Agents)
Phase 2: Execution Layer (Filesystem, Git, Tests, Dashboard)
Phase 3: Delivery Pipeline (GitHub, CI/CD, Traceability, PR)
```

## Future: Real GitHub Integration

The current implementation is simulated. To integrate with real GitHub:

```typescript
// Current (Simulated)
class PullRequestGenerator {
  generate(input: PRInput): PullRequest {
    // Generate PR object in memory
  }
}

// Future (Real GitHub API)
class GitHubProvider {
  async createPullRequest(input: PRInput): Promise<PullRequest> {
    const response = await fetch('https://api.github.com/repos/owner/repo/pulls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        title: input.title,
        body: this.generateDescription(input),
        head: input.branch,
        base: input.baseBranch
      })
    });
    return response.json();
  }
}
```

## Success Metrics

**Primary KPI:**
> "How much trustworthy engineering work was completed before the human had to intervene?"

**Phase 3 Metrics:**
- ✅ User Story → PR delivery time: < 10 seconds
- ✅ PR completeness: 100% (all sections present)
- ✅ Traceability: Full chain from REQ to PR
- ✅ Cost tracking: Accurate to €0.01
- ✅ Pipeline success rate: 100% (simulated)
- ⏳ Real GitHub integration: Phase 4
- ⏳ Real code execution: Phase 4

## Next Steps

### Phase 4: Backend + Real Execution
- Node.js backend API
- Docker sandbox for real code execution
- Real filesystem operations
- Actual test execution (Jest, Vitest)
- Real git operations (simple-git)
- GitHub API integration (create real PRs)
- Persistence (database)

### Phase 5: Advanced Features
- Multi-model consensus
- Agent disagreement resolution (real)
- Learning from past executions
- Predictive cost estimation
- Automatic team optimization
- Webhook integration
- Slack/Teams notifications

## Conclusion

Phase 3 completes the autonomous delivery loop. The system can now:

1. Accept a User Story
2. Generate code
3. Run CI/CD pipeline
4. Create traceability links
5. Resolve disagreements
6. Generate a complete Pull Request

All in under 10 seconds, with full cost tracking and traceability.

The next phase will replace simulations with real execution (Docker, GitHub API, databases).
