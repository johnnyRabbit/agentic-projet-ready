export type AgentStatus = 'idle' | 'running' | 'waiting' | 'blocked' | 'complete' | 'failed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'done' | 'blocked';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';
export type AutonomyLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type QuestionPriority = 'blocking' | 'important' | 'optional';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask?: string;
  avatar: string;
  skills: string[];
  modelUsed?: string;
  tokensUsed: number;
  cost: number;
  duration?: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignedTo: string;
  priority: RiskLevel;
  estimate: string;
  actual?: string;
  dependencies?: string[];
}

export interface Risk {
  id: string;
  category: string;
  description: string;
  probability: number;
  impact: number;
  severity: RiskLevel;
  mitigation: string;
  status: 'open' | 'mitigated' | 'accepted' | 'closed';
}

export interface Cost {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  agent: string;
  task: string;
  timestamp: string;
}

export interface Question {
  id: string;
  priority: QuestionPriority;
  text: string;
  context: string;
  options: string[];
  recommendation?: string;
  confidence: number;
  status: 'open' | 'answered' | 'dismissed';
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  agents: { name: string; position: string }[];
  finalDecision: string;
  confidence: number;
  requiresApproval: boolean;
  status: 'proposed' | 'decided' | 'escalated' | 'approved';
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  status: 'ready' | 'review' | 'changes_requested' | 'approved' | 'merged';
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  testsPassing: number;
  testsTotal: number;
  agentCost: number;
  estimatedHumanEffort: string;
  agentDuration: string;
  risk: RiskLevel;
  decisionsRequiringAttention: number;
  knownLimitations: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: 'active' | 'paused' | 'completed' | 'planning';
  autonomyLevel: AutonomyLevel;
  budget: { total: number; spent: number };
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  risks: RiskLevel[];
  lastActivity: string;
}

export interface WorkRequest {
  id: string;
  title: string;
  source: string;
  status: 'intake' | 'analyzing' | 'planning' | 'implementing' | 'review' | 'delivered';
  project: string;
  createdAt: string;
  assignee?: string;
}
