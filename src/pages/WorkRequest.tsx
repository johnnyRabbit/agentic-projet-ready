import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Settings2,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuthStore } from '../auth/AuthStore';
import { useEngineStore } from '../store/engineStore';
import { useIntakeSessionStore } from '../store/intakeSessionStore';
import { GroqProvider } from '../engine/providers/GroqProvider';
import {
  IntakeRecord,
  intakeService,
  isApproved,
  latestProposal,
} from '../engine/intake/IntakeService';
import {
  ProposalDocument,
  ProposalEditor,
  intakeField,
  intakePrimary,
  intakeSecondary,
} from '../components/intake/ProposalDocument';

type View = 'list' | 'create' | 'detail';
function statusLabel(record: IntakeRecord): string {
  if (isApproved(record)) return 'Aprovado';
  if (record.status === 'analyzing') return 'Em análise';
  if (record.status === 'failed') return 'Análise interrompida';
  if (record.status === 'draft') return 'Rascunho';
  if (
    record.decisions[record.decisions.length - 1]?.decision === 'rejected' &&
    record.decisions[record.decisions.length - 1]?.version === latestProposal(record)?.version
  )
    return 'Rejeitado';
  return latestProposal(record)?.proposal.questions.length
    ? 'Aguarda respostas'
    : 'Pronto para rever';
}
const titleOf = (record: IntakeRecord) =>
  latestProposal(record)?.proposal.title || record.source.text.slice(0, 90);
