/**
 * BOVR — Design tokens.
 *
 * Implementa o DESIGN.md ("clinical blueprint on frosted paper"): sistema
 * monocromatico, superficies em tres tons, bordas de 1px e cantos grandes.
 * Fonte unica de verdade do padrao visual — nenhum componente declara cor,
 * espacamento, raio ou tamanho de fonte diretamente.
 *
 * Tres adaptacoes deliberadas do DESIGN.md para Android, documentadas onde
 * aparecem: alvo de toque (`toque`), sombra (`sombra`) e peso de fonte
 * (`tipografia`).
 */

/**
 * Neutros. Esta escala permanece acromatica: e ela que da ao app o ar de
 * "clinical blueprint" do DESIGN.md. Cor com significado mora em `paleta`.
 */
export const cores = {
  /**
   * Nivel 0 — fundo da pagina.
   *
   * Quase-preto com vies verde, nao cinza neutro: o verde de pasto que o app
   * tinha no tema claro continua presente, so que agora como temperatura do
   * escuro. O DESIGN.md especifica "Theme: light" — inverter foi decisao do
   * time, e a inversao e completa: nenhum token ficou com valor do tema claro.
   */
  canvas: '#0E1410',
  /** Nivel 2 — cartoes e popovers. No escuro o cartao e mais CLARO que o chao. */
  paper: '#161D18',
  /** Nivel 1 — estado pressionado sobre o papel, um degrau acima dele. */
  superficieAlt: '#1F2721',

  /**
   * Preenchimento neutro de badge, input e botao secundario.
   *
   * Continua separado de `canvas` pelo mesmo motivo do tema claro: usar o
   * mesmo token faria o badge neutro se confundir com o chao e competir com o
   * "Boa" da qualidade do pasto (RF-15.2).
   */
  neutro: '#1F2721',

  /** Texto primario, titulos, tracos de icone. */
  tinta: '#EDF4EE',
  /**
   * Fundo do botao preenchido e do chip selecionado.
   *
   * O DESIGN.md chama a inversao escuro-sobre-claro de "the only chromatic
   * interaction in the system". No tema escuro ela vira claro-sobre-escuro:
   * este token clareia e `tintaInversa` escurece, mantendo a mesma ideia.
   */
  tintaSuave: '#EDF4EE',
  /**
   * Texto de apoio, placeholder, rotulos auxiliares, icone em repouso.
   *
   * 6.99:1 sobre o chao e 6.44:1 sobre o papel — folga confortavel sobre o AA.
   */
  cinzaMedio: '#94A297',
  /** Bordas, contorno de input, aresta de cartao, contorno de badge. */
  fio: '#303D34',
  /** Texto sobre o botao preenchido claro. */
  tintaInversa: '#0E1410',

  ember: '#FF6B6B',
} as const;

/**
 * Camada cromatica.
 *
 * DESVIO DELIBERADO do DESIGN.md, que e acromatico por definicao. A cor entra
 * porque RF-15.2 exige tres niveis de qualidade de pasto e, no campo, sob sol,
 * peso de preenchimento nao se le tao rapido quanto cor.
 *
 * A regra que sobra: a fundacao continua monocromatica. Superficie, texto,
 * borda e icone em repouso nunca recebem cor — ela entra so onde carrega
 * significado (status, identidade de modulo, sinal do resultado financeiro).
 *
 * Cada tom tem tres papeis:
 *   base   — icone, marca, ponto de status, preenchimento solido
 *   forte  — texto sobre `suave` (todos verificados em AA, >= 7:1)
 *   suave  — fundo tingido de badge
 */
export const paleta = {
  /** RF-15.2 — classificacao de qualidade do pasto. */
  qualidade: {
    boa: { base: '#4ADE80', forte: '#86EFAC', suave: '#14301F' },
    regular: { base: '#FBBF24', forte: '#FCD34D', suave: '#35280C' },
    ruim: { base: '#FF6B6B', forte: '#FCA5A5', suave: '#3A1618' },
  },

  /**
   * Identidade de cada modulo (F01–F08). Tinge apenas o icone e o selo de 40px
   * do atalho — o cartao, o titulo e a descricao seguem acromaticos, entao a
   * tela inicial ganha reconhecimento sem virar um mosaico.
   */
  modulo: {
    gado: { base: '#E0A44A', suave: '#3A2E15' },
    pastos: { base: '#5FD08A', suave: '#14301F' },
    vendas: { base: '#7DA9F5', suave: '#17233B' },
    gastos: { base: '#F2809C', suave: '#3A1B26' },
    relatorios: { base: '#B08CF0', suave: '#271C3D' },
  },

  /** RF-25 — sinal do resultado financeiro. */
  resultado: {
    positivo: '#5FD08A',
    negativo: '#FF6B6B',
  },
} as const;

