// ============================================================
// AI ENGINEERING TEAM — CORE ENGINE TYPES
// ============================================================

// --- Model Provider ---
export type ModelCapability = 
  | 'fast'           // Quick responses, low cost
  | 'reasoning'      // Complex analysis
  | 'code-generation' // Code writing
  | 'code-review'    // Code analysis
  | 'planning'       // Task decomposition
  | 'creative';      // Creative solutions

export interface ModelRequest {
  taskType: ModelCapability;
  complexity: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  budget: 'minimal' | 'standard' | 'premium';
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  agentId: string;
  taskId?: string;
  context?: Record<string, unknown>;
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

// --- Model Provider Interface ---
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

// --- Agent System ---
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
  | 'risk';

export type AgentStatus = 'idle' | 'running' | 'waiting' | 'blocked' | 'complete' | 'failed' | 'escalated';

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

// --- Budget Engine ---
export interface Budget {
  id: string;
  scope: 'organization' | 'project' | 'task' | 'agent';
  parentId?: string;
  limit: number;
  spent: number;
  currency: string;
  alerts: BudgetAlert[];
}

export interface BudgetAlert {
  threshold: number; // percentage
  triggered: boolean;
  message: string;
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

// --- Context Engine ---
export type ContextType = 
  | 'requirements'
  | 'architecture'
  | 'task'
  | 'code'
  | 'test'
  | 'decision'
  | 'risk';

export type InformationType = 'fact' | 'requirement' | 'assumption' | 'inference' | 'decision' | 'recommendation';

export interface ContextPack {
  id: string;
  type: ContextType;
  content: string;
  source: string;
  informationType: InformationType;
  relevance: number; // 0-1
  tokens: number;
  timestamp: string;
}

// --- Workflow Engine ---
export type WorkflowStatus = 'pending' | 'running' | 'paused' | 'complete' | 'failed' | 'cancelled';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
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

// --- Risk Engine ---
export interface Risk {
  id: string;
  category: 'requirements' | 'technical' | 'architecture' | 'security' | 'dependency' | 'integration' | 'schedule' | 'budget' | 'ai' | 'operational';
  description: string;
  probability: number;
  impact: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  status: 'open' | 'mitigated' | 'accepted' | 'closed';
  source: string;
  detectedAt: string;
}

// --- Agent Breaker (Circuit Breaker) ---
export interface CircuitBreakerState {
  agentId: string;
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailure?: string;
  resetTimeout: number;
  reason?: string;
}

// --- Approval Engine ---
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

// --- Project ---
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

// --- Work Request ---
export interface WorkRequest {
  id: string;
  title: string;
  source: string;
  content: string;
  status: 'intake' | 'analyzing' | 'planning' | 'implementing' | 'review' | 'delivered';
  projectId: string;
  createdAt: string;
}

// --- Engine Event ---
export interface EngineEvent {
  id: string;
  type: string;
  timestamp: string;
  agentId?: string;
  taskId?: string;
  projectId: string;
  data: Record<string, unknown>;
}
