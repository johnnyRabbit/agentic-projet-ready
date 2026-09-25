import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../auth/AuthStore';
import { useEngineStore } from '../store/engineStore';
import { GroqProvider } from '../engine/providers/GroqProvider';
import {
  IntakeRecord,
  Proposal,
  intakeService,
  isApproved,
  latestProposal,
} from '../engine/intake/IntakeService';

const fieldClass = 'w-full rounded-lg bg-dark-700 border border-dark-500 p-3 text-white';
const buttonClass = 'rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-40';
const labels = {
  scope: 'Âmbito',
  exclusions: 'Exclusões',
  assumptions: 'Suposições',
  questions: 'Dúvidas por resolver',
  risks: 'Riscos',
} as const;

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1 text-sm text-slate-300">
      <span>{label}</span>
      <textarea className={fieldClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function WorkRequest() {
  const [records, setRecords] = useState<IntakeRecord[]>([]);
  const [selected, setSelected] = useState<IntakeRecord | null>(null);
  const [draft, setDraft] = useState<Proposal | null>(null);
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const lock = useRef(false);
  const user = useAuthStore((state) => state.user);
  const apiKey = useEngineStore((state) => state.groqApiKey);
  const [sessionKey, setSessionKey] = useState('');
  const key = sessionKey || apiKey;

  const select = (record: IntakeRecord | null) => {
    setSelected(record);
    setDraft(record ? structuredClone(latestProposal(record)?.proposal || null) : null);
    setAnswer('');
  };
  useEffect(() => {
    let active = true;
    intakeService
      .list()
      .then((items) => {
        if (!active) return;
        setRecords(items);
        select(items[0] || null);
        setLoaded(true);
      })
      .catch(() => {
        if (active) {
          setError(
            'Não foi possível aceder ao armazenamento local. Ainda pode escrever uma ideia e tentar guardar.'
          );
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const perform = async (action: () => Promise<IntakeRecord>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const record = await action();
      select(record);
      setRecords(await intakeService.list());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível guardar. Tente novamente.'
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const latest = selected && latestProposal(selected);
  const dirty = !!draft && JSON.stringify(draft) !== JSON.stringify(latest?.proposal);
  const pending = selected?.status === 'analyzing';
  const approved = selected && isApproved(selected);
  const splitLines = (text: string) => text.split('\n');
  // Blank lines are removed only when saving, so typing a new line remains possible.
  const clean = (proposal: Proposal): Proposal => ({
    ...proposal,
    ...Object.fromEntries(
      Object.keys(labels).map((k) => [
        k,
        proposal[k as keyof typeof labels].map((s) => s.trim()).filter(Boolean),
      ])
    ),
    requirements: proposal.requirements.map((r) => ({
      ...r,
      acceptanceCriteria: r.acceptanceCriteria.map((s) => s.trim()).filter(Boolean),
    })),
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 text-white">
      <h1 className="text-2xl font-bold">Ideia e proposta</h1>
      <p className="text-slate-400">
        Cole uma ideia ou especificação. Reveja a análise e aprove uma versão concreta antes da
        implementação.
      </p>
      {error && (
        <p role="alert" className="text-red-300">
          {error}
        </p>
      )}
      {!loaded && <p role="status">A carregar pedidos…</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <main className="space-y-6 min-w-0">
          <fieldset disabled={busy || dirty} className="space-y-4 glass-card p-5 rounded-xl">
            <TextField
              label="Nova ideia ou especificação (texto)"
              value={input}
              onChange={setInput}
            />
            <button
              className={buttonClass}
              disabled={!input.trim() || input.length > 30000}
              onClick={() =>
                void perform(async () => {
                  const record = await intakeService.create(input);
                  setInput('');
                  return record;
                })
              }
            >
              Guardar entrada
            </button>
            <p className="text-xs text-slate-400">
              Até 30 000 caracteres. Upload, Jira e importação de repositórios serão
              disponibilizados numa fase posterior.
            </p>
            {error && (
              <button
                className={buttonClass}
                type="button"
                disabled={busy}
                onClick={() => window.location.reload()}
              >
                Tentar carregar pedidos novamente
              </button>
            )}
          </fieldset>
          {selected && (
            <section className="glass-card rounded-xl p-5 space-y-4" aria-label="Pedido guardado">
              <h2 className="text-lg font-semibold">Entrada guardada</h2>
              <p className="text-xs text-slate-400 break-all">
                Projeto {selected.id} · Origem: texto ·{' '}
                {new Date(selected.source.createdAt).toLocaleString()}
              </p>
              <p className="whitespace-pre-wrap break-words">{selected.source.text}</p>
              {selected.clarifications.map((text, i) => (
                <p key={i} className="whitespace-pre-wrap text-slate-300">
                  Esclarecimento {i + 1}: {text}
                </p>
              ))}
              <label className="block text-sm text-slate-300">
                Chave Groq para esta sessão
                <input
                  type="password"
                  autoComplete="off"
                  value={sessionKey}
                  onChange={(e) => setSessionKey(e.target.value)}
                  className={fieldClass}
                  placeholder={
                    apiKey ? 'Chave configurada disponível' : 'Introduza a chave para analisar'
                  }
                />
              </label>
              <p className="text-xs text-slate-400">
                A chave introduzida aqui fica apenas em memória e não é guardada com o pedido.
              </p>
              <button
                className={buttonClass}
                disabled={busy || pending || dirty || !key.trim()}
                onClick={() =>
                  void perform(() => intakeService.analyze(selected, new GroqProvider(key)))
                }
              >
                {busy ? 'A processar…' : 'Analisar requisitos'}
              </button>
              {pending && (
                <div role="status">
                  <p>
                    Existe uma análise em curso ou interrompida. Pode cancelar para tentar
                    novamente.
                  </p>
                  <button
                    className={buttonClass}
                    disabled={busy}
                    onClick={() => void perform(() => intakeService.cancel(selected))}
                  >
                    Cancelar análise pendente
                  </button>
                </div>
              )}
              {selected.error && (
                <p role="alert" className="text-red-300">
                  {selected.error}
                </p>
              )}
              <fieldset disabled={busy || pending || dirty} className="space-y-3">
                <TextField
                  label="Esclarecimento ou correção da entrada"
                  value={answer}
                  onChange={setAnswer}
                />
                <button
                  className={buttonClass}
                  disabled={!answer.trim()}
                  onClick={() => void perform(() => intakeService.clarify(selected, answer))}
                >
                  Guardar esclarecimento
                </button>
                <p className="text-xs text-slate-400">
                  Esclarecimentos exigem uma nova análise e aprovação.
                </p>
              </fieldset>
            </section>
          )}
          {selected && draft && latest && (
            <section className="glass-card rounded-xl p-5 space-y-4" aria-label="Proposta">
              <h2 className="text-lg font-semibold">Proposta v{latest.version}</h2>
              <p role="status">
                {approved
                  ? 'Aprovada para implementação'
                  : selected.status === 'draft' || selected.status === 'failed'
                    ? 'É necessária uma nova análise'
                    : 'Aguarda decisão'}
              </p>
              <fieldset
                disabled={busy || pending || selected.status !== 'ready'}
                className="space-y-4"
              >
                <TextField
                  label="Título"
                  value={draft.title}
                  onChange={(title) => setDraft({ ...draft, title })}
                />
                {Object.entries(labels).map(([key, label]) => (
                  <TextField
                    key={key}
                    label={`${label} (um item por linha)`}
                    value={draft[key as keyof typeof labels].join('\n')}
                    onChange={(text) => setDraft({ ...draft, [key]: splitLines(text) })}
                  />
                ))}
                {draft.requirements.map((requirement, i) => (
                  <div
                    key={requirement.id}
                    className="rounded-lg border border-dark-500 p-3 space-y-3"
                  >
                    <p className="font-medium">Requisito {requirement.id}</p>
                    <TextField
                      label={`Referência à fonte ${requirement.id} (excerto literal)`}
                      value={requirement.sourceQuote}
                      onChange={(sourceQuote) =>
                        setDraft({
                          ...draft,
                          requirements: draft.requirements.map((r, index) =>
                            index === i ? { ...r, sourceQuote } : r
                          ),
                        })
                      }
                    />
                    <TextField
                      label={`Descrição ${requirement.id}`}
                      value={requirement.description}
                      onChange={(description) =>
                        setDraft({
                          ...draft,
                          requirements: draft.requirements.map((r, index) =>
                            index === i ? { ...r, description } : r
                          ),
                        })
                      }
                    />
                    <TextField
                      label={`Critérios de aceitação ${requirement.id} (um por linha)`}
                      value={requirement.acceptanceCriteria.join('\n')}
                      onChange={(text) =>
                        setDraft({
                          ...draft,
                          requirements: draft.requirements.map((r, index) =>
                            index === i ? { ...r, acceptanceCriteria: splitLines(text) } : r
                          ),
                        })
                      }
                    />
                    <button
                      className={buttonClass}
                      disabled={draft.requirements.length === 1}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          requirements: draft.requirements.filter((_, index) => index !== i),
                        })
                      }
                    >
                      Remover {requirement.id}
                    </button>
                  </div>
                ))}
                <button
                  className={buttonClass}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      requirements: [
                        ...draft.requirements,
                        {
                          id: `R-${crypto.randomUUID().slice(0, 8)}`,
                          description: '',
                          sourceQuote: '',
                          acceptanceCriteria: [''],
                        },
                      ],
                    })
                  }
                >
                  Adicionar requisito
                </button>
                <TextField
                  label="Estimativa (não é uma medição)"
                  value={draft.estimate}
                  onChange={(estimate) => setDraft({ ...draft, estimate })}
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    className={buttonClass}
                    disabled={!dirty}
                    onClick={() => void perform(() => intakeService.edit(selected, clean(draft)))}
                  >
                    Guardar nova versão
                  </button>
                  <button
                    className={buttonClass}
                    disabled={!dirty}
                    onClick={() => select(selected)}
                  >
                    Descartar edição
                  </button>
                  <button
                    className={buttonClass}
                    disabled={dirty || !!draft.questions.length || !user || !!approved}
                    onClick={() =>
                      void perform(() => intakeService.decide(selected, 'approved', user?.id || ''))
                    }
                  >
                    Aprovar v{latest.version}
                  </button>
                  <button
                    className={buttonClass}
                    disabled={dirty || !user}
                    onClick={() =>
                      void perform(() => intakeService.decide(selected, 'rejected', user?.id || ''))
                    }
                  >
                    Rejeitar v{latest.version}
                  </button>
                </div>
              </fieldset>
              {dirty && (
                <p className="text-amber-300">
                  Guarde ou descarte as alterações antes de continuar. Uma nova versão exige nova
                  aprovação.
                </p>
              )}
              {!!draft.questions.length && (
                <p className="text-amber-300">
                  Resolva as dúvidas através de esclarecimentos e nova análise, ou edite a proposta
                  com a decisão tomada.
                </p>
              )}
              <p className="text-sm text-slate-400">
                A aprovação refere-se apenas à implementação desta versão. Não autoriza publicação
                nem merge. Board e execução real aguardam M2/M3.
              </p>
              <details>
                <summary>Histórico de versões e decisões</summary>
                {selected.versions.map((v) => (
                  <details key={v.version} className="p-2">
                    <summary>
                      v{v.version} · {v.origin === 'human' ? 'Edição humana' : 'Análise IA'} ·{' '}
                      {v.createdAt}
                    </summary>
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(v.proposal, null, 2)}
                    </pre>
                  </details>
                ))}
                {selected.decisions.map((d, i) => (
                  <p key={i} className="text-sm">
                    v{d.version} · {d.decision === 'approved' ? 'Aprovada' : 'Rejeitada'} ·{' '}
                    {d.author} · {d.at} · implementação
                  </p>
                ))}
              </details>
            </section>
          )}
          {!!selected?.attempts.length && (
            <details className="glass-card p-5 rounded-xl">
              <summary>Registo de análises</summary>
              {selected.attempts.map((a) => (
                <p key={a.id} className="text-sm py-2">
                  {a.at} · skill {a.skillVersion} · {a.outcome}{' '}
                  {a.model &&
                    `· ${a.model} · tokens: ${a.inputTokens}/${a.outputTokens} · custo estimado: $${a.estimatedCost}`}
                </p>
              ))}
            </details>
          )}
        </main>
        <aside className="space-y-3">
          <h2 className="font-semibold">Pedidos guardados</h2>
          {!records.length && <p className="text-slate-400">Ainda não existem pedidos.</p>}
          {records.map((record) => (
            <button
              key={record.id}
              disabled={busy || dirty}
              aria-pressed={selected?.id === record.id}
              className="w-full text-left rounded-lg border border-dark-500 p-3 disabled:opacity-40"
              onClick={() => void perform(() => intakeService.get(record.id))}
            >
              {latestProposal(record)?.proposal.title || record.source.text.slice(0, 80)}
              <span className="block text-xs text-slate-400">
                {isApproved(record) ? 'Aprovado' : record.status}
              </span>
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
}
