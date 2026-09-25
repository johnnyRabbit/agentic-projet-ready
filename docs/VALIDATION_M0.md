# Validação local da base — M0

Data: 2026-09-25. Ambiente: Windows, Node 24.15.0, npm 11.12.1.

## Problemas corrigidos

- Dependência de testes em falta: `@testing-library/dom`.
- Substituição do mock de hash constante por Web Crypto real e do mock IndexedDB sem eventos por `fake-indexeddb`.
- Registo/login deixavam de preservar o hash da palavra-passe; o perfil de sessão é agora guardado separadamente, sem o hash. A inicialização do utilizador de demonstração é aguardada antes de registo/login.
- Orçamentos por projeto/tarefa/agente eram ignorados. Custos são associados à entidade e aos seus antecessores, sem contar duas vezes a mesma operação. Despesas já incorridas são registadas mesmo acima do limite; o resultado assinala que a continuação não é permitida.
- Percentis usam a posição por posto mais próximo; testes de temporização controlam o relógio em vez de depender da precisão do sistema.
- Removidos imports/variáveis sem uso, tipados dados internos e corrigidas dependências de hooks. Logs de diagnóstico usam o logger; só o transporte central permite `console.debug/info`.
- Operações virtuais rejeitam caminhos vazios e colisões entre ficheiros e diretórios; a árvore de navegação preserva diretórios vazios.

## Verificações

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instalação pelo lockfile concluída |
| `npm run lint` | Zero erros e zero avisos |
| `npm run typecheck` | Passou |
| `npm run test:ci -- --silent` | 97 testes, nove suites, todos passaram |
| `npm run build` | Passou; aviso de bundle grande |
| `git diff --check` | Sem erros de whitespace |

Cobertura de linhas: 14,97% (505/3373). A configuração inclui agora todo o código-fonte elegível, incluindo módulos não importados pelos testes. A cobertura não deve ser confundida com a percentagem de funcionalidades implementadas.

## Limites desta entrega

- A autenticação continua local e orientada a demonstração; esta correção não a transforma numa autenticação multiutilizador em servidor.
- Contabilizar gastos depois de uma chamada não impede a chamada de exceder o limite. Reservas de custo, limites antes da execução e recuperação persistente pertencem à integração operacional futura.
- Os testes existentes do fornecedor IA usam simulação. Não houve chamadas pagas nem validação de credenciais externas.
- Há três vulnerabilidades moderadas reportadas pelo npm e um bundle que precisa de futura otimização.
- O CI foi atualizado, mas a execução no GitHub só poderá ser confirmada após envio das alterações.
- Não foi implementado o percurso M1 de análise e aprovação; a próxima entrega parte desta base.

## Próxima entrega

Ligar o formulário de novo pedido a uma análise real com contrato validado, persistir entrada e proposta, permitir esclarecimentos/edição e guardar a aprovação por versão. O bloqueio de execução deve ser implementado no código e a falha do fornecedor não pode ser substituída por sucesso simulado.