export type Qualidade = keyof typeof paleta.qualidade;
export type Modulo = keyof typeof paleta.modulo;

/** Superficies empilhadas — canvas < superficieAlt < paper. */
export const superficie = {
  canvas: cores.canvas,
  navegacao: cores.superficieAlt,
  cartao: cores.paper,
  input: cores.neutro,
} as const;

/** Escala de espacamento, base 4px, densidade compacta. */
export const espaco = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  secao: 48,
} as const;

/**
 * Raios. O DESIGN.md e categorico: 18px em tudo que e interativo, 24px em
 * containers, e nada entre os dois. `pequeno` e `aninhado` ficam para icones e
 * blocos internos.
 */
export const raio = {
  pequeno: 6,
  aninhado: 10,
  interativo: 18,
  cartao: 24,
} as const;

/**
 * Familias da Geist. No Android o `fontWeight` nao seleciona o arquivo certo
 * de uma fonte customizada — e preciso apontar a familia de cada peso
 * diretamente. Por isso a tipografia carrega `fontFamily`, nunca `fontWeight`.
 */
export const fonte = {
  regular: 'Geist_400Regular',
  media: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
} as const;

/**
 * Escala tipografica do DESIGN.md. `lineHeight` e `letterSpacing` ja vem
 * calculados em px — nao sobrescrever nos componentes.
 *
 * `display` (48px) e `headingLg` (36px) sao tamanhos de headline web; em tela
 * de 360px o maior passo que cabe sem quebrar e `heading` (30px). Ficam
 * definidos por fidelidade a escala, mas so use os maiores em numero curto.
 */
export const tipografia = {
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0.6, fontFamily: fonte.media },
  body: { fontSize: 14, lineHeight: 20, fontFamily: fonte.regular },
  bodyMedia: { fontSize: 14, lineHeight: 20, fontFamily: fonte.media },
  bodyLg: { fontSize: 16, lineHeight: 24, fontFamily: fonte.regular },
  subheading: { fontSize: 18, lineHeight: 28, fontFamily: fonte.semibold },
  headingSm: { fontSize: 24, lineHeight: 32, letterSpacing: -0.6, fontFamily: fonte.semibold },
  heading: { fontSize: 30, lineHeight: 36, letterSpacing: -0.75, fontFamily: fonte.semibold },
  headingLg: { fontSize: 36, lineHeight: 40, letterSpacing: -0.9, fontFamily: fonte.semibold },
  display: { fontSize: 48, lineHeight: 53, letterSpacing: -2.4, fontFamily: fonte.semibold },
} as const;

/**
 * Elevacao.
 *
 * O DESIGN.md empilha tres camadas de sombra; o Android nao suporta sombra
 * composta, so o `elevation`. A aresta do cartao vem da borda de 1px — que o
 * DESIGN.md ja exige ("the shadow alone does not define the card edge") — e o
 * `elevation` entra so como o sussurro de profundidade por cima.
 */
export const sombra = {
  nenhuma: {},
  cartao: {
    elevation: 1,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
} as const;

/**
 * Alvo minimo de toque.
 *
 * O DESIGN.md descreve botoes de 36–40px de altura, medida de ponteiro de
 * mouse. Este app e usado no campo, no celular, as vezes com luva ou a mao
 * suja, e 48dp e o minimo do Material Design para toque. Mantemos a geometria
 * do DESIGN.md (raio 18px, tipo 14px/500) e chegamos aos 48px por padding,
 * entao o visual segue o sistema e o alvo segue o dedo.
 */
export const toque = {
  alvoMinimo: 48,
} as const;

/** Layout. `larguraMaxima` do DESIGN.md e de pagina web; em celular nao se aplica. */
export const layout = {
  paddingCartao: espaco.xl,
  gapElemento: espaco.sm,
  gapSecao: espaco.secao,
} as const;

export const tema = {
  cores,
  paleta,
  superficie,
  espaco,
  raio,
  fonte,
  tipografia,
  sombra,
  toque,
  layout,
} as const;

export type Tema = typeof tema;
