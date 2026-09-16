import { Feather } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, raio, tipografia } from '../theme/tokens';
import { Badge } from './Badge';
import { Cartao } from './Cartao';
import { Tela } from './Tela';

type Props = {
  titulo: string;
  /** Requisitos do Documento de Visão que esta tela vai atender. */
  requisitos: string[];
  /** Bloco opcional acima da lista, para um pedaço do módulo que já existe. */
  previa?: ReactNode;
};

/**
 * Placeholder dos módulos ainda não implementados. Existe para que a navegação
 * da tela inicial possa ser testada inteira desde já — cada destino mostra o
 * que será construído ali. Substituir pela tela real conforme cada módulo sai.
 */
export function EmBreve({ titulo, requisitos, previa }: Props) {
  return (
    <Tela>
      <View style={estilos.topo}>
        <View style={estilos.selo}>
          <Feather name="tool" size={20} color={cores.tinta} />
        </View>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Badge texto="Em construção" variante="contorno" />
      </View>

      {previa}

      <Cartao>
        <Text style={estilos.listaTitulo}>Vai atender</Text>
        <View style={estilos.lista}>
          {requisitos.map((requisito) => {
            const [codigo, ...resto] = requisito.split('  ');
            return (
              <View key={requisito} style={estilos.linha}>
                <Badge texto={codigo} variante="suave" />
                <Text style={estilos.item}>{resto.join('  ')}</Text>
              </View>
            );
          })}
        </View>
      </Cartao>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  topo: {
    alignItems: 'flex-start',
    gap: espaco.md,
  },
  selo: {
    width: 40,
    height: 40,
    borderRadius: raio.aninhado,
    backgroundColor: cores.paper,
    borderWidth: 1,
    borderColor: cores.fio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    ...tipografia.headingSm,
    color: cores.tinta,
  },
  listaTitulo: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    textTransform: 'uppercase',
    marginBottom: espaco.lg,
  },
  lista: {
    gap: espaco.md,
  },
  /** Código do requisito como badge à esquerda, texto fluindo à direita: a
      quebra alinha sob a primeira letra, não sob o código. */
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaco.md,
  },
  item: {
    ...tipografia.body,
    color: cores.cinzaMedio,
    flex: 1,
  },
});
