import { describe, it, expect, beforeEach } from 'vitest';
import { BudgetEngine } from '../../engine/budget/BudgetEngine';

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
});
