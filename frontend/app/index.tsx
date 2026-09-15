import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtalhoCard } from '../src/components/AtalhoCard';
import { Cartao } from '../src/components/Cartao';
import { GrupoIndicadores } from '../src/components/GrupoIndicadores';
import { Indicador } from '../src/components/Indicador';
import { dataHora, moeda, plural } from '../src/lib/formato';
import { resumoFazenda } from '../src/lib/dadosExemplo';
import { cores, espaco, paleta, tipografia, type Modulo } from '../src/theme/tokens';

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
    descricao: 'Vendas realizadas e vendas planejadas',
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
  const { nomeFazenda, animaisAtivos, pastosAtivos, emTratamento, resultadoAcumulado, ultimoBackup } =
    resumoFazenda;

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
        <Text style={estilos.saudacao}>Bem-vindo de volta</Text>
        <Text style={estilos.fazenda}>{nomeFazenda}</Text>
      </View>

      <Cartao>
        <View style={estilos.resumoCabecalho}>
          <Text style={estilos.resumoTitulo}>Resumo da fazenda</Text>
          <Text style={estilos.resumoData}>{dataHora(new Date())}</Text>
        </View>

        <GrupoIndicadores>
          <Indicador
            rotulo={plural(animaisAtivos, 'animal ativo', 'animais ativos')}
            valor={String(animaisAtivos)}
          />
          <Indicador rotulo={plural(pastosAtivos, 'pasto', 'pastos')} valor={String(pastosAtivos)} />
          {/* RF-13 — animais com ocorrencia aberta. Recebe o tom de atencao so
              quando ha algum; em zero nao ha o que alertar. */}
          <Indicador
            rotulo="tratamento"
            descricaoAcessivel="animais em tratamento"
            valor={String(emTratamento)}
            cor={emTratamento > 0 ? paleta.qualidade.regular.base : undefined}
          />
        </GrupoIndicadores>

        <View style={estilos.divisor} />

        {/* RF-25.1 + P-16 — sem período selecionado o resultado considera todo o
            histórico. Não rotular como mensal: P-09 define o ciclo de venda em
            1–2 anos, então um recorte de mês não significa nada aqui.
            Empilhado porque rótulo e valor não cabem na mesma linha a 360px. */}
        <View style={estilos.resultado}>
          <Text style={estilos.resultadoRotulo}>Resultado acumulado</Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              estilos.resultadoValor,
              {
                color:
                  resultadoAcumulado >= 0
                    ? paleta.resultado.positivo
                    : paleta.resultado.negativo,
              },
            ]}
          >
            {moeda(resultadoAcumulado)}
          </Text>
        </View>
      </Cartao>

      {/* Atalhos — RNF-08. */}
      <View style={estilos.secao}>
        <Text style={estilos.secaoTitulo}>Atalhos</Text>
        <View style={estilos.atalhos}>
          {ATALHOS.map((atalho) => (
            <AtalhoCard key={atalho.titulo} {...atalho} />
          ))}
        </View>
      </View>

      {/* RF-36 — o app não envia notificações (RF-14), então o estado do backup
          precisa estar visível na tela inicial para o usuário não esquecer. */}
      <View style={estilos.backup}>
        <Feather name="shield" size={14} color={cores.cinzaMedio} />
        <Text style={estilos.backupTexto}>Último backup em {dataHora(ultimoBackup)}</Text>
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
  resumoCabecalho: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: espaco.sm,
    marginBottom: espaco.xl,
  },
  resumoTitulo: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    textTransform: 'uppercase',
  },
  resumoData: {
    ...tipografia.caption,
    letterSpacing: 0,
    color: cores.cinzaMedio,
  },
  divisor: {
    height: 1,
    backgroundColor: cores.fio,
    marginVertical: espaco.xl,
  },
  resultado: {
    gap: espaco.xs,
  },
  resultadoRotulo: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    textTransform: 'uppercase',
  },
  resultadoValor: {
    ...tipografia.headingLg,
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
  backup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
  },
  backupTexto: {
    ...tipografia.caption,
    letterSpacing: 0,
    color: cores.cinzaMedio,
  },
});
