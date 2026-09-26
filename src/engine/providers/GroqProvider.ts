import { logger } from '../../utils/logger';
import { ModelProvider, ModelRequest, ModelResponse, ModelInfo } from '../types';

// ============================================================
// GROQ PROVIDER — Real API Integration
// ============================================================

const GROQ_MODELS: ModelInfo[] = [
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    capability: ['fast', 'planning'],
    inputCostPer1k: 0.000075,
    outputCostPer1k: 0.0003,
    maxContext: 131072,
    speed: 'fast',
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    capability: ['reasoning', 'code-generation', 'code-review', 'planning', 'creative'],
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
    maxContext: 131072,
    speed: 'medium',
  },
];

interface GroqStreamChunk {
  model?: string;
  choices?: Array<{
    delta?: { content?: string | null };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    cached_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number };
  } | null;
}

export class GroqProvider implements ModelProvider {
  name = 'groq';
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  getModels(): ModelInfo[] {
    return GROQ_MODELS;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async execute(request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();
    const model = this.selectModel(request);

    if (!this.apiKey) {
      if (request.executionMode === 'real') {
        throw new Error('Configure a chave Groq nas definições antes de analisar.');
      }
      // Simulation mode — return realistic mock response
      logger.debug('[GroqProvider] No API key, using simulation mode');
      return this.simulateResponse(request, model, startTime);
    }

    try {
      logger.debug(`[GroqProvider] Executing request with model: ${model.id}`);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        signal: request.signal
          ? AbortSignal.any([request.signal, AbortSignal.timeout(60000)])
          : AbortSignal.timeout(60000),
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.id,
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature ?? 0.3,
          stream: true,
          stream_options: { include_usage: true },
        }),
      });

      if (!response.ok) {
        if (request.executionMode === 'real') {
          throw new Error(`Falha Groq (HTTP ${response.status}). Tente novamente.`);
        }
        const errorText = await response.text();
        let errorMessage = `Groq API error: ${response.status}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` - ${errorJson.error?.message || errorText}`;
        } catch {
          errorMessage += ` - ${errorText}`;
        }

        throw new Error(errorMessage);
      }

      const data = await this.readStream(response, request.onDelta);
      const latency = Date.now() - startTime;

      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;
      const cost = this.calculateCost(model, inputTokens, outputTokens);

      logger.debug(`[GroqProvider] Request completed in ${latency}ms, cost: $${cost.toFixed(6)}`);

      return {
        content: data.content,
        provider: this.name,
        model: data.model || model.id,
        inputTokens,
        outputTokens,
        cachedTokens:
          data.usage?.cached_tokens || data.usage?.prompt_tokens_details?.cached_tokens || 0,
        latency,
        cost,
        timestamp: new Date().toISOString(),
        finishReason: data.finishReason || 'stop',
      };
    } catch (error) {
      if (request.executionMode === 'real') {
        throw new Error(
          error instanceof Error && error.message.startsWith('Falha Groq')
            ? error.message
            : 'Não foi possível concluir a chamada Groq. Verifique a ligação e tente novamente.'
        );
      }
      // Fallback to simulation on error
      console.warn('[GroqProvider] API call failed, using simulation:', error);
      return this.simulateResponse(request, model, startTime);
    }
  }

  private async readStream(
    response: Response,
    onDelta?: ModelRequest['onDelta']
  ): Promise<{
    content: string;
    model?: string;
    finishReason?: string;
    usage?: NonNullable<GroqStreamChunk['usage']>;
  }> {
    if (!response.body) throw new Error('A resposta Groq não contém um stream.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';
    let model: string | undefined;
    let finishReason: string | undefined;
    let usage: NonNullable<GroqStreamChunk['usage']> | undefined;
    let completed = false;

    const processEvent = (event: string) => {
      const data = event
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n');
      if (!data) return;
      if (data.trim() === '[DONE]') {
        completed = true;
        return;
      }

      const chunk = JSON.parse(data) as GroqStreamChunk;
      model = chunk.model || model;
      usage = chunk.usage || usage;
      const choice = chunk.choices?.[0];
      finishReason = choice?.finish_reason || finishReason;
      const delta = choice?.delta?.content;
      if (delta) {
        content += delta;
        try {
          onDelta?.(delta, content);
        } catch (error) {
          logger.warn('[GroqProvider] Stream progress callback failed', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';
      events.forEach(processEvent);
      if (done) break;
    }
    if (buffer.trim()) processEvent(buffer);
    if (!completed) throw new Error('O stream Groq terminou antes da mensagem final.');
    return { content, model, finishReason, usage };
  }

  private selectModel(request: ModelRequest): ModelInfo {
    // Model selection based on task requirements
    const { taskType, complexity, risk, budget } = request;

    if (budget === 'minimal' || taskType === 'fast') {
      return GROQ_MODELS[0];
    }

    if (complexity === 'high' || risk === 'high') {
      return GROQ_MODELS[1];
    }

    if (taskType === 'code-generation' || taskType === 'code-review') {
      return GROQ_MODELS[1];
    }

    // Default: balanced model
    return GROQ_MODELS[1];
  }

  private calculateCost(model: ModelInfo, inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * model.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * model.outputCostPer1k;
    return Math.round((inputCost + outputCost) * 10000) / 10000;
  }

  private simulateResponse(
    request: ModelRequest,
    model: ModelInfo,
    _startTime: number
  ): ModelResponse {
    // Realistic simulation based on agent role and task
    const content = this.generateSimulatedContent(request);
    const inputTokens = request.messages.reduce(
      (sum, m) => sum + Math.ceil(m.content.length / 4),
      0
    );
    const outputTokens = Math.ceil(content.length / 4);
    const latency = Math.floor(Math.random() * 800) + 200 + (model.speed === 'fast' ? 0 : 500);
    const cost = this.calculateCost(model, inputTokens, outputTokens);

    return {
      content,
      provider: this.name,
      model: model.id,
      inputTokens,
      outputTokens,
      cachedTokens: 0,
      latency,
      cost,
      timestamp: new Date().toISOString(),
      finishReason: 'stop',
    };
  }

  private generateSimulatedContent(request: ModelRequest): string {
    const { taskType } = request;

    const responses: Record<string, string> = {
      requirements: JSON.stringify(
        {
          requirements: [
            {
              id: 'REQ-001',
              text: 'User can view charging timeline for next 7 days',
              priority: 'high',
            },
            {
              id: 'REQ-002',
              text: 'System schedules charging during off-peak hours',
              priority: 'high',
            },
            { id: 'REQ-003', text: 'User can override scheduled times', priority: 'medium' },
            { id: 'REQ-004', text: 'Real-time price updates from grid API', priority: 'medium' },
            { id: 'REQ-005', text: 'Notifications for charging events', priority: 'low' },
            { id: 'REQ-006', text: 'Cost breakdown in charging history', priority: 'low' },
          ],
          ambiguities: [
            'Connectivity loss behavior not specified',
            'Recurring schedule support unclear',
          ],
          assumptions: ['Single user per device', 'Grid API supports WebSocket'],
        },
        null,
        2
      ),

      planning: JSON.stringify(
        {
          phases: [
            {
              name: 'Foundation',
              tasks: ['DB schema', 'API endpoints', 'State machine base'],
              estimate: '3h',
            },
            {
              name: 'Core Features',
              tasks: ['Timeline UI', 'Real-time updates', 'Scheduling logic'],
              estimate: '5h',
            },
            {
              name: 'Integration',
              tasks: ['Grid API', 'WebSocket', 'Error handling'],
              estimate: '3h',
            },
            { name: 'Quality', tasks: ['Tests', 'Security review', 'Performance'], estimate: '2h' },
          ],
          totalEstimate: { optimistic: '10h', expected: '13h', pessimistic: '18h' },
          confidence: 0.73,
          teamComposition: ['Lead', 'Mobile Dev', 'Backend Dev', 'QA', 'Reviewer'],
        },
        null,
        2
      ),

      'code-generation': `// Charging State Machine Implementation
import { createMachine, assign } from 'xstate';

export const chargingMachine = createMachine({
  id: 'charging',
  initial: 'idle',
  context: {
    scheduledTime: null,
    currentPrice: 0,
    batteryLevel: 0,
    targetLevel: 80,
    errors: []
  },
  states: {
    idle: {
      on: {
        SCHEDULE: {
          target: 'scheduled',
          actions: assign({ scheduledTime: (_, event) => event.time })
        },
        CHARGE_NOW: 'charging'
      }
    },
    scheduled: {
      after: {
        // Check if it's time to start
        CHECK_TIME: [
          { target: 'charging', cond: 'isScheduledTime' },
          { target: 'scheduled' }
        ]
      },
      on: {
        CANCEL: 'idle',
        OVERRIDE: 'charging'
      }
    },
    charging: {
      invoke: {
        src: 'monitorCharging',
        onDone: { target: 'complete' },
        onError: { target: 'error' }
      },
      on: {
        PAUSE: 'paused',
        ERROR: 'error'
      }
    },
    paused: {
      on: {
        RESUME: 'charging',
        CANCEL: 'idle'
      }
    },
    complete: {
      type: 'final',
      entry: 'notifyComplete'
    },
    error: {
      on: {
        RETRY: 'charging',
        CANCEL: 'idle'
      }
    }
  }
}, {
  guards: {
    isScheduledTime: (context) => {
      const now = new Date();
      return context.scheduledTime && now >= new Date(context.scheduledTime);
    }
  }
});`,

      'code-review': JSON.stringify(
        {
          overallAssessment: 'PASS',
          score: 87,
          findings: [
            {
              severity: 'info',
              message: 'State machine is well-structured with proper transitions',
              file: 'chargingMachine.ts',
              line: 1,
            },
            {
              severity: 'info',
              message: 'Good use of XState for complex state management',
              file: 'chargingMachine.ts',
              line: 3,
            },
            {
              severity: 'warning',
              message: 'Consider adding timeout guard for charging state',
              file: 'chargingMachine.ts',
              line: 42,
            },
            {
              severity: 'info',
              message: 'Error handling covers main failure modes',
              file: 'chargingMachine.ts',
              line: 55,
            },
          ],
          suggestions: [
            'Add a maximum charging duration guard to prevent overcharging',
            'Consider adding a "gridUnavailable" state for connectivity loss',
            'Add metrics emission for charging duration and energy consumed',
          ],
          securityReview: {
            status: 'PASS',
            notes: 'No security vulnerabilities detected. Input validation present.',
          },
        },
        null,
        2
      ),

      risk: JSON.stringify(
        {
          risks: [
            {
              category: 'technical',
              description: 'WebSocket drops on poor networks',
              probability: 0.6,
              impact: 0.7,
              mitigation: 'Optimistic updates with reconciliation',
            },
            {
              category: 'integration',
              description: 'Grid API rate limits',
              probability: 0.3,
              impact: 0.8,
              mitigation: 'Request batching and caching',
            },
          ],
          overallRisk: 'medium',
          confidence: 0.78,
        },
        null,
        2
      ),
    };

    return responses[taskType] || responses['planning'] || 'Analysis complete.';
  }
}
