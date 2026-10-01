# ADR-002: Design system

Documento de decisão sobre a identidade visual da interface do EMPREST.AI.
Base visual: design system **Nocturne** (interface escura, densa, acento usado
como linha e brilho — nunca como preenchimento sólido), com o acento e a
tipografia substituídos pela marca EMPREST.AI.

Este ADR decide a identidade visual e os tokens. A especificação detalhada de
tela a tela continua em [`layout.md`](../../layout.md), que é a fonte para
reproduzir o layout.

## 1. Identidade

| Item | Escolha |
|---|---|
| Design system base | Nocturne (cópia da folha do sistema + override de `:root`) |
| Tema | Escuro, denso, cromia baixa |
| Acento da marca | `#2fb8ac` (teal), rampa 100→900 |
| Tipografia | Raleway (Google Fonts), pesos 400/500/600/700 |
| Marca | `EMPREST` (peso 700) + `.AI` no acento, `letter-spacing: 0.02em` |
| Ícones | Phosphor Icons |
| Idioma da interface | Português do Brasil; datas em `DD/MM/AAAA` |

- **Nocturne como base** — o design já vem pronto e denso; partir de uma folha
  única e sobrescrever só a rampa de acento e a fonte evita redesenhar
  componente por componente.
- **Tema escuro** — é o desenho de referência e o app é denso e orientado a
  tabela; um tema claro seria um segundo sistema a manter.
- **Acento teal no lugar do acento do Nocturne** — a marca precisa de cor
  própria, mas mantém o papel do acento original (linha e brilho).
- **Raleway** — família única para título e corpo; reduz variação sem exigir
  duas famílias.
- **Phosphor Icons** — conjunto leve e coerente com o traço do sistema.

## 2. Cores

### Tokens de base (ground escuro)

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#161826` | fundo de toda página |
| `--color-surface` | `#232532` | cards, tabela, modal, inputs |
| `--color-text` | `#e9e9ed` | texto principal |
| `--color-divider` | `color-mix(in srgb, #e9e9ed 16%, transparent)` | bordas e réguas |
| `--color-neutral-900` | `#292b31` | avatares neutros na tabela |

### Acento da marca

Primária: **`#2fb8ac`** (teal). Rampa 100→900:

```plain text
100 #e6faf7 · 200 #c2f1eb · 300 #93e3da · 400 #5fcfc4
500 #2fb8ac (base) · 600 #26978e · 700 #1d746d · 800 #15534e · 900 #0f3733
```

Uso: 500 para bordas/linhas/ícones e números de destaque; 300 para texto em
tamanho de parágrafo sobre o fundo escuro (contraste); 900 para preenchimentos
tintados (avatar do usuário, toast); 700 para bordas desses preenchimentos.
Tints por transparência: `rgba(47,184,172,0.10)` (chip de filtro ativo), `0.12`
(hover do botão primário e fundo de pill "Disponível"), `0.22` (pressed).

### Cores semânticas de situação (pills, bordas, prazos)

| Estado | Texto (`fg`) | Fundo (`bg`) | Borda (`bd`) |
|---|---|---|---|
| Disponível / Em dia | `#5fcfc4` | `rgba(47,184,172,0.12)` | `rgba(47,184,172,0.40)` |
| Emprestado / a vencer | `#c9a25f` | `rgba(201,162,95,0.12)` | `rgba(201,162,95,0.38)` |
| Em atraso / erro | `#e88b8b` | `rgba(200,90,90,0.14)` | `rgba(200,90,90,0.40)` |
| Em manutenção / inativo | `#9aa0ad` | `rgba(154,160,173,0.10)` | `rgba(154,160,173,0.30)` |

Banner de bloqueio por atraso: borda `#7a3b3b`, fundo `rgba(122,59,59,0.14)`,
texto `#e88b8b`.

### Texto secundário

