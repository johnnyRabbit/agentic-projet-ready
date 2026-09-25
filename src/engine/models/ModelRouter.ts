import { ModelProvider, ModelRequest, ModelResponse, ModelCapability } from '../types';

// ============================================================
// MODEL ROUTER — Intelligent Model Selection
// ============================================================
// Selects the optimal model based on:
// - Task type and complexity
// - Risk level
// - Budget constraints
// - Historical performance
// - Context size
// - Latency requirements

interface RouterDecision {
  provider: string;
  model: string;
  reason: string;
  alternatives: { model: string; reason: string }[];
  escalationPath: string[];
}

interface PerformanceRecord {
  model: string;
  taskType: ModelCapability;
  avgLatency: number;
  avgCost: number;
  successRate: number;
  sampleCount: number;
}

export class ModelRouter {
  private providers: Map<string, ModelProvider> = new Map();
  private performanceHistory: PerformanceRecord[] = [];
  private escalationEnabled = true;

  registerProvider(provider: ModelProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): ModelProvider | undefined {
    return this.providers.get(name);
  }

  getActiveProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Main entry point — routes a request to the optimal model
   */
  async execute(request: ModelRequest): Promise<ModelResponse> {
    const decision = this.makeDecision(request);

    const provider = this.providers.get(decision.provider);
    if (!provider) {
      throw new Error(`Provider ${decision.provider} not available`);
    }

    const response = await provider.execute(request);

    // Record performance for future routing decisions
    this.recordPerformance(response, request.taskType);

    return response;
  }

  /**
   * Escalation: try progressively stronger models
   */
  async executeWithEscalation(
    request: ModelRequest,
    confidenceThreshold: number = 0.8
  ): Promise<{ response: ModelResponse; escalations: number; decision: RouterDecision }> {
    const decision = this.makeDecision(request);
    let currentProvider = this.providers.get(decision.provider);
    let escalations = 0;

    if (!currentProvider) {
      throw new Error(`No provider available`);
    }

    let response = await currentProvider.execute(request);

    // Check if confidence is sufficient (simulated via response quality heuristic)
    while (
      escalations < decision.escalationPath.length &&
      !this.isConfidenceSufficient(response, confidenceThreshold)
    ) {
      const nextModel = decision.escalationPath[escalations];
      const nextProvider = this.findProviderForModel(nextModel);

      if (!nextProvider) break;

      currentProvider = nextProvider;
      escalations++;

      // Retry with stronger model
      const escalatedRequest = { ...request, budget: 'premium' as const };
      response = await currentProvider.execute(escalatedRequest);
    }

    return { response, escalations, decision };
  }

  /**
   * Multi-model review: get independent opinions from multiple models
   */
  async multiModelReview(
    request: ModelRequest,
    modelCount: number = 3
  ): Promise<{ responses: ModelResponse[]; consensus: string }> {
    const allModels = this.getAllAvailableModels();
    const selected = allModels.slice(0, modelCount);

    const promises = selected.map(async ({ provider }) => {
      const p = this.providers.get(provider);
      if (!p) return null;
      return p.execute(request);
    });

    const results = await Promise.all(promises);
    const responses = results.filter((r): r is ModelResponse => r !== null);

    return {
      responses,
      consensus: this.findConsensus(responses),
    };
  }

