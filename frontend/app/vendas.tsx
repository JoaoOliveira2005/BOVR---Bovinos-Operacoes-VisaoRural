import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useServicoVendas } from '../../backend/data/sqlite/saleServices';
import type { TipoVenda, Venda } from '../../backend/features/sales/types';
import { Badge } from '../src/components/Badge';
import { Botao } from '../src/components/Botao';
import { Campo } from '../src/components/Campo';
import { Cartao } from '../src/components/Cartao';
import { EstadoTela } from '../src/components/EstadoTela';
import { Tela } from '../src/components/Tela';
import { mensagemErro } from '../src/domain/errors';
import { isoParaData, moeda, plural } from '../src/lib/formato';
import { cores, espaco, paleta, raio, tipografia, toque } from '../src/theme/tokens';

type AbaTipo = 'todas' | TipoVenda;

export default function TelaVendas() {
  const router = useRouter();
  const servico = useServicoVendas();

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [abaAtiva, setAbaAtiva] = useState<AbaTipo>('todas');
  const [busca, setBusca] = useState('');
  const [expandidoId, setExpandidoId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await servico.listar();
      setVendas(lista);
      setErro(null);
    } catch (causa) {
      setErro(mensagemErro(causa));
    } finally {
      setCarregando(false);
    }
  }, [servico]);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar]),
  );

  const excluirVenda = (venda: Venda) => {
    const executarExclusao = async () => {
      try {
        await servico.excluir(venda.id);
        await carregar();
      } catch (causa) {
        const mensagem = mensagemErro(causa);
        if (Platform.OS === 'web') {
          window.alert(`Não foi possível excluir: ${mensagem}`);
        } else {
          Alert.alert('Não foi possível excluir', mensagem);
        }
      }
    };

    const textoConfirmacao = `A venda para “${venda.comprador}” no valor de ${moeda(
      venda.valorBrutoCentavos / 100,
    )} será excluída definitivamente.`;

    if (Platform.OS === 'web') {
      if (window.confirm(`${textoConfirmacao} Confirma?`)) {
        void executarExclusao();
      }
    } else {
      Alert.alert('Excluir venda?', textoConfirmacao, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => void executarExclusao() },
      ]);
    }
  };

  const vendasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return vendas.filter((v) => {
      if (abaAtiva !== 'todas' && v.tipo !== abaAtiva) {
        return false;
      }
      if (termo) {
        const bateComprador = v.comprador.toLowerCase().includes(termo);
        const bateBrinco = v.itens.some((it) => it.brinco.toLowerCase().includes(termo));
        if (!bateComprador && !bateBrinco) return false;
      }
      return true;
    });
  }, [vendas, abaAtiva, busca]);

  const resumo = useMemo(() => {
    const totalCentavos = vendasFiltradas.reduce((acc, v) => acc + v.valorBrutoCentavos, 0);
    const totalCabecas = vendasFiltradas.reduce((acc, v) => acc + v.quantidadeAnimais, 0);
    const pesoTotal = vendasFiltradas.reduce((acc, v) => acc + v.pesoTotalKg, 0);
    return {
      totalCentavos,
      totalCabecas,
      pesoTotal: Number(pesoTotal.toFixed(2)),
      quantidadeVendas: vendasFiltradas.length,
    };
  }, [vendasFiltradas]);

  return (
    <Tela>
      {/* Botão de Registro */}
      <Botao
        titulo="Registrar venda"
        onPress={() => router.push('/venda-form')}
      />

      {/* Seletor de Abas (Todas / Realizadas / Planejadas - RF-21) */}
      <View style={estilos.abasContainer}>
        {(['todas', 'realizada', 'planejada'] as AbaTipo[]).map((tab) => {
          const ativa = abaAtiva === tab;
          const rotulos: Record<AbaTipo, string> = {
            todas: 'Todas',
            realizada: 'Realizadas',
            planejada: 'Planejadas',
          };
          return (
            <Pressable
              key={tab}
              onPress={() => setAbaAtiva(tab)}
              style={[estilos.aba, ativa && estilos.abaAtiva]}
            >
              <Text style={[estilos.abaTexto, ativa && estilos.abaTextoAtivo]}>
                {rotulos[tab]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Campo de Busca / Filtro por Comprador ou Brinco (RF-20.2) */}
      <Campo
        rotulo=""
        placeholder="Buscar por comprador ou nº do brinco…"
        value={busca}
        onChangeText={setBusca}
      />

      {carregando ? (
        <EstadoTela mensagem="Carregando vendas…" carregando />
      ) : erro ? (
        <EstadoTela mensagem={erro} />
      ) : vendas.length === 0 ? (
        <EstadoTela mensagem="Nenhuma venda registrada ainda. Use o botão acima para registrar a primeira venda." />
      ) : vendasFiltradas.length === 0 ? (
        <EstadoTela mensagem="Nenhuma venda encontrada para os filtros selecionados." />
      ) : (
        <View style={estilos.conteudo}>
          {/* Card de Resumo das Vendas Filtradas */}
          <Cartao style={estilos.cartaoResumo}>
            <Text style={estilos.resumoTitulo}>
              Resumo — {abaAtiva === 'todas' ? 'Geral' : abaAtiva === 'realizada' ? 'Realizadas' : 'Planejadas'}
            </Text>
            <View style={estilos.resumoGrid}>
              <View style={estilos.resumoItem}>
                <Text style={estilos.resumoValor}>{moeda(resumo.totalCentavos / 100)}</Text>
                <Text style={estilos.resumoLabel}>Faturamento Bruto</Text>
              </View>
              <View style={estilos.resumoItem}>
                <Text style={estilos.resumoValor}>{resumo.totalCabecas}</Text>
                <Text style={estilos.resumoLabel}>
                  {plural(resumo.totalCabecas, 'Animal', 'Animais')}
                </Text>
              </View>
              <View style={estilos.resumoItem}>
                <Text style={estilos.resumoValor}>
                  {resumo.pesoTotal.toLocaleString('pt-BR')} kg
                </Text>
                <Text style={estilos.resumoLabel}>Peso Total</Text>
              </View>
              <View style={estilos.resumoItem}>
                <Text style={estilos.resumoValor}>{resumo.quantidadeVendas}</Text>
                <Text style={estilos.resumoLabel}>
                  {plural(resumo.quantidadeVendas, 'Venda', 'Vendas')}
                </Text>
              </View>
            </View>
          </Cartao>

          {/* Listagem de Vendas */}
          <View style={estilos.listaVendas}>
            {vendasFiltradas.map((venda) => {
              const expandido = expandidoId === venda.id;
              const precoMedioPorCabeca =
                venda.quantidadeAnimais > 0
                  ? venda.valorBrutoCentavos / 100 / venda.quantidadeAnimais
                  : 0;
              const pesoMedio =
                venda.quantidadeAnimais > 0
                  ? venda.pesoTotalKg / venda.quantidadeAnimais
                  : 0;

              return (
                <Cartao key={venda.id} style={estilos.cartaoVenda}>
                  {/* Cabeçalho da Venda */}
                  <View style={estilos.cabecalhoVenda}>
                    <View style={estilos.infoComprador}>
                      <Text style={estilos.nomeComprador}>{venda.comprador}</Text>
                      <Text style={estilos.dataVenda}>
                        {isoParaData(venda.data)}
                      </Text>
                    </View>
                    <Badge
                      texto={venda.tipo === 'realizada' ? 'Realizada' : 'Planejada'}
                      variante={venda.tipo === 'realizada' ? 'solido' : 'suave'}
                    />
                  </View>

                  {/* Valores e Métricas */}
                  <View style={estilos.valoresLinha}>
                    <Text style={estilos.valorBruto}>
                      {moeda(venda.valorBrutoCentavos / 100)}
                    </Text>
                    <Text style={estilos.metricasTexto}>
                      {venda.quantidadeAnimais} {plural(venda.quantidadeAnimais, 'cabeça', 'cabeças')} · {venda.pesoTotalKg.toLocaleString('pt-BR')} kg
                    </Text>
                  </View>

                  {/* Médias */}
                  <View style={estilos.mediasLinha}>
                    <Text style={estilos.mediaItem}>
                      Média: {moeda(precoMedioPorCabeca)} / cab.
                    </Text>
                    <Text style={estilos.mediaItem}>
                      {pesoMedio.toFixed(1)} kg / cab.
                    </Text>
                  </View>

                  {/* Observações */}
                  {venda.observacoes ? (
                    <Text style={estilos.observacoesVenda}>
                      Obs.: {venda.observacoes}
                    </Text>
                  ) : null}

                  {/* Lista detalhada dos animais (expandível) */}
                  {venda.itens.length > 0 ? (
                    <Pressable
                      onPress={() => setExpandidoId(expandido ? null : venda.id)}
                      style={estilos.toggleAnimais}
                    >
                      <Text style={estilos.toggleTexto}>
                        {expandido ? 'Ocultar animais' : `Ver ${venda.itens.length} ${plural(venda.itens.length, 'animal', 'animais')}`}
                      </Text>
                      <Feather
                        name={expandido ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={cores.cinzaMedio}
                      />
                    </Pressable>
                  ) : null}

                  {expandido && (
                    <View style={estilos.detalheAnimais}>
                      {venda.itens.map((item, idx) => (
                        <View key={item.id ?? idx} style={estilos.itemAnimalLinha}>
                          <Text style={estilos.itemBrinco}>Brinco {item.brinco}</Text>
                          <Text style={estilos.itemPeso}>{item.pesoKg.toLocaleString('pt-BR')} kg</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Ações */}
                  <View style={estilos.acoes}>
                    <Botao
                      titulo="Editar"
                      variante="secundario"
                      onPress={() =>
                        router.push({
                          pathname: '/venda-form',
                          params: { id: String(venda.id) },
                        })
                      }
                    />
                    <Botao
                      titulo="Excluir"
                      variante="perigo"
                      onPress={() => excluirVenda(venda)}
                    />
                  </View>
                </Cartao>
              );
            })}
          </View>
        </View>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  abasContainer: {
    flexDirection: 'row',
    gap: espaco.sm,
    backgroundColor: cores.paper,
    padding: 4,
    borderRadius: raio.interativo,
    borderWidth: 1,
    borderColor: cores.fio,
  },
  aba: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaco.sm,
    borderRadius: raio.interativo - 2,
  },
  abaAtiva: {
    backgroundColor: cores.tintaSuave,
  },
  abaTexto: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    fontFamily: 'Geist_500Medium',
  },
  abaTextoAtivo: {
    color: cores.tintaInversa,
  },
  conteudo: {
    gap: espaco.md,
  },
  cartaoResumo: {
    gap: espaco.sm,
    backgroundColor: cores.paper,
  },
  resumoTitulo: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    textTransform: 'uppercase',
  },
  resumoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaco.md,
  },
  resumoItem: {
    flex: 1,
    minWidth: '45%',
    gap: 2,
  },
  resumoValor: {
    ...tipografia.headingSm,
    color: cores.tinta,
  },
  resumoLabel: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    letterSpacing: 0,
  },
  listaVendas: {
    gap: espaco.md,
  },
  cartaoVenda: {
    gap: espaco.md,
  },
  cabecalhoVenda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoComprador: {
    gap: 2,
    flex: 1,
  },
  nomeComprador: {
    ...tipografia.subheading,
    color: cores.tinta,
  },
  dataVenda: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    letterSpacing: 0,
  },
  valoresLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: espaco.sm,
  },
  valorBruto: {
    ...tipografia.headingSm,
    color: paleta.resultado.positivo,
  },
  metricasTexto: {
    ...tipografia.body,
    color: cores.tinta,
  },
  mediasLinha: {
    flexDirection: 'row',
    gap: espaco.lg,
  },
  mediaItem: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    letterSpacing: 0,
  },
  observacoesVenda: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    fontStyle: 'italic',
    letterSpacing: 0,
  },
  toggleAnimais: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    paddingVertical: espaco.xs,
  },
  toggleTexto: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    letterSpacing: 0,
  },
  detalheAnimais: {
    backgroundColor: cores.neutro,
    borderRadius: raio.interativo,
    padding: espaco.sm,
    gap: espaco.xs,
  },
  itemAnimalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemBrinco: {
    ...tipografia.caption,
    color: cores.tinta,
    fontFamily: 'Geist_500Medium',
  },
  itemPeso: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
  },
  acoes: {
    flexDirection: 'row',
    gap: espaco.sm,
  },
});
