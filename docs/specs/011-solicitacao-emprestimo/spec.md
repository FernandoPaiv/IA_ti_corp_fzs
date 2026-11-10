---
description: Proposta auditável para solicitação de empréstimo.
alwaysApply: false
---

# Spec 011 — Solicitação de empréstimo (proposta)

**Estado:** proposta de auditoria; não aprovada como spec pronta.

Esta proposta consolida os requisitos localizados em `nova_demanda/` e nos
documentos versionados. Os briefings de `nova_demanda/` são entradas locais
ignoradas pelo Git, portanto os critérios relevantes foram transcritos aqui.
Não substitui a decisão do responsável pelo produto.
O repositório não contém `docs/PRD.md` nem ADR-003, embora registros anteriores
os citem como fonte para regras de empréstimo.

## Fontes e precedência identificada

- O briefing da prática em `nova_demanda/pratica-sdd-subagentes.html` §05 e
  `nova_demanda/prompt_auxiliar.md` §4 pede empréstimo imediato, 14 dias úteis
  e limite de cinco empréstimos abertos.
- `layout.md` §5.1 e §7 descreve limite de três itens e exibe prazo de hoje
  mais 14 dias, sem explicitar se são dias úteis ou corridos.
- `docs/specs/002-meus-emprestimos/spec.md` define a visualização dos próprios
  empréstimos, mas não define limite nem calendário.
- `docs/specs/003-operacoes/spec.md` trata de aprovação e devolução em
  Operações. Sua regra de aprovar empréstimos pendentes pode conflitar com a
  solicitação imediata desta spec caso ambas se refiram ao mesmo fluxo; a
  separação de escopo não está documentada.
- `nova_demanda/pegadinhas-e-especificacoes.md` registra que o PRD citado na
  atividade diz apenas “14 dias”, sem escrever “corridos”, e que a spec
  existente usa três empréstimos. A única fonte localizada que chama
  explicitamente o prazo de “14 dias corridos” é a spec 011 histórica do
  checkpoint `b7596c2`, fora das branches nomeadas/remotas.
- `AGENTS.md` e `docs/adr/001-stack.md` determinam JWT verificado, tenant do
  contexto autenticado, autorização no servidor e formato RFC 9457; não definem
  as regras de negócio acima.

## Requisitos funcionais propostos

| ID | Critério de aceite |
|----|--------------------|
| CA-01 | Uma solicitação de um usuário autenticado é efetivada imediatamente; não existe aprovação de Operações nem fila nesta funcionalidade. |
| CA-02 | O equipamento só pode ser solicitado se pertencer ao tenant do contexto autenticado e estiver disponível. Tenant e usuário não podem ser escolhidos pelo corpo ou query string. |
| CA-03 | Uma solicitação aceita cria um empréstimo aberto e atualiza a disponibilidade do equipamento atomicamente; não pode haver estado parcial. |
| CA-04 | **Pendente de decisão:** definir se o prazo é de 14 dias úteis (briefing) ou 14 dias corridos (spec 011 histórica); `layout.md` exibe hoje + 14 dias e o PRD citado no briefing não está no checkout. Depois da decisão, testar a data e a fronteira de horário/fuso. |
| CA-05 | **Pendente de decisão:** o briefing pede limite cinco; `layout.md` e a spec 011 histórica indicam três, mas a fonte canônica do produto não está disponível. Depois da decisão, testar os limites imediatamente abaixo, no limite e acima dele. |
| CA-06 | Um usuário com empréstimo aberto vencido não pode solicitar outro. A comparação no instante exato do vencimento precisa de confirmação. |
| CA-07 | Equipamento em manutenção, já emprestado ou sem disponibilidade não pode ser solicitado. |
| CA-08 | Duas solicitações concorrentes para o mesmo equipamento resultam em no máximo um empréstimo aberto. A operação perdedora não pode deixar alterações parciais e deve receber um erro compreensível. |
| CA-09 | Recusas informam o motivo ao cliente e não criam empréstimo nem alteram o equipamento. |
| CA-10 | A listagem de empréstimos abertos segue `docs/specs/002-meus-emprestimos/spec.md`: retorna somente registros do usuário e tenant autenticados, com data prevista e paginação cursor-based. |
| CA-11 | Erros da API seguem RFC 9457, conforme ADR-001. A tabela de mapeamento entre regra, status HTTP e `type`/`title`/`detail` ainda precisa ser definida. |
| CA-12 | Usuários sem sessão válida não podem solicitar nem listar empréstimos. A validação da assinatura JWT deve ocorrer via JWKS, conforme ADR-001. |

## Requisitos não funcionais

- A autorização primária é feita no servidor com usuário e tenant derivados da
  identidade verificada; identificadores enviados pelo cliente não substituem o
  contexto autenticado.
- A unicidade de empréstimos ativos deve permanecer protegida no banco contra
  concorrência. A migration atual cria índice único parcial por equipamento.
- A consulta de “Meus empréstimos” deve restringir tanto `user_id` quanto
  `tenant_id`.
- Os testes de integração usam PostgreSQL local/efêmero, nunca o `.env` remoto.
- A spec só pode ser declarada pronta após validação independente e evidências
  executáveis para cada critério.

## Cenários negativos e de fronteira obrigatórios

1. Sem token e com token inválido.
2. Tentativa de trocar `user_id`/`tenant_id` por body ou query.
3. Equipamento inexistente ou pertencente a outro tenant.
4. Equipamento em manutenção, emprestado ou com empréstimo ativo.
5. Usuário com 2, 3 e mais de 3 empréstimos abertos.
6. Usuário com empréstimo vencido, em dia e no instante exato do vencimento.
7. Solicitações concorrentes do mesmo equipamento e concorrência no limite por
   usuário.
8. Rejeição sem escrita parcial e resposta RFC 9457.
9. Usuários distintos no mesmo tenant e usuários em tenants distintos ao
   listar empréstimos.

## Lacunas que impedem aprovar esta proposta

- Não há PRD no checkout atual para confirmar as regras de negócio. Os registros
  anteriores citam “PRD/ADR-3”, mas só foram encontrados ADR-001 e ADR-002 e a
  spec 003 de Operações.
- A escolha entre cinco e três empréstimos, e entre 14 dias úteis e corridos,
  precisa de decisão explícita do responsável. A spec histórica fora de branch
  não prova aprovação do produto, e o PRD/ADR-003 citado não está no checkout.
- O identificador do equipamento no endpoint é ambíguo: o controller atual
  recebe `equipmentId`, o service procura pelo `id` UUID, enquanto os testes
  existentes enviam patrimônio.
- O vocabulário de status varia entre `available`/`loaned`/`maintenance` e
  `disponivel`/`emprestado`/`manutenção`.
- Falta definir o prazo de devolução, a fronteira temporal de atraso,
  fuso/horário de vencimento e a resposta HTTP para conflito de concorrência.
- Falta confirmar se a aprovação de empréstimos pendentes em Operações continua
  aplicável a algum fluxo ou se a solicitação imediata substitui essa etapa.
- A regra de concorrência do limite por usuário ainda não tem proteção
  demonstrada no banco.
- Não há evidência de validação independente desta spec nem de isolamento real
  por JWT validado.

## Mapeamento de evidências necessário

Os testes devem referenciar os CAs desta proposta. Cobertura de banco do índice
parcial não substitui testes do service, endpoint, autenticação ou isolamento.
Não há veredito “PRONTA” nesta proposta.
