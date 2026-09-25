# Validação local M1

Data: 2026-09-25.

## Percurso entregue

1. Abrir “New Work Request” / “Ideia e proposta”, colar texto e guardar a entrada.
2. Introduzir uma chave Groq de sessão e analisar. A análise envia o texto ao Groq e requer uma resposta JSON válida; o botão não inicia implementação.
3. Rever requisitos, referências à fonte, suposições, âmbito, exclusões, riscos e estimativa. Esclarecimentos ficam guardados e exigem nova análise.
4. Editar a proposta e guardar uma nova versão; é possível adicionar/remover requisitos. Referências têm de corresponder literalmente à entrada ou a um esclarecimento.
5. Aprovar ou rejeitar a versão. Dúvidas pendentes bloqueiam aprovação. A decisão guarda o identificador do utilizador local, a data e o âmbito autorizado.
6. Recarregar: a entrada, versões e decisões são recuperadas. Alterações materiais exigem nova aprovação. O histórico permanece disponível.

## Cenários automatizados

`src/test/engine/intake.test.ts` usa IndexedDB de teste e respostas controladas: entrada completa, dúvidas/contradições representadas por perguntas, esclarecimentos e reanálise, edição/rejeição, decisões desatualizadas, concorrência, falhas, JSON inválido, referências inventadas, recuperação de análise interrompida e bloqueio do executor legado. Inclui testes de Groq sem chave, com falha HTTP e com falha de rede.

`src/test/engine/workRequest.test.tsx` percorre a interface React: guardar, analisar, aprovar, desmontar/remontar, recuperar a decisão e editar para invalidar a aprovação. Confirma que a chave de sessão não fica guardada no pedido.

## Verificações executadas

- `npm run typecheck`: passou.
- `npm test -- --run`: 114 testes passaram em 11 suites.
- `npm run lint`: passou, sem avisos.
- `npm run build`: passou; mantém o aviso de bundle acima de 500 kB.
- Formatação dos ficheiros alterados e links Markdown locais verificados. A cobertura não foi recalculada nesta entrega.

## Limites

- Os testes com respostas controladas validam contratos e transições; não provam que o modelo identifica corretamente toda a ambiguidade ou contradição.
- Não foi feita uma chamada autenticada ao Groq nem validação visual num navegador real nesta entrega. A qualidade da análise real continua por verificar.
- Não foram gerados board, ficheiros, testes de uma aplicação gerada, preview ou PR. Estes pertencem a M2–M4.
- Persistência e identidade são locais. Não há backend multiutilizador.
- A skill é carregada pelo motor, mas a análise M1 não utiliza o pipeline legado de execução de agentes. A sua tentativa regista tokens e estimativa de custo, sem representar execução de código.
- Publicação e merge não são autorizados pela aprovação da proposta.
