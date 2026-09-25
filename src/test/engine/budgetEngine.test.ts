import { describe, it, expect, beforeEach } from 'vitest';
import { BudgetEngine } from '../../engine/budget/BudgetEngine';
import type { CostRecord } from '../../engine/types';

const cost: Omit<CostRecord, 'id'> = {
  provider: 'test',
  model: 'test',
  inputTokens: 1,
  outputTokens: 1,
  cachedTokens: 0,
  cost: 12,
  agentId: 'agent-a',
  agentRole: 'developer',
  taskId: 'task-a',
  projectId: 'project-a',
  timestamp: '2026-09-25T00:00:00Z',
  latency: 1,
};

describe('BudgetEngine', () => {
  let budgetEngine: BudgetEngine;

  beforeEach(() => {
    budgetEngine = new BudgetEngine();
  });

  it('should create a budget', () => {
    const budget = budgetEngine.createBudget('project', 100);

    expect(budget).toBeDefined();
    expect(budget.limit).toBe(100);
    expect(budget.spent).toBe(0);
    expect(budget.scope).toBe('project');
    expect(budget.currency).toBe('EUR');
  });

  it('should track spending', () => {
    const budget = budgetEngine.createBudget('project', 100);

    budgetEngine.recordCost({
      provider: 'groq',
      model: 'llama-3.3-70b',
      inputTokens: 1000,
      outputTokens: 500,
      cachedTokens: 0,
      cost: 10,
      agentId: 'test-agent',
      agentRole: 'developer',
      projectId: 'test-project',
      timestamp: new Date().toISOString(),
      latency: 100,
    });

    const remaining = budgetEngine.getRemaining(budget.id);
    expect(remaining).toBe(90);
  });

  it('should prevent overspending', () => {
    budgetEngine.createBudget('project', 10);

    const result = budgetEngine.recordCost({
      provider: 'groq',
      model: 'llama-3.3-70b',
      inputTokens: 1000,
      outputTokens: 500,
      cachedTokens: 0,
      cost: 15,
      agentId: 'test-agent',
      agentRole: 'developer',
      projectId: 'test-project',
      timestamp: new Date().toISOString(),
      latency: 100,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Budget exceeded');
  });

  it('should allow spending within budget', () => {
    budgetEngine.createBudget('project', 100);

    const result = budgetEngine.recordCost({
      provider: 'groq',
      model: 'llama-3.3-70b',
      inputTokens: 1000,
      outputTokens: 500,
      cachedTokens: 0,
      cost: 50,
      agentId: 'test-agent',
      agentRole: 'developer',
      projectId: 'test-project',
      timestamp: new Date().toISOString(),
      latency: 100,
    });

    expect(result.allowed).toBe(true);
  });

  it('should check if cost can be afforded', () => {
    const budget = budgetEngine.createBudget('project', 100);

    expect(budgetEngine.canAfford(50, budget.id)).toBe(true);
    expect(budgetEngine.canAfford(150, budget.id)).toBe(false);
  });

  it('should calculate remaining budget', () => {
    const budget = budgetEngine.createBudget('project', 100);

    budgetEngine.recordCost({
      provider: 'groq',
      model: 'llama-3.3-70b',
      inputTokens: 1000,
      outputTokens: 500,
      cachedTokens: 0,
      cost: 30,
      agentId: 'test-agent',
      agentRole: 'developer',
      projectId: 'test-project',
      timestamp: new Date().toISOString(),
      latency: 100,
    });

    const remaining = budgetEngine.getRemaining(budget.id);
    expect(remaining).toBe(70);
  });

  it('should calculate utilization percentage', () => {
    const budget = budgetEngine.createBudget('project', 100);

    budgetEngine.recordCost({
      provider: 'groq',
      model: 'llama-3.3-70b',
      inputTokens: 1000,
      outputTokens: 500,
      cachedTokens: 0,
      cost: 50,
      agentId: 'test-agent',
      agentRole: 'developer',
      projectId: 'test-project',
      timestamp: new Date().toISOString(),
      latency: 100,
    });

    const utilization = budgetEngine.getUtilization(budget.id);
    expect(utilization).toBe(50);
  });

  it('should return Infinity for non-existent budget remaining', () => {
    const remaining = budgetEngine.getRemaining('non-existent');
    expect(remaining).toBe(Infinity);
  });

  it('should return 0 for non-existent budget utilization', () => {
    const utilization = budgetEngine.getUtilization('non-existent');
    expect(utilization).toBe(0);
  });

  it('accounts for all ancestors exactly once and leaves other projects untouched', () => {
    const org = budgetEngine.createBudget('organization', 100);
    const project = budgetEngine.createBudget('project', 50, org.id, 'project-a');
    const other = budgetEngine.createBudget('project', 50, org.id, 'project-b');
    const task = budgetEngine.createBudget('task', 10, project.id, 'task-a');
    const agent = budgetEngine.createBudget('agent', 20, task.id, 'agent-a');
    expect(budgetEngine.recordCost(cost).allowed).toBe(false);
    for (const budget of [org, project, task, agent]) expect(budget.spent).toBe(12);
    expect(other.spent).toBe(0);
    expect(budgetEngine.getTotalCost('project-a')).toBe(12);
    expect(budgetEngine.canAfford(1, agent.id)).toBe(false);
  });

  it('rejects invalid amounts without corrupting accounting', () => {
    const budget = budgetEngine.createBudget('project', 50, undefined, 'project-a');
    for (const value of [-1, NaN, Infinity]) {
      expect(() => budgetEngine.recordCost({ ...cost, cost: value })).toThrow('Invalid cost');
      expect(budgetEngine.canAfford(value, budget.id)).toBe(false);
    }
    expect(budget.spent).toBe(0);
    expect(budgetEngine.getCostRecords('project-a')).toEqual([]);
  });
});
