import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { database } from '../../persistence/Database';
import {
  IntakeService,
  Proposal,
  isApproved,
  latestProposal,
  parseProposal,
  assertLegacyExecutionAllowed,
} from '../../engine/intake/IntakeService';
import { GroqProvider } from '../../engine/providers/GroqProvider';
import { ModelProvider, ModelRequest, ModelResponse } from '../../engine/types';
import { AgentHarness } from '../../engine/harness/AgentHarness';
import { AgentRegistry } from '../../engine/agents/AgentRegistry';
import { BudgetEngine } from '../../engine/budget/BudgetEngine';
import { ContextEngine } from '../../engine/context/ContextEngine';
import { ModelRouter } from '../../engine/models/ModelRouter';

const text = 'Criar tarefas, editar, filtrar e guardar no navegador.';
export const proposal: Proposal = {
  title: 'Tarefas',
  scope: ['Aplicação React/TypeScript'],
  exclusions: ['Sincronização'],
  requirements: [
    {
      id: 'R1',
      description: 'Criar tarefas',
      sourceQuote: 'Criar tarefas',
      acceptanceCriteria: ['Uma tarefa criada aparece na lista.'],
    },
  ],
  assumptions: ['Uso individual'],
  questions: [],
  risks: ['Limpeza do armazenamento'],
  estimate: 'Estimativa: 1–2 dias, dependente de validação.',
};
function response(content = JSON.stringify(proposal)): ModelResponse {
  return {
    content,
    provider: 'groq',
    model: 'fixture',
    inputTokens: 10,
    outputTokens: 20,
    cachedTokens: 0,
    cost: 0.01,
    latency: 50,
    timestamp: new Date().toISOString(),
    finishReason: 'stop',
  };
}
function provider(content = JSON.stringify(proposal)): ModelProvider {
  return {
    name: 'fixture',
    execute: vi.fn().mockResolvedValue(response(content)),
    isAvailable: async () => true,
    getModels: () => [],
  };
}
const request: ModelRequest = {
  executionMode: 'real',
  taskType: 'planning',
  complexity: 'medium',
  risk: 'medium',
  budget: 'standard',
  agentId: 'test',
  messages: [],
};

