import { describe, it, expect, beforeEach } from 'vitest';
import { ModelRouter } from '../../engine/models/ModelRouter';
import { GroqProvider } from '../../engine/providers/GroqProvider';

describe('ModelRouter', () => {
  let router: ModelRouter;
  let provider: GroqProvider;

  beforeEach(() => {
    router = new ModelRouter();
    provider = new GroqProvider();
    router.registerProvider(provider);
  });

  it('should register a provider', () => {
    expect(router.getActiveProviders()).toContain('groq');
  });

  it('should get provider by name', () => {
    const retrieved = router.getProvider('groq');
    expect(retrieved).toBe(provider);
  });

  it('should return undefined for non-existent provider', () => {
    const retrieved = router.getProvider('non-existent');
    expect(retrieved).toBeUndefined();
  });

  it('should execute request through provider', async () => {
    const request = {
      taskType: 'reasoning' as const,
      complexity: 'medium' as const,
      risk: 'low' as const,
      budget: 'standard' as const,
      messages: [{ role: 'user' as const, content: 'Test' }],
      agentId: 'test-agent',
    };

    const response = await router.execute(request);
    
    expect(response).toBeDefined();
    expect(response.content).toBeDefined();
    expect(response.provider).toBe('groq');
    expect(response.cost).toBeGreaterThanOrEqual(0);
  });

  it('should track performance history', async () => {
    const request = {
      taskType: 'reasoning' as const,
      complexity: 'medium' as const,
      risk: 'low' as const,
      budget: 'standard' as const,
      messages: [{ role: 'user' as const, content: 'Test' }],
      agentId: 'test-agent',
    };

    await router.execute(request);
    const history = router.getPerformanceHistory();
    
    expect(history.length).toBeGreaterThan(0);
  });
});

describe('GroqProvider', () => {
  let provider: GroqProvider;

  beforeEach(() => {
    provider = new GroqProvider();
  });

  it('should have provider name', () => {
    expect(provider.name).toBe('groq');
  });

  it('should return list of models', () => {
    const models = provider.getModels();
    expect(models.length).toBeGreaterThan(0);
    expect(models[0]).toHaveProperty('id');
    expect(models[0]).toHaveProperty('name');
    expect(models[0]).toHaveProperty('inputCostPer1k');
  });

  it('should set API key', () => {
    provider.setApiKey('test-key');
    // No error thrown means success
  });

  it('should execute request in simulation mode', async () => {
    const request = {
      taskType: 'reasoning' as const,
      complexity: 'medium' as const,
      risk: 'low' as const,
      budget: 'standard' as const,
      messages: [{ role: 'user' as const, content: 'Test' }],
      agentId: 'test-agent',
    };

    const response = await provider.execute(request);
    
    expect(response).toBeDefined();
    expect(response.content).toBeDefined();
    expect(response.provider).toBe('groq');
    expect(response.model).toBeDefined();
    expect(response.cost).toBeGreaterThanOrEqual(0);
    expect(response.latency).toBeGreaterThanOrEqual(0);
  });

  it('should calculate cost correctly', async () => {
    const request = {
      taskType: 'reasoning' as const,
      complexity: 'medium' as const,
      risk: 'low' as const,
      budget: 'standard' as const,
      messages: [{ role: 'user' as const, content: 'Test message' }],
      agentId: 'test-agent',
    };

    const response = await provider.execute(request);
    
    expect(response.inputTokens).toBeGreaterThan(0);
    expect(response.outputTokens).toBeGreaterThan(0);
    expect(response.cost).toBeGreaterThan(0);
  });
});
