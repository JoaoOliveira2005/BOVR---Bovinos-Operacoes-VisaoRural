import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores, espaco } from '../theme/tokens';

type Props = {
  children: ReactNode;
  /** Desliga a rolagem para telas que gerenciam a própria lista (ex.: FlatList). */
  rolavel?: boolean;
};

/**
 * Moldura padrão de toda tela: canvas de fundo, respiro lateral e a folga
 * inferior da barra de gestos do Android. Usar sempre — é o que mantém o
 * alinhamento consistente entre os módulos.
 */
export function Tela({ children, rolavel = true }: Props) {
  const insets = useSafeAreaInsets();
  const preenchimento = { paddingBottom: insets.bottom + espaco.xxl };

  if (!rolavel) {
    return <View style={[estilos.base, preenchimento]}>{children}</View>;
  }

  return (
    <ScrollView
      style={estilos.base}
      contentContainerStyle={[estilos.conteudo, preenchimento]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: cores.canvas,
  },
  conteudo: {
    paddingHorizontal: espaco.lg,
    paddingTop: espaco.xxl,
    gap: espaco.xxl,
  },
});
