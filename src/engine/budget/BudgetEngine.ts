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
  createBudget(scope: Budget['scope'], limit: number, parentId?: string): Budget {
    const id = `budget-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const budget: Budget = {
      id,
      scope,
      parentId,
      limit,
      spent: 0,
      currency: 'EUR',
      alerts: [
        { threshold: 50, triggered: false, message: '50% budget consumed' },
        { threshold: 75, triggered: false, message: '75% budget consumed' },
        { threshold: 90, triggered: false, message: '90% budget consumed — approaching limit' },
        { threshold: 100, triggered: false, message: 'Budget limit reached' }
      ]
    };
    this.budgets.set(id, budget);
    return budget;
  }

  /**
   * Record a cost and update all relevant budgets
   */
  recordCost(record: Omit<CostRecord, 'id'>): { allowed: boolean; reason?: string } {
    const id = `cost-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const costRecord: CostRecord = { ...record, id };
    this.costRecords.push(costRecord);

    // Update all relevant budgets (agent → task → project → organization)
    const relevantBudgets = this.getRelevantBudgets(record);
    
    for (const budget of relevantBudgets) {
      const newSpent = budget.spent + record.cost;
      
      if (newSpent > budget.limit) {
        return {
          allowed: false,
          reason: `Budget exceeded: ${budget.scope} budget ${budget.id} (€${budget.spent.toFixed(4)}/€${budget.limit})`
        };
      }
      
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

    return { allowed: true };
  }

  /**
   * Check if a cost would be allowed without recording it
   */
  canAfford(estimatedCost: number, budgetId: string): boolean {
    const budget = this.budgets.get(budgetId);
    if (!budget) return true; // No budget = no restriction
    return (budget.spent + estimatedCost) <= budget.limit;
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
    const projectCosts = this.costRecords.filter(r => r.projectId === projectId);
    const byAgent: Record<string, number> = {};
    
    for (const record of projectCosts) {
      const key = record.agentRole;
      byAgent[key] = (byAgent[key] || 0) + record.cost;
    }

    const total = projectCosts.reduce((sum, r) => sum + r.cost, 0);
    
    return Object.entries(byAgent).map(([phase, cost]) => ({
      phase,
      cost: Math.round(cost * 10000) / 10000,
      percentage: total > 0 ? Math.round((cost / total) * 100) : 0
    })).sort((a, b) => b.cost - a.cost);
  }

  /**
   * Get all cost records for a project
   */
  getCostRecords(projectId: string): CostRecord[] {
    return this.costRecords.filter(r => r.projectId === projectId);
  }

  /**
   * Get total cost for a project
   */
  getTotalCost(projectId: string): number {
    return this.costRecords
      .filter(r => r.projectId === projectId)
      .reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * Get total tokens for a project
   */
  getTotalTokens(projectId: string): { input: number; output: number; total: number } {
    const records = this.costRecords.filter(r => r.projectId === projectId);
    const input = records.reduce((sum, r) => sum + r.inputTokens, 0);
    const output = records.reduce((sum, r) => sum + r.outputTokens, 0);
    return { input, output, total: input + output };
  }

  onAlert(callback: (budget: Budget, alert: BudgetAlert) => void) {
    this.alertCallbacks.push(callback);
  }

  private getRelevantBudgets(_record: Omit<CostRecord, 'id'>): Budget[] {
    const relevant: Budget[] = [];
    for (const [, budget] of this.budgets) {
      if (budget.scope === 'organization') {
        relevant.push(budget);
      }
    }
    return relevant;
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
