import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtalhoCard } from '../src/components/AtalhoCard';
import { cores, espaco, tipografia, type Modulo } from '../src/theme/tokens';

type Atalho = {
  modulo: Modulo;
  titulo: string;
  descricao: string;
  icone: React.ComponentProps<typeof Feather>['name'];
  href: string;
};

/**
 * Os cinco atalhos exigidos por RNF-08, nesta ordem: a sequência acompanha o
 * dia do usuário — primeiro o rebanho e onde ele está, depois o dinheiro que
 * entra e sai, e por fim a consolidação.
 */
const ATALHOS: Atalho[] = [
  {
    modulo: 'gado',
    titulo: 'Gado',
    descricao: 'Animais, lotes, reprodução, vacinas e saúde',
    icone: 'list',
    href: '/gado',
  },
  {
    modulo: 'pastos',
    titulo: 'Pastos',
    descricao: 'Qualidade do capim, movimentação e descanso',
    icone: 'map',
    href: '/pastos',
  },
  {
    modulo: 'vendas',
    titulo: 'Vendas',
    descricao: 'Registro e histórico de vendas realizadas',
    icone: 'trending-up',
    href: '/vendas',
  },
  {
    modulo: 'gastos',
    titulo: 'Gastos',
    descricao: 'Água, ração, mão de obra e infraestrutura',
    icone: 'credit-card',
    href: '/gastos',
  },
  {
    modulo: 'relatorios',
    titulo: 'Relatórios',
    descricao: 'Gado, vendas, gastos e resumo financeiro',
    icone: 'bar-chart-2',
    href: '/relatorios',
  },
];

export default function TelaInicial() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={estilos.base}
      contentContainerStyle={[
        estilos.conteudo,
        { paddingTop: insets.top + espaco.xxl, paddingBottom: insets.bottom + espaco.xxl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho puramente tipográfico — sem faixa de cor, como manda o
          DESIGN.md: a hierarquia vem da escala, não de um fundo. */}
      <View style={estilos.topo}>
        <Text style={estilos.saudacao}>Gestão da fazenda</Text>
        <Text style={estilos.fazenda}>BOVR</Text>
      </View>

      {/* Atalhos — RNF-08. */}
      <View style={estilos.secao}>
        <Text style={estilos.secaoTitulo}>Atalhos</Text>
        <View style={estilos.atalhos}>
          {ATALHOS.map((atalho) => (
            <AtalhoCard key={atalho.titulo} {...atalho} />
          ))}
        </View>
      </View>

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
    gap: espaco.xxl,
  },
  topo: {
    gap: espaco.xs,
  },
  saudacao: {
    ...tipografia.body,
    color: cores.cinzaMedio,
  },
  fazenda: {
    ...tipografia.heading,
    color: cores.tinta,
  },
  secao: {
    gap: espaco.md,
  },
  secaoTitulo: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    textTransform: 'uppercase',
  },
  atalhos: {
    gap: espaco.md,
  },
});
