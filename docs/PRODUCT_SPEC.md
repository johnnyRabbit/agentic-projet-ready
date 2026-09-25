# Especificação do produto

Estado: visão acordada na conversa; os requisitos abaixo são objetivos de implementação, não uma declaração de funcionalidades concluídas.

## Problema e resultado esperado

O utilizador tem uma ideia, uma especificação de produto ou trabalho organizado numa ferramenta como Jira e quer transformá-lo num projeto funcional. A plataforma analisa o material, identifica o que falta, propõe um plano e coordena agentes para executar, testar e rever o trabalho. O utilizador acompanha o progresso e aprova decisões relevantes e a entrega.

## Entradas

- Ideia em texto: esclarecer problema, público, funcionalidades e restrições.
- Especificação: extrair requisitos e critérios de aceitação, detetar contradições e lacunas.
- Jira: preservar épicos, histórias, identificadores e relações existentes, evitando duplicados.
- Repositório existente: analisar tecnologias e convenções antes de propor alterações.

A primeira entrega suporta texto colado, incluindo especificações. Upload de ficheiros e integração Jira serão adicionados ao mesmo fluxo após a validação do percurso inicial. Não anunciar suporte a um formato sem parser e validação implementados.

## Percurso principal

1. Receber e guardar a entrada e a sua origem.
2. Analisar requisitos, suposições, dúvidas e restrições. Perguntar apenas o que não está esclarecido e afeta a decisão.
3. Apresentar proposta com âmbito, exclusões, critérios de aceitação, riscos e estimativas identificadas como tal.
4. Permitir editar, rejeitar ou aprovar a versão da proposta.
5. Gerar board com histórias, tarefas, dependências e papéis responsáveis; propor estrutura técnica.
6. Executar o plano aprovado num ambiente isolado, com limites e progresso ligado ao board.
7. Executar validações reais e revisão; corrigir problemas dentro dos limites autorizados.
8. Disponibilizar preview, alterações e evidências. Transformar feedback em trabalho rastreável.
9. Obter aprovação para entrega e autorização específica para publicação ou merge quando aplicável.

## Âmbito inicial

- Aplicações web simples em React/TypeScript; um projeto e uma execução principal de cada vez.
- Coordenador, analista, planeador/arquiteto, programador, tester e revisor como papéis iniciais, reutilizando o registo existente.
- Persistência da entrada, proposta, decisões, histórias e estado da execução.
- Primeiro exemplo de validação: aplicação de tarefas com criação, edição, filtros e persistência.
- Fora do primeiro percurso: geração mobile, marketplace, colaboração em tempo real e suporte universal a stacks.

## Aprovações

A implementação depende de uma proposta aprovada. Alterações significativas de âmbito ou de orçamento regressam ao utilizador. Aprovação da proposta não autoriza automaticamente publicação nem merge. Decisões guardam autor, data, versão e âmbito autorizado; revisões materiais exigem nova aprovação. A interface deve permitir perceber o que está bloqueado e como continuar.

## Dados e evidências

Histórias têm identificador, valor para o utilizador, critérios de aceitação e referências à fonte. Tarefas ligam histórias a dependências, agentes e artefactos. Preservar a distinção entre informação fornecida, suposição e decisão aprovada.

Saídas de agentes devem cumprir contratos validados durante a execução. Registar ficheiros alterados, comandos, resultados, custos observados e limitações. Demonstração e execução real devem ser distinguíveis; testes não executados nunca aparecem como aprovados.

## Critério de sucesso

Um utilizador apresenta uma ideia, aprova o plano, acompanha o board, experimenta a aplicação gerada, pede uma alteração e recebe uma versão corrigida sem ser necessário completar o trabalho manualmente fora do fluxo. Medir intervenções humanas, conclusão dos critérios, falhas, duração e custo observado. Não publicar percentagens de sucesso ou poupança sem medições.
