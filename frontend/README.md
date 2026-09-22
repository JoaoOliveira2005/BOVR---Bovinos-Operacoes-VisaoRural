# BOVR — Front-end

Aplicativo Android de gestão de rebanho bovino, offline. Este diretório contém
a base do front-end: **tela inicial, navegação e padrão visual**.

> **Estado:** a fundação offline com SQLite e os módulos de Pastos e Gastos
> estão funcionais. Gado, Vendas e Relatórios ainda são telas de destino.

---

## Rodando o projeto

```bash
cd frontend
npm install
npm run web       # preview no navegador, sem emulador
npm run android   # no aparelho ou emulador (precisa do Android SDK)
```

O `npm run web` existe só para desenvolver rápido. **A entrega é Android**
(RNF-01, RNF-02) — o mesmo código gera o APK. Não é protótipo descartável.

---

## Stack

| Peça | Escolha | Por quê |
|------|---------|---------|
| Framework | Expo SDK 57 + React Native 0.86 | Preview no navegador durante o desenvolvimento e APK Android na entrega, do mesmo código |
| Navegação | `expo-router` (file-based) | Rota = arquivo em `app/`; menos configuração para manter |
| Linguagem | TypeScript | — |
| Fonte | Geist via `@expo-google-fonts/geist` | Os `.ttf` vão no bundle; nada é baixado em runtime, então RF-31 (offline total) continua válido |
| Ícones | Feather (`@expo/vector-icons`) | Traço fino e geométrico, o mais próximo do Lucide que o DESIGN.md descreve |

⚠️ **No SDK 56+ não se importa de `@react-navigation/*` direto.** Use os pontos
de entrada do `expo-router`.

---

## Estrutura

```
frontend/
├── app/                      # Rotas (expo-router)
│   ├── _layout.tsx           # Navegação raiz, carregamento da fonte, tema do cabeçalho
│   ├── index.tsx             # TELA INICIAL — atalhos (RNF-08) e resumo
│   ├── gado.tsx              # ─┐
│   ├── pastos.tsx            # CRUD de pastos
│   ├── vendas.tsx            #  │ placeholders com os RFs de cada módulo
│   ├── gastos.tsx            # CRUD de gastos
│   └── relatorios.tsx        # ─┘
└── src/
    ├── theme/tokens.ts       # ← FONTE ÚNICA do padrão visual
    ├── components/
    │   ├── Tela.tsx          # Moldura padrão de tela
    │   ├── Cartao.tsx        # Container de conteúdo
    │   ├── AtalhoCard.tsx    # Atalho da tela inicial
    │   ├── Indicador.tsx     # Número + rótulo (stat block)
    │   ├── GrupoIndicadores.tsx  # Linha de indicadores com fio separador
    │   ├── Badge.tsx         # Tag neutra (sólido / suave / contorno)
    │   ├── BadgeQualidade.tsx    # Qualidade do pasto — RF-15.2
    │   └── EmBreve.tsx       # Placeholder de módulo
    ├── data/sqlite/          # migrations e repositórios locais
    ├── features/             # domínio e casos de uso por módulo
    └── lib/formato.ts        # Moeda e data pt-BR — RNF-18
```

---

## Padrão visual

Baseado no `DESIGN.md` (sistema monocromático estilo shadcn/ui), com uma camada
de cor adicionada por decisão do time.

> Os requisitos citados aqui (RF-*, RNF-*, P-*) vêm de
> [`docs/Requisitos.md`](../docs/Requisitos.md) e
> [`docs/vision/DocumentoDeVisao.md`](../docs/vision/DocumentoDeVisao.md).
> O `DESIGN.md` ainda não está versionado no repositório.

### A regra

> **A fundação é monocromática. Superfície, texto, borda e ícone em repouso
> nunca recebem cor. A cor entra só onde carrega significado.**

"Significado" hoje são três casos, e só eles:

1. **Status** — qualidade do pasto (RF-15.2), animais em tratamento (RF-13)
2. **Identidade de módulo** — ícone e selo dos atalhos, nada além disso
3. **Sinal financeiro** — resultado positivo ou negativo (RF-25)

