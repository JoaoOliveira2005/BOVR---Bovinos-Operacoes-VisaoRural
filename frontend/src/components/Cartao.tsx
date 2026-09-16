import { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { cores, layout, raio, sombra } from '../theme/tokens';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

/**
 * Container de conteudo do DESIGN.md: papel branco, raio 24px, fio de 1px e
 * uma sombra quase imperceptivel. O fio nao e opcional — no sistema e ele que
 * define a aresta, nao a sombra.
 */
export function Cartao({ children, style }: Props) {
  return <View style={[estilos.base, style]}>{children}</View>;
}

const estilos = StyleSheet.create({
  base: {
    backgroundColor: cores.paper,
    borderRadius: raio.cartao,
    borderWidth: 1,
    borderColor: cores.fio,
    padding: layout.paddingCartao,
    ...sombra.cartao,
  },
});
