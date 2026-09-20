// ============================================================
// CI/CD PIPELINE RUNNER
// ============================================================
// Executes the complete delivery pipeline:
// Build → Test → Lint → Security → Review → PR

import { CheckRun, CheckStatus, Review, ReviewFinding } from '../github/types';
import { ExecutionEngine } from '../execution/ExecutionEngine';
import { JavaScriptSandbox, ValidationResult } from '../sandbox/JavaScriptSandbox';

export interface PipelineStage {
  name: string;
  status: CheckStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  output?: string;
  details?: string;
}

export interface PipelineResult {
  stages: PipelineStage[];
  checks: CheckRun[];
  reviews: Review[];
  success: boolean;
  totalDuration: number;
}

export class PipelineRunner {
  private executionEngine: ExecutionEngine;
  private sandbox: JavaScriptSandbox;

  constructor(executionEngine: ExecutionEngine) {
    this.executionEngine = executionEngine;
    this.sandbox = new JavaScriptSandbox();
  }

  /**
   * Run the complete CI/CD pipeline
   */
  async run(worktreeId: string): Promise<PipelineResult> {
    const startTime = Date.now();
    const stages: PipelineStage[] = [];
    const checks: CheckRun[] = [];
    const reviews: Review[] = [];

    // Stage 1: Build
    const buildStage = await this.runBuild(worktreeId);
    stages.push(buildStage);
    checks.push(this.stageToCheck(buildStage));

    if (buildStage.status === 'failure') {
      return this.finalize(stages, checks, reviews, startTime);
    }

    // Stage 2: Test
    const testStage = await this.runTests(worktreeId);
    stages.push(testStage);
    checks.push(this.stageToCheck(testStage));

    if (testStage.status === 'failure') {
      return this.finalize(stages, checks, reviews, startTime);
    }

    // Stage 3: Lint
    const lintStage = await this.runLint(worktreeId);
    stages.push(lintStage);
    checks.push(this.stageToCheck(lintStage));

    // Stage 4: Type Check
    const typeCheckStage = await this.runTypeCheck(worktreeId);
    stages.push(typeCheckStage);
    checks.push(this.stageToCheck(typeCheckStage));

    // Stage 5: Security Scan
    const securityStage = await this.runSecurityScan(worktreeId);
    stages.push(securityStage);
    checks.push(this.stageToCheck(securityStage));

    // Stage 6: Code Review (simulated)
    const reviewStage = await this.runCodeReview(worktreeId);
    stages.push(reviewStage);
    if (reviewStage.details) {
      reviews.push(JSON.parse(reviewStage.details));
    }

    return this.finalize(stages, checks, reviews, startTime);
  }

