import { Agent, Project, Task, Risk, PullRequest, Question, Decision, WorkRequest } from '../types';

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Smart Charging Timeline',
    description: 'Mobile energy app — EV charging scheduling with smart grid integration',
    progress: 82,
    status: 'active',
    autonomyLevel: 3,
    budget: { total: 25, spent: 18.74 },
    activeAgents: 3,
    totalTasks: 24,
    completedTasks: 19,
    risks: ['medium'],
    lastActivity: '2 min ago'
  },
  {
    id: 'proj-002',
    name: 'Notification Filtering',
    description: 'Add filtering by unread notifications in React Native app',
    progress: 100,
    status: 'completed',
    autonomyLevel: 3,
    budget: { total: 10, spent: 2.74 },
    activeAgents: 0,
    totalTasks: 8,
    completedTasks: 8,
    risks: [],
    lastActivity: '1h ago'
  },
  {
    id: 'proj-003',
    name: 'API Rate Limiter',
    description: 'Implement distributed rate limiting for public API endpoints',
    progress: 45,
    status: 'active',
    autonomyLevel: 2,
    budget: { total: 30, spent: 11.42 },
    activeAgents: 2,
    totalTasks: 16,
    completedTasks: 7,
    risks: ['high'],
    lastActivity: '5 min ago'
  },
  {
    id: 'proj-004',
    name: 'Payment Integration',
    description: 'Stripe payment flow for SaaS subscription management',
    progress: 12,
    status: 'planning',
    autonomyLevel: 1,
    budget: { total: 40, spent: 1.2 },
    activeAgents: 1,
    totalTasks: 20,
    completedTasks: 2,
    risks: ['medium', 'low'],
    lastActivity: '15 min ago'
  }
];

export const mockAgents: Agent[] = [
  {
    id: 'agent-001',
    name: 'Engineering Lead',
    role: 'Lead Agent',
    status: 'running',
    currentTask: 'Orchestrating TASK-141, TASK-142',
    avatar: '🧠',
    skills: ['orchestration', 'architecture', 'risk-assessment'],
    modelUsed: 'llama-3.3-70b',
    tokensUsed: 45200,
    cost: 0.82,
    duration: '41m'
  },
  {
    id: 'agent-002',
    name: 'Mobile Developer',
    role: 'Frontend Agent',
    status: 'running',
    currentTask: 'TASK-141: Implement charging state machine',
    avatar: '📱',
    skills: ['react-native', 'typescript', 'expo', 'state-management'],
    modelUsed: 'llama-3.3-70b',
    tokensUsed: 128400,
    cost: 4.73,
    duration: '28m'
  },
  {
    id: 'agent-003',
    name: 'Backend Developer',
    role: 'Backend Agent',
    status: 'running',
    currentTask: 'TASK-142: API validation & rate limiting',
    avatar: '⚙️',
    skills: ['node', 'nestjs', 'postgresql', 'redis'],
    modelUsed: 'llama-3.3-70b',
    tokensUsed: 96800,
    cost: 3.41,
    duration: '22m'
  },
  {
    id: 'agent-004',
    name: 'QA Engineer',
    role: 'Test Agent',
    status: 'waiting',
    currentTask: 'TASK-143: Integration tests (blocked by TASK-141)',
    avatar: '🧪',
    skills: ['jest', 'testing-library', 'e2e-testing'],
    modelUsed: 'llama-3.1-8b',
    tokensUsed: 12400,
    cost: 0.19,
    duration: '5m'
  },
  {
    id: 'agent-005',
    name: 'Code Reviewer',
    role: 'Reviewer Agent',
    status: 'idle',
    avatar: '🔍',
    skills: ['code-review', 'security-review', 'architecture-review'],
    modelUsed: 'llama-3.3-70b',
    tokensUsed: 0,
    cost: 0,
    duration: '0m'
  },
  {
    id: 'agent-006',
    name: 'Security Analyst',
    role: 'Security Agent',
    status: 'idle',
    avatar: '🛡️',
    skills: ['security-audit', 'owasp', 'dependency-scan'],
    modelUsed: 'llama-3.3-70b',
    tokensUsed: 0,
    cost: 0,
    duration: '0m'
  },
  {
    id: 'agent-007',
    name: 'Requirements Analyst',
    role: 'Requirements Agent',
    status: 'complete',
    currentTask: 'Requirements extraction complete',
    avatar: '📋',
    skills: ['requirements', 'ambiguity-detection', 'acceptance-criteria'],
    modelUsed: 'llama-3.1-8b',
    tokensUsed: 18600,
    cost: 0.31,
    duration: '3m'
  }
];

