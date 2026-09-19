import { AgentRun, AgentStatus, AgentRole, AgentError, AgentArtifact, CircuitBreakerState, ModelResponse, Workflow, WorkflowStep, Risk, ApprovalRequest, EngineEvent } from '../types';
import { ModelRouter } from '../models/ModelRouter';
import { BudgetEngine } from '../budget/BudgetEngine';
import { ContextEngine } from '../context/ContextEngine';
import { AgentRegistry } from '../agents/AgentRegistry';

// ============================================================
// AGENT HARNESS — Central Orchestration Engine
// ============================================================
// Controls all agent execution. Agents must NOT bypass the Harness.
// Implements:
// - Agent lifecycle management
// - Circuit breaker pattern
// - Workflow execution
// - Event tracking
// - Approval gating

export class AgentHarness {
  private modelRouter: ModelRouter;
  private budgetEngine: BudgetEngine;
  private contextEngine: ContextEngine;
  private agentRegistry: AgentRegistry;
  
  private activeRuns: Map<string, AgentRun> = new Map();
  private completedRuns: AgentRun[] = [];
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private approvalQueue: ApprovalRequest[] = [];
  private eventLog: EngineEvent[] = [];
  private riskRegister: Risk[] = [];

  constructor(
    modelRouter: ModelRouter,
    budgetEngine: BudgetEngine,
    contextEngine: ContextEngine,
    agentRegistry: AgentRegistry
  ) {
    this.modelRouter = modelRouter;
    this.budgetEngine = budgetEngine;
    this.contextEngine = contextEngine;
    this.agentRegistry = agentRegistry;
  }

  /**
   * Execute an agent run
   */
  async executeAgent(
    agentId: string,
    role: AgentRole,
    taskId: string,
    projectId: string,
    input: string
  ): Promise<AgentRun> {
    const definition = this.agentRegistry.getByRole(role);
    if (!definition) {
      throw new Error(`No agent definition found for role: ${role}`);
    }

    // Check circuit breaker
    if (this.isCircuitOpen(agentId)) {
      throw new Error(`Circuit breaker open for agent ${agentId}`);
    }

    // Create agent run
    const run: AgentRun = {
      id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      agentId,
      agentRole: role,
      taskId,
      projectId,
      status: 'running',
      startedAt: new Date().toISOString(),
      input,
      modelCalls: [],
      totalCost: 0,
      totalTokens: 0,
      retries: 0,
      errors: [],
      artifacts: []
    };

    this.activeRuns.set(run.id, run);
    this.emitEvent({ type: 'agent.started', agentId, taskId, projectId, data: { role, agentName: definition.name } });

    try {
      // Build context for the agent
      const context = this.contextEngine.buildContextPack(projectId, this.getContextTypeForRole(role));
      
      // Build messages
      const messages = [
        { role: 'system' as const, content: definition.systemPrompt },
        { role: 'user' as const, content: this.buildAgentInput(input, context.content, role) }
      ];

      // Execute with model router
      const response = await this.modelRouter.execute({
        taskType: this.getModelCapabilityForRole(role),
        complexity: 'medium',
        risk: 'medium',
        budget: 'standard',
        messages,
        agentId: run.id,
        taskId
      });

      // Record cost
      const costResult = this.budgetEngine.recordCost({
        provider: response.provider,
        model: response.model,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        cachedTokens: response.cachedTokens,
        cost: response.cost,
        agentId: run.agentId,
        agentRole: role,
        taskId,
        projectId,
        timestamp: response.timestamp,
        latency: response.latency
      });

      if (!costResult.allowed) {
        run.status = 'failed';
        run.errors.push({
          timestamp: new Date().toISOString(),
          message: costResult.reason || 'Budget exceeded',
          type: 'budget',
          recoverable: false
        });
        this.emitEvent({ type: 'agent.budget_exceeded', agentId, taskId, projectId, data: { reason: costResult.reason } });
      } else {
        run.modelCalls.push(response);
        run.totalCost += response.cost;
        run.totalTokens += response.inputTokens + response.outputTokens;
        run.output = response.content;
        run.status = 'complete';
        
        // Extract artifacts from response
        run.artifacts = this.extractArtifacts(response, role);
        
        // Calculate confidence
        run.confidence = this.estimateConfidence(response, role);
      }

    } catch (error) {
      run.status = 'failed';
      run.errors.push({
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'model',
        recoverable: true
      });
      
      // Update circuit breaker
      this.recordFailure(agentId);
      this.emitEvent({ type: 'agent.failed', agentId, taskId, projectId, data: { error: String(error) } });
    }

    run.completedAt = new Date().toISOString();
    this.activeRuns.delete(run.id);
    this.completedRuns.push(run);
    
    this.emitEvent({ type: 'agent.completed', agentId, taskId, projectId, data: { status: run.status, cost: run.totalCost } });
    
    return run;
  }