Sempre por transparência sobre `--color-text`, nunca um cinza novo:
72% apoio em painéis · 70% labels de formulário · 62% corpo de diálogo ·
55% subtítulos e metadados · 45% kickers, patrimônio, dicas de KPI ·
40% rodapés discretos.

### Regras de cor

- Nunca preto puro nem branco puro.
- Nunca inundar áreas grandes com o acento: botão primário é **contorno** de
  1px sobre transparente.
- Cromia baixa fora do acento; superfícies e bordas vêm dos neutros.

## 3. Tipografia

- Família única: **Raleway** (pesos 400/500/600/700), em `--font-heading` e
  `--font-body`.
- Peso de títulos: **600**; corpo: 400.
- `line-height` de títulos ≈ 1.12, `letter-spacing: -0.015em`; corpo 1.55.
- `text-wrap: pretty` em títulos longos.

### Escala usada

| Elemento | Tamanho |
|---|---|
| H1 do login | 44px |
| H1 de tela interna / número de KPI | 30px |
| H2 "Entrar" | 26px |
| Título de modal | 20px |
| Título de painel/seção | 17px |
| Título de card | 16.5px |
| Nome de item em lista | 16px |
| Subtítulo de página / lead do login | 14–16px |
| Corpo, célula de tabela, input, botão | 13.5–14px |
| Nota, metadado, chip | 12–13px |
| Kicker / cabeçalho de tabela | 11–11.5px, `letter-spacing: 0.08–0.09em`, uppercase |
| Micro-rótulo (patrimônio, dica) | 11–12px |

## 4. Espaçamento, raios e elevação

- Escala (densidade 0.70×): `2.8 · 5.6 · 8.4 · 11.2 · 16.8 · 22.4px`.
- Raios: `--radius-sm 4px`, `--radius-md 8px` (botões, inputs, linhas de lista),
  `--radius-lg 14px` (cards, painéis, modal, moldura).
- Elevação: `--shadow-sm/md/lg` do sistema; nunca sombras empilhadas.
- Layout sempre em flex/grid com `gap` — nunca margens por elemento para espaçar
  irmãos.

### Medidas aplicadas

- Conteúdo das telas internas: padding `36px 40px 64px`.
- Larguras máximas: Catálogo 1240px · Meus empréstimos 1000px · Operações 1320px
  · Equipamentos 1160px.
- Login: `64px 56px` em ambas as colunas; grade `1.05fr 0.95fr`, altura mín. 820px.
- Barra de navegação: altura **60px**, padding lateral 40px, `gap: 32px`.
- Card do catálogo: padding 18px, `gap` 12px; grade
  `repeat(auto-fill, minmax(292px, 1fr))`, `gap` 16px.
- Linha de "Meus empréstimos": padding `18px 20px`, `gap` 20px.
- KPIs: 4 colunas, `gap` 14px, padding `16px 18px`.
- Tabela: cabeçalho `12px 18px`, célula `13px 18px`.
- Modal: largura **420px**, padding 26px.
- Cadastro: grade 2 colunas, `gap` 14px; coluna direita de regras com 300px.

### Alturas de controles

Input/select 36px (padding `6px 10px`) · botão padrão 36px · botão do login 40px
· avatar 28px (26px na tabela) · pill de status 3px/9px, `border-radius: 999px`
· traços do limite de 3 itens: 5px, largura flex igual, `border-radius: 999px`.

## 5. Componentes

Classes do Nocturne, replicadas como componentes no front:

- `.btn` + `.btn-primary` (contorno acento) · `.btn-secondary` (contorno
  divider) · `.btn-ghost` (texto acento) · `.btn-block`.
- `.tag` + `.tag-outline` para etiquetas de papel/seção.
- `.card` (+ `.card-kicker`, `.card-title`) e `.elev-sm/md/lg`.
- `.field` + `label` + `.input` (inclui `select` e `textarea`).
- `.radio` + `.dot` para a situação inicial no cadastro.
- `.nav` + `.nav-brand` para a barra de topo.
- `.table` para a lista de Operações.
- `.dialog-backdrop` + `.dialog` (+ `-title`, `-body`, `-actions`).
- Estados: hover tintado do acento, pressed um passo além, foco
  `outline: 2px solid var(--color-accent); outline-offset: 2px`; desabilitado
  `opacity .45` + `cursor: not-allowed`.
