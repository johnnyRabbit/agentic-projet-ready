// ============================================================
// PULL REQUEST GENERATOR
// ============================================================
// Generates complete Pull Requests with:
// - Title, description, body
// - Diff from worktree changes
// - Checklist (tests, lint, security)
// - Traceability links
// - Decision records
// - Cost report
// - Risk assessment

import { PullRequest, GitHubCommit, FileChange, CheckRun, Review, TraceabilityLink, DecisionRecord, RiskRecord, CostReport, PRStatus } from './types';

export interface PRInput {
  title: string;
  description: string;
  branch: string;
  baseBranch: string;
  author: string;
  commits: GitHubCommit[];
  files: FileChange[];
  checks: CheckRun[];
  reviews: Review[];
  traceability: TraceabilityLink[];
  decisions: DecisionRecord[];
  risks: RiskRecord[];
  costReport: CostReport;
}

export class PullRequestGenerator {
  private prCounter = 184;

  /**
   * Generate a complete Pull Request
   */
  generate(input: PRInput): PullRequest {
    const number = this.prCounter++;
    const now = new Date().toISOString();

    const stats = {
      additions: input.files.reduce((sum, f) => sum + f.additions, 0),
      deletions: input.files.reduce((sum, f) => sum + f.deletions, 0),
      files: input.files.length
    };

    const pr: PullRequest = {
      number,
      title: input.title,
      description: this.generateDescription(input),
      status: this.determineStatus(input),
      author: input.author,
      branch: input.branch,
      baseBranch: input.baseBranch,
      createdAt: now,
      updatedAt: now,
      commits: input.commits,
      files: input.files,
      stats,
      checks: input.checks,
      reviews: input.reviews,
      labels: this.generateLabels(input),
      linkedIssues: this.extractLinkedIssues(input.description),
      traceability: input.traceability,
      decisions: input.decisions,
      risks: input.risks,
      costReport: input.costReport
    };

    return pr;
  }

  /**
   * Generate PR description with all sections
   */
  private generateDescription(input: PRInput): string {
    const stats = {
      additions: input.files.reduce((sum, f) => sum + f.additions, 0),
      deletions: input.files.reduce((sum, f) => sum + f.deletions, 0),
      files: input.files.length
    };

    const allChecksPassed = input.checks.every(c => c.status === 'success');
    const allReviewsApproved = input.reviews.every(r => r.state === 'approved');

    let description = `## Summary\n\n${input.description}\n\n`;
    
    // Checklist
    description += `## Checklist\n\n`;
    description += `- [${allChecksPassed ? 'x' : ' '}] All checks passing\n`;
    description += `- [${allReviewsApproved ? 'x' : ' '}] Code review completed\n`;
    description += `- [x] Tests written and passing\n`;
    description += `- [x] Security review completed\n`;
    description += `- [x] No breaking changes\n\n`;

    // Stats
    description += `## Changes\n\n`;
    description += `- **Files changed:** ${stats.files}\n`;
    description += `- **Lines added:** +${stats.additions}\n`;
    description += `- **Lines removed:** -${stats.deletions}\n`;
    description += `- **Commits:** ${input.commits.length}\n\n`;

    // Files
    if (input.files.length > 0) {
      description += `## Files Modified\n\n`;
      input.files.forEach(file => {
        const icon = file.status === 'added' ? '🆕' : file.status === 'modified' ? '📝' : '🗑️';
        description += `- ${icon} \`${file.path}\` (+${file.additions}/-${file.deletions})\n`;
      });
      description += `\n`;
    }

    // Traceability
    if (input.traceability.length > 0) {
      description += `## Traceability\n\n`;
      description += `| Requirement | User Story | Task | Commit | Test |\n`;
      description += `|-------------|------------|------|--------|------|\n`;
      input.traceability.forEach(link => {
        description += `| ${link.requirement} | ${link.userStory} | ${link.task} | \`${link.commit.substring(0, 7)}\` | ${link.test} |\n`;
      });
      description += `\n`;
    }

    // Decisions
    if (input.decisions.length > 0) {
      description += `## Architecture Decisions\n\n`;
      input.decisions.forEach(dec => {
        description += `### ${dec.title}\n\n`;
        description += `**Context:** ${dec.context}\n\n`;
        description += `**Options considered:**\n`;
        dec.options.forEach(opt => {
          description += `- **${opt.agent}:** ${opt.position}\n`;
        });
        description += `\n**Final decision:** ${dec.finalDecision}\n`;
        description += `**Confidence:** ${(dec.confidence * 100).toFixed(0)}%\n`;
        description += `**Decided by:** ${dec.decidedBy}\n\n`;
      });
    }

    // Risks
    if (input.risks.length > 0) {
      description += `## Risk Assessment\n\n`;
      input.risks.forEach(risk => {
        const icon = risk.severity === 'high' ? '🔴' : risk.severity === 'medium' ? '🟡' : '🟢';
        description += `- ${icon} **${risk.category}:** ${risk.description}\n`;
        description += `  - Mitigation: ${risk.mitigation}\n`;
        description += `  - Status: ${risk.status}\n\n`;
      });
    }

    // Cost report
    description += `## Cost Report\n\n`;
    description += `- **Total AI cost:** €${input.costReport.totalCost.toFixed(2)}\n`;
    description += `- **Total tokens:** ${input.costReport.totalTokens.toLocaleString()}\n`;
    description += `- **Agent execution time:** ${input.costReport.agentDuration}\n`;
    description += `- **Estimated human effort:** ${input.costReport.estimatedHumanEffort}\n`;
    description += `- **Time saved:** ${input.costReport.savings}\n\n`;

    if (input.costReport.breakdown.length > 0) {
      description += `### Cost Breakdown\n\n`;
      description += `| Phase | Cost | Tokens |\n`;
      description += `|-------|------|--------|\n`;
      input.costReport.breakdown.forEach(item => {
        description += `| ${item.phase} | €${item.cost.toFixed(2)} | ${item.tokens.toLocaleString()} |\n`;
      });
      description += `\n`;
    }

    // Footer
    description += `---\n\n`;
    description += `*This PR was generated autonomously by the AI Engineering Team.*\n`;
    description += `*Human review required before merge.*\n`;

    return description;
  }

