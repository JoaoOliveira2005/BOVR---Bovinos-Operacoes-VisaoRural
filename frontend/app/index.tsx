import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtalhoCard } from '../src/components/AtalhoCard';
import { Cartao } from '../src/components/Cartao';
import { GrupoIndicadores } from '../src/components/GrupoIndicadores';
import { Indicador } from '../src/components/Indicador';
import { useServicoDashboard } from '../src/data/sqlite/dashboardServices';
import type { ResumoFazenda } from '../src/features/dashboard/types';
import { moeda } from '../src/lib/formato';
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
  const servico = useServicoDashboard();
  const [resumo, setResumo] = useState<ResumoFazenda | null>(null);

  const carregarResumo = useCallback(async () => {
    try {
      const dados = await servico.obterResumoFazenda();
      setResumo(dados);
    } catch {
      // Falha silenciosa para não quebrar a tela inicial se o banco estiver ocupado
    }
  }, [servico]);

  useFocusEffect(
    useCallback(() => {
      void carregarResumo();
    }, [carregarResumo]),
  );

  const temDados =
    resumo && (resumo.pastos.totalPastos > 0 || resumo.gastos.totalGeralCentavos > 0);

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

      {/* Resumo consolidado dos módulos existentes — RF-18.1 / RF-22 */}
      {temDados ? (
        <Cartao style={estilos.cartaoResumo}>
          <Text style={estilos.secaoTitulo}>Resumo da fazenda</Text>
          <GrupoIndicadores>
            <Indicador
              rotulo="Pastos"
              valor={String(resumo.pastos.totalPastos)}
              descricaoAcessivel="pastos cadastrados"
            />
            <Indicador
              rotulo="Área total"
              valor={`${resumo.pastos.areaTotalHectares} ha`}
              descricaoAcessivel="hectares cadastrados"
            />
            <Indicador
              rotulo="Gastos no mês"
              valor={moeda(resumo.gastos.totalMesCentavos / 100)}
              descricaoAcessivel="gastos neste mês"
            />
          </GrupoIndicadores>
        </Cartao>
      ) : null}

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
  cartaoResumo: {
    gap: espaco.md,
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
