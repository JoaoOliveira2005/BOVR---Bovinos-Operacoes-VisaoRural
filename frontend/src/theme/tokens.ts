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
   * Verde muito claro em vez do cinza do DESIGN.md: o branco puro deixava o
   * app sem temperatura. E so o chao — cartao, cabecalho e conteudo seguem em
   * papel branco por cima, entao o contraste de camada nao muda.
   */
  canvas: '#EDF4EE',
  /** Nivel 2 — cartoes, popovers, botao primario claro. */
  paper: '#FFFFFF',
  /** Nivel 1 — variante sutil de cartao, estado pressionado sobre papel. */
  superficieAlt: '#FAFAFA',

  /**
   * Preenchimento neutro de badge, input e botao secundario.
   *
   * Existe separado de `canvas` de proposito: com o chao verde, usar o mesmo
   * token faria o badge neutro sair esverdeado e competir com o "Boa" da
   * qualidade do pasto (RF-15.2). Preenchimento neutro tem que continuar cinza.
   */
  neutro: '#F5F5F5',

  /** Texto primario, titulos, tracos de icone. */
  tinta: '#0A0A0A',
  /** Fundo de botao preenchido, texto secundario sobre superficie clara. */
  tintaSuave: '#171717',
  /**
   * Texto de apoio, placeholder, rotulos auxiliares, icone em repouso.
   *
   * Um passo mais escuro que o #737373 do DESIGN.md: sobre o chao verde aquele
   * tom caia para 4.24:1 e perdia o AA. Aqui fica 4.56:1 no verde e 5.10:1 no
   * papel. O DESIGN.md proibe clarear alem de #737373 — escurecer esta dentro.
   */
  cinzaMedio: '#6E6E6E',
  /** Bordas, contorno de input, aresta de cartao, contorno de badge. */
  fio: '#E5E5E5',
  /** Texto sobre superficie escura (botao preenchido, badge solido). */
  tintaInversa: '#FAFAFA',

  /**
   * Unico tom cromatico do sistema. O DESIGN.md reserva-o para acoes
   * destrutivas e estados de erro — "it never decorates". Nao usar para
   * enfase, marca ou categoria.
   */
  ember: '#E7000B',
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
    boa: { base: '#15803D', forte: '#14532D', suave: '#DCFCE7' },
    regular: { base: '#B45309', forte: '#78350F', suave: '#FEF3C7' },
    ruim: { base: '#E7000B', forte: '#9F0007', suave: '#FFE4E6' },
  },

  /**
   * Identidade de cada modulo (F01–F08). Tinge apenas o icone e o selo de 40px
   * do atalho — o cartao, o titulo e a descricao seguem acromaticos, entao a
   * tela inicial ganha reconhecimento sem virar um mosaico.
   */
  modulo: {
    gado: { base: '#B45309', suave: '#FEF3C7' },
    pastos: { base: '#15803D', suave: '#DCFCE7' },
    vendas: { base: '#1D4ED8', suave: '#DBEAFE' },
    gastos: { base: '#BE123C', suave: '#FFE4E6' },
    relatorios: { base: '#6D28D9', suave: '#EDE9FE' },
  },

  /** RF-25 — sinal do resultado financeiro. */
  resultado: {
    positivo: '#15803D',
    negativo: '#E7000B',
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
