import { describe, it, expect, beforeEach } from 'vitest';
import { ContextEngine } from '../../engine/context/ContextEngine';

describe('ContextEngine', () => {
  let contextEngine: ContextEngine;

  beforeEach(() => {
    contextEngine = new ContextEngine();
  });

  it('should add context', () => {
    const context = contextEngine.addContext('project-1', {
      type: 'requirements',
      content: 'Test requirement',
      source: 'user-input',
      informationType: 'requirement',
      relevance: 0.9,
      tokens: 100,
    });

    expect(context).toBeDefined();
    expect(context.id).toBeDefined();
    expect(context.content).toBe('Test requirement');
    expect(context.type).toBe('requirements');
  });

  it('should get all context for a project', () => {
    contextEngine.addContext('project-1', {
      type: 'requirements',
      content: 'Requirement 1',
      source: 'user-input',
      informationType: 'requirement',
      relevance: 0.9,
      tokens: 100,
    });

    contextEngine.addContext('project-1', {
      type: 'architecture',
      content: 'Architecture decision',
      source: 'architect',
      informationType: 'decision',
      relevance: 0.8,
      tokens: 150,
    });

    const contexts = contextEngine.getAllContext('project-1');
    expect(contexts.length).toBe(2);
  });

  it('should get context by type', () => {
    contextEngine.addContext('project-1', {
      type: 'requirements',
      content: 'Requirement 1',
      source: 'user-input',
      informationType: 'requirement',
      relevance: 0.9,
      tokens: 100,
    });

    contextEngine.addContext('project-1', {
      type: 'architecture',
      content: 'Architecture decision',
      source: 'architect',
      informationType: 'decision',
      relevance: 0.8,
      tokens: 150,
    });

    const requirements = contextEngine.getContextByType('project-1', 'requirements');
    expect(requirements.length).toBe(1);
    expect(requirements[0].type).toBe('requirements');
  });

  it('should build context pack', () => {
    contextEngine.addContext('project-1', {
      type: 'requirements',
      content: 'Requirement 1',
      source: 'user-input',
      informationType: 'requirement',
      relevance: 0.9,
      tokens: 100,
    });

    contextEngine.addContext('project-1', {
      type: 'requirements',
      content: 'Requirement 2',
      source: 'user-input',
      informationType: 'requirement',
      relevance: 0.8,
      tokens: 120,
    });

    const pack = contextEngine.buildContextPack('project-1', 'requirements', 1000);
    expect(pack).toBeDefined();
    expect(pack.content).toBeDefined();
    expect(pack.sources.length).toBeGreaterThan(0);
    expect(pack.tokenCount).toBeGreaterThan(0);
  });

  it('should respect token budget when building context pack', () => {
    contextEngine.addContext('project-1', {
      type: 'requirements',
      content: 'Requirement 1',
      source: 'user-input',
      informationType: 'requirement',
      relevance: 0.9,
      tokens: 500,
    });

    contextEngine.addContext('project-1', {
      type: 'requirements',
      content: 'Requirement 2',
      source: 'user-input',
      informationType: 'requirement',
      relevance: 0.8,
      tokens: 600,
    });

    const pack = contextEngine.buildContextPack('project-1', 'requirements', 500);
    expect(pack.tokenCount).toBeLessThanOrEqual(500);
  });

  it('should search context by query', () => {
    contextEngine.addContext('project-1', {
      type: 'requirements',
      content: 'User authentication system',
      source: 'user-input',
      informationType: 'requirement',
      relevance: 0.9,
      tokens: 100,
    });

    contextEngine.addContext('project-1', {
      type: 'requirements',
      content: 'Database schema design',
      source: 'user-input',
      informationType: 'requirement',
      relevance: 0.8,
      tokens: 120,
    });

    const results = contextEngine.searchContext('project-1', 'authentication');
    expect(results.length).toBe(1);
    expect(results[0].content).toContain('authentication');
  });

  it('should clear context for a project', () => {
    contextEngine.addContext('project-1', {
      type: 'requirements',
      content: 'Requirement 1',
      source: 'user-input',
      informationType: 'requirement',
      relevance: 0.9,
      tokens: 100,
    });

    contextEngine.clearContext('project-1');
    const contexts = contextEngine.getAllContext('project-1');
    expect(contexts.length).toBe(0);
  });

  it('should estimate tokens correctly', () => {
    const text = 'This is a test text with approximately twenty tokens';
    const tokens = contextEngine.estimateTokens(text);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBe(Math.ceil(text.length / 4));
  });
});