export const mockTasks: Task[] = [
  { id: 'TASK-141', title: 'Implement charging state machine', status: 'in_progress', assignedTo: 'Mobile Developer', priority: 'medium', estimate: '4h', actual: '3h 20m' },
  { id: 'TASK-142', title: 'API validation & rate limiting', status: 'in_progress', assignedTo: 'Backend Developer', priority: 'medium', estimate: '3h', actual: '2h 15m' },
  { id: 'TASK-143', title: 'Write integration tests', status: 'pending', assignedTo: 'QA Engineer', priority: 'medium', estimate: '2h', dependencies: ['TASK-141', 'TASK-142'] },
  { id: 'TASK-144', title: 'Update charging timeline UI', status: 'done', assignedTo: 'Mobile Developer', priority: 'low', estimate: '2h', actual: '1h 45m' },
  { id: 'TASK-145', title: 'Database schema for charging sessions', status: 'done', assignedTo: 'Backend Developer', priority: 'high', estimate: '1h', actual: '52m' },
  { id: 'TASK-146', title: 'WebSocket for real-time updates', status: 'review', assignedTo: 'Backend Developer', priority: 'medium', estimate: '3h', actual: '2h 40m' },
  { id: 'TASK-147', title: 'Error handling & retry logic', status: 'in_progress', assignedTo: 'Mobile Developer', priority: 'high', estimate: '2h', actual: '1h 10m' },
  { id: 'TASK-148', title: 'Security review of API endpoints', status: 'pending', assignedTo: 'Security Analyst', priority: 'high', estimate: '1h', dependencies: ['TASK-142'] },
];

export const mockRisks: Risk[] = [
  {
    id: 'risk-001',
    category: 'technical',
    description: 'WebSocket connection may drop on poor mobile networks, causing state desync',
    probability: 0.6,
    impact: 0.7,
    severity: 'medium',
    mitigation: 'Implement optimistic updates with server reconciliation',
    status: 'open'
  },
  {
    id: 'risk-002',
    category: 'architecture',
    description: 'State machine complexity may exceed initial estimate if edge cases discovered',
    probability: 0.4,
    impact: 0.5,
    severity: 'low',
    mitigation: 'Lead Agent monitoring complexity metrics; escalation threshold set',
    status: 'mitigated'
  },
  {
    id: 'risk-003',
    category: 'integration',
    description: 'Smart grid API rate limits may affect real-time scheduling accuracy',
    probability: 0.3,
    impact: 0.8,
    severity: 'medium',
    mitigation: 'Implement request batching and local caching layer',
    status: 'open'
  }
];

export const mockPR: PullRequest = {
  id: 'pr-001',
  number: 184,
  title: 'US-124: Smart Charging Timeline',
  status: 'ready',
  filesChanged: 12,
  linesAdded: 684,
  linesRemoved: 91,
  testsPassing: 38,
  testsTotal: 38,
  agentCost: 2.74,
  estimatedHumanEffort: '8–12h',
  agentDuration: '41 minutes',
  risk: 'low',
  decisionsRequiringAttention: 2,
  knownLimitations: 1
};

export const mockQuestions: Question[] = [
  {
    id: 'q-001',
    priority: 'blocking',
    text: 'US-124 does not specify whether charging should continue when the device loses connectivity.',
    context: 'Searched: User Story, Architecture decisions, Repository, Related tickets — no answer found.',
    options: ['Continue charging (optimistic)', 'Stop charging (safe)', 'Server decides (recommended)'],
    recommendation: 'Server decides — maintains data integrity',
    confidence: 61,
    status: 'open'
  },
  {
    id: 'q-002',
    priority: 'important',
    text: 'Should the charging timeline support recurring schedules (e.g., "every weekday at 22:00")?',
    context: 'Found partial reference in US-098 but scope was different.',
    options: ['Yes — full recurrence support', 'No — one-time only for now', 'Deferred to next sprint'],
    recommendation: 'Deferred — keeps scope manageable',
    confidence: 78,
    status: 'answered'
  }
];

export const mockDecisions: Decision[] = [
  {
    id: 'dec-001',
    title: 'State management approach for charging timeline',
    context: 'Multiple approaches viable for complex state machine',
    agents: [
      { name: 'Mobile Developer', position: 'Use XState for formal state machine' },
      { name: 'Architecture Agent', position: 'XState adds complexity; use Zustand with patterns' },
      { name: 'Critic Agent', position: 'XState justified — state transitions are complex and testable' }
    ],
    finalDecision: 'Use XState — complexity justified by testability and formal verification',
    confidence: 89,
    requiresApproval: false,
    status: 'decided'
  },
  {
    id: 'dec-002',
    title: 'Database choice for charging session history',
    context: 'Need time-series data with query flexibility',
    agents: [
      { name: 'Backend Developer', position: 'PostgreSQL with TimescaleDB extension' },
      { name: 'Database Agent', position: 'TimescaleDB adds operational overhead' },
      { name: 'Architecture Agent', position: 'Start with PostgreSQL, migrate if needed' }
    ],
    finalDecision: 'PostgreSQL with partitioned tables — simpler initially, can extend later',
    confidence: 74,
    requiresApproval: false,
    status: 'decided'
  },
  {
    id: 'dec-003',
    title: 'Offline-first vs online-first for charging control',
    context: 'Affects architecture significantly — needs human input on product requirements',
    agents: [
      { name: 'Mobile Developer', position: 'Offline-first — better UX on poor networks' },
      { name: 'Security Agent', position: 'Online-first — prevents unauthorized charging' },
      { name: 'Risk Agent', position: 'Escalate — this is a product decision with safety implications' }
    ],
    finalDecision: 'Pending human decision',
    confidence: 42,
    requiresApproval: true,
    status: 'escalated'
  }
];

