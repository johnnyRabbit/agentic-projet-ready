import { ContextPack, ContextType, InformationType } from '../types';

// ============================================================
// CONTEXT ENGINE — Intelligent Context Assembly
// ============================================================
// Never sends the entire repository to agents.
// Builds minimal, relevant Context Packs.
// Maintains provenance (FACT, REQUIREMENT, ASSUMPTION, etc.)

export class ContextEngine {
  private contextStore: Map<string, ContextPack[]> = new Map();

  /**
   * Add context to the store
   */
  addContext(projectId: string, pack: Omit<ContextPack, 'id' | 'timestamp'>): ContextPack {
    const contextPack: ContextPack = {
      ...pack,
      id: `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString()
    };

    const existing = this.contextStore.get(projectId) || [];
    existing.push(contextPack);
    this.contextStore.set(projectId, existing);

    return contextPack;
  }

  /**
   * Build a context pack for a specific agent/task
   * Only includes relevant information within token budget
   */
  buildContextPack(
    projectId: string,
    type: ContextType,
    maxTokens: number = 8000
  ): { content: string; sources: string[]; tokenCount: number } {
    const allContext = this.contextStore.get(projectId) || [];
    
    // Filter by type and sort by relevance
    const relevant = allContext
      .filter(ctx => ctx.type === type || this.isRelated(ctx.type, type))
      .sort((a, b) => b.relevance - a.relevance);

    // Pack context within token budget
    let tokenCount = 0;
    const selected: ContextPack[] = [];
    const sources: string[] = [];

    for (const ctx of relevant) {
      if (tokenCount + ctx.tokens > maxTokens) break;
      selected.push(ctx);
      tokenCount += ctx.tokens;
      if (!sources.includes(ctx.source)) {
        sources.push(ctx.source);
      }
    }

    // Format with provenance markers
    const content = selected.map(ctx => {
      const marker = this.getProvenanceMarker(ctx.informationType);
      return `${marker} [${ctx.source}]\n${ctx.content}`;
    }).join('\n\n---\n\n');

    return { content, sources, tokenCount };
  }

  /**
   * Get all context for a project
   */
  getAllContext(projectId: string): ContextPack[] {
    return this.contextStore.get(projectId) || [];
  }

  /**
   * Get context by type
   */
  getContextByType(projectId: string, type: ContextType): ContextPack[] {
    const all = this.contextStore.get(projectId) || [];
    return all.filter(ctx => ctx.type === type);
  }

  /**
   * Search context by content
   */
  searchContext(projectId: string, query: string): ContextPack[] {
    const all = this.contextStore.get(projectId) || [];
    const lowerQuery = query.toLowerCase();
    return all.filter(ctx => 
      ctx.content.toLowerCase().includes(lowerQuery) ||
      ctx.source.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear context for a project
   */
  clearContext(projectId: string) {
    this.contextStore.delete(projectId);
  }

  /**
   * Estimate token count for text
   */
  estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if context types are related
   */
  private isRelated(source: ContextType, target: ContextType): boolean {
    const relations: Record<ContextType, ContextType[]> = {
      requirements: ['architecture', 'task'],
      architecture: ['requirements', 'code', 'risk'],
      task: ['requirements', 'code', 'test'],
      code: ['architecture', 'task', 'test'],
      test: ['task', 'code'],
      decision: ['architecture', 'requirements'],
      risk: ['architecture', 'task']
    };
    return relations[target]?.includes(source) || false;
  }

  /**
   * Get provenance marker for information type
   */
  private getProvenanceMarker(type: InformationType): string {
    const markers: Record<InformationType, string> = {
      fact: '📌 FACT',
      requirement: '📋 REQUIREMENT',
      assumption: '⚠️ ASSUMPTION',
      inference: '💭 INFERENCE',
      decision: '✅ DECISION',
      recommendation: '💡 RECOMMENDATION'
    };
    return markers[type];
  }
}
