import { Children, Fragment, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { cores, espaco } from '../theme/tokens';

type Props = {
  children: ReactNode;
};

/**
 * Linha de indicadores separados por um fio vertical.
 *
 * Sem o fio, o rótulo de uma coluna encosta no da seguinte e os dois podem ser
 * lidos como uma frase só ("animais ativos pastos"). O fio de 1px é o mesmo
 * elemento que o DESIGN.md usa para delimitar cartão e input — delimita sem
 * adicionar peso nem uma cor nova.
 *
 * Os fios entram intercalados e o respiro vem do `gap` do contêiner, então
 * nenhuma coluna carrega padding sobrando na borda do cartão — o que roubava
 * largura e fazia o rótulo mais longo truncar.
 */
export function GrupoIndicadores({ children }: Props) {
  const itens = Children.toArray(children);

  return (
    <View style={estilos.base}>
      {itens.map((item, indice) => (
        // A ordem dos indicadores é fixa, definida no código da tela — o índice
        // como chave é estável aqui.
        <Fragment key={indice}>
          {indice > 0 && <View style={estilos.fio} />}
          {item}
        </Fragment>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: espaco.md,
  },
  fio: {
    width: 1,
    backgroundColor: cores.fio,
  },
});
