# Handoff

> Regra de origem: [`rules/handoff.md`](rules/handoff.md). No máximo 25 linhas.
> Sobrescreva este arquivo ao fechar uma tarefa do plano.

1. **Onde parei** — Criadas 7 specs em docs/specs/ (001-catalogo, 002-meus-emprestimos,
   003-operacoes, 004-cadastro-equipamentos, 005-reserva-data-futura, 006-notificacao-email,
   007-importacao-planilha), cada uma com spec.md, plan.md e tasks.md. Atualizado
   rules/spec-flow.md com fluxo completo do exemplo. Criada skill typescript.md em skills/.
2. **Commitado / branch** — branch `main`. Último: `d711621` *chore: atualiza AGENTS.md*.
   Antes: `c0f18b7` *feat: adiciona specs v1 e fora da v1, regras spec-flow e skill typescript*.
3. **No banco local, não commitado** — Nada. Nenhuma alteração pendente no banco.
4. **Já publicado** — Back: `https://ia-ti-corp-fzsbackend.vercel.app`. Front:
   `https://ia-ti-corp-fzs-front-git-main-fezes-team.vercel.app`.
   PENDENTE: `DATABASE_URL` + `DIRECT_URL` como env vars do back na Vercel.
5. **Não fazer na próxima sessão** — Não commitar `entrega/`, `entrega_*.zip`,
   `node_modules.zip`. Não criar specs fora do padrão `docs/specs/<NNN-nome-curto>/`.
6. **Próximo passo** — Implementar módulo de equipamentos (`src/modules/equipments/`)
   com guard + CASL e teste de isolamento por tenant, seguindo `docs/adr/001-stack.md` §6-§7.
