// ============================================================
// DELIVERY ENGINE — End-to-End Delivery Orchestrator
// ============================================================
// Orchestrates the complete delivery from User Story to PR:
// Requirements → Plan → Implement → Test → Review → PR

import { ExecutionEngine } from '../execution/ExecutionEngine';
import { PipelineRunner, PipelineResult } from './PipelineRunner';
import { TraceabilityEngine } from './TraceabilityEngine';
import { DisagreementResolver, Disagreement } from './DisagreementResolver';
import { PullRequestGenerator } from '../github/PullRequestGenerator';
import { PullRequest, GitHubCommit, FileChange, CostReport, DecisionRecord, RiskRecord, TraceabilityLink } from '../github/types';

export interface DeliveryInput {
  userStory: string;
  requirements: string[];
  plan: string;
  code: Record<string, string>; // path -> content
  repository?: string;
}

export interface DeliveryResult {
  success: boolean;
  pullRequest?: PullRequest;
  pipeline?: PipelineResult;
  traceability: TraceabilityLink[];
  decisions: DecisionRecord[];
  disagreements: Disagreement[];
  costReport: CostReport;
  errors: string[];
  duration: number;
}

export class DeliveryEngine {
  private executionEngine: ExecutionEngine;
  private pipelineRunner: PipelineRunner;
  private traceability: TraceabilityEngine;
  private disagreementResolver: DisagreementResolver;
  private prGenerator: PullRequestGenerator;

  constructor() {
    this.executionEngine = new ExecutionEngine();
    this.pipelineRunner = new PipelineRunner(this.executionEngine);
    this.traceability = new TraceabilityEngine();
    this.disagreementResolver = new DisagreementResolver();
    this.prGenerator = new PullRequestGenerator();
  }

  /**
   * Execute complete delivery pipeline
   */
  async deliver(input: DeliveryInput): Promise<DeliveryResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const decisions: DecisionRecord[] = [];
    const traceabilityLinks: TraceabilityLink[] = [];

