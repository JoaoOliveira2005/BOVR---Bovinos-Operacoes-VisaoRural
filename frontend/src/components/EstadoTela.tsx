import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, tipografia } from '../theme/tokens';

export function EstadoTela({ mensagem, carregando = false }: { mensagem: string; carregando?: boolean }) {
  return (
    <View style={estilos.base}>
      {carregando ? <ActivityIndicator color={cores.tinta} /> : null}
      <Text style={estilos.texto}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { alignItems: 'center', gap: espaco.md, paddingVertical: espaco.secao },
  texto: { ...tipografia.body, color: cores.cinzaMedio, textAlign: 'center' },
});
