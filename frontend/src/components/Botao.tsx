import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { cores, espaco, raio, tipografia, toque } from '../theme/tokens';

type Props = Omit<PressableProps, 'children'> & {
  titulo: string;
  variante?: 'primario' | 'secundario' | 'perigo';
  carregando?: boolean;
};

export function Botao({ titulo, variante = 'primario', carregando = false, disabled, style, ...props }: Props) {
  const desabilitado = disabled || carregando;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={desabilitado}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        pressed && estilos.pressionado,
        desabilitado && estilos.desabilitado,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...props}
    >
      {carregando ? (
        <ActivityIndicator color={variante === 'primario' ? cores.tintaInversa : cores.tinta} />
      ) : (
        <Text style={[estilos.texto, variante === 'primario' && estilos.textoInverso, variante === 'perigo' && estilos.textoPerigo]}>
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: toque.alvoMinimo,
    borderRadius: raio.interativo,
    paddingHorizontal: espaco.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primario: { backgroundColor: cores.tintaSuave, borderColor: cores.tintaSuave },
  secundario: { backgroundColor: cores.paper, borderColor: cores.fio },
  perigo: { backgroundColor: cores.paper, borderColor: cores.ember },
  texto: { ...tipografia.bodyMedia, color: cores.tinta },
  textoInverso: { color: cores.tintaInversa },
  textoPerigo: { color: cores.ember },
  pressionado: { opacity: 0.72 },
  desabilitado: { opacity: 0.45 },
});