- Marca: quadrado de 22–26px, borda 1.5px do acento, raio 6–7px, com um
  quadradinho preenchido de 8–9px (raio 2px) centralizado.
- Régua de seção: `linear-gradient(90deg, transparent, var(--color-divider) 48px,
  var(--color-divider) calc(100% - 48px), transparent)` — desaparece nas pontas.

## 6. Páginas

- **Login** — grade `1.05fr 0.95fr`, altura mínima 820px. Esquerda: fundo
  `linear-gradient(160deg,#1b1f2e,#161826 60%)` + brilho radial
  `rgba(47,184,172,0.16)` (520px, `left:-160px; top:120px`), marca, título 44px
  em duas linhas, lead 16px/60% e faixa de 3 estatísticas; rodapé "Operações ·
  TI interno" 12px/40%. Direita: coluna de 340px centralizada — H2 "Entrar",
  lead, E-mail, Senha, primário `btn-block` 40px, ghost "Entrar como Operações →"
  e a nota "Cada pessoa vê apenas os próprios empréstimos".
- **Catálogo** — H1 + "X de Y equipamentos disponíveis agora"; busca 260px à
  direita; banner de bloqueio condicional; chips Todos · Disponíveis ·
  Emprestados · Em manutenção; grade de cards (kicker uppercase 11px · nome
  16.5px · patrimônio 12px · pill de situação · linha de detalhe min-height 18px
  · botão de largura total).
- **Meus empréstimos** — H1 + "N de 3 itens em seu nome · prazo padrão de 14
  dias"; barra de 3 traços (ocupados no acento, atraso em vermelho, vazios em
  `text 12%`); linhas com borda esquerda de 3px na cor do estado em 5 colunas
  flex: item (1.4) · Retirada (1) · Devolver até (1) · pill (0.9) · botão
  "Devolver"; estado vazio tracejado (padding 48px) com "Ir ao catálogo";
  rodapé de regras em 3 itens de 12.5px.
- **Operações** — H1 + lead; busca 230px + primário "Cadastrar equipamento";
  4 KPIs (Em aberto · Em atraso vermelho · Disponíveis acento · Manutenção
  cinza); tabela em contêiner `radius-lg` com overflow hidden: Pessoa ·
  Equipamento · Patrimônio · Retirada · Prazo (cor do estado) · Situação (pill)
  · ação "Registrar devolução"; cabeçalho em `text 5%`, linhas separadas por
  borda superior de 1px; sem resultados: texto centralizado, padding 40px.
- **Equipamentos** — grade `1fr 300px`, `gap` 34px. Formulário em card: Nome
  (2 colunas) · Categoria (Notebook, Monitor, Cabo, Câmera, Acessório) ·
  Patrimônio · Observações (textarea, 2 colunas) · rádios de situação inicial ·
  rodapé com "Cadastrar equipamento" + "Cancelar". Direita: "Regras em vigor"
  (4 itens) e "Fora desta versão" (42% de opacidade).
- **Sobreposições** — Modal (420px): título · corpo · bloco resumo com borda
  (raio `md`, padding `14px 16px`, valor no acento) · ações à direita (Cancelar
  secundário + confirmação primário); backdrop `rgba(10,11,18,0.68)`, clique
  fora fecha. Toast: fixo `left:50%`/`translateX(-50%)`, `bottom: 28px`, padding
  `12px 20px`, `border-radius: 999px`, fundo `--color-accent-900`, borda
  `--color-accent-700`, texto `--color-accent-200`, 13.5px, sai em **2600ms**.

## 7. Navegação

- Papéis: **Colaborador** → `Catálogo`, `Meus empréstimos`. **Operações** →
  `Catálogo`, `Operações`, `Equipamentos`, `Meus empréstimos`.