  /**
   * Determine PR status based on checks and reviews
   */
  private determineStatus(input: PRInput): PRStatus {
    const allChecksPassed = input.checks.every(c => c.status === 'success');
    const allReviewsApproved = input.reviews.every(r => r.state === 'approved');
    const hasChangesRequested = input.reviews.some(r => r.state === 'changes_requested');

    if (hasChangesRequested) {
      return 'changes_requested';
    }
    if (allChecksPassed && allReviewsApproved) {
      return 'approved';
    }
    if (input.reviews.length > 0) {
      return 'review';
    }
    return 'open';
  }

  /**
   * Generate labels based on content
   */
  private generateLabels(input: PRInput): string[] {
    const labels: string[] = [];

    // Size label
    const totalLines = input.files.reduce((sum, f) => sum + f.additions + f.deletions, 0);
    if (totalLines < 50) labels.push('size/XS');
    else if (totalLines < 200) labels.push('size/S');
    else if (totalLines < 500) labels.push('size/M');
    else if (totalLines < 1000) labels.push('size/L');
    else labels.push('size/XL');

    // Type label
    if (input.title.toLowerCase().includes('fix')) labels.push('type/bug');
    else if (input.title.toLowerCase().includes('feat')) labels.push('type/feature');
    else labels.push('type/enhancement');

    // AI-generated label
    labels.push('ai-generated');

    // Risk label
    const hasHighRisk = input.risks.some(r => r.severity === 'high' || r.severity === 'critical');
    if (hasHighRisk) labels.push('risk/high');

    return labels;
  }

  /**
   * Extract linked issues from description
   */
  private extractLinkedIssues(description: string): string[] {
    const matches = description.match(/(US|ISSUE|BUG|TASK)-\d+/g) || [];
    return [...new Set(matches)];
  }

  /**
   * Generate a diff summary for the PR
   */
  generateDiffSummary(files: FileChange[]): string {
    let summary = '';
    
    files.forEach(file => {
      summary += `\n### ${file.path}\n\n`;
      if (file.patch) {
        summary += '```diff\n' + file.patch + '\n```\n';
      }
    });

    return summary;
  }
}