    try {
      // Step 1: Create worktree
      const worktreeId = `delivery-${Date.now()}`;
      const branchName = `feature/${worktreeId}`;
      await this.executionEngine.createWorktree(worktreeId, 'main', branchName);

      // Step 2: Write code files
      for (const [path, content] of Object.entries(input.code)) {
        await this.executionEngine.writeFile(worktreeId, path, content);
      }

      // Step 3: Build traceability graph
      const reqId = `REQ-${Math.floor(Math.random() * 1000)}`;
      const usId = `US-${Math.floor(Math.random() * 1000)}`;
      const taskId = `TASK-${Math.floor(Math.random() * 1000)}`;

      this.traceability.addNode({
        id: reqId,
        type: 'requirement',
        title: input.requirements[0] || 'Requirement',
        content: input.requirements.join('\n')
      });

      this.traceability.addNode({
        id: usId,
        type: 'user-story',
        title: input.userStory.substring(0, 100),
        content: input.userStory,
        parent: reqId
      });

      this.traceability.addNode({
        id: taskId,
        type: 'task',
        title: 'Implement feature',
        parent: usId
      });

      // Step 4: Run CI/CD pipeline
      const pipelineResult = await this.pipelineRunner.run(worktreeId);

      if (!pipelineResult.success) {
        errors.push('Pipeline failed — some checks did not pass');
      }

      // Step 5: Commit changes
      const commitMessage = `feat: implement ${input.userStory.substring(0, 50)}`;
      const commit = await this.executionEngine.commit(worktreeId, commitMessage, 'AI Developer Agent');

      // Add commit to traceability
      this.traceability.addNode({
        id: commit.hash,
        type: 'commit',
        title: commit.message,
        parent: taskId
      });

      // Step 6: Generate file changes
      const files = await this.executionEngine.listFiles(worktreeId);
      const fileChanges: FileChange[] = [];

      for (const file of files) {
        const content = await this.executionEngine.readFile(worktreeId, file);
        const lines = content.split('\n').length;
        
        fileChanges.push({
          path: file,
          status: 'added',
          additions: lines,
          deletions: 0,
          patch: this.generatePatch(content)
        });

        // Add file to traceability
        this.traceability.addNode({
          id: file,
          type: 'file',
          title: file,
          parent: commit.hash
        });
      }

      // Step 7: Create traceability link
      const traceLink: TraceabilityLink = {
        requirement: reqId,
        userStory: usId,
        task: taskId,
        commit: commit.hash,
        test: `TEST-${Math.floor(Math.random() * 1000)}`,
        pr: `PR-${this.prGenerator['prCounter']}`
      };
      traceabilityLinks.push(traceLink);
      this.traceability.createLink(traceLink);

      // Step 8: Generate cost report
      const costReport = this.generateCostReport(input.code, pipelineResult);

      // Step 9: Generate decisions (simulated)
      const decision = this.generateDecision(input);
      decisions.push(decision);

      // Step 10: Generate PR
      const githubCommit: GitHubCommit = {
        sha: commit.hash,
        message: commit.message,
        author: {
          name: commit.author,
          email: 'ai-team@example.com',
          date: commit.timestamp
        },
        url: `https://github.com/example/repo/commit/${commit.hash}`,
        files: fileChanges,
        stats: {
          additions: fileChanges.reduce((sum, f) => sum + f.additions, 0),
          deletions: 0,
          files: fileChanges.length
        }
      };

      const pullRequest = this.prGenerator.generate({
        title: `feat: ${input.userStory.substring(0, 60)}`,
        description: input.userStory,
        branch: branchName,
        baseBranch: 'main',
        author: 'AI Engineering Team',
        commits: [githubCommit],
        files: fileChanges,
        checks: pipelineResult.checks,
        reviews: pipelineResult.reviews,
        traceability: traceabilityLinks,
        decisions,
        risks: [],
        costReport
      });

      return {
        success: pipelineResult.success,
        pullRequest,
        pipeline: pipelineResult,
        traceability: traceabilityLinks,
        decisions,
        disagreements: this.disagreementResolver.getAll(),
        costReport,
        errors,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        traceability: traceabilityLinks,
        decisions,
        disagreements: this.disagreementResolver.getAll(),
        costReport: this.generateCostReport(input.code, undefined),
        errors: [error instanceof Error ? error.message : String(error)],
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Get traceability engine instance
   */
  getTraceability(): TraceabilityEngine {
    return this.traceability;
  }

  /**
   * Get disagreement resolver instance
   */
  getDisagreementResolver(): DisagreementResolver {
    return this.disagreementResolver;
  }

  // --- Private helpers ---

  private generatePatch(content: string): string {
    const lines = content.split('\n');
    let patch = '';
    
    lines.forEach((line, i) => {
      patch += `+${line}\n`;
    });

    return patch;
  }

  private generateCostReport(code: Record<string, string>, pipeline?: PipelineResult): CostReport {
    const totalLines = Object.values(code).reduce((sum, c) => sum + c.split('\n').length, 0);
    const totalTokens = totalLines * 10; // Rough estimate
    const totalCost = totalTokens * 0.0001; // €0.0001 per token

    const breakdown = [
      { phase: 'Requirements', cost: totalCost * 0.1, tokens: totalTokens * 0.1 },
      { phase: 'Planning', cost: totalCost * 0.15, tokens: totalTokens * 0.15 },
      { phase: 'Implementation', cost: totalCost * 0.4, tokens: totalTokens * 0.4 },
      { phase: 'Testing', cost: totalCost * 0.15, tokens: totalTokens * 0.15 },
      { phase: 'Review', cost: totalCost * 0.1, tokens: totalTokens * 0.1 },
      { phase: 'Pipeline', cost: totalCost * 0.1, tokens: totalTokens * 0.1 }
    ];

    const estimatedHumanHours = Math.ceil(totalLines / 50); // ~50 lines per hour
    const agentMinutes = pipeline ? Math.ceil(pipeline.totalDuration / 60000) : 5;

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      totalTokens: Math.round(totalTokens),
      breakdown,
      estimatedHumanEffort: `${estimatedHumanHours}h`,
      agentDuration: `${agentMinutes}m`,
      savings: `${estimatedHumanHours}h → ${agentMinutes}m`
    };
  }

  private generateDecision(input: DeliveryInput): DecisionRecord {
    return {
      id: `decision-${Date.now()}`,
      title: 'Implementation approach',
      context: 'Multiple approaches considered for implementing the feature',
      options: [
        { agent: 'Developer Agent', position: 'Use existing patterns and libraries' },
        { agent: 'Architect Agent', position: 'Create custom solution for better control' },
        { agent: 'Critic Agent', position: 'Use existing patterns — simpler and proven' }
      ],
      finalDecision: 'Use existing patterns and libraries for simplicity and maintainability',
      confidence: 0.85,
      decidedBy: 'agent',
      timestamp: new Date().toISOString()
    };
  }
}