Se você for adicionar cor fora desses três casos, provavelmente é decoração —
e decoração quebra o sistema.

### Tokens

Tudo vem de [`src/theme/tokens.ts`](src/theme/tokens.ts). **Nenhum componente
declara cor, espaçamento, raio ou tamanho de fonte na mão.**

| Grupo | O que é |
|-------|---------|
| `cores` | Neutros. `canvas` (chão verde), `paper` (cartão), `tinta`, `cinzaMedio`, `fio`, `neutro`, `ember` |
| `paleta` | Camada cromática: `qualidade`, `modulo`, `resultado` |
| `espaco` | Escala base 4px: 4, 8, 12, 16, 20, 24, 48 |
| `raio` | **18px** em tudo interativo, **24px** em containers. Nada entre os dois |
| `tipografia` | Escala Geist com `lineHeight` e `letterSpacing` já calculados |
| `sombra` | `elevation` + borda de 1px |
| `toque` | `alvoMinimo: 48` |

**`cores.canvas` e `cores.neutro` são tokens diferentes de propósito.** `canvas`
é o chão verde da página; `neutro` (`#F5F5F5`) é o preenchimento de badge e
input. Se você usar `canvas` num badge, ele sai esverdeado e passa a competir
com o "Boa" da qualidade do pasto — um preenchimento neutro viraria status.

**Cada tom da `paleta` tem três papéis:** `base` (ícone, marca, ponto),
`forte` (texto sobre fundo tingido) e `suave` (fundo). Molde pronto para quem
adicionar um status novo.

### Tipografia

A Geist é carregada em `app/_layout.tsx`, que segura a splash até a fonte estar
pronta — senão a primeira renderização sai na fonte do sistema e o texto salta
quando a fonte troca. Se o carregamento falhar, a tela é liberada mesmo assim:
melhor a fonte do sistema do que travar na splash.

⚠️ **No Android, `fontWeight` não seleciona o arquivo certo de uma fonte
customizada.** Por isso a `tipografia` carrega `fontFamily` (`Geist_500Medium`
etc.), nunca `fontWeight`. Se você escrever `fontWeight: '600'` num componente,
no Android não vai acontecer nada.

---

## Navegação

**Pilha (stack) com a tela inicial como hub.** Não há barra de abas.

RNF-08 exige que a tela inicial apresente os atalhos dos cinco módulos — uma
tab bar competiria com esses atalhos e duplicaria a navegação.

**A profundidade é apertada de propósito.** P-11 respondeu que os três passos do
RNF-07 contam a tela inicial como primeiro passo. Ou seja, o cadastro de animal
tem que caber em:

```
Início (1)  →  Gado (2)  →  Cadastro (3)
```

Não sobra folga. **O botão de cadastrar precisa estar na própria tela de Gado**,
não atrás de mais um nível — se a tela de Gado abrir numa lista e o cadastro for
um quarto toque, estoura o RNF-07.

---

## Desvios deliberados do DESIGN.md

Todos estão comentados no código, onde aparecem. Registrados aqui para não
serem "corrigidos" por engano depois.

| # | Desvio | Motivo |
|---|--------|--------|
| 1 | **Cor adicionada** ao sistema monocromático | RF-15.2 exige três níveis de qualidade de pasto. No campo, sob sol, peso de preenchimento não se lê tão rápido quanto cor |
| 2 | **Alvo de toque 48px**, não 36–40px | O DESIGN.md mede para ponteiro de mouse. Este app é usado no celular, no campo, às vezes com luva. 48dp é o mínimo do Material Design. A geometria do sistema (raio 18px, tipo 14px/500) foi mantida — os 48px vêm de padding |
| 3 | **Sombra de uma camada**, não três | Android não suporta sombra composta, só `elevation`. A aresta do cartão vem da borda de 1px — que o próprio DESIGN.md já exige |
| 4 | **`display` (48px) não é usado** | É tamanho de headline web; a 360px ele quebra. O maior passo em uso é 36px (`headingLg`). A escala completa fica definida por fidelidade |
| 5 | **Chão verde** (`#EDF4EE`), não cinza | Decisão do time: o branco puro deixava o app sem temperatura |
| 6 | **`cinzaMedio` = `#6E6E6E`**, não `#737373` | Sobre o chão verde, o `#737373` caía para 4,24:1 e perdia o AA. Agora dá 4,56:1 no verde e 5,10:1 no papel. O DESIGN.md proíbe **clarear** além de `#737373`; escurecer está dentro da regra |
| 7 | **`letterSpacing` 0,2px** nos rótulos de indicador | O 0,6px do DESIGN.md é de caption em tela larga; somado nas três colunas a 360px, custa a largura que faz o rótulo quebrar |