- Aba ativa: `border-bottom: 2px solid var(--color-accent)` e texto 100%;
  inativa: linha transparente e texto 55%. Botões com altura total da barra
  (60px), padding lateral 14px, sem raio.
- Barra `position: sticky; top: 0`, fundo `--color-bg`, `z-index: 20`; à direita
  etiqueta do papel (`.tag-outline`), avatar com iniciais (fundo `accent-900`,
  borda `accent-700`, texto `accent-300`), nome e "Sair".
- Entradas: "Entrar" → Catálogo (Colaborador); "Entrar como Operações" →
  Operações; "Sair" → Login. Atalhos: banner de atraso → Meus empréstimos;
  estado vazio → Catálogo; "Cadastrar equipamento" → Equipamentos; "Cancelar" →
  Operações; após cadastrar → Operações + toast.
- Transições são troca de tela na mesma janela; sem rotas aninhadas nem modais
  empilhados.

## 8. Interações (regras de negócio da v1)

1. **Solicitar empréstimo** (card disponível): modal "Devolver até = hoje + 14
   dias"; confirmar → item `emprestado`, sai do disponível, entra em Meus
   empréstimos e em Operações; toast.
2. **Devolver** (Meus empréstimos): modal "Devolução em {hoje}"; confirmar →
   item `disponivel`, libera slot, sai de Operações; toast.
3. **Registrar devolução** (Operações): mesmo efeito, com "Pessoa" no resumo.
4. **Limite de 3 itens**: com 3 ativos, botão vira "Limite de 3 itens"
   desabilitado (`btn-secondary`).
5. **Atraso bloqueia**: com item em atraso, botões viram "Bloqueado por atraso"
   (desabilitados) e o banner vermelho aparece no topo do catálogo.
6. **Manutenção**: nunca conta como disponível; pill cinza, observação no
   detalhe e botão "Indisponível" desabilitado.
7. **Item já com o usuário**: "Está com você" (desabilitado); com outra pessoa:
   "Emprestado" (desabilitado) e o detalhe mostra quem e o prazo.
8. **Busca**: Catálogo filtra por nome + patrimônio; Operações por pessoa +
   item; case-insensitive, imediata, com estado vazio próprio.
9. **Filtros de situação**: exclusivos; ativo com borda e texto no acento e fundo
   `rgba(47,184,172,0.10)`.