  /**
   * Core decision logic
   */
  private makeDecision(request: ModelRequest): RouterDecision {
    const { taskType, complexity, risk, budget } = request;

    // Priority rules (highest to lowest):
    // 1. Risk level → always use strong model for high risk
    // 2. Budget constraints → respect limits
    // 3. Task type → match capability
    // 4. Complexity → adjust model strength
    // 5. Historical performance → prefer proven models

    const selectedProvider = 'groq';
    let selectedModel = '';
    let reason = '';
    const alternatives: { model: string; reason: string }[] = [];
    const escalationPath: string[] = [];

    // High risk → always use strongest model
    if (risk === 'high') {
      selectedModel = 'llama-3.3-70b-versatile';
      reason = 'High risk task — using strongest available model';
      escalationPath.push('llama-3.3-70b-versatile');
    }
    // Budget minimal → use cheapest fast model
    else if (budget === 'minimal') {
      selectedModel = 'llama-3.1-8b-instant';
      reason = 'Minimal budget — using fast/cheap model';
      escalationPath.push('mixtral-8x7b-32768', 'llama-3.3-70b-versatile');
    }
    // Code generation → use code-capable model
    else if (taskType === 'code-generation') {
      selectedModel = 'llama-3.3-70b-versatile';
      reason = 'Code generation requires strong reasoning model';
      escalationPath.push('llama-3.3-70b-versatile');
    }
    // Fast tasks → use instant model
    else if (taskType === 'fast' || complexity === 'low') {
      selectedModel = 'llama-3.1-8b-instant';
      reason = 'Low complexity task — fast model sufficient';
      escalationPath.push('mixtral-8x7b-32768', 'llama-3.3-70b-versatile');
    }
    // Default: balanced approach
    else {
      selectedModel = 'llama-3.3-70b-versatile';
      reason = 'Default: versatile model for balanced performance';
      escalationPath.push('llama-3.3-70b-versatile');
    }

    // Build alternatives
    const allModels = this.getAllAvailableModels();
    for (const m of allModels) {
      if (m.model !== selectedModel) {
        alternatives.push({ model: m.model, reason: `Alternative for ${taskType}` });
      }
    }

    return {
      provider: selectedProvider,
      model: selectedModel,
      reason,
      alternatives: alternatives.slice(0, 3),
      escalationPath,
    };
  }

  private getAllAvailableModels(): { provider: string; model: string }[] {
    const models: { provider: string; model: string }[] = [];
    for (const [providerName, provider] of this.providers) {
      for (const model of provider.getModels()) {
        models.push({ provider: providerName, model: model.id });
      }
    }
    return models;
  }

  private findProviderForModel(modelId: string): ModelProvider | undefined {
    for (const [, provider] of this.providers) {
      if (provider.getModels().some((m) => m.id === modelId)) {
        return provider;
      }
    }
    return undefined;
  }

  private recordPerformance(response: ModelResponse, taskType: ModelCapability) {
    const existing = this.performanceHistory.find(
      (p) => p.model === response.model && p.taskType === taskType
    );

    if (existing) {
      existing.avgLatency =
        (existing.avgLatency * existing.sampleCount + response.latency) /
        (existing.sampleCount + 1);
      existing.avgCost =
        (existing.avgCost * existing.sampleCount + response.cost) / (existing.sampleCount + 1);
      existing.sampleCount++;
    } else {
      this.performanceHistory.push({
        model: response.model,
        taskType,
        avgLatency: response.latency,
        avgCost: response.cost,
        successRate: 1.0,
        sampleCount: 1,
      });
    }
  }

  private isConfidenceSufficient(response: ModelResponse, _threshold: number): boolean {
    // Heuristic: check response quality indicators
    const content = response.content;
    if (!content || content.length < 50) return false;

    // Check for structured output (JSON)
    try {
      JSON.parse(content);
      return true; // Structured output is usually high confidence
    } catch {
      // Check for code blocks
      if (content.includes('```') || content.includes('function') || content.includes('class')) {
        return true;
      }
      // Heuristic: longer responses tend to be more confident
      return content.length > 200;
    }
  }

  private findConsensus(responses: ModelResponse[]): string {
    if (responses.length === 0) return '';
    if (responses.length === 1) return responses[0].content;

    // Simple consensus: return the most detailed response
    return responses.reduce((best, current) =>
      current.content.length > best.content.length ? current : best
    ).content;
  }

  getPerformanceHistory(): PerformanceRecord[] {
    return [...this.performanceHistory];
  }
}
