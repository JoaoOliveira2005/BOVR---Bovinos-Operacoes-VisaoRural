import { StyleSheet, Text, View } from 'react-native';

import { espaco, paleta, raio, tipografia, type Qualidade } from '../theme/tokens';

type Props = {
  qualidade: Qualidade;
};

/** Rótulos exibidos ao usuário (RNF-17). */
const ROTULO: Record<Qualidade, string> = {
  boa: 'Boa',
  regular: 'Regular',
  ruim: 'Ruim',
};

/**
 * Classificação de qualidade do pasto — RF-15.2.
 *
 * Carrega a informação em três canais ao mesmo tempo: cor de fundo, ponto
 * sólido e texto. O texto é o que garante o requisito para quem não distingue
 * as cores — a cor acelera a leitura, não a substitui.
 */
export function BadgeQualidade({ qualidade }: Props) {
  const tom = paleta.qualidade[qualidade];

  return (
    <View style={[estilos.base, { backgroundColor: tom.suave }]}>
      <View style={[estilos.ponto, { backgroundColor: tom.base }]} />
      <Text style={[estilos.texto, { color: tom.forte }]}>{ROTULO[qualidade]}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espaco.sm - 2,
    paddingVertical: 3,
    paddingHorizontal: espaco.sm + 2,
    borderRadius: raio.interativo,
  },
  ponto: {
    width: 6,
    height: 6,
    borderRadius: raio.interativo,
  },
  texto: {
    ...tipografia.caption,
    letterSpacing: 0,
  },
});
