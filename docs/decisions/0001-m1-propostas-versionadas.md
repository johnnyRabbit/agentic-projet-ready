# M1 — Propostas versionadas e separação da execução legada

Data: 2026-09-25. Estado: aceite para a implementação local M1, no âmbito autorizado pelo utilizador.

## Contexto

O ecrã de entrada era uma demonstração. A aplicação dispõe de IndexedDB, mas o executor e parte dos workflows ainda simulam resultados. Precisamos de preservar o texto, a análise e a decisão humana sem apresentar essas simulações como implementação aprovada.

## Decisão

`IntakeService` reutiliza a base IndexedDB e guarda cada pedido no store `settings`, com prefixo `intake:`. O identificador `m1-…` também identifica o projeto deste percurso. Cada registo contém a fonte imutável, esclarecimentos, versões completas da proposta, tentativas de análise e decisões com autor, data, versão e âmbito `implementation`.

As alterações usam uma transação com comparação da revisão, concluída apenas no commit. Edições concorrentes ou decisões sobre um registo desatualizado são recusadas. O contrato também é validado ao ler os dados persistidos. Isto protege a consistência local; não constitui autenticação de servidor ou proteção contra adulteração deliberada de IndexedDB.

A skill de requisitos é um módulo versionado carregado pelo serviço. Os dados do utilizador seguem numa mensagem distinta das instruções. A resposta do modelo é validada em execução, incluindo referências literais às fontes. Uma resposta não pode criar decisões de aprovação. A validade semântica dos requisitos ainda depende da revisão humana.

O Groq recebe `executionMode: real`, sem fallback simulado e com timeout de 60 segundos. A chave introduzida no novo ecrã fica apenas na memória do componente. O comportamento de armazenamento das definições legadas não foi alterado. Os registos de tentativa guardam tokens reportados e custo estimado pelo tarifário existente, que não equivale a faturação verificada.

O harness e a entrada de workflows recusam projetos `m1-…`, mesmo aprovados, até existir integração M2/M3. A aprovação nunca autoriza automaticamente publicação ou merge. Uma análise interrompida é mostrada como pendente; o utilizador pode cancelá-la e repetir. O cancelamento lógico impede aceitar resultados tardios, mas não garante que o fornecedor deixe de processar ou cobrar a chamada anterior.

## Alternativas e consequências

- Reutilizar a fila de aprovações legada sem alterações não ligaria a decisão a uma versão concreta persistida da proposta.
- Migrar já para um servidor aumentaria o âmbito antes de validar o percurso inicial. IndexedDB permite validar M1, mantendo explícita a limitação local e a ausência de isolamento multiutilizador.
- Iniciar o workflow legado após aprovação daria uma impressão errada de execução real. O bloqueio é intencional até M2/M3.

## Validação e revisão futura

Testes exercitam persistência, revisão concorrente, referências inválidas, falha do fornecedor, recuperação e decisões na interface. Ver [validação M1](../VALIDATION_M1.md).

M2 deve consumir a versão aprovada, preservar referências e fazer a verificação de autorização antes de criar o board. M3 deve substituir o bloqueio legado por autorização ligada à versão e às operações reais, sem reutilizar implicitamente a aprovação para publicação. Reavaliar o armazenamento quando houver servidor ou múltiplos utilizadores.
