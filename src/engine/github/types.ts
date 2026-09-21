// ============================================================
// GITHUB INTEGRATION TYPES
// ============================================================

export interface GitHubConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

export interface GitHubToken {
  accessToken: string;
  tokenType: string;
  scope: string;
  expiresAt?: string;
  refreshToken?: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatarUrl: string;
  url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
}

export interface GitHubBranch {
  name: string;
  sha: string;
  protected: boolean;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
  files?: FileChange[];
  stats?: { additions: number; deletions: number; files: number };
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  htmlUrl: string;
  diffUrl: string;
  head: {
    ref: string;
    sha: string;
    repo: GitHubRepository;
  };
  base: {
    ref: string;
    sha: string;
    repo: GitHubRepository;
  };
  user: GitHubUser;
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
  mergeable: boolean;
  mergeableState: string;
  commits: number;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  htmlUrl: string;
  user: GitHubUser;
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubWebhook {
  id: number;
  name: string;
  active: boolean;
  events: string[];
  config: {
    url: string;
    contentType: string;
    secret?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GitHubWebhookPayload {
  action: string;
  repository: GitHubRepository;
  sender: GitHubUser;
  pullRequest?: GitHubPullRequest;
  issue?: GitHubIssue;
  commit?: GitHubCommit;
}

export interface CreatePullRequestInput {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base: string;
  draft?: boolean;
  maintainerCanModify?: boolean;
}

export interface GitHubIntegrationState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: GitHubToken | null;
  repositories: GitHubRepository[];
  selectedRepository: GitHubRepository | null;
  webhooks: GitHubWebhook[];
}

// ============================================================
// DELIVERY PIPELINE TYPES
// ============================================================

export type PRStatus = 'draft' | 'open' | 'review' | 'approved' | 'changes_requested' | 'merged' | 'closed';
export type CheckStatus = 'pending' | 'success' | 'failure' | 'skipped';
export type ReviewState = 'approved' | 'changes_requested' | 'commented' | 'pending';

export interface PullRequest {
  number: number;
  title: string;
  body: string;
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

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
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
  options: Array<{ agent: string; position: string }>;
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
  breakdown: Array<{ phase: string; cost: number; tokens: number }>;
  estimatedHumanEffort: string;
  agentDuration: string;
  savings: string;
}