  /**
   * Execute a complete workflow
   */
  async executeWorkflow(workflow: Workflow): Promise<Workflow> {
    this.workflows.set(workflow.id, workflow);
    workflow.status = 'running';
    workflow.startedAt = new Date().toISOString();
    
    this.emitEvent({ type: 'workflow.started', projectId: workflow.projectId, data: { workflowId: workflow.id, name: workflow.name } });

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      // Check dependencies
      if (step.dependsOn) {
        const depsComplete = step.dependsOn.every(depId => {
          const dep = workflow.steps.find(s => s.id === depId);
          return dep?.status === 'complete';
        });
        if (!depsComplete) {
          step.status = 'failed';
          continue;
        }
      }

      step.status = 'running';
      step.startedAt = new Date().toISOString();
      workflow.currentStep = i;

      try {
        const run = await this.executeAgent(
          `${workflow.id}-${step.agentRole}`,
          step.agentRole,
          workflow.id,
          workflow.projectId,
          step.input || workflow.steps.slice(0, i).map(s => s.output || '').join('\n\n')
        );

        step.output = run.output || '';
        step.status = run.status === 'complete' ? 'complete' : 'failed';
        step.completedAt = new Date().toISOString();

        if (run.status === 'failed') {
          workflow.status = 'failed';
          break;
        }
      } catch (error) {
        step.status = 'failed';
        workflow.status = 'failed';
        break;
      }
    }

    if (workflow.status === 'running') {
      workflow.status = 'complete';
    }
    workflow.completedAt = new Date().toISOString();
    
    this.emitEvent({ type: 'workflow.completed', projectId: workflow.projectId, data: { workflowId: workflow.id, status: workflow.status } });
    
