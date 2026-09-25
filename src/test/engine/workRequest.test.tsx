import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WorkRequest } from '../../pages/WorkRequest';
import { database } from '../../persistence/Database';
import { GroqProvider } from '../../engine/providers/GroqProvider';
import { intakeService } from '../../engine/intake/IntakeService';

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
  fireEvent.change(screen.getByLabelText('Nova ideia ou especificação (texto)'), {
    target: { value: 'Criar tarefas' },
  });
  fireEvent.click(screen.getByText('Guardar entrada'));
  await screen.findByRole('region', { name: 'Pedido guardado' });
  fireEvent.change(screen.getByLabelText('Chave Groq para esta sessão'), {
    target: { value: 'session-test-key' },
  });
  await waitFor(() => expect(screen.getByText('Analisar requisitos')).toBeEnabled());
  fireEvent.click(screen.getByText('Analisar requisitos'));
  await screen.findByText('Proposta v1');
  await waitFor(() => expect(screen.getByText('Aprovar v1')).toBeEnabled());
  fireEvent.click(screen.getByText('Aprovar v1'));
  await screen.findByText('Aprovada para implementação');
  const [saved] = await intakeService.list();
  expect(JSON.stringify(saved)).not.toContain('session-test-key');
  view.unmount();
  render(<WorkRequest />);
  await screen.findByText('Aprovada para implementação');
  expect(screen.getByLabelText('Chave Groq para esta sessão')).toHaveValue('');
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Tarefas alteradas' } });
  expect(screen.getByText('Aprovar v1')).toBeDisabled();
  fireEvent.click(screen.getByText('Guardar nova versão'));
  await screen.findByText('Proposta v2');
  expect(screen.queryByText('Aprovada para implementação')).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByText('Aprovar v2')).toBeEnabled());
});
