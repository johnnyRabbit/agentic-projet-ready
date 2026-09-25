import { database } from '../../persistence/Database';
import { ModelProvider } from '../types';
import { requirementsSkill } from './requirementsSkill';

export interface Proposal {
  title: string;
  scope: string[];
  exclusions: string[];
  requirements: {
    id: string;
    description: string;
    sourceQuote: string;
    acceptanceCriteria: string[];
  }[];
  assumptions: string[];
  questions: string[];
  risks: string[];
  estimate: string;
}

export interface IntakeRecord {
  id: string;
  revision: number;
  source: { type: 'text'; text: string; createdAt: string };
  clarifications: string[];
  versions: { version: number; createdAt: string; proposal: Proposal; origin: 'model' | 'human' }[];
  decisions: {
    version: number;
    decision: 'approved' | 'rejected';
    author: string;
    at: string;
    scope: 'implementation';
  }[];
  status: 'draft' | 'analyzing' | 'ready' | 'failed';
  error: string | null;
  attempts: {
    id: string;
    at: string;
    skillVersion: string;
    outcome: 'running' | 'complete' | 'failed';
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    estimatedCost?: number;
  }[];
}

const prefix = 'intake:';
const now = () => new Date().toISOString();
const invalid = () => new Error('Dados inválidos. Reveja a proposta ou tente analisar novamente.');
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid();
  return value as Record<string, unknown>;
}
function string(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 30000) throw invalid();
  return value;
}
function strings(value: unknown, required = false): string[] {
  if (!Array.isArray(value) || value.length > 100 || (required && !value.length)) throw invalid();
  return value.map(string);
}
function integer(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) throw invalid();
  return value;
}

export function parseProposal(value: unknown, sources: string[]): Proposal {
  const data = object(value);
  if (
    !Array.isArray(data.requirements) ||
    !data.requirements.length ||
    data.requirements.length > 100
  )
    throw invalid();
  const ids = new Set<string>();
  const requirements = data.requirements.map((item: unknown) => {
    const r = object(item);
    const id = string(r.id);
    const sourceQuote = string(r.sourceQuote);
    if (ids.has(id) || !sources.some((source) => source.includes(sourceQuote))) throw invalid();
    ids.add(id);
    return {
      id,
      sourceQuote,
      description: string(r.description),
      acceptanceCriteria: strings(r.acceptanceCriteria, true),
    };
  });
  return {
    title: string(data.title),
    scope: strings(data.scope, true),
    exclusions: strings(data.exclusions),
    requirements,
    assumptions: strings(data.assumptions),
    questions: strings(data.questions),
    risks: strings(data.risks),
    estimate: string(data.estimate),
  };
}

function parseRecord(value: unknown): IntakeRecord {
  const r = object(value);
  const source = object(r.source);
  const id = string(r.id);
  if (!id.startsWith('m1-') || source.type !== 'text') throw invalid();
  const text = string(source.text);
  const clarifications = strings(r.clarifications);
  if (!Array.isArray(r.versions) || !Array.isArray(r.decisions) || !Array.isArray(r.attempts))
    throw invalid();
  const versions = r.versions.map(
    (item: unknown, index: number): IntakeRecord['versions'][number] => {
      const v = object(item);
      if (v.version !== index + 1 || (v.origin !== 'model' && v.origin !== 'human'))
        throw invalid();
      return {
        version: index + 1,
        createdAt: string(v.createdAt),
        origin: v.origin,
        proposal: parseProposal(v.proposal, [text, ...clarifications]),
      };
    }
  );
  const decisions = r.decisions.map((item: unknown): IntakeRecord['decisions'][number] => {
    const d = object(item);
    const version = integer(d.version);
    if (
      !versions[version - 1] ||
      d.scope !== 'implementation' ||
      (d.decision !== 'approved' && d.decision !== 'rejected')
    )
      throw invalid();
    return {
      version,
      decision: d.decision,
      author: string(d.author),
      at: string(d.at),
      scope: d.scope,
    };
  });
  const attempts = r.attempts.map((item: unknown) => {
    const a = object(item);
    if (a.outcome !== 'running' && a.outcome !== 'complete' && a.outcome !== 'failed')
      throw invalid();
    const result: IntakeRecord['attempts'][number] = {
      id: string(a.id),
      at: string(a.at),
      skillVersion: string(a.skillVersion),
      outcome: a.outcome,
    };
    if (a.model !== undefined) result.model = string(a.model);
    for (const key of ['inputTokens', 'outputTokens', 'estimatedCost'] as const) {
      if (a[key] !== undefined) {
        if (typeof a[key] !== 'number' || !Number.isFinite(a[key]) || a[key] < 0) throw invalid();
        result[key] = a[key];
      }
    }
    return result;
  });
  if (!['draft', 'analyzing', 'ready', 'failed'].includes(String(r.status))) throw invalid();
  return {
    id,
    revision: integer(r.revision),
    source: { type: 'text', text, createdAt: string(source.createdAt) },
    clarifications,
    versions,
    decisions,
    attempts,
    status: r.status as IntakeRecord['status'],
    error: r.error === null ? null : string(r.error),
  };
}

