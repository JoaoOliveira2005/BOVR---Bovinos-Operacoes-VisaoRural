import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, raio, tipografia } from '../theme/tokens';

/**
 * Variantes do DESIGN.md. Num sistema monocromatico e o preenchimento — e nao
 * a cor — que carrega a hierarquia: `solido` pesa mais que `suave`, que pesa
 * mais que `contorno`.
 */
type Variante = 'solido' | 'suave' | 'contorno';

type Props = {
  texto: string;
  variante?: Variante;
};

export function Badge({ texto, variante = 'suave' }: Props) {
  return (
    <View style={[estilos.base, estilos[variante]]}>
      <Text style={[estilos.texto, variante === 'solido' && estilos.textoSolido]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: espaco.sm,
    borderRadius: raio.interativo,
    borderWidth: 1,
  },
  solido: {
    backgroundColor: cores.tintaSuave,
    borderColor: cores.tintaSuave,
  },
  suave: {
    backgroundColor: cores.neutro,
    borderColor: cores.neutro,
  },
  contorno: {
    backgroundColor: 'transparent',
    borderColor: cores.fio,
  },
  texto: {
    ...tipografia.caption,
    letterSpacing: 0,
    color: cores.tintaSuave,
  },
  textoSolido: {
    color: cores.tintaInversa,
  },
});
