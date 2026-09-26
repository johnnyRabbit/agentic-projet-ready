import { useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import { Proposal } from '../../engine/intake/IntakeService';

export const intakeField =
  'w-full rounded-xl border border-dark-500 bg-dark-900 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 disabled:opacity-60';
export const intakePrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-40';
export const intakeSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-dark-500 bg-dark-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-40';

export function ProposalDocument({
  proposal,
  onEdit,
  disabled = false,
}: {
  proposal: Proposal;
  onEdit?: () => void;
  disabled?: boolean;
}) {
  return (
    <article className="space-y-7" aria-label="Proposta">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-300">
            A sua proposta
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">{proposal.title}</h2>
        </div>
        {onEdit && (
          <button className={intakeSecondary} onClick={onEdit} disabled={disabled}>
            <Pencil size={15} />
            Editar proposta
          </button>
        )}
      </div>
      <DocumentSection title="O que vamos construir" items={proposal.scope} />
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Funcionalidades e critérios de aceitação
        </h3>
        {proposal.requirements.map((r, i) => (
          <div key={r.id} className="rounded-xl border border-dark-500 bg-dark-900/50 p-5">
            <h4 className="mb-3 flex gap-3 font-medium text-slate-100">
              <span className="text-indigo-300">{String(i + 1).padStart(2, '0')}</span>
              {r.description}
            </h4>
            <ul className="space-y-2">
              {r.acceptanceCriteria.map((criterion, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed text-slate-400">
                  <Check size={15} className="mt-1 shrink-0 text-emerald-400" />
                  {criterion}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <div className="grid gap-6 sm:grid-cols-2">
        <DocumentSection
          title="Fica fora desta versão"
          items={proposal.exclusions}
          empty="Sem exclusões adicionais."
        />
        <DocumentSection
          title="Suposições a confirmar"
          items={proposal.assumptions}
          empty="Sem suposições adicionais."
        />
      </div>
      <DocumentSection
        title="Riscos a considerar"
        items={proposal.risks}
        empty="Sem riscos adicionais identificados."
      />
      <section className="rounded-xl border border-indigo-400/20 bg-indigo-400/5 p-4">
        <h3 className="mb-2 text-sm font-semibold text-indigo-200">Estimativa indicativa</h3>
        <p className="text-sm leading-relaxed text-slate-300">{proposal.estimate}</p>
        <p className="mt-2 text-xs text-slate-500">
          É uma estimativa, não uma medição nem um compromisso de entrega.
        </p>
      </section>
    </article>
  );
}

function DocumentSection({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty?: string;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-200">{title}</h3>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed text-slate-400">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{empty}</p>
      )}
    </section>
  );
}

const listLabels = {
  scope: 'Âmbito',
  exclusions: 'Exclusões',
  assumptions: 'Suposições',
  risks: 'Riscos',
  questions: 'Dúvidas por resolver',
} as const;

export function ProposalEditor({
  initial,
  onSave,
  onCancel,
  busy,
}: {
  initial: Proposal;
  onSave: (proposal: Proposal) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  // Mounted only while editing. Cancel never mutates the saved version.
  return <EditorForm initial={initial} onSave={onSave} onCancel={onCancel} busy={busy} />;
}

function EditorForm({
  initial,
  onSave,
  onCancel,
  busy,
}: {
  initial: Proposal;
  onSave: (proposal: Proposal) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [draft, setDraft] = useState(() => structuredClone(initial));
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const lines = (text: string) => text.split('\n');
  const clean = (items: string[]) => items.map((s) => s.trim()).filter(Boolean);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...draft,
          ...Object.fromEntries(
            Object.keys(listLabels).map((key) => [
              key,
              clean(draft[key as keyof typeof listLabels]),
            ])
          ),
          requirements: draft.requirements.map((r) => ({
            ...r,
            acceptanceCriteria: clean(r.acceptanceCriteria),
          })),
        });
      }}
    >
      <fieldset disabled={busy} className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Editar a proposta</h2>
          <p className="mt-2 text-sm text-slate-400">
            As alterações criam uma nova versão que terá de ser aprovada.
          </p>
        </div>
        <EditorField
          label="Título"
          value={draft.title}
          onChange={(title) => setDraft({ ...draft, title })}
        />
        {Object.entries(listLabels).map(([key, label]) => (
          <EditorField
            key={key}
            label={`${label} (um item por linha)`}
            value={draft[key as keyof typeof listLabels].join('\n')}
            onChange={(text) => setDraft({ ...draft, [key]: lines(text) })}
          />
        ))}
        {draft.requirements.map((r, index) => (
          <div key={r.id} className="space-y-4 rounded-xl border border-dark-500 p-4">
            <EditorField
              label={`Descrição ${r.id}`}
              value={r.description}
              onChange={(description) =>
                setDraft({
                  ...draft,
                  requirements: draft.requirements.map((item, i) =>
                    i === index ? { ...item, description } : item
                  ),
                })
              }
            />
            <EditorField
              label={`Critérios de aceitação ${r.id} (um por linha)`}
              value={r.acceptanceCriteria.join('\n')}
              onChange={(text) =>
                setDraft({
                  ...draft,
                  requirements: draft.requirements.map((item, i) =>
                    i === index ? { ...item, acceptanceCriteria: lines(text) } : item
                  ),
                })
              }
            />
            <EditorField
              label={`Referência à fonte ${r.id} (excerto literal)`}
              value={r.sourceQuote}
              onChange={(sourceQuote) =>
                setDraft({
                  ...draft,
                  requirements: draft.requirements.map((item, i) =>
                    i === index ? { ...item, sourceQuote } : item
                  ),
                })
              }
            />
            <button
              type="button"
              className={intakeSecondary}
              disabled={draft.requirements.length === 1}
              onClick={() =>
                setDraft({
                  ...draft,
                  requirements: draft.requirements.filter((_, i) => i !== index),
                })
              }
            >
              Remover requisito {index + 1}
            </button>
          </div>
        ))}
        <button
          type="button"
          className={intakeSecondary}
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
        <EditorField
          label="Estimativa"
          value={draft.estimate}
          onChange={(estimate) => setDraft({ ...draft, estimate })}
        />
        <div className="flex flex-wrap gap-3 border-t border-dark-500 pt-5">
          <button className={intakePrimary} disabled={!dirty}>
            Guardar alterações
          </button>
          <button type="button" className={intakeSecondary} onClick={onCancel}>
            Cancelar edição
          </button>
        </div>
      </fieldset>
    </form>
  );
}

function EditorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      <textarea
        className={intakeField}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