export function latestProposal(record: IntakeRecord) {
  return record.versions[record.versions.length - 1];
}
export function isApproved(record: IntakeRecord): boolean {
  const latest = latestProposal(record);
  const decision = record.decisions[record.decisions.length - 1];
  return (
    record.status === 'ready' &&
    !!latest &&
    !latest.proposal.questions.length &&
    decision?.version === latest.version &&
    decision.decision === 'approved'
  );
}

export class IntakeService {
  async list(): Promise<IntakeRecord[]> {
    const rows = await database.getAll('settings');
    return rows
      .filter((row) => row.key.startsWith(prefix))
      .map((row) => parseRecord(row.value))
      .sort((a, b) => b.source.createdAt.localeCompare(a.source.createdAt));
  }
  async get(id: string): Promise<IntakeRecord> {
    const row = await database.get('settings', prefix + id);
    return parseRecord(row?.value);
  }
  /** Atomic compare-and-swap also rejects stale decisions from another browser tab. */
  private async save(record: IntakeRecord, expectedRevision: number): Promise<IntakeRecord> {
    const validated = parseRecord(record);
    const db = await database.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      let failure: Error | undefined;
      const request = store.get(prefix + record.id);
      request.onsuccess = () => {
        try {
          const actual = request.result ? parseRecord(request.result.value).revision : 0;
          if (actual !== expectedRevision)
            throw new Error('O pedido mudou. Recarregue antes de continuar.');
          store.put({ key: prefix + record.id, value: validated, updatedAt: now() });
        } catch (error) {
          failure = error instanceof Error ? error : invalid();
          tx.abort();
        }
      };
      tx.oncomplete = () => resolve(validated);
      tx.onabort = tx.onerror = () =>
        reject(failure || new Error('Não foi possível guardar o pedido.'));
    });
  }
  async create(text: string): Promise<IntakeRecord> {
    return this.save(
      {
        id: `m1-${crypto.randomUUID()}`,
        revision: 1,
        source: { type: 'text', text: string(text.trim()), createdAt: now() },
        clarifications: [],
        versions: [],
        decisions: [],
        status: 'draft',
        error: null,
        attempts: [],
      },
      0
    );
  }
  async edit(record: IntakeRecord, proposal: unknown): Promise<IntakeRecord> {
    if (record.status === 'analyzing') throw new Error('Cancele a análise antes de editar.');
    const parsed = parseProposal(proposal, [record.source.text, ...record.clarifications]);
    return this.save(
      {
        ...record,
        revision: record.revision + 1,
        status: 'ready',
        error: null,
        versions: [
          ...record.versions,
          {
            version: record.versions.length + 1,
            proposal: parsed,
            createdAt: now(),
            origin: 'human',
          },
        ],
      },
      record.revision
    );
  }
  async clarify(record: IntakeRecord, answer: string): Promise<IntakeRecord> {
    if (record.status === 'analyzing') throw new Error('Cancele a análise antes de esclarecer.');
    return this.save(
      {
        ...record,
        revision: record.revision + 1,
        status: 'draft',
        error: null,
        clarifications: [...record.clarifications, string(answer.trim())],
      },
      record.revision
    );
  }
  async decide(
    record: IntakeRecord,
    decision: 'approved' | 'rejected',
    author: string
  ): Promise<IntakeRecord> {
    const latest = latestProposal(record);
    if (
      record.status !== 'ready' ||
      !latest ||
      (decision === 'approved' && latest.proposal.questions.length)
    ) {
      throw new Error('Resolva as dúvidas e guarde a proposta antes de aprovar.');
    }
    return this.save(
      {
        ...record,
        revision: record.revision + 1,
        decisions: [
          ...record.decisions,
          {
            version: latest.version,
            decision,
            author: string(author),
            at: now(),
            scope: 'implementation',
          },
        ],
      },
      record.revision
    );
  }
  async cancel(record: IntakeRecord): Promise<IntakeRecord> {
    if (record.status !== 'analyzing') throw new Error('Não existe análise em curso.');
    return this.save(
      {
        ...record,
        revision: record.revision + 1,
        status: 'failed',
        error: 'Análise cancelada ou interrompida. Pode tentar novamente.',
        attempts: record.attempts.map((a) =>
          a.outcome === 'running' ? { ...a, outcome: 'failed' } : a
        ),
      },
      record.revision
    );
  }
  async analyze(record: IntakeRecord, provider: ModelProvider): Promise<IntakeRecord> {
    if (record.status === 'analyzing') throw new Error('Já existe uma análise em curso.');
    const attempt = {
      id: crypto.randomUUID(),
      at: now(),
      skillVersion: requirementsSkill.version,
      outcome: 'running' as const,
    };
    const started = await this.save(
      {
        ...record,
        revision: record.revision + 1,
        status: 'analyzing',
        error: null,
        attempts: [...record.attempts, attempt],
      },
      record.revision
    );
    let evidence: Partial<IntakeRecord['attempts'][number]> = {};
    let failureMessage =
      'A chamada de IA falhou. Verifique a chave Groq e a ligação e tente novamente.';
    try {
      const response = await provider.execute({
        executionMode: 'real',
        taskType: 'planning',
        complexity: 'medium',
        risk: 'medium',
        budget: 'standard',
        agentId: requirementsSkill.id,
        taskId: record.id,
        temperature: 0.2,
        maxTokens: 4096,
        messages: [
          { role: 'system', content: requirementsSkill.instructions },
          {
            role: 'user',
            content: JSON.stringify({
              source: record.source,
              clarifications: record.clarifications,
            }),
          },
        ],
      });
      evidence = {
        model: response.model,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        estimatedCost: response.cost,
      };
      failureMessage =
        'A IA devolveu uma proposta inválida ou incompleta. Tente analisar novamente.';
      if (response.finishReason !== 'stop') throw invalid();
      const proposal = parseProposal(JSON.parse(response.content), [
        record.source.text,
        ...record.clarifications,
      ]);
      failureMessage = 'Não foi possível guardar o resultado da análise. Tente novamente.';
      return await this.save(
        {
          ...started,
          revision: started.revision + 1,
          status: 'ready',
          versions: [
            ...record.versions,
            { version: record.versions.length + 1, proposal, createdAt: now(), origin: 'model' },
          ],
          attempts: [...record.attempts, { ...attempt, ...evidence, outcome: 'complete' }],
        },
        started.revision
      );
    } catch {
      // Never persist provider bodies/prompts/secrets or accept a late response after cancellation.
      const current = await this.get(record.id);
      if (current.revision !== started.revision) return current;
      return this.save(
        {
          ...started,
          revision: started.revision + 1,
          status: 'failed',
          error: failureMessage,
          attempts: [...record.attempts, { ...attempt, ...evidence, outcome: 'failed' }],
        },
        started.revision
      );
    }
  }
  async assertApproved(id: string, version: number): Promise<void> {
    const record = await this.get(id);
    if (!isApproved(record) || latestProposal(record)?.version !== version)
      throw new Error('É necessária aprovação da versão atual da proposta.');
  }
}

export const intakeService = new IntakeService();

/** M1 projects cannot enter the legacy simulated execution pipeline. M2/M3 must replace this gate. */
export function assertLegacyExecutionAllowed(projectId: string): void {
  if (projectId.startsWith('m1-'))
    throw new Error(
      'A execução deste projeto aguarda a integração do board e do executor real (M2/M3).'
    );
}
