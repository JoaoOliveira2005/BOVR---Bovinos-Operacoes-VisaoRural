import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, tipografia } from '../theme/tokens';

type Props = {
  rotulo: string;
  valor: string;
  /** Passo da escala para o número. `headingSm` é o padrão; `heading` destaca. */
  tamanho?: 'headingSm' | 'heading';
  /** Tom do número quando ele carrega um estado. Sem isto, tinta neutra. */
  cor?: string;
  /** Frase completa para leitor de tela, quando o rótulo visível é abreviado. */
  descricaoAcessivel?: string;
};

/**
 * Stat Block do DESIGN.md: rótulo em caption maiúsculo cinza, valor grande em
 * tinta com tracking apertado. Sem moldura de cartão — no sistema é a escala
 * tipográfica sozinha que estabelece a métrica.
 */
export function Indicador({
  rotulo,
  valor,
  tamanho = 'headingSm',
  cor = cores.tinta,
  descricaoAcessivel,
}: Props) {
  return (
    <View
      style={estilos.base}
      accessible
      accessibilityLabel={`${valor} ${descricaoAcessivel ?? rotulo}`}
    >
      <Text
        style={[estilos.valor, tipografia[tamanho], { color: cor }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {valor}
      </Text>
      <Text style={estilos.rotulo} numberOfLines={1}>
        {rotulo}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  /**
   * A coluna toma a largura do proprio conteudo e divide a sobra por igual
   * (`flexBasis: 'auto'`), em vez de um terco fixo para cada.
   *
   * Com tercos iguais, "PASTOS" desperdicava espaco e "EM TRATAMENTO" quebrava
   * no meio da palavra a 360px. Medindo pelo conteudo, cada rotulo cabe em uma
   * linha so e os tres continuam somando menos que a largura do cartao.
   */
  base: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    minWidth: 0,
    gap: espaco.xs,
  },
  valor: {},
  /**
   * `letterSpacing` menor que o 0.6px do DESIGN.md: aquele valor e de caption
   * em tela larga e, somado nas tres colunas a 360px, custa a largura que faz
   * o rotulo mais longo quebrar.
   */
  rotulo: {
    ...tipografia.caption,
    letterSpacing: 0.2,
    color: cores.cinzaMedio,
    textTransform: 'uppercase',
  },
});