  /**
   * Run build stage
   */
  private async runBuild(worktreeId: string): Promise<PipelineStage> {
    const startedAt = new Date().toISOString();
    
    try {
      const result = await this.executionEngine.build(worktreeId);
      const completedAt = new Date().toISOString();
      
      return {
        name: 'Build',
        status: result.success ? 'success' : 'failure',
        startedAt,
        completedAt,
        duration: result.duration,
        output: result.output,
        details: result.error
      };
    } catch (error) {
      return {
        name: 'Build',
        status: 'failure',
        startedAt,
        completedAt: new Date().toISOString(),
        duration: 0,
        output: '',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run test stage
   */
  private async runTests(worktreeId: string): Promise<PipelineStage> {
    const startedAt = new Date().toISOString();
    
    try {
      const result = await this.executionEngine.runTests(worktreeId);
      const completedAt = new Date().toISOString();
      
      const output = `Tests: ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped`;
      const success = result.failed === 0;
      
      return {
        name: 'Test',
        status: success ? 'success' : 'failure',
        startedAt,
        completedAt,
        duration: result.duration,
        output,
        details: JSON.stringify(result)
      };
    } catch (error) {
      return {
        name: 'Test',
        status: 'failure',
        startedAt,
        completedAt: new Date().toISOString(),
        duration: 0,
        output: '',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run lint stage
   */
  private async runLint(worktreeId: string): Promise<PipelineStage> {
    const startedAt = new Date().toISOString();
    
    try {
      const result = await this.executionEngine.lint(worktreeId);
      const completedAt = new Date().toISOString();
      
      return {
        name: 'Lint',
        status: result.success ? 'success' : 'failure',
        startedAt,
        completedAt,
        duration: result.duration,
        output: result.output,
        details: result.error
      };
    } catch (error) {
      return {
        name: 'Lint',
        status: 'failure',
        startedAt,
        completedAt: new Date().toISOString(),
        duration: 0,
        output: '',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run type check stage
   */
  private async runTypeCheck(worktreeId: string): Promise<PipelineStage> {
    const startedAt = new Date().toISOString();
    
    try {
      // Get all TypeScript files
      const files = await this.executionEngine.listFiles(worktreeId, 'src');
      const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
      
      let allValid = true;
      const outputs: string[] = [];
      
      for (const file of tsFiles) {
        const content = await this.executionEngine.readFile(worktreeId, file);
        const validation = this.sandbox.validate(content);
        
        if (!validation.valid) {
          allValid = false;
          outputs.push(`${file}: ${validation.errors.length} error(s)`);
        } else {
          outputs.push(`${file}: ✓ (${validation.warnings.length} warnings)`);
        }
      }
      
      const completedAt = new Date().toISOString();
      
      return {
        name: 'Type Check',
        status: allValid ? 'success' : 'failure',
        startedAt,
        completedAt,
        duration: Date.now() - new Date(startedAt).getTime(),
        output: outputs.join('\n'),
        details: allValid ? undefined : 'Type errors found'
      };
    } catch (error) {
      return {
        name: 'Type Check',
        status: 'failure',
        startedAt,
        completedAt: new Date().toISOString(),
        duration: 0,
        output: '',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run security scan stage
   */
  private async runSecurityScan(worktreeId: string): Promise<PipelineStage> {
    const startedAt = new Date().toISOString();
    
    try {
      const files = await this.executionEngine.listFiles(worktreeId);
      const codeFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js'));
      
      const findings: string[] = [];
      let hasCritical = false;
      
      for (const file of codeFiles) {
        const content = await this.executionEngine.readFile(worktreeId, file);
        
        // Simple security checks
        if (/eval\s*\(/.test(content)) {
          findings.push(`🔴 ${file}: Uses eval() - potential code injection`);
          hasCritical = true;
        }
        if (/innerHTML\s*=/.test(content)) {
          findings.push(`🟡 ${file}: Direct innerHTML assignment - potential XSS`);
        }
        if (/dangerouslySetInnerHTML/.test(content)) {
          findings.push(`🟡 ${file}: dangerouslySetInnerHTML used - verify sanitization`);
        }
        if (/process\.env\./.test(content)) {
          findings.push(`ℹ️ ${file}: Accesses environment variables`);
        }
      }
      
      const completedAt = new Date().toISOString();
      const status = hasCritical ? 'failure' : 'success';
      
      return {
        name: 'Security Scan',
        status,
        startedAt,
        completedAt,
        duration: Date.now() - new Date(startedAt).getTime(),
        output: findings.length > 0 ? findings.join('\n') : '✓ No security issues found',
        details: hasCritical ? 'Critical security issues found' : undefined
      };
    } catch (error) {
      return {
        name: 'Security Scan',
        status: 'failure',
        startedAt,
        completedAt: new Date().toISOString(),
        duration: 0,
        output: '',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run code review stage (simulated)
   */
  private async runCodeReview(worktreeId: string): Promise<PipelineStage> {
    const startedAt = new Date().toISOString();
    
    try {
      const files = await this.executionEngine.listFiles(worktreeId);
      const codeFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
      
      const findings: ReviewFinding[] = [];
      
      for (const file of codeFiles) {
        const content = await this.executionEngine.readFile(worktreeId, file);
        const validation = this.sandbox.validate(content);
        
        // Convert validation warnings to review findings
        validation.warnings.forEach(w => {
          findings.push({
            severity: w.severity === 'warning' ? 'warning' : 'info',
            file,
            line: w.line,
            message: w.message,
            resolved: false
          });
        });
        
        // Additional review checks
        if (content.length > 500) {
          findings.push({
            severity: 'suggestion',
            file,
            message: 'Consider breaking this file into smaller modules',
            resolved: false
          });
        }
      }
      
      const review: Review = {
        id: `review-${Date.now()}`,
        reviewer: 'AI Code Reviewer',
        state: findings.some(f => f.severity === 'critical') ? 'changes_requested' : 'approved',
        body: this.generateReviewBody(findings),
        submittedAt: new Date().toISOString(),
        findings
      };
      
      const completedAt = new Date().toISOString();
      
      return {
        name: 'Code Review',
        status: 'success',
        startedAt,
        completedAt,
        duration: Date.now() - new Date(startedAt).getTime(),
        output: `Review completed: ${findings.length} finding(s)`,
        details: JSON.stringify(review)
      };
    } catch (error) {
      return {
        name: 'Code Review',
        status: 'failure',
        startedAt,
        completedAt: new Date().toISOString(),
        duration: 0,
        output: '',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Generate review body text
   */
  private generateReviewBody(findings: ReviewFinding[]): string {
    const critical = findings.filter(f => f.severity === 'critical').length;
    const warnings = findings.filter(f => f.severity === 'warning').length;
    const info = findings.filter(f => f.severity === 'info' || f.severity === 'suggestion').length;

    let body = `## Code Review Summary\n\n`;
    body += `- **Critical:** ${critical}\n`;
    body += `- **Warnings:** ${warnings}\n`;
    body += `- **Info/Suggestions:** ${info}\n\n`;

    if (findings.length > 0) {
      body += `## Findings\n\n`;
      findings.forEach(f => {
        const icon = f.severity === 'critical' ? '🔴' : f.severity === 'warning' ? '🟡' : 'ℹ️';
        body += `${icon} **${f.file}${f.line ? `:${f.line}` : ''}**: ${f.message}\n`;
      });
    } else {
      body += `✓ No issues found. Code looks good!\n`;
    }

    return body;
  }

  /**
   * Convert stage to check run
   */
  private stageToCheck(stage: PipelineStage): CheckRun {
    return {
      name: stage.name,
      status: stage.status,
      duration: stage.duration,
      output: stage.output,
      details: stage.details
    };
  }

  /**
   * Finalize pipeline result
   */
  private finalize(
    stages: PipelineStage[],
    checks: CheckRun[],
    reviews: Review[],
    startTime: number
  ): PipelineResult {
    const success = stages.every(s => s.status === 'success');
    
    return {
      stages,
      checks,
      reviews,
      success,
      totalDuration: Date.now() - startTime
    };
  }
}