export const mockWorkRequests: WorkRequest[] = [
  { id: 'wr-001', title: 'US-124: Smart Charging Timeline', source: 'Jira', status: 'implementing', project: 'Smart Charging Timeline', createdAt: '2h ago' },
  { id: 'wr-002', title: 'BUG-89: Notification badge not updating', source: 'GitHub Issue', status: 'review', project: 'Notification Filtering', createdAt: '3h ago' },
  { id: 'wr-003', title: 'Implement distributed rate limiter', source: 'User Request', status: 'implementing', project: 'API Rate Limiter', createdAt: '45m ago' },
  { id: 'wr-004', title: 'Stripe subscription flow', source: 'Requirements Doc', status: 'planning', project: 'Payment Integration', createdAt: '15m ago' },
  { id: 'wr-005', title: 'React Native + Supabase app', source: 'Freelance Opportunity', status: 'intake', project: 'New', createdAt: '5m ago' },
];

export const mockActivityLog = [
  { time: '2m ago', agent: 'Mobile Developer', event: 'Committed: feat: implement charging state transitions', type: 'code' },
  { time: '5m ago', agent: 'Backend Developer', event: 'Tests passing: 12/12 for TASK-142', type: 'test' },
  { time: '8m ago', agent: 'Engineering Lead', event: 'Reassigned TASK-147 due to complexity increase', type: 'decision' },
  { time: '12m ago', agent: 'Mobile Developer', event: 'Fixed: state machine edge case in idle→charging transition', type: 'code' },
  { time: '15m ago', agent: 'QA Engineer', event: 'Waiting for TASK-141 completion to begin integration tests', type: 'status' },
  { time: '18m ago', agent: 'Backend Developer', event: 'Created branch: feature/TASK-142-rate-limiting', type: 'git' },
  { time: '22m ago', agent: 'Engineering Lead', event: 'Budget check: €18.74 / €25.00 — on track', type: 'system' },
  { time: '25m ago', agent: 'Requirements Analyst', event: 'Completed requirements extraction — 6 requirements, 2 assumptions', type: 'analysis' },
  { time: '30m ago', agent: 'Engineering Lead', event: 'Team assembled: Lead, Mobile Dev, Backend Dev, QA, Reviewer', type: 'system' },
  { time: '35m ago', agent: 'Engineering Lead', event: 'Architecture approved — XState + PostgreSQL + WebSocket', type: 'decision' },
];

export const mockCostBreakdown = [
  { phase: 'Requirements', cost: 0.31, percentage: 2 },
  { phase: 'Architecture', cost: 0.82, percentage: 4 },
  { phase: 'Planning', cost: 0.19, percentage: 1 },
  { phase: 'Implementation', cost: 8.73, percentage: 47 },
  { phase: 'Tests', cost: 0.71, percentage: 4 },
  { phase: 'Review', cost: 0.66, percentage: 4 },
  { phase: 'Overhead', cost: 7.32, percentage: 38 },
];

export const mockModelCalls = [
  { provider: 'Groq', model: 'llama-3.3-70b', inputTokens: 45200, outputTokens: 12800, cost: 0.82, agent: 'Engineering Lead', task: 'Orchestration', timestamp: '2m ago' },
  { provider: 'Groq', model: 'llama-3.3-70b', inputTokens: 89400, outputTokens: 39000, cost: 3.41, agent: 'Backend Developer', task: 'TASK-142', timestamp: '5m ago' },
  { provider: 'Groq', model: 'llama-3.3-70b', inputTokens: 96200, outputTokens: 32200, cost: 4.73, agent: 'Mobile Developer', task: 'TASK-141', timestamp: '8m ago' },
  { provider: 'Groq', model: 'llama-3.1-8b', inputTokens: 12400, outputTokens: 3200, cost: 0.19, agent: 'QA Engineer', task: 'Test planning', timestamp: '15m ago' },
  { provider: 'Groq', model: 'llama-3.1-8b', inputTokens: 18600, outputTokens: 5400, cost: 0.31, agent: 'Requirements Analyst', task: 'Analysis', timestamp: '25m ago' },
];
