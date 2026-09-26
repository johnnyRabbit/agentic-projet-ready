import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WorkRequest } from '../../pages/WorkRequest';
import { database } from '../../persistence/Database';
import { GroqProvider } from '../../engine/providers/GroqProvider';
import { intakeService } from '../../engine/intake/IntakeService';
import { useIntakeSessionStore } from '../../store/intakeSessionStore';

vi.mock('../../auth/AuthStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) => selector({ user: { id: 'human-1' } }),
}));
vi.mock('../../store/engineStore', () => ({
  useEngineStore: (selector: (s: unknown) => unknown) => selector({ groqApiKey: '' }),
}));
const content = JSON.stringify({
  title: 'Tarefas',
  scope: ['Criar tarefas'],
  exclusions: [],
  assumptions: [],
  questions: [],
  risks: [],
  estimate: 'Estimativa: um dia',
  requirements: [
    {
      id: 'R1',
      description: 'Criar tarefas',
      sourceQuote: 'Criar tarefas',
      acceptanceCriteria: ['Tarefa aparece na lista'],
    },
  ],
});
beforeEach(async () => {
  await database.clear('settings');
  useIntakeSessionStore.setState({ apiKey: '' });
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('saves input, analyzes, approves, reloads and invalidates approval through the UI', async () => {
  vi.spyOn(GroqProvider.prototype, 'execute').mockResolvedValue({
    content,
    model: 'fixture',
    provider: 'fixture',
    inputTokens: 10,
    outputTokens: 20,
    cachedTokens: 0,
    cost: 0.01,
    latency: 1,
    timestamp: new Date().toISOString(),
    finishReason: 'stop',
  });
  const view = render(<WorkRequest />);
  await waitFor(() => expect(screen.queryByText('A carregar pedidos…')).not.toBeInTheDocument());
  fireEvent.click(screen.getByText('Novo pedido'));
  fireEvent.change(screen.getByLabelText('Descreva a sua ideia'), {
    target: { value: 'Criar tarefas' },
  });
  fireEvent.click(screen.getByText('Analisar ideia'));
  fireEvent.change(screen.getByLabelText('Chave Groq para esta sessão'), {
    target: { value: 'session-test-key' },
  });
  fireEvent.click(screen.getByText('Continuar análise'));
  await waitFor(() => expect(screen.getByText('Aprovar proposta')).toBeEnabled());
  fireEvent.click(screen.getByText('Aprovar proposta'));
  await screen.findByText('Proposta aprovada');
  const [saved] = await intakeService.list();
  expect(JSON.stringify(saved)).not.toContain('session-test-key');
  view.unmount();
  render(<WorkRequest />);
  fireEvent.click(await screen.findByText('Tarefas'));
  await screen.findByText('Proposta aprovada');
  expect(screen.queryByLabelText('Chave Groq para esta sessão')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Editar proposta'));
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Tarefas alteradas' } });
  expect(screen.queryByText('Aprovar proposta')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Guardar alterações'));
  await waitFor(() => expect(screen.getByText('Aprovar proposta')).toBeEnabled());
  expect(screen.queryByText('Proposta aprovada')).not.toBeInTheDocument();
  expect((await intakeService.list())[0].versions).toHaveLength(2);
});

const response = (questions: string[] = []) => ({
  content: JSON.stringify({ ...JSON.parse(content), questions }),
  model: 'fixture',
  provider: 'fixture',
  inputTokens: 10,
  outputTokens: 20,
  cachedTokens: 0,
  cost: 0.01,
  latency: 1,
  timestamp: new Date().toISOString(),
  finishReason: 'stop' as const,
});
async function startIdea() {
  useIntakeSessionStore.setState({ apiKey: 'fixture-key' });
  render(<WorkRequest />);
  await waitFor(() => expect(screen.getByText('Novo pedido')).toBeEnabled());
  fireEvent.click(screen.getByText('Novo pedido'));
  fireEvent.change(screen.getByLabelText('Descreva a sua ideia'), {
    target: { value: 'Criar tarefas' },
  });
  fireEvent.click(screen.getByText('Analisar ideia'));
}

it('pairs answers with questions and updates the same request', async () => {
  vi.spyOn(GroqProvider.prototype, 'execute')
    .mockResolvedValueOnce(response(['Para quem?', 'Precisa de login?']))
    .mockResolvedValueOnce(response());
  await startIdea();
  await screen.findByText('Vamos esclarecer alguns detalhes');
  expect(screen.getByText('Atualizar proposta')).toBeDisabled();
  fireEvent.click(screen.getByText('Ver proposta provisória'));
  expect(screen.queryByText('Aprovar proposta')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Responder às perguntas'));
  fireEvent.change(screen.getByLabelText('Para quem?'), { target: { value: 'Crianças' } });
  fireEvent.change(screen.getByLabelText('Precisa de login?'), { target: { value: 'Não' } });
  fireEvent.click(screen.getByText('Atualizar proposta'));
  await waitFor(() => expect(screen.getByText('Aprovar proposta')).toBeEnabled());
  const records = await intakeService.list();
  expect(records).toHaveLength(1);
  expect(records[0].clarifications[0]).toContain('Pergunta: Para quem?\nResposta: Crianças');
  expect(records[0].versions).toHaveLength(2);
});

it('keeps the idea after a provider failure and allows retry', async () => {
  vi.spyOn(GroqProvider.prototype, 'execute')
    .mockRejectedValueOnce(new Error('failure'))
    .mockResolvedValueOnce(response());
  await startIdea();
  fireEvent.click(await screen.findByText('Tentar análise novamente'));
  await waitFor(() => expect(screen.getByText('Aprovar proposta')).toBeEnabled());
  const records = await intakeService.list();
  expect(records).toHaveLength(1);
  expect(records[0].source.text).toBe('Criar tarefas');
  expect(records[0].attempts.map((attempt) => attempt.outcome)).toEqual(['failed', 'complete']);
});

it('aborts the active provider request without losing the saved idea', async () => {
  const execute = vi.spyOn(GroqProvider.prototype, 'execute').mockImplementation(
    (request) =>
      new Promise((_, reject) => {
        request.signal?.addEventListener('abort', () => reject(new Error('aborted')), {
          once: true,
        });
      })
  );
  await startIdea();
  await waitFor(() => expect(execute).toHaveBeenCalledOnce());
  fireEvent.click(await screen.findByText('Cancelar análise'));
  await screen.findByText('Análise cancelada. O pedido ficou guardado e pode tentar novamente.');
  expect(screen.getByText('Tentar análise novamente')).toBeEnabled();
  const [record] = await intakeService.list();
  expect(record.status).toBe('failed');
  expect(record.source.text).toBe('Criar tarefas');
});
