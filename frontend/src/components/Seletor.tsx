import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, raio, tipografia, toque } from '../theme/tokens';

type Opcao<T extends string | number> = { valor: T; rotulo: string };

export function Seletor<T extends string | number>({
  rotulo,
  valor,
  opcoes,
  aoSelecionar,
}: {
  rotulo: string;
  valor: T | null;
  opcoes: Opcao<T>[];
  aoSelecionar: (valor: T) => void;
}) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <View style={estilos.opcoes}>
        {opcoes.map((opcao) => {
          const selecionada = opcao.valor === valor;
          return (
            <Pressable
              key={String(opcao.valor)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selecionada }}
              onPress={() => aoSelecionar(opcao.valor)}
              style={[estilos.opcao, selecionada && estilos.selecionada]}
            >
              <Text style={[estilos.texto, selecionada && estilos.textoSelecionado]}>{opcao.rotulo}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: espaco.sm },
  rotulo: { ...tipografia.bodyMedia, color: cores.tinta },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  opcao: {
    minHeight: toque.alvoMinimo,
    justifyContent: 'center',
    paddingHorizontal: espaco.lg,
    borderRadius: raio.interativo,
    borderWidth: 1,
    borderColor: cores.fio,
    backgroundColor: cores.paper,
  },
  selecionada: { backgroundColor: cores.tintaSuave, borderColor: cores.tintaSuave },
  texto: { ...tipografia.bodyMedia, color: cores.tinta },
  textoSelecionado: { color: cores.tintaInversa },
});
