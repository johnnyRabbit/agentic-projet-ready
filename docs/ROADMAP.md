# Roadmap consolidado

Este é o plano de referência para novo trabalho. Os documentos `PHASE_*` e guias de expansão preservam o histórico, mas a numeração antiga não determina a sequência abaixo. Estado observado: [STATUS.md](STATUS.md). Objetivo: [PRODUCT_SPEC.md](PRODUCT_SPEC.md).

M0 tem uma primeira entrega local verificada; ver [relatório de validação](VALIDATION_M0.md). M1 está implementado com validação automatizada local; a análise com fornecedor autenticado continua por verificar. M2–M5 continuam pendentes. Componentes existentes devem ser aproveitados. Adiar funcionalidades secundárias até demonstrar o percurso principal.

## M0 — Base verificável

- Consolidar documentação e orientação para agentes.
- Corrigir a instalação e execução da suite de testes; executar tipos, lint e build e registar resultados.
- Rever CI: alinhamento com branches usadas, versões de runtime compatíveis e geração efetiva de cobertura.
- Distinguir capacidades reais, simuladas e não verificadas.

Conclusão: instalação reproduzível e verificações acordadas passam; limitações ficam documentadas com evidências. A execução do workflow no GitHub continua por confirmar após envio das alterações; esta entrega valida os comandos localmente.

## M1 — Entrada, análise e proposta aprovada

Depende de M0.

Entrega local: `WorkRequest` e `src/engine/intake/` implementam entrada, análise com contrato validado, esclarecimentos, edição e decisões persistentes por versão. A skill é carregada explicitamente pelo serviço; o modo real Groq não usa fallback simulado. Ver [validação M1](VALIDATION_M1.md) e [decisão de persistência e isolamento](decisions/0001-m1-propostas-versionadas.md). Falta validar a qualidade da análise com uma chamada autenticada ao fornecedor; os cenários automatizados usam respostas controladas.

- Guardar ideia ou especificação recebida como texto.
- Criar uma skill de análise de requisitos: instruções versionadas, contrato de saída e carregamento explícito no motor.
- Validar requisitos, dúvidas, suposições e referências à origem; corrigir ou reportar saídas inválidas.
- Ligar esclarecimentos, edição da proposta e aprovação persistente por versão.

Conclusão: após recarregar a aplicação, a proposta e decisão continuam disponíveis; a implementação não começa sem aprovação. Avaliar entrada completa, ambígua, contraditória e falha do fornecedor de IA.

## M2 — Board e estrutura derivados do plano

Depende de M1.

- Gerar histórias com critérios de aceitação e tarefas com dependências.
- Associar o Kanban ao projeto persistido, substituindo tarefas de exemplo neste fluxo.
- Definir estrutura React/TypeScript e gerar os ficheiros iniciais, aproveitando templates quando adequados.
- Vincular tarefas, requisitos, agentes e artefactos; controlar revisões do plano.

Conclusão: o board reflete a proposta aprovada, sobrevive a recarregamento e cada tarefa tem origem e critério de conclusão. Ficheiros gerados nesta etapa ainda não significam aplicação validada.

## M3 — Execução real e revisão

Depende de M2. O desenho técnico pode começar antes, mas deve seguir os contratos do percurso aprovado.

- Implementar serviço de execução e isolamento, operações reais de ficheiros e Git.
- Disponibilizar ferramentas aos agentes com permissões, limites de tempo, orçamento e tentativas.
- Executar build, testes e tipos reais; recolher logs e códigos de saída.
- Integrar revisão e correção, cancelamento e recuperação de execuções interrompidas sem repetir ações já concluídas.
- Atualizar o board por eventos de execução, preservando falhas e bloqueios.

Conclusão: uma tarefa produz alterações reais e evidências verificáveis; falhas não são convertidas em demonstrações nem marcadas como sucesso.

## M4 — Preview, feedback e entrega

Depende de M3.

- Criar preview da aplicação gerada e apresentar alterações e limitações.
- Converter feedback em tarefas e executar uma nova iteração.
- Integrar entrega do código e PR real; publicação e merge respeitam a autorização correspondente.

Conclusão: completar o cenário da aplicação de tarefas da especificação, incluindo uma correção pedida pelo utilizador. Registar custo, duração, intervenções e resultados reais.

## M5 — Novas fontes e expansão

Depende da validação do percurso M1–M4.

- Upload de formatos explicitamente suportados, extração e referências à origem.
- Jira: importação de épicos/histórias/tarefas com identificadores e prevenção de duplicados. Sincronização de escrita é capacidade separada, com autorização própria.
- Integração de repositórios existentes, deteção de convenções e validação de alterações.
- Depois: colaboração, mais stacks e seleção avançada de especialistas conforme resultados observados.

Conclusão por integração: uma nova fonte percorre o mesmo fluxo sem perder referências, duplicar trabalho ou contornar aprovações.
