// ============================================================
// CORE TYPES — AI Engineering Team Engine
// ============================================================

export type AgentRole =
  | 'lead'
  | 'requirements'
  | 'planner'
  | 'developer'
  | 'reviewer'
  | 'tester'
  | 'security'
  | 'critic'
  | 'debugger'
  | 'architect'
  | 'estimator'
  | 'risk'
  | 'data-analyst'
  | 'ui-ux-designer'
  | 'documentation-writer'
  | 'devops-engineer'
  | 'mobile-specialist'
  | 'database-specialist'
  | 'api-designer'
  | 'performance-engineer';

export type AgentStatus =
  'idle' | 'running' | 'waiting' | 'blocked' | 'complete' | 'failed' | 'escalated';

export type ModelCapability =
  'fast' | 'reasoning' | 'code-generation' | 'code-review' | 'planning' | 'creative';

export interface ModelRequest {
  /** Real requests must never fall back to demonstration data. */
  executionMode?: 'real' | 'demo';
  taskType: ModelCapability;
  complexity: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  budget: 'minimal' | 'standard' | 'premium';
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  agentId: string;
  taskId?: string;
}

export interface ModelResponse {
  content: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  latency: number;
  cost: number;
  timestamp: string;
  finishReason: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelProvider {
  name: string;
  execute(request: ModelRequest): Promise<ModelResponse>;
  isAvailable(): Promise<boolean>;
  getModels(): ModelInfo[];
}

export interface ModelInfo {
  id: string;
  name: string;
  capability: ModelCapability[];
  inputCostPer1k: number;
  outputCostPer1k: number;
  maxContext: number;
  speed: 'fast' | 'medium' | 'slow';
}

export interface AgentDefinition {
  id: string;
  role: AgentRole;
  name: string;
  description: string;
  skills: string[];
  preferredModel: ModelCapability;
  systemPrompt: string;
  maxRetries: number;
  maxBudget: number;
}

export interface AgentRun {
  id: string;
  agentId: string;
  agentRole: AgentRole;
  taskId: string;
  projectId: string;
  status: AgentStatus;
  startedAt: string;
  completedAt?: string;
  input: string;
  output?: string;
  modelCalls: ModelResponse[];
  totalCost: number;
  totalTokens: number;
  retries: number;
  errors: AgentError[];
  artifacts: AgentArtifact[];
  confidence?: number;
}

export interface AgentError {
  timestamp: string;
  message: string;
  type: 'model' | 'tool' | 'validation' | 'budget' | 'timeout' | 'circuit_breaker';
  recoverable: boolean;
}

export interface AgentArtifact {
  type: 'code' | 'test' | 'review' | 'plan' | 'requirements' | 'decision' | 'risk';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface Budget {
  id: string;
  /** Entity constrained by this budget; omitted means a shared limit for its scope. */
  entityId?: string;
  scope: 'organization' | 'project' | 'task' | 'agent';
  parentId?: string;
  limit: number;
  spent: number;
  currency: string;
  alerts: BudgetAlert[];
}

export interface CostRecord {
  id: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  cost: number;
  agentId: string;
  agentRole: AgentRole;
  taskId?: string;
  projectId: string;
  timestamp: string;
  latency: number;
}

export interface ContextPack {
  id: string;
  type: 'requirements' | 'architecture' | 'task' | 'code' | 'test' | 'decision' | 'risk';
  content: string;
  source: string;
  informationType:
    'fact' | 'requirement' | 'assumption' | 'inference' | 'decision' | 'recommendation';
  relevance: number;
  tokens: number;
  timestamp: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'pending' | 'running' | 'paused' | 'complete' | 'failed' | 'cancelled';
  currentStep?: number;
  projectId: string;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentRole: AgentRole;
  status: 'pending' | 'running' | 'complete' | 'failed' | 'skipped';
  input?: string;
  output?: string;
  dependsOn?: string[];
  startedAt?: string;
  completedAt?: string;
}

export interface Risk {
  id: string;
  category:
    | 'requirements'
    | 'technical'
    | 'architecture'
    | 'security'
    | 'dependency'
    | 'integration'
    | 'schedule'
    | 'budget'
    | 'ai'
    | 'operational';
  description: string;
  probability: number;
  impact: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  status: 'open' | 'mitigated' | 'accepted' | 'closed';
  source: string;
  detectedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  autonomyLevel: 0 | 1 | 2 | 3 | 4 | 5;
  budget: Budget;
  risks: Risk[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAlert {
  threshold: number;
  triggered: boolean;
  message: string;
}

export type ContextType =
  'requirements' | 'architecture' | 'task' | 'code' | 'test' | 'decision' | 'risk';
export type InformationType =
  'fact' | 'requirement' | 'assumption' | 'inference' | 'decision' | 'recommendation';

export interface CircuitBreakerState {
  agentId: string;
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailure?: string;
  resetTimeout: number;
  reason?: string;
}

export type ApprovalLevel = 'auto' | 'lead' | 'human';

export interface ApprovalRequest {
  id: string;
  type: 'architecture' | 'budget' | 'scope' | 'security' | 'merge' | 'deployment' | 'question';
  title: string;
  description: string;
  context: string;
  level: ApprovalLevel;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  requestedBy: string;
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface EngineEvent {
  id: string;
  type: string;
  timestamp: string;
  agentId?: string;
  taskId?: string;
  projectId: string;
  data: Record<string, unknown>;
}
