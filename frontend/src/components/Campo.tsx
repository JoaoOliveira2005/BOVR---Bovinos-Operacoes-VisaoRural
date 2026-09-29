import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { cores, espaco, raio, tipografia, toque } from '../theme/tokens';

type Props = TextInputProps & {
  rotulo: string;
  ajuda?: string;
  /** Mensagem de erro do campo. Substitui a ajuda e tinge a borda (RNF-09). */
  erro?: string | null;
};

export function Campo({ rotulo, ajuda, erro, style, ...props }: Props) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={erro ? `${rotulo}. Erro: ${erro}` : rotulo}
        placeholderTextColor={cores.cinzaMedio}
        style={[estilos.input, erro ? estilos.inputComErro : null, style]}
        {...props}
      />
      {erro ? (
        <Text style={estilos.erro}>{erro}</Text>
      ) : ajuda ? (
        <Text style={estilos.ajuda}>{ajuda}</Text>
      ) : null}
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
  // Ember e a unica cor cromatica que o DESIGN.md reserva para erro.
  inputComErro: { borderColor: cores.ember },
  erro: { ...tipografia.caption, letterSpacing: 0, color: cores.ember },
});
