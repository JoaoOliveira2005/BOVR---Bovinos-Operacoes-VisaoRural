import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Cartao } from '../src/components/Cartao';
import { EstadoTela } from '../src/components/EstadoTela';
import { GrupoIndicadores } from '../src/components/GrupoIndicadores';
import { Indicador } from '../src/components/Indicador';
import { Tela } from '../src/components/Tela';
import { useServicoDashboard } from '../src/data/sqlite/dashboardServices';
import type { GastoPorCategoria, ResumoFazenda } from '../src/features/dashboard/types';
import { moeda } from '../src/lib/formato';
import { cores, espaco, raio, tipografia } from '../src/theme/tokens';

export default function TelaRelatorios() {
  const servico = useServicoDashboard();
  const [resumo, setResumo] = useState<ResumoFazenda | null>(null);
  const [porCategoria, setPorCategoria] = useState<GastoPorCategoria[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [res, cats] = await Promise.all([
        servico.obterResumoFazenda(),
        servico.obterGastosPorCategoria(),
      ]);
      setResumo(res);
      setPorCategoria(cats);
    } catch {
      // Mantém estado anterior em caso de erro momentâneo
    } finally {
      setCarregando(false);
    }
  }, [servico]);

  useFocusEffect(
    useCallback(() => {
      void carregarDados();
    }, [carregarDados]),
  );

  const totalGeralCentavos = resumo?.gastos.totalGeralCentavos ?? 0;
  const semGastos = totalGeralCentavos === 0;

  return (
    <Tela>
      {/* Título e escopo do relatório */}
      <View style={estilos.topo}>
        <Text style={estilos.titulo}>Relatório Financeiro</Text>
        <Text style={estilos.subtitulo}>
          Acompanhamento consolidado de gastos e custos operacionais (RF-28).
        </Text>
      </View>

      {carregando ? (
        <EstadoTela mensagem="Carregando dados dos relatórios…" carregando />
      ) : semGastos ? (
        <EstadoTela mensagem="Nenhum gasto registrado ainda. Os relatórios serão gerados assim que as despesas forem lançadas." />
      ) : (
        <>
          {/* Indicadores gerais de custos */}
          <Cartao style={estilos.cartaoResumo}>
            <Text style={estilos.secaoTitulo}>Total Acumulado</Text>
            <GrupoIndicadores>
              <Indicador
                rotulo="Total geral"
                valor={moeda(totalGeralCentavos / 100)}
                descricaoAcessivel="total de gastos acumulado"
              />
              <Indicador
                rotulo="Mês atual"
                valor={moeda((resumo?.gastos.totalMesCentavos ?? 0) / 100)}
                descricaoAcessivel="gastos neste mês"
              />
            </GrupoIndicadores>
          </Cartao>

          {/* Gastos por categoria — RF-28 */}
          <View style={estilos.secao}>
            <Text style={estilos.secaoTitulo}>Gastos por categoria (RF-28)</Text>
            <Cartao style={estilos.cartaoCategorias}>
              {porCategoria.map((item, index) => {
                const percentual =
                  totalGeralCentavos > 0
                    ? Math.round((item.totalCentavos / totalGeralCentavos) * 100)
                    : 0;

                return (
                  <View key={item.categoriaId} style={estilos.linhaCategoria}>
                    {index > 0 && <View style={estilos.divisor} />}
                    <View style={estilos.cabecalhoLinha}>
                      <Text style={estilos.nomeCategoria}>{item.categoriaNome}</Text>
                      <Text style={estilos.valorCategoria}>
                        {moeda(item.totalCentavos / 100)}
                      </Text>
                    </View>

                    {/* Barra de proporção */}
                    <View style={estilos.trilhoBarra}>
                      <View
                        style={[
                          estilos.preenchimentoBarra,
                          { width: `${Math.max(percentual, 2)}%` },
                        ]}
                      />
                    </View>

                    <Text style={estilos.detalhesCategoria}>
                      {percentual}% do total · {item.quantidade}{' '}
                      {item.quantidade === 1 ? 'lançamento' : 'lançamentos'}
                    </Text>
                  </View>
                );
              })}
            </Cartao>
          </View>

          {/* Observação de expansão para as próximas fases */}
          <Cartao style={estilos.cartaoFuturo}>
            <Text style={estilos.tituloFuturo}>Próximos Relatórios</Text>
            <Text style={estilos.textoFuturo}>
              Os relatórios de rebanho (RF-26) e vendas (RF-27) serão integrados assim que os
              módulos de Gado e Vendas forem conectados.
            </Text>
          </Cartao>
        </>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  topo: {
    gap: espaco.xs,
  },
  titulo: {
    ...tipografia.heading,
    color: cores.tinta,
  },
  subtitulo: {
    ...tipografia.body,
    color: cores.cinzaMedio,
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
  cartaoCategorias: {
    gap: espaco.lg,
  },
  linhaCategoria: {
    gap: espaco.xs,
  },
  divisor: {
    height: 1,
    backgroundColor: cores.fio,
    marginBottom: espaco.sm,
  },
  cabecalhoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  nomeCategoria: {
    ...tipografia.bodyMedia,
    color: cores.tinta,
  },
  valorCategoria: {
    ...tipografia.bodyMedia,
    color: cores.tinta,
  },
  trilhoBarra: {
    height: 8,
    backgroundColor: cores.neutro,
    borderRadius: raio.interativo,
    overflow: 'hidden',
    marginVertical: espaco.xs,
  },
  preenchimentoBarra: {
    height: '100%',
    backgroundColor: cores.tinta,
    borderRadius: raio.interativo,
  },
  detalhesCategoria: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
  },
  cartaoFuturo: {
    gap: espaco.xs,
    backgroundColor: cores.canvas,
  },
  tituloFuturo: {
    ...tipografia.subheading,
    color: cores.cinzaMedio,
  },
  textoFuturo: {
    ...tipografia.body,
    color: cores.cinzaMedio,
  },
});
