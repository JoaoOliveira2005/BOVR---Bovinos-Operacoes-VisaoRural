import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { cores, espaco, raio, tipografia, toque } from '../theme/tokens';

type Props = TextInputProps & { rotulo: string; ajuda?: string };

export function Campo({ rotulo, ajuda, style, ...props }: Props) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor={cores.cinzaMedio}
        style={[estilos.input, style]}
        {...props}
      />
      {ajuda ? <Text style={estilos.ajuda}>{ajuda}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: espaco.xs },
  rotulo: { ...tipografia.bodyMedia, color: cores.tinta },
  input: {
    minHeight: toque.alvoMinimo,
    borderRadius: raio.interativo,
    borderWidth: 1,
    borderColor: cores.fio,
    backgroundColor: cores.neutro,
    color: cores.tinta,
    paddingHorizontal: espaco.lg,
    ...tipografia.body,
  },
  ajuda: { ...tipografia.caption, letterSpacing: 0, color: cores.cinzaMedio },
});