const dateLabel = (date: string) =>
  new Date(date).toLocaleString('pt-PT', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export function WorkRequest() {
  const [view, setView] = useState<View>('list');
  const [records, setRecords] = useState<IntakeRecord[]>([]);
  const [selected, setSelected] = useState<IntakeRecord | null>(null);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [busy, setBusy] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [streamedCharacters, setStreamedCharacters] = useState(0);
  const [configOpen, setConfigOpen] = useState(false);
  const [continueAfterConfig, setContinueAfterConfig] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(true);
  const controller = useRef<AbortController | null>(null);
  const user = useAuthStore((state) => state.user);
  const configuredKey = useEngineStore((state) => state.groqApiKey);
  const { apiKey: sessionKey, setApiKey } = useIntakeSessionStore();
  const key = sessionKey || configuredKey;
  const latest = selected && latestProposal(selected);
  const proposal = latest?.proposal;
  const needsAnswers = selected?.status === 'ready' && !!proposal?.questions.length;
  const approved = !!selected && isApproved(selected);
  const stage = view === 'create' || !proposal ? 1 : needsAnswers && !preview ? 2 : 3;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    intakeService
      .list()
      .then((items) => {
        if (active) setRecords(items);
      })
      .catch((failure: unknown) => {
        if (active)
          setError(
            failure instanceof Error ? failure.message : 'Não foi possível carregar os pedidos.'
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);
  useEffect(() => {
    if (!busy) return;
    setElapsed(0);
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [busy]);

  function updateRecord(record: IntakeRecord) {
    if (!mounted.current) return;
    setSelected(record);
    setRecords((items) => [record, ...items.filter((item) => item.id !== record.id)]);
    setView('detail');
  }
  async function perform(label: string, action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(label);
    setStreamedCharacters(0);
    setError('');
    try {
      await action();
    } catch (failure) {
      if (mounted.current)
        setError(
          failure instanceof Error ? failure.message : 'Não foi possível concluir a operação.'
        );
    } finally {
      lock.current = false;
      controller.current = null;
      if (mounted.current) setBusy('');
    }
  }
  function goToList() {
    if (
      (editing ||
        answers.some((answer) => answer.trim()) ||
        feedback.trim() ||
        (view === 'create' && input.trim())) &&
      !window.confirm('Sair e descartar as alterações ainda não guardadas?')
    )
      return;
    setView('list');
    setEditing(false);
    setAnswers([]);
    setFeedback('');
    setFeedbackOpen(false);
    setInput('');
    setError('');
  }
  function openRecord(id: string) {
    void perform('A abrir o pedido…', async () => {
      const record = await intakeService.get(id);
      if (!record) throw new Error('Este pedido já não está disponível.');
      updateRecord(record);
      setAnswers([]);
      setEditing(false);
      setPreview(false);
      setFeedback('');
      setFeedbackOpen(false);
    });
  }
  function analyze(apiKey = key) {
    if (!apiKey.trim()) {
      setContinueAfterConfig(true);
      setConfigOpen(true);
      return;
    }
    void perform('A guardar o pedido…', async () => {
      const abort = new AbortController();
      controller.current = abort;
      let record = selected;
      if (view === 'create') {
        record = await intakeService.create(input);
        updateRecord(record);
        setInput('');
      }
      if (!record) throw new Error('Descreva primeiro a sua ideia.');
      if (needsAnswers && !preview && proposal) {
        if (proposal.questions.some((_, index) => !answers[index]?.trim()))
          throw new Error('Responda às perguntas antes de continuar.');
        const clarification = proposal.questions
          .map(
            (question, index) => 'Pergunta: ' + question + '\nResposta: ' + answers[index].trim()
          )
          .join('\n\n');
        record = await intakeService.clarify(record, clarification);
        updateRecord(record);
        setAnswers([]);
      } else if (feedbackOpen && feedback.trim()) {
        record = await intakeService.clarify(record, feedback);
        updateRecord(record);
        setFeedback('');
        setFeedbackOpen(false);
      }
      const result = await intakeService.analyze(record, new GroqProvider(apiKey.trim()), {
        signal: abort.signal,
        onStarted: (started) => {
          updateRecord(started);
          if (mounted.current) setBusy('A analisar com a IA…');
        },
        onDelta: (_delta, accumulated) => {
          if (mounted.current) setStreamedCharacters(accumulated.length);
        },
      });
      updateRecord(result);
      setPreview(false);
    });
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-7 p-4 pt-24 text-slate-100 sm:p-8 sm:pt-24">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-300">
            Da ideia ao plano
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Pedidos de trabalho</h1>
          <p className="mt-2 text-sm text-slate-400">
            Descreva uma ideia, esclareça os detalhes e aprove a proposta.
          </p>
        </div>
        <button
          className={intakeSecondary}
          disabled={!!busy}
          onClick={() => {
            setContinueAfterConfig(false);
            setConfigOpen(true);
          }}
        >
          <Settings2 size={16} />
          <span className={key ? 'text-emerald-300' : ''}>
            {key ? 'IA configurada' : 'Configurar IA'}
          </span>
        </button>
      </header>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
        >
          {error}
          {view === 'list' && (
            <button
              className="ml-3 underline"
              onClick={() => {
                setError('');
                setLoadAttempt((value) => value + 1);
              }}
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}
      {view === 'list' ? (
        <section aria-label="Pedidos guardados" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Os seus pedidos</h2>
              <p className="mt-1 text-sm text-slate-500">
                Retome um pedido ou comece uma nova ideia.
              </p>
            </div>
            <button
              className={intakePrimary}
              disabled={!!busy || loading}
              onClick={() => {
                setSelected(null);
                setInput('');
                setError('');
                setView('create');
              }}
            >
              <Plus size={18} />
              Novo pedido
            </button>
          </div>
          {loading ? (
            <p role="status" className="py-12 text-center text-slate-400">
              A carregar pedidos…
            </p>
          ) : records.length ? (
            <div className="grid gap-3">
              {records.map((record) => (
                <button
                  key={record.id}
                  className="flex w-full items-center gap-4 rounded-2xl border border-dark-500 bg-dark-800 p-5 text-left transition-colors hover:border-indigo-400/60 disabled:opacity-50"
                  disabled={!!busy}
                  onClick={() => openRecord(record.id)}
                >
                  <FileText className="shrink-0 text-indigo-300" size={22} />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words font-medium">{titleOf(record)}</span>
                    <span className="mt-2 block text-xs text-slate-500">
                      Criado em {dateLabel(record.source.createdAt)}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-dark-700 px-3 py-1 text-xs text-slate-300">
                    {statusLabel(record)}
                  </span>
                  <ChevronRight className="hidden shrink-0 text-slate-500 sm:block" size={18} />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-dark-500 py-16 text-center">
              <Sparkles className="mx-auto mb-4 text-indigo-300" size={30} />
              <h3 className="font-medium">A próxima ideia começa aqui</h3>
              <p className="mt-2 text-sm text-slate-400">
                Crie um pedido para transformar a sua ideia numa proposta.
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          <button
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white disabled:opacity-40"
            disabled={!!busy}
            onClick={goToList}
          >
            <ArrowLeft size={16} />
            Todos os pedidos
          </button>
          <ol aria-label="Etapas do pedido" className="grid grid-cols-3 gap-2">
            {['Descrever', 'Esclarecer', 'Rever e aprovar'].map((label, index) => (
              <li
                key={label}
                aria-current={stage === index + 1 ? 'step' : undefined}
                className={
                  'flex items-center gap-2 rounded-xl border p-3 text-xs sm:gap-3 sm:p-4 sm:text-sm ' +
                  (stage === index + 1
                    ? 'border-indigo-400/40 bg-indigo-400/10 text-indigo-200'
                    : 'border-dark-500 text-slate-500')
                }
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dark-700">
                  {stage > index + 1 ? <Check size={13} /> : index + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
          {!!busy && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-indigo-400/30 bg-indigo-400/10 p-4">
              <Loader2 size={18} className="animate-spin text-indigo-300" />
              <span role="status" aria-live="polite" className="flex-1 text-sm">
                {busy} <span className="text-slate-400">{elapsed}s</span>
                {streamedCharacters > 0 && (
                  <span className="ml-2 text-slate-400">
                    · resposta em curso ({streamedCharacters.toLocaleString('pt-PT')} caracteres)
                  </span>
                )}
              </span>
              {controller.current && (
                <button className={intakeSecondary} onClick={() => controller.current?.abort()}>
                  Cancelar análise
                </button>
              )}
            </div>
          )}
          <section
            aria-label="Pedido aberto"
            className="rounded-2xl border border-dark-500 bg-dark-800 p-5 sm:p-8"
          >
            {view === 'create' ? (
              <form
                className="space-y-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  analyze();
                }}
              >
                <div>
                  <h2 className="text-xl font-semibold">O que quer criar?</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Conte-nos a sua ideia: para quem é, que problema resolve e o que deve permitir
                    fazer.
                  </p>
                </div>
                <label className="block space-y-3">
                  <span className="text-sm font-medium">Descreva a sua ideia</span>
                  <textarea
                    autoFocus
                    className={intakeField}
                    rows={8}
                    maxLength={30000}
                    value={input}
                    disabled={!!busy}
                    placeholder="Quero uma aplicação que ajude as crianças a organizar as tarefas diárias…"
                    onChange={(event) => setInput(event.target.value)}
                  />
                </label>
                <div className="flex justify-between gap-4 text-xs text-slate-500">
                  <span>Não precisa de conhecer os detalhes técnicos.</span>
                  <span>{input.length.toLocaleString('pt-PT')} / 30 000</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 border-t border-dark-500 pt-5">
                  <button className={intakePrimary} disabled={!input.trim() || !!busy}>
                    <Sparkles size={17} />
                    Analisar ideia
                  </button>
                  <p className="text-xs text-slate-500">A ideia é guardada antes da análise.</p>
                </div>
              </form>
            ) : (
              selected && (
                <>
                  {selected.error && !busy && (
                    <div
                      role="alert"
                      className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
                    >
                      {selected.error}
                    </div>
                  )}
                  {selected.status === 'analyzing' && !busy ? (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">
                        Este pedido tem uma análise pendente
                      </h2>
                      <p className="text-sm text-slate-400">
                        Se já não estiver a decorrer noutra janela, cancele-a para poder tentar
                        novamente.
                      </p>
                      <button
                        className={intakeSecondary}
                        onClick={() =>
                          void perform('A cancelar…', async () =>
                            updateRecord(await intakeService.cancel(selected))
                          )
                        }
                      >
                        Cancelar análise pendente
                      </button>
                    </div>
                  ) : editing && proposal ? (
                    <ProposalEditor
                      initial={proposal}
                      busy={!!busy}
                      onCancel={() => setEditing(false)}
                      onSave={(draft) =>
                        void perform('A guardar alterações…', async () => {
                          updateRecord(await intakeService.edit(selected, draft));
                          setEditing(false);
                          setPreview(false);
                        })
                      }
                    />
                  ) : needsAnswers && !preview && proposal ? (
                    <div className="space-y-6">
                      <div>
                        <p className="mb-2 text-xs text-indigo-300">{proposal.title}</p>
                        <h2 className="text-xl font-semibold">Vamos esclarecer alguns detalhes</h2>
                        <p className="mt-2 text-sm text-slate-400">
                          Responda a estas {proposal.questions.length} perguntas para completar a
                          proposta.
                        </p>
                      </div>
                      {proposal.questions.map((question, index) => (
                        <label
                          key={index}
                          className="block space-y-3 rounded-xl border border-dark-500 bg-dark-900/40 p-4"
                        >
                          <span className="block text-sm font-medium">
                            <span className="mr-2 text-indigo-300">{index + 1}.</span>
                            {question}
                          </span>
                          <textarea
                            aria-label={question}
                            rows={3}
                            className={intakeField}
                            placeholder="A sua resposta…"
                            value={answers[index] || ''}
                            disabled={!!busy}
                            onChange={(event) =>
                              setAnswers((values) => {
                                const next = [...values];
                                next[index] = event.target.value;
                                return next;
                              })
                            }
                          />
                        </label>
                      ))}
                      <div className="flex flex-wrap gap-3 border-t border-dark-500 pt-5">
                        <button
                          className={intakePrimary}
                          disabled={
                            !!busy || proposal.questions.some((_, index) => !answers[index]?.trim())
                          }
                          onClick={() => analyze()}
                        >
                          Atualizar proposta
                          <ArrowRight size={16} />
                        </button>
                        <button
                          className={intakeSecondary}
                          disabled={!!busy}
                          onClick={() => setPreview(true)}
                        >
                          Ver proposta provisória
                        </button>
                      </div>
                    </div>
                  ) : selected.status === 'ready' && proposal ? (
                    <div className="space-y-6">
                      {approved && (
                        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                          <p className="font-medium text-emerald-200">Proposta aprovada</p>
                          <p className="mt-1 text-sm text-slate-400">
                            A versão {latest?.version} ficou aprovada para implementação. A execução
                            automática ainda não está disponível neste fluxo.
                          </p>
                        </div>
                      )}
                      {needsAnswers && (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-400/10 p-4 text-sm text-amber-200">
                          Ainda há perguntas por responder.
                          <button className={intakeSecondary} onClick={() => setPreview(false)}>
                            Responder às perguntas
                          </button>
                        </div>
                      )}
                      <ProposalDocument
                        proposal={proposal}
                        disabled={!!busy || feedbackOpen}
                        onEdit={() => setEditing(true)}
                      />
                      {!needsAnswers && !approved && (
                        <div className="space-y-4 border-t border-dark-500 pt-6">
                          <div className="flex flex-wrap justify-between gap-3">
                            <button
                              className={intakeSecondary}
                              disabled={!!busy}
                              onClick={() => setFeedbackOpen(true)}
                            >
                              Pedir um ajuste
                            </button>
                            <button
                              className={intakePrimary}
                              disabled={!!busy || !user || feedbackOpen}
                              onClick={() =>
                                void perform('A aprovar…', async () =>
                                  updateRecord(
                                    await intakeService.decide(selected, 'approved', user?.id || '')
                                  )
                                )
                              }
                            >
                              <Check size={17} />
                              Aprovar proposta
                            </button>
                          </div>
                          <p className="text-xs text-slate-500">
                            A aprovação refere-se apenas à versão {latest?.version}. Qualquer
                            alteração requer uma nova aprovação.
                          </p>
                        </div>
                      )}
                      {feedbackOpen && (
                        <form
                          className="space-y-4 rounded-xl border border-dark-500 p-4"
                          onSubmit={(event) => {
                            event.preventDefault();
                            analyze();
                          }}
                        >
                          <label className="block space-y-2 text-sm">
                            <span>O que deve mudar na proposta?</span>
                            <textarea
                              autoFocus
                              className={intakeField}
                              rows={4}
                              value={feedback}
                              disabled={!!busy}
                              onChange={(event) => setFeedback(event.target.value)}
                            />
                          </label>
                          <div className="flex flex-wrap gap-3">
                            <button className={intakePrimary} disabled={!!busy || !feedback.trim()}>
                              Atualizar proposta
                            </button>
                            <button
                              type="button"
                              className={intakeSecondary}
                              disabled={!!busy}
                              onClick={() => {
                                setFeedbackOpen(false);
                                setFeedback('');
                              }}
                            >
                              Cancelar ajuste
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold">
                        {busy
                          ? 'A preparar a sua proposta'
                          : selected.clarifications.length
                            ? 'As respostas estão guardadas'
                            : 'A sua ideia está guardada'}
                      </h2>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                        {selected.source.text}
                      </p>
                      {!busy && (
                        <button className={intakePrimary} onClick={() => analyze()}>
                          <Sparkles size={17} />
                          {selected.status === 'failed'
                            ? 'Tentar análise novamente'
                            : 'Analisar ideia'}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )
            )}
          </section>
          {selected && (
            <details className="rounded-xl border border-dark-500 p-5 text-sm text-slate-400">
              <summary className="cursor-pointer font-medium text-slate-300">
                Histórico e detalhes do pedido
              </summary>
              <div className="mt-5 space-y-5">
                <section>
                  <h3 className="mb-2 font-medium text-slate-200">Ideia original</h3>
                  <p className="whitespace-pre-wrap">{selected.source.text}</p>
                  <p className="mt-2 break-all text-xs text-slate-500">
                    {selected.id} · {dateLabel(selected.source.createdAt)}
                  </p>
                </section>
                {selected.clarifications.map((text, index) => (
                  <section key={index}>
                    <h3 className="mb-2 font-medium text-slate-200">Esclarecimento {index + 1}</h3>
                    <p className="whitespace-pre-wrap">{text}</p>
                  </section>
                ))}
                {selected.versions.map((version) => (
                  <details key={version.version} className="rounded-xl border border-dark-500 p-4">
                    <summary className="cursor-pointer">
                      Versão {version.version} ·{' '}
                      {version.origin === 'human' ? 'Edição manual' : 'Análise por IA'} ·{' '}
                      {dateLabel(version.createdAt)}
                    </summary>
                    <div className="mt-5">
                      <ProposalDocument proposal={version.proposal} />
                    </div>
                  </details>
                ))}
                {selected.decisions.map((decision, index) => (
                  <p key={index}>
                    Versão {decision.version} ·{' '}
                    {decision.decision === 'approved' ? 'Aprovada' : 'Rejeitada'} ·{' '}
                    {dateLabel(decision.at)}
                  </p>
                ))}
                <details>
                  <summary className="cursor-pointer">Detalhes técnicos da análise</summary>
                  {selected.attempts.map((attempt) => (
                    <p className="mt-2" key={attempt.id}>
                      {dateLabel(attempt.at)} ·{' '}
                      {attempt.outcome === 'complete'
                        ? 'Concluída'
                        : attempt.outcome === 'failed'
                          ? 'Falhou'
                          : 'Em curso'}{' '}
                      · {attempt.model || 'Modelo ainda não registado'}
                    </p>
                  ))}
                </details>
                {selected.status === 'ready' && !approved && (
                  <button
                    className={intakeSecondary}
                    disabled={!!busy || editing || !user}
                    onClick={() =>
                      void perform('A registar decisão…', async () =>
                        updateRecord(
                          await intakeService.decide(selected, 'rejected', user?.id || '')
                        )
                      )
                    }
                  >
                    Rejeitar esta versão
                  </button>
                )}
              </div>
            </details>
          )}
        </>
      )}
      {configOpen && (
        <AIConfiguration
          initialKey={sessionKey}
          hasConfiguredKey={!!configuredKey}
          continuing={continueAfterConfig}
          onClose={() => setConfigOpen(false)}
          onSave={(value) => {
            setApiKey(value);
            setConfigOpen(false);
            if (continueAfterConfig) analyze(value || configuredKey);
          }}
        />
      )}
    </main>
  );
}

function AIConfiguration({
  initialKey,
  hasConfiguredKey,
  continuing,
  onClose,
  onSave,
}: {
  initialKey: string;
  hasConfiguredKey: boolean;
  continuing: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(initialKey);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="ai-configuration-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 m-auto w-11/12 max-w-md rounded-2xl border border-dark-500 bg-dark-800 p-6 text-slate-100 shadow-2xl backdrop:bg-black/70"
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(value.trim());
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="ai-configuration-title" className="text-xl font-semibold">
            Configurar IA
          </h2>
          <button
            type="button"
            aria-label="Fechar configuração"
            className="text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">
          A Groq analisa a ideia e as suas respostas para preparar a proposta.
        </p>
        <label className="block space-y-2 text-sm">
          <span>Chave Groq para esta sessão</span>
          <input
            autoFocus
            type="password"
            autoComplete="off"
            className={intakeField}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={
              hasConfiguredKey ? 'Existe uma chave nas definições' : 'Introduza a chave Groq'
            }
          />
        </label>
        <p className="text-xs leading-relaxed text-slate-500">
          Esta chave fica apenas em memória durante a sessão e não é guardada com o pedido. O
          conteúdo do pedido é enviado à Groq para análise.
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" className={intakeSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button className={intakePrimary} disabled={!value.trim() && !hasConfiguredKey}>
            {continuing ? 'Continuar análise' : 'Guardar configuração'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