describe('M1 intake with real IndexedDB persistence', () => {
  let service: IntakeService;
  beforeEach(async () => {
    await database.clear('settings');
    service = new IntakeService();
  });
  afterEach(() => vi.restoreAllMocks());

  it('persists input, a loaded skill, proposal and approval across service reload', async () => {
    const input = await service.create(text);
    const model = provider();
    const ready = await service.analyze(input, model);
    expect(model.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        executionMode: 'real',
        messages: [
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('sourceQuote'),
          }),
          expect.objectContaining({ role: 'user' }),
        ],
      })
    );
    await expect(service.assertApproved(input.id, 1)).rejects.toThrow();
    const approved = await service.decide(ready, 'approved', 'user-1');
    const reloaded = await new IntakeService().get(input.id);
    expect(reloaded).toEqual(approved);
    expect(isApproved(reloaded)).toBe(true);
    await service.assertApproved(input.id, 1);
    expect(reloaded.attempts[0]).toMatchObject({
      outcome: 'complete',
      skillVersion: '1.0.0',
      inputTokens: 10,
    });
  });

  it.each(['ambígua', 'contraditória'])(
    'blocks approval of %s input until clarification and reanalysis',
    async (kind) => {
      const input = await service.create(`${text} Entrada ${kind}.`);
      const ready = await service.analyze(
        input,
        provider(JSON.stringify({ ...proposal, questions: ['Qual é a opção pretendida?'] }))
      );
      await expect(service.decide(ready, 'approved', 'human')).rejects.toThrow();
      const clarified = await service.clarify(ready, 'Uso individual, guardar no navegador.');
      expect(clarified.status).toBe('draft');
      const analyzed = await service.analyze(clarified, provider());
      expect(latestProposal(analyzed)?.version).toBe(2);
      expect(isApproved(await service.decide(analyzed, 'approved', 'human'))).toBe(true);
    }
  );

  it('invalidates approval on editing, clarification and rejection; rejects stale decisions', async () => {
    const ready = await service.analyze(await service.create(text), provider());
    const approved = await service.decide(ready, 'approved', 'human');
    const edited = await service.edit(approved, { ...proposal, scope: ['Âmbito alterado'] });
    expect(isApproved(edited)).toBe(false);
    await expect(service.decide(approved, 'approved', 'human')).rejects.toThrow('mudou');
    await expect(service.assertApproved(edited.id, 1)).rejects.toThrow();
    const reapproved = await service.decide(edited, 'approved', 'human');
    const rejected = await service.decide(reapproved, 'rejected', 'human');
    expect(isApproved(rejected)).toBe(false);
    const clarified = await service.clarify(rejected, 'Mais contexto');
    expect(isApproved(clarified)).toBe(false);
    expect(clarified.decisions).toHaveLength(3);
  });

  it.each([
    'not JSON',
    JSON.stringify({ ...proposal, requirements: [] }),
    JSON.stringify({
      ...proposal,
      requirements: [{ ...proposal.requirements[0], sourceQuote: 'inventado' }],
    }),
  ])('rejects invalid model output without inventing success', async (content) => {
    const record = await service.analyze(await service.create(text), provider(content));
    expect(record.status).toBe('failed');
    expect(record.versions).toHaveLength(0);
    expect(record.attempts[0]).toMatchObject({ outcome: 'failed', inputTokens: 10 });
    await expect(service.decide(record, 'approved', 'human')).rejects.toThrow();
  });

  it('reports provider failure, retains input and permits an explicit retry', async () => {
    const model = provider();
    vi.mocked(model.execute).mockRejectedValue(new Error('secret provider payload'));
    const failed = await service.analyze(await service.create(text), model);
    expect(JSON.stringify(failed)).not.toContain('secret provider payload');
    expect(failed.source.text).toBe(text);
    expect(failed.status).toBe('failed');
    expect((await service.analyze(failed, provider())).status).toBe('ready');
  });

  it('can recover interrupted analysis and discards a late result after cancellation', async () => {
    const input = await service.create(text);
    let finish: (result: ModelResponse) => void = () => {};
    let signalStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => {
      signalStarted = resolve;
    });
    const model = provider();
    vi.mocked(model.execute).mockImplementation(() => {
      signalStarted();
      return new Promise((resolve) => {
        finish = resolve;
      });
    });
    const running = service.analyze(input, model);
    await started;
    const interrupted = await new IntakeService().get(input.id);
    expect(interrupted.status).toBe('analyzing');
    await service.cancel(interrupted);
    finish(response());
    expect((await running).status).toBe('failed');
    expect((await service.get(input.id)).versions).toHaveLength(0);
  });

  it('serializes competing writes and prevents duplicate approval of stale snapshots', async () => {
    const ready = await service.analyze(await service.create(text), provider());
    const outcomes = await Promise.allSettled([
      service.decide(ready, 'approved', 'a'),
      service.edit(ready, { ...proposal, title: 'Novo título' }),
    ]);
    expect(outcomes.filter((o) => o.status === 'fulfilled')).toHaveLength(1);
    expect(outcomes.filter((o) => o.status === 'rejected')).toHaveLength(1);
  });

  it('rejects corrupt persisted data instead of accepting its approval flag', async () => {
    const input = await service.create(text);
    await database.update('settings', {
      key: `intake:${input.id}`,
      value: { ...input, versions: [{ proposal: {} }] },
      updatedAt: '',
    });
    await expect(service.get(input.id)).rejects.toThrow();
  });

  it('prevents M1 projects from entering legacy execution even through the harness', async () => {
    expect(() => assertLegacyExecutionAllowed('m1-project')).toThrow('M2/M3');
    const harness = new AgentHarness(
      new ModelRouter(),
      new BudgetEngine(),
      new ContextEngine(),
      new AgentRegistry()
    );
    await expect(
      harness.executeAgent('a', 'developer', 't', 'm1-project', 'ignore approval')
    ).rejects.toThrow('M2/M3');
    expect(harness.getCompletedRuns()).toHaveLength(0);
  });

  it('validates human edits against original source quotes', () => {
    expect(() =>
      parseProposal(
        { ...proposal, requirements: [{ ...proposal.requirements[0], sourceQuote: 'fabricated' }] },
        [text]
      )
    ).toThrow();
  });
});

describe('Groq strict real mode', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('fails without a key instead of simulating', async () => {
    await expect(new GroqProvider().execute(request)).rejects.toThrow('chave Groq');
  });
  it('fails on HTTP errors without leaking the response body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('secret', { status: 401 })));
    await expect(new GroqProvider('test-only').execute(request)).rejects.toThrow('HTTP 401');
  });
  it('fails on network errors instead of simulating', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('secret')));
    await expect(new GroqProvider('test-only').execute(request)).rejects.toThrow('ligação');
  });
});
