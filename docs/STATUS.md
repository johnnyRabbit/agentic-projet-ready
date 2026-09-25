# Estado verificado do projeto

Data desta revisão: 2026-09-25. Base: leitura dos 14 documentos de `docs/`, inspeção dos módulos indicados e verificações locais descritas abaixo. Não foi feita uma validação completa no navegador nem de integrações externas autenticadas.

## Capacidades

| Área | Evidência | Estado e limite |
| --- | --- | --- |
| Papéis e skills | `src/engine/agents/AgentRegistry.ts` | Definições e prompts existentes; skills são listas de capacidades, não procedimentos carregados separadamente. |
| Orquestração | `src/engine/harness/AgentHarness.ts`, `src/engine/workflows/WorkflowEngine.ts` | Execução de passos e chamadas ao modelo; não comprova entrega integrada de um projeto. |
| Aprovações | `AgentHarness.ts`: fila e resolução de pedidos | Estrutura existente; bloqueio, persistência e retoma do percurso completo ainda por validar/implementar. |
| Fornecedor IA | `src/engine/providers/GroqProvider.ts` | Chamadas Groq e fallback para simulação, inclusive após erro; precisa de separação explícita no fluxo real. |
| Entrada de trabalho | `src/pages/WorkRequest.tsx` | O handler de análise observado apenas usa um temporizador; não está ligado à análise real nesse ecrã. |
| Kanban | `src/pages/KanbanPage.tsx` | Estado React com tarefas de exemplo e componentes de movimentação; sem geração integrada a partir da proposta. |
| Templates | `src/templates/projectTemplates.ts` | Definições de projetos/tarefas; não demonstram geração e execução completa de aplicações. |
| Execução e Git | `src/engine/execution/` | Sistema virtual e operações Git simuladas. |
| Testes da entrega | `src/engine/execution/TestRunner.ts` | Inclui resultados simulados e aleatórios; não são evidências de validação do código gerado. |
| Entrega e revisão | `src/engine/delivery/`, `src/pages/Reviews.tsx` | Pipeline e artefactos existentes com etapas simuladas; ecrã de revisão usa mocks. |
| Persistência e autenticação | `src/backend/BackendAPI.ts`, `src/auth/AuthService.ts` | IndexedDB e autenticação local; não equivalem a backend multiutilizador. |
| GitHub | `src/engine/github/GitHubClient.ts` | Cliente com chamadas HTTP existente; OAuth, webhooks e entrega autenticada não validados nesta revisão. |
| Capacidades do navegador | `src/filesystem/BrowserFileSystem.ts`, `src/sandbox/WebWorkerSandbox.ts` | Módulos documentados para ficheiros e execução no navegador; não equivalem a executar um projeto completo com Git e ferramentas Node.js. |

## Verificações locais — M0

- `npm run typecheck`: passou.
- `npm ci`: passou com Node 24.15.0 e npm 11.12.1. Foram adicionadas dependências de teste em falta e um ambiente IndexedDB de teste funcional.
- `npm run test:ci -- --silent`: 97 testes passaram em nove suites, com cobertura gerada. O bloqueio anterior de `@testing-library/dom` foi corrigido.
- Corrigidos problemas de preservação do hash no login, contabilização de orçamentos e cálculo de percentis. Testes adicionais cobrem login repetido, hierarquia de custos e operações de ficheiros virtuais.
- `npm run lint`: passou com zero avisos, mantendo o limite `--max-warnings 0`.
- Hooks do commit `48388e4`: lint/format dos ficheiros preparados e validação da mensagem passaram. Não executam a suite completa.
- CI ajustado para `main`, `master` e `develop`, Node 24.15.0, verificação de tipos e execução de testes com cobertura. Ainda não foi executado remotamente nesta entrega.
- Cobertura global medida: 14,97% das linhas (505/3373), incluindo ficheiros não exercitados. Não equivale aos ~80% estimados na documentação histórica.
- A instalação reporta três vulnerabilidades moderadas em dependências; a sua correção não está incluída nesta entrega. O build emite aviso de bundle superior a 500 kB.
- Integrações externas autenticadas e experiência no navegador continuam sem validação de ponta a ponta. Consultar [VALIDATION_M0.md](VALIDATION_M0.md) para âmbito e limitações.

## Como interpretar os documentos antigos

- Fases 2 e 3 reconhecem explicitamente simulações e preveem a sua substituição.
- O documento da fase 4 acrescenta persistência e capacidades do navegador; a migração para servidor continua futura.
- Numeração das fases, contagens de agentes e declarações de conclusão variam entre documentos.
- “Criado”, “integrado”, “simulado” e “verificado de ponta a ponta” são estados diferentes.

Atualizar esta página quando houver nova evidência, identificando comando ou cenário, resultado e limite da verificação. Não marcar uma capacidade concluída apenas porque existem tipos, UI ou um documento.