---

## Acessibilidade

Não é enfeite aqui — é requisito de uso real no campo.

- **Contraste:** todos os textos coloridos passam AA. Os badges de qualidade
  ficam acima de 7:1; os ícones de módulo acima de 5:1 sobre o branco.
- **RF-15.2 em três canais:** a classificação do pasto é carregada por cor de
  fundo, ponto sólido **e texto**. O texto é o que garante o requisito para
  quem não distingue as cores — daltonismo vermelho-verde atinge cerca de 8%
  dos homens, e é exatamente o par que "Boa" e "Ruim" usam. **A cor acelera a
  leitura, não a substitui.** Não remova o rótulo de texto.
- **Rótulos abreviados** levam a frase completa em `descricaoAcessivel`
  (ex.: "TRATAMENTO" é anunciado como "4 animais em tratamento").
- **Alvo mínimo de 48px** em tudo que é tocável.

---

## Requisitos já atendidos

| ID | Onde |
|----|------|
| RNF-08 | Atalhos para gado, pastos, vendas, gastos e relatórios em `app/index.tsx` |
| RNF-17 | Todos os textos em português brasileiro |
| RNF-18 | `src/lib/formato.ts` — `R$ 1.234,50` e `15/09/2026` |
| RNF-14 | Componentes com responsabilidade única e tokens centralizados |
| RF-15.2 | `BadgeQualidade` — os três níveis, visíveis na tela de Pastos |
| RF-15/16 | CRUD de pastos e tipos de capim com validações de ha, cm e % |
| RF-22/23 | CRUD de gastos, categorias e subcategorias persistido no SQLite |
| RF-31/32/33 | Operação offline e persistência local com migrations versionadas |

**RNF-18 não usa `Intl`.** O suporte a locale do Hermes varia entre builds do
Android, e aqui o formato pt-BR é requisito, não preferência do aparelho — então
a formatação é manual e determinística.

---

## Pendências

### Precisa de decisão

1. **P-07 conflita com RF-21.** O atalho de Vendas diz "Vendas realizadas e
   vendas planejadas", seguindo RF-21. Mas P-07 respondeu que "será considerado
   apenas vendas realizadas". Ou RF-21 sai do escopo, ou P-07 responde outra
   coisa. Decisão do patrocinador. Quando resolver, é uma linha em
   `app/index.tsx`.

### Precisa de código

2. **Módulos restantes.** Gado, Vendas e Relatórios ainda são placeholders. A
   tela real substitui o `<EmBreve>` sem mexer na tela inicial.
3. **Resumo e backup.** Os indicadores da tela inicial devem voltar somente
   quando as respectivas consultas e o backup real estiverem implementados;
   não usar números ou datas fictícios.

---

## Ao construir um módulo novo

1. Importe os tokens de `src/theme/tokens.ts`. Não invente valor.
2. Envolva a tela em `<Tela>` e o conteúdo em `<Cartao>`.
3. Cor só nos três casos da regra acima.
4. Nada tocável abaixo de 48px.
5. Texto em pt-BR; moeda e data por `src/lib/formato.ts`.
6. Cheque a 360px, não só no preview largo — é a largura de Android mais comum
   e onde os layouts quebram primeiro.