10. **Cadastro**: nome obrigatório (sem nome → toast "Informe o nome do
    equipamento"); patrimônio vazio vira `TI-—`; item entra no topo.
11. **Escopo por pessoa**: cada usuário vê só os próprios empréstimos; a visão
    completa existe apenas em Operações.

Fora da v1: reserva com data futura, notificação por e-mail, importação de
planilha.

## 9. Animações

Discretas e curtas — a interface é quieta.

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}
```

- Cards do catálogo: `fadeUp .25s ease both` ao renderizar.
- Modal: `fadeUp .18s ease both`; backdrop sem animação.
- Toast: `fadeUp .2s ease both` na entrada, remoção em 2600ms.
- Hover/pressed de botões e bordas de input: transição implícita do sistema;
  sem escala, sombra pulsante ou parallax.
- Nada de animação em número de KPI, tabela ou navegação.

## 10. Dados de exemplo

Usuário **Ana Ribeiro** (AR), data de referência **31/08/2026**. Equipamentos:
Notebook Dell Latitude 5450 (TI-0142, disponível) · MacBook Pro 14 M3 (TI-0088,
com Marcos Lemos até 07/09) · Monitor LG 27" 4K (TI-0231, disponível) · Monitor
Dell 24" FHD (TI-0233, manutenção) · Câmera Sony ZV-1 (TI-0301, com Ana até
12/09) · Cabo HDMI 2.1 (TI-0455, disponível) · Dock Thunderbolt 4 (TI-0512, com
Ana até 05/09) · Tripé Manfrotto (TI-0318, manutenção) · Headset Jabra Evolve2
(TI-0402, disponível). Empréstimos em aberto: Ana/Sony ZV-1, Ana/Dock,
Marcos/MacBook, Júlia/Notebook Lenovo T14 (TI-0119), Rafael/Monitor AOC 24"
(TI-0244), Camila/Câmera GoPro Hero 12 (TI-0307, **em atraso**). Estado padrão:
2 de 3 slots de Ana ocupados e em dia, 4 disponíveis, 2 em manutenção, 6 em
aberto, 1 em atraso.

## 11. Notas de implementação

- Uma folha do design system (`styles.css` do Nocturne) + override de `:root`
  com a rampa teal e Raleway; o restante vem de `var(--*)`.
- Estilos aplicados inline no markup (sem classes próprias além das do sistema),
  mantendo a estrutura legível e editável elemento por elemento.
- Estado em memória: `view`, `role`, `query`, `opsQuery`, `filter`, `modal`,
  `toast`, `items[]`, `loans[]`, campos do formulário.
- Toda mudança de dados é derivada no render: contagens, KPIs, cores de estado,
  rótulo e habilitação de cada botão.
- Controles de protótipo: `startView` (login, catalogo, meus, operações,
  cadastro) e `demoState` (none, modal-solicitar, modal-devolver,
  sem-emprestimos, atraso-bloqueado, toast).
- Altura mínima das telas: 820px; larguras de referência: 1360–1440px.
- Copy direto e operacional, sem exclamações e sem emoji.

## Alternativas descartadas

| Alternativa | Motivo do descarte |
|---|---|
| Criar o design system do zero | O Nocturne já entrega densidade e traço; redesenhar componente a componente atrasa a v1 sem ganho de identidade. |
| Tema claro (dark/light) | Seria um segundo sistema de tokens a manter; o desenho de referência é escuro. |
| Biblioteca de componentes com visual próprio (MUI, Mantine) | O visual vem do Nocturne e precisaria ser imposto por cima; contraria o ADR-001 §2. |
| Manter o acento original do Nocturne | A interface precisa da identidade da marca EMPREST.AI. |
| Duas famílias tipográficas (título + corpo) | Raleway cobre os pesos necessários; uma segunda família é variação sem propósito. |
| Acento como preenchimento sólido | O sistema usa o acento como linha e brilho; inundar grandes áreas quebra a densidade e o contraste. |
| Tailwind como fonte única dos tokens (sem `var(--*)`) | O override de `:root` sobre a folha do system é menos duplicação do que reescrever cada valor como utilitário. |

## Consequências

### Fica mais fácil
- Uma folha de sistema + override de `:root` reproduz o layout fielmente.
- Estado de situação (pill, borda, prazo) tem cor derivada de um único mapa.
- O acento é trocável em um ponto; trocar a marca não toca nos componentes.
- Densidade e traço vêm prontos: menos decisão visual por tela.

### Fica mais difícil
- Sem tema claro: superfície clara exigiria revisão de toda a rampa.
- Valores em `var(--*)` e no markup inline são menos "componentizados" do que
  classes utilitárias — a consistência depende de disciplina.
- Contraste de texto secundário por transparência precisa de verificação manual
  em telas novas.
- Customização de componente do shadcn/ui precisa casar com as classes do
  Nocturne em vez de usar só o default.

## O que este ADR não decide

- Modelagem de domínio e contrato da API (ver ADR-001).
- Estrutura de pastas e componentes no front (React + Vite + shadcn/ui).
- Papéis e matriz de permissão por tenant.
- Assets de marca (logo vetorial, favicon, tipografia licenciada).
- Acessibilidade formal (meta WCAG, contraste mínimo auditado).
- Responsividade além da altura/largura mínimas de referência (820px;
  1360–1440px).
- Internacionalização além de pt-BR.

  var(--color-divider) calc(100% - 48px), transparent)` — desaparece nas pontas.