    return workflow;
  }

  /**
   * Request human approval
   */
  requestApproval(request: Omit<ApprovalRequest, 'id' | 'status' | 'requestedAt'>): ApprovalRequest {
    const approval: ApprovalRequest = {
      ...request,
      id: `approval-${Date.now()}`,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    this.approvalQueue.push(approval);
    this.emitEvent({ type: 'approval.requested', projectId: '', data: { approvalId: approval.id, type: approval.type } });
    return approval;
  }

  /**
   * Resolve an approval
   */
  resolveApproval(approvalId: string, decision: 'approved' | 'rejected', resolvedBy: string) {
    const approval = this.approvalQueue.find(a => a.id === approvalId);
    if (approval) {
      approval.status = decision;
      approval.resolvedAt = new Date().toISOString();
      approval.resolvedBy = resolvedBy;
    }
  }

  /**
   * Add a risk to the register
   */
  addRisk(risk: Omit<Risk, 'id' | 'detectedAt'>): Risk {
    const fullRisk: Risk = {
      ...risk,
      id: `risk-${Date.now()}`,
      detectedAt: new Date().toISOString()
    };
    this.riskRegister.push(fullRisk);
    return fullRisk;
  }

  // --- Getters ---
  
  getActiveRuns(): AgentRun[] {
    return Array.from(this.activeRuns.values());
  }

  getCompletedRuns(): AgentRun[] {
    return [...this.completedRuns];
  }

  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  getApprovalQueue(): ApprovalRequest[] {
    return this.approvalQueue.filter(a => a.status === 'pending');
  }

  getRiskRegister(): Risk[] {
    return [...this.riskRegister];
  }

  getEventLog(): EngineEvent[] {
    return [...this.eventLog];
  }

  getCircuitBreakers(): CircuitBreakerState[] {
    return Array.from(this.circuitBreakers.values());
  }

  // --- Private helpers ---

  private isCircuitOpen(agentId: string): boolean {
    const breaker = this.circuitBreakers.get(agentId);
    if (!breaker) return false;
    if (breaker.state === 'closed') return false;
    if (breaker.state === 'open') {
      const elapsed = Date.now() - new Date(breaker.lastFailure || 0).getTime();
      if (elapsed > breaker.resetTimeout) {
        breaker.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  private recordFailure(agentId: string) {
    let breaker = this.circuitBreakers.get(agentId);
    if (!breaker) {
      breaker = {
        agentId,
        state: 'closed',
        failureCount: 0,
        resetTimeout: 60000 // 1 minute
      };
      this.circuitBreakers.set(agentId, breaker);
    }
    
    breaker.failureCount++;
    breaker.lastFailure = new Date().toISOString();
    
    if (breaker.failureCount >= 3) {
      breaker.state = 'open';
      breaker.reason = `Agent ${agentId} failed ${breaker.failureCount} times`;
    }
  }

  private buildAgentInput(input: string, context: string, role: AgentRole): string {
    let prompt = '';
    if (context) {
      prompt += `## Context\n${context}\n\n`;
    }
    prompt += `## Task\n${input}\n\n`;
    
    if (role === 'developer') {
      prompt += '## Instructions\nImplement the task following the context above. Output clean, production-ready code.';
    } else if (role === 'reviewer') {
      prompt += '## Instructions\nReview the implementation above. Provide structured feedback with severity levels.';
    } else if (role === 'requirements') {
      prompt += '## Instructions\nExtract requirements, identify ambiguities, and classify information by provenance.';
    } else if (role === 'planner') {
      prompt += '## Instructions\nCreate a detailed implementation plan with tasks, estimates, and dependencies.';
    } else if (role === 'risk') {
      prompt += '## Instructions\nIdentify risks with probability, impact, and mitigation strategies.';
    }
    
    return prompt;
  }

  private getContextTypeForRole(role: AgentRole): 'requirements' | 'architecture' | 'task' | 'code' | 'test' | 'decision' | 'risk' {
    const mapping: Record<AgentRole, 'requirements' | 'architecture' | 'task' | 'code' | 'test' | 'decision' | 'risk'> = {
      lead: 'task',
      requirements: 'requirements',
      planner: 'task',
      developer: 'code',
      reviewer: 'code',
      tester: 'test',
      security: 'code',
      critic: 'architecture',
      debugger: 'code',
      architect: 'architecture',
      estimator: 'task',
      risk: 'risk'
    };
    return mapping[role] || 'task';
  }

  private getModelCapabilityForRole(role: AgentRole): 'fast' | 'reasoning' | 'code-generation' | 'code-review' | 'planning' | 'creative' {
    const mapping: Record<AgentRole, 'fast' | 'reasoning' | 'code-generation' | 'code-review' | 'planning' | 'creative'> = {
      lead: 'reasoning',
      requirements: 'reasoning',
      planner: 'planning',
      developer: 'code-generation',
      reviewer: 'code-review',
      tester: 'code-generation',
      security: 'reasoning',
      critic: 'reasoning',
      debugger: 'code-generation',
      architect: 'reasoning',
      estimator: 'planning',
      risk: 'reasoning'
    };
    return mapping[role] || 'reasoning';
  }

  private extractArtifacts(response: ModelResponse, role: AgentRole): AgentArtifact[] {
    const artifacts: AgentArtifact[] = [];
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(response.content);
      artifacts.push({
        type: this.getArtifactTypeForRole(role),
        content: response.content,
        metadata: { parsed: true, structure: Object.keys(parsed) }
      });
    } catch {
      // Not JSON — treat as code or text
      if (response.content.includes('```') || response.content.includes('function') || response.content.includes('import')) {
        artifacts.push({
          type: 'code',
          content: response.content,
          metadata: { format: 'code' }
        });
      } else {
        artifacts.push({
          type: this.getArtifactTypeForRole(role),
          content: response.content,
          metadata: { format: 'text' }
        });
      }
    }
    
    return artifacts;
  }

  private getArtifactTypeForRole(role: AgentRole): AgentArtifact['type'] {
    const mapping: Record<AgentRole, AgentArtifact['type']> = {
      lead: 'decision',
      requirements: 'requirements',
      planner: 'plan',
      developer: 'code',
      reviewer: 'review',
      tester: 'test',
      security: 'review',
      critic: 'review',
      debugger: 'code',
      architect: 'decision',
      estimator: 'plan',
      risk: 'risk'
    };
    return mapping[role] || 'decision';
  }

  private estimateConfidence(response: ModelResponse, role: AgentRole): number {
    // Heuristic confidence estimation
    let confidence = 0.7; // Base confidence
    
    if (response.content.length > 500) confidence += 0.1;
    if (response.finishReason === 'stop') confidence += 0.05;
    
    try {
      JSON.parse(response.content);
      confidence += 0.1; // Structured output = higher confidence
    } catch {
      // Not structured
    }

    if (role === 'reviewer' || role === 'security') {
      confidence -= 0.05; // Reviews are inherently less confident
    }

    return Math.min(Math.max(confidence, 0.3), 0.95);
  }

  private emitEvent(event: Omit<EngineEvent, 'id' | 'timestamp'>) {
    this.eventLog.push({
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString()
    });
  }
}
