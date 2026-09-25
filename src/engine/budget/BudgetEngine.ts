import { Budget, CostRecord, BudgetAlert } from '../types';

// ============================================================
// BUDGET ENGINE — Financial Governance
// ============================================================
// Tracks costs at multiple levels:
// Organization → Project → Task → Agent
// Enforces limits and triggers alerts

export class BudgetEngine {
  private budgets: Map<string, Budget> = new Map();
  private costRecords: CostRecord[] = [];
  private alertCallbacks: ((budget: Budget, alert: BudgetAlert) => void)[] = [];

  /**
   * Create a budget hierarchy
   */
  createBudget(
    scope: Budget['scope'],
    limit: number,
    parentId?: string,
    entityId?: string
  ): Budget {
    if (!Number.isFinite(limit) || limit <= 0) throw new Error('Budget limit must be positive');
    if (parentId && !this.budgets.has(parentId)) throw new Error('Parent budget not found');
    const id = `budget-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const budget: Budget = {
      id,
      scope,
      parentId,
      entityId,
      limit,
      spent: 0,
      currency: 'EUR',
      alerts: [
        { threshold: 50, triggered: false, message: '50% budget consumed' },
        { threshold: 75, triggered: false, message: '75% budget consumed' },
        { threshold: 90, triggered: false, message: '90% budget consumed — approaching limit' },
        { threshold: 100, triggered: false, message: 'Budget limit reached' },
      ],
    };
    this.budgets.set(id, budget);
    return budget;
  }

  /**
   * Record a cost and update all relevant budgets
   */
  recordCost(record: Omit<CostRecord, 'id'>): { allowed: boolean; reason?: string } {
    if (!Number.isFinite(record.cost) || record.cost < 0) throw new Error('Invalid cost');
    const id = `cost-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const costRecord: CostRecord = { ...record, id };
    this.costRecords.push(costRecord);

    // Update all relevant budgets (agent → task → project → organization)
    const relevantBudgets = this.getRelevantBudgets(record);

    let exceeded: Budget | undefined;
    for (const budget of relevantBudgets) {
      const newSpent = budget.spent + record.cost;

      if (newSpent > budget.limit) exceeded ??= budget;

      budget.spent = newSpent;

      // Check alerts
      const percentage = (newSpent / budget.limit) * 100;
      for (const alert of budget.alerts) {
        if (percentage >= alert.threshold && !alert.triggered) {
          alert.triggered = true;
          this.notifyAlert(budget, alert);
        }
      }
    }

    // Calls have already incurred their cost: keep every ancestor accurate even
    // when continuation must be blocked. This is accounting, not a reservation.
    return exceeded
      ? {
          allowed: false,
          reason: `Budget exceeded: ${exceeded.scope} budget ${exceeded.id} (€${exceeded.spent.toFixed(4)}/€${exceeded.limit})`,
        }
      : { allowed: true };
  }

  /**
   * Check if a cost would be allowed without recording it
   */
  canAfford(estimatedCost: number, budgetId: string): boolean {
    if (!Number.isFinite(estimatedCost) || estimatedCost < 0) return false;
    const budget = this.budgets.get(budgetId);
    if (!budget) return true; // No budget = no restriction
    return (
      budget.spent + estimatedCost <= budget.limit &&
      (!budget.parentId || this.canAfford(estimatedCost, budget.parentId))
    );
  }

  /**
   * Get remaining budget
   */
  getRemaining(budgetId: string): number {
    const budget = this.budgets.get(budgetId);
    if (!budget) return Infinity;
    return budget.limit - budget.spent;
  }

  /**
   * Get budget utilization percentage
   */
  getUtilization(budgetId: string): number {
    const budget = this.budgets.get(budgetId);
    if (!budget) return 0;
    return (budget.spent / budget.limit) * 100;
  }

  /**
   * Get cost breakdown by phase/agent
   */
  getCostBreakdown(projectId: string): { phase: string; cost: number; percentage: number }[] {
    const projectCosts = this.costRecords.filter((r) => r.projectId === projectId);
    const byAgent: Record<string, number> = {};

    for (const record of projectCosts) {
      const key = record.agentRole;
      byAgent[key] = (byAgent[key] || 0) + record.cost;
    }

    const total = projectCosts.reduce((sum, r) => sum + r.cost, 0);

    return Object.entries(byAgent)
      .map(([phase, cost]) => ({
        phase,
        cost: Math.round(cost * 10000) / 10000,
        percentage: total > 0 ? Math.round((cost / total) * 100) : 0,
      }))
      .sort((a, b) => b.cost - a.cost);
  }

  /**
   * Get all cost records for a project
   */
  getCostRecords(projectId: string): CostRecord[] {
    return this.costRecords.filter((r) => r.projectId === projectId);
  }

  /**
   * Get total cost for a project
   */
  getTotalCost(projectId: string): number {
    return this.costRecords
      .filter((r) => r.projectId === projectId)
      .reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * Get total tokens for a project
   */
  getTotalTokens(projectId: string): { input: number; output: number; total: number } {
    const records = this.costRecords.filter((r) => r.projectId === projectId);
    const input = records.reduce((sum, r) => sum + r.inputTokens, 0);
    const output = records.reduce((sum, r) => sum + r.outputTokens, 0);
    return { input, output, total: input + output };
  }

  onAlert(callback: (budget: Budget, alert: BudgetAlert) => void) {
    this.alertCallbacks.push(callback);
  }

  private getRelevantBudgets(record: Omit<CostRecord, 'id'>): Budget[] {
    const relevant = new Map<string, Budget>();
    const entities = { project: record.projectId, task: record.taskId, agent: record.agentId };
    for (const [, budget] of this.budgets) {
      if (
        budget.scope === 'organization' ||
        (entities[budget.scope] && (!budget.entityId || budget.entityId === entities[budget.scope]))
      ) {
        let current: Budget | undefined = budget;
        while (current && !relevant.has(current.id)) {
          relevant.set(current.id, current);
          current = current.parentId ? this.budgets.get(current.parentId) : undefined;
        }
      }
    }
    return [...relevant.values()];
  }

  private notifyAlert(budget: Budget, alert: BudgetAlert) {
    for (const callback of this.alertCallbacks) {
      try {
        callback(budget, alert);
      } catch (e) {
        console.error('Budget alert callback failed:', e);
      }
    }
  }

  getAllBudgets(): Budget[] {
    return Array.from(this.budgets.values());
  }
}
