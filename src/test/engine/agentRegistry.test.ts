import { describe, it, expect, beforeEach } from 'vitest';
import { AgentRegistry } from '../../engine/agents/AgentRegistry';

describe('AgentRegistry', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = new AgentRegistry();
  });

  it('should initialize with default agents', () => {
    const agents = registry.getAll();
    expect(agents.length).toBeGreaterThan(0);
  });

  it('should get agent by id', () => {
    const agent = registry.getDefinition('engineering-lead');
    expect(agent).toBeDefined();
    expect(agent?.name).toBe('Engineering Lead');
  });

  it('should return undefined for non-existent agent', () => {
    const agent = registry.getDefinition('non-existent');
    expect(agent).toBeUndefined();
  });

  it('should get agent by role', () => {
    const agent = registry.getByRole('lead');
    expect(agent).toBeDefined();
    expect(agent?.role).toBe('lead');
  });

  it('should return undefined for non-existent role', () => {
    const agent = registry.getByRole('non-existent' as any);
    expect(agent).toBeUndefined();
  });

  it('should get multiple agents by roles', () => {
    const agents = registry.getByRoles(['lead', 'developer', 'reviewer']);
    expect(agents.length).toBe(3);
  });

  it('should have all required agent properties', () => {
    const agent = registry.getDefinition('engineering-lead');
    expect(agent).toBeDefined();
    expect(agent?.id).toBeDefined();
    expect(agent?.role).toBeDefined();
    expect(agent?.name).toBeDefined();
    expect(agent?.description).toBeDefined();
    expect(agent?.skills).toBeDefined();
    expect(agent?.preferredModel).toBeDefined();
    expect(agent?.systemPrompt).toBeDefined();
    expect(agent?.maxRetries).toBeDefined();
    expect(agent?.maxBudget).toBeDefined();
  });

  it('should have skills array for each agent', () => {
    const agents = registry.getAll();
    agents.forEach(agent => {
      expect(Array.isArray(agent.skills)).toBe(true);
      expect(agent.skills.length).toBeGreaterThan(0);
    });
  });

  it('should have positive budget for each agent', () => {
    const agents = registry.getAll();
    agents.forEach(agent => {
      expect(agent.maxBudget).toBeGreaterThan(0);
    });
  });

  it('should have positive max retries for each agent', () => {
    const agents = registry.getAll();
    agents.forEach(agent => {
      expect(agent.maxRetries).toBeGreaterThanOrEqual(0);
    });
  });
});
