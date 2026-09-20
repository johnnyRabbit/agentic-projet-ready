// ============================================================
// GITHUB INTEGRATION — Types
// ============================================================
// Defines GitHub entities. Provider is currently simulated but
// interface is ready for real GitHub API integration.

export type PRStatus = 'draft' | 'open' | 'review' | 'approved' | 'changes_requested' | 'merged' | 'closed';
export type CheckStatus = 'pending' | 'success' | 'failure' | 'skipped';
export type ReviewState = 'approved' | 'changes_requested' | 'commented' | 'pending';

export interface GitHubBranch {
  name: string;
  sha: string;
  protected: boolean;
  ahead: number;
  behind: number;
  lastCommit?: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  files: FileChange[];
  stats: { additions: number; deletions: number; files: number };
}

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
}

export interface PullRequest {
  number: number;
  title: string;
  description: string;
  status: PRStatus;
  author: string;
  branch: string;
  baseBranch: string;
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
  commits: GitHubCommit[];
  files: FileChange[];
  stats: { additions: number; deletions: number; files: number };
  checks: CheckRun[];
  reviews: Review[];
  labels: string[];
  linkedIssues: string[];
  traceability: TraceabilityLink[];
  decisions: DecisionRecord[];
  risks: RiskRecord[];
  costReport: CostReport;
}

export interface CheckRun {
  name: string;
  status: CheckStatus;
  duration?: number;
  output?: string;
  details?: string;
}

export interface Review {
  id: string;
  reviewer: string;
  state: ReviewState;
  body: string;
  submittedAt: string;
  findings: ReviewFinding[];
}

export interface ReviewFinding {
  severity: 'critical' | 'warning' | 'info' | 'suggestion';
  file: string;
  line?: number;
  message: string;
  resolved: boolean;
}

export interface TraceabilityLink {
  requirement: string;
  userStory: string;
  task: string;
  commit: string;
  test: string;
  pr: string;
}

export interface DecisionRecord {
  id: string;
  title: string;
  context: string;
  options: { agent: string; position: string }[];
  finalDecision: string;
  confidence: number;
  decidedBy: 'agent' | 'human';
  timestamp: string;
}

export interface RiskRecord {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  status: 'open' | 'mitigated' | 'accepted';
}

export interface CostReport {
  totalCost: number;
  totalTokens: number;
  breakdown: { phase: string; cost: number; tokens: number }[];
  estimatedHumanEffort: string;
  agentDuration: string;
  savings: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  labels: string[];
  status: 'open' | 'closed';
  linkedPR?: number;
}
