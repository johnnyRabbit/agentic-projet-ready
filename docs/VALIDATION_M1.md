# Validação local M1

Data: 2026-09-26.

## Percurso entregue

1. Abrir “Work Requests” e escolher “Novo pedido” na lista.
2. Descrever a ideia e escolher “Analisar ideia”. Se faltar a chave Groq, surge a configuração de sessão; a ideia é guardada antes da chamada. O botão não inicia implementação.
3. Responder junto de cada pergunta na etapa “Esclarecer” e escolher “Atualizar proposta”. As perguntas e respostas ficam ligadas no mesmo pedido. Durante a chamada, é possível cancelar e tentar novamente.
4. Em “Rever e aprovar”, ler o documento e escolher “Pedir um ajuste” ou “Editar proposta” se necessário. Alterações manuais criam uma nova versão; referências têm de corresponder à entrada ou a esclarecimentos.
5. Escolher “Aprovar proposta”. Dúvidas pendentes bloqueiam aprovação. A decisão regista utilizador local, versão, data e âmbito. Rejeição e versões anteriores estão em “Histórico e detalhes do pedido”.
6. Recarregar e abrir o pedido na lista: entrada, versões e decisões são recuperadas. A chave de sessão permanece apenas em memória até recarregar a aplicação.

## Cenários automatizados

`src/test/engine/intake.test.ts` usa IndexedDB de teste e respostas controladas: entrada completa, dúvidas/contradições representadas por perguntas, esclarecimentos e reanálise, edição/rejeição, decisões desatualizadas, concorrência, falhas, JSON inválido, referências inventadas, recuperação de análise interrompida e bloqueio do executor legado. Inclui testes de Groq sem chave, com falha HTTP e com falha de rede.

`src/test/engine/workRequest.test.tsx` percorre criação, configuração, análise, aprovação, recuperação e edição que invalida aprovação. Cobre também respostas ligadas às perguntas no mesmo pedido, falha com repetição e cancelamento da chamada ativa. Confirma que a chave de sessão não fica guardada no pedido.

O fornecedor Groq processa a resposta como eventos SSE com `stream: true` e `stream_options.include_usage`. Os testes fragmentam os eventos em blocos pequenos, incluindo texto UTF-8, e confirmam acumulação dos deltas, métricas finais, motivo de conclusão e rejeição de um stream interrompido antes de `[DONE]`.

## Verificações executadas

- `npm run typecheck`: passou.
- `npm test -- --run`: 127 testes passaram em 12 suites.
- `npm run lint`: passou, sem avisos.
- `npm run build`: passou; mantém o aviso de bundle acima de 500 kB.
- Formatação dos ficheiros alterados e links Markdown locais verificados. A cobertura não foi recalculada nesta entrega.

## Validação no browser — 2026-09-26

Reproduzido o bloqueio de gravação com a aplicação completa: `BackendAPI` mantinha uma ligação à versão 1 enquanto a persistência tentava abrir a versão 2 da mesma base. Unificada a abertura através de `Database`, com migração aditiva para versão 3, stores e índices dos dois módulos, pedidos concorrentes partilhados e encerramento em `versionchange`. Uma abertura bloqueada ou sem resposta falha explicitamente; respostas tardias não deixam uma ligação escondida aberta.

Oito testes de regressão em `src/test/persistence/database.test.ts` cobrem migração das duas estruturas antigas (v1/v2), preservação de dados, arranque simultâneo, repetição após bloqueio, encerramento e timeout.

No browser local em `http://localhost:3000`, com a conta de demonstração e um pedido de teste de aplicação de tarefas: entrada guardada, duas análises autenticadas Groq, esclarecimento guardado no mesmo pedido, edição humana da dúvida restante, aprovação da versão 3 e recuperação da aprovação após recarregar. A chave de sessão deixou de aparecer após recarregar. Não foram modificados pedidos reais do utilizador neste teste.

A reformulação posterior separa lista, descrição, esclarecimentos e revisão. Validada visualmente no browser: proposta aprovada existente preservada, novo formulário editável, diálogo de configuração e texto preservado ao cancelar esse diálogo. Os testes automatizados cobrem as transições com respostas controladas; não foi repetida uma chamada autenticada na alteração de layout. A análise real anterior introduziu uma pergunta adicional; avaliar a qualidade e repetição das perguntas do modelo continua pendente.

## Limites

- Os testes com respostas controladas validam contratos e transições; não provam que o modelo identifica corretamente toda a ambiguidade ou contradição.
- A validação real cobre um pedido de teste, não uma avaliação abrangente da qualidade do modelo nem de todos os browsers.
- Não foram gerados board, ficheiros, testes de uma aplicação gerada, preview ou PR. Estes pertencem a M2–M4.
- Persistência e identidade são locais. Não há backend multiutilizador.
- A skill é carregada pelo motor, mas a análise M1 não utiliza o pipeline legado de execução de agentes. A sua tentativa regista tokens e estimativa de custo, sem representar execução de código.
- Publicação e merge não são autorizados pela aprovação da proposta.
