import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useServicoAnimais } from '../../backend/data/sqlite/cattleServices';
import { useServicoVendas } from '../../backend/data/sqlite/saleServices';
import type { Animal } from '../../backend/features/cattle/types';
import type { EntradaItemVenda, TipoVenda } from '../../backend/features/sales/types';
import { Botao } from '../src/components/Botao';
import { Campo } from '../src/components/Campo';
import { Cartao } from '../src/components/Cartao';
import { EstadoTela } from '../src/components/EstadoTela';
import { Seletor } from '../src/components/Seletor';
import { Tela } from '../src/components/Tela';
import { mensagemErro } from '../src/domain/errors';
import { data, dataParaIso, isoParaData, mascararData } from '../src/lib/formato';
import { cores, espaco, raio, tipografia, toque } from '../src/theme/tokens';

type ItemFormulario = {
  idTemp: string;
  animalId?: number | null;
  brinco: string;
  pesoKg: string;
};

const OPCOES_TIPO: { valor: TipoVenda; rotulo: string }[] = [
  { valor: 'realizada', rotulo: 'Venda Realizada' },
  { valor: 'planejada', rotulo: 'Venda Planejada' },
];

function reaisParaCentavos(valor: string): number {
  const limpo = valor.trim().replace(/\./g, '').replace(',', '.');
  const n = Number(limpo);
  if (isNaN(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function centavosParaReais(centavos: number): string {
  return (centavos / 100).toFixed(2).replace('.', ',');
}

export default function FormularioVenda() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : undefined;

  const servicoVendas = useServicoVendas();
  const servicoAnimais = useServicoAnimais();

  const [tipo, setTipo] = useState<TipoVenda>('realizada');
  const [comprador, setComprador] = useState('');
  const [dataVenda, setDataVenda] = useState(data(new Date()));
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemFormulario[]>([
    { idTemp: '1', brinco: '', pesoKg: '' },
  ]);

  const [animaisDisponiveis, setAnimaisDisponiveis] = useState<Animal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const listaAnimais = await servicoAnimais.listar();
        setAnimaisDisponiveis(listaAnimais.filter((a) => a.situacao === 'ativo'));

        if (id) {
          const venda = await servicoVendas.exigir(id);
          setTipo(venda.tipo);
          setComprador(venda.comprador);
          setDataVenda(isoParaData(venda.data));
          setValor(centavosParaReais(venda.valorBrutoCentavos));
          setObservacoes(venda.observacoes ?? '');
          if (venda.itens.length > 0) {
            setItens(
              venda.itens.map((it, idx) => ({
                idTemp: String(it.id ?? idx + 1),
                animalId: it.animalId,
                brinco: it.brinco,
                pesoKg: String(it.pesoKg).replace('.', ','),
              })),
            );
          }
        }
      } catch (causa) {
        Alert.alert('Não foi possível carregar', mensagemErro(causa));
      } finally {
        setCarregando(false);
      }
    })();
  }, [id, servicoVendas, servicoAnimais]);

  const adicionarAnimal = (animal?: Animal) => {
    setItens((atuais) => [
      ...atuais,
      {
        idTemp: String(Date.now() + Math.random()),
        animalId: animal?.id,
        brinco: animal?.brinco ?? '',
        pesoKg: '',
      },
    ]);
  };

  const removerAnimal = (idTemp: string) => {
    setItens((atuais) => {
      if (atuais.length <= 1) {
        return [{ idTemp: '1', brinco: '', pesoKg: '' }];
      }
      return atuais.filter((it) => it.idTemp !== idTemp);
    });
  };

  const atualizarItem = (idTemp: string, campo: 'brinco' | 'pesoKg', valorTexto: string) => {
    setItens((atuais) =>
      atuais.map((it) => {
        if (it.idTemp !== idTemp) return it;
        return { ...it, [campo]: valorTexto };
      }),
    );
  };

  const resumoItens = useMemo(() => {
    let pesoTotal = 0;
    let qtdValidos = 0;
    for (const it of itens) {
      if (it.brinco.trim()) {
        qtdValidos++;
        const p = Number(it.pesoKg.replace(',', '.'));
        if (!isNaN(p) && p > 0) pesoTotal += p;
      }
    }
    return { qtdValidos, pesoTotal: Number(pesoTotal.toFixed(2)) };
  }, [itens]);

  const salvar = async () => {
    setSalvando(true);
    try {
      const dataIso = dataParaIso(dataVenda);
      if (!dataIso) {
        throw new Error('Informe a data no formato DD/MM/AAAA.');
      }

      const itensValidados: EntradaItemVenda[] = itens.map((it) => {
        const peso = Number(it.pesoKg.trim().replace(',', '.'));
        return {
          animalId: it.animalId ?? null,
          brinco: it.brinco.trim(),
          pesoKg: peso,
        };
      });

      await servicoVendas.salvar(
        {
          tipo,
          comprador,
          data: dataIso,
          valorBrutoCentavos: reaisParaCentavos(valor),
          observacoes: observacoes.trim() || null,
          itens: itensValidados,
        },
        id,
      );

      router.back();
    } catch (causa) {
      const msg = mensagemErro(causa);
      if (Platform.OS === 'web') {
        window.alert(`Revise os dados: ${msg}`);
      } else {
        Alert.alert('Revise os dados', msg);
      }
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <Tela>
        <EstadoTela mensagem="Carregando formulário de venda…" carregando />
      </Tela>
    );
  }

  return (
    <Tela>
      <Text style={estilos.titulo}>{id ? 'Editar venda' : 'Nova venda'}</Text>

      <Seletor rotulo="Tipo de venda" valor={tipo} opcoes={OPCOES_TIPO} aoSelecionar={setTipo} />

      <Campo
        rotulo="Comprador"
        value={comprador}
        onChangeText={setComprador}
        placeholder="Ex.: Frigorífico Boi Gordo / João Silva"
      />

      <Campo
        rotulo="Data da venda"
        ajuda="Formato DD/MM/AAAA"
        value={dataVenda}
        onChangeText={(txt) => setDataVenda(mascararData(txt))}
        keyboardType="number-pad"
        placeholder="DD/MM/AAAA"
        maxLength={10}
      />

      <Campo
        rotulo="Valor total bruto (R$)"
        value={valor}
        onChangeText={setValor}
        keyboardType="decimal-pad"
        placeholder="0,00"
      />

      {/* Seção de Animais da Venda */}
      <View style={estilos.secaoAnimais}>
        <View style={estilos.cabecalhoSecao}>
          <Text style={estilos.rotuloSecao}>Animais da venda (RF-19.1)</Text>
          <Text style={estilos.subtituloSecao}>
            {resumoItens.qtdValidos} {resumoItens.qtdValidos === 1 ? 'animal' : 'animais'} ·{' '}
            {resumoItens.pesoTotal.toLocaleString('pt-BR')} kg total
          </Text>
        </View>

        {/* Sugestão de animais ativos rápidos para adicionar */}
        {animaisDisponiveis.length > 0 ? (
          <View style={estilos.sugestoes}>
            <Text style={estilos.ajudaSugestao}>Adicionar animal do rebanho ativo:</Text>
            <View style={estilos.chipsContainer}>
              {animaisDisponiveis.slice(0, 8).map((animal) => {
                const jaAdicionado = itens.some(
                  (it) => it.brinco.trim().toUpperCase() === animal.brinco.toUpperCase(),
                );
                return (
                  <Pressable
                    key={animal.id}
                    onPress={() => {
                      if (!jaAdicionado) adicionarAnimal(animal);
                    }}
                    style={[estilos.chip, jaAdicionado && estilos.chipDesabilitado]}
                  >
                    <Text style={[estilos.chipTexto, jaAdicionado && estilos.chipTextoDesabilitado]}>
                      +{animal.brinco} ({animal.raca})
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {itens.map((item, index) => (
          <Cartao key={item.idTemp} style={estilos.cartaoItem}>
            <View style={estilos.linhaItem}>
              <View style={estilos.colunaBrinco}>
                <Campo
                  rotulo={`Animal #${index + 1} - Brinco`}
                  value={item.brinco}
                  onChangeText={(txt) => atualizarItem(item.idTemp, 'brinco', txt)}
                  placeholder="Nº do brinco"
                />
              </View>
              <View style={estilos.colunaPeso}>
                <Campo
                  rotulo="Peso (kg)"
                  value={item.pesoKg}
                  onChangeText={(txt) => atualizarItem(item.idTemp, 'pesoKg', txt)}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 480"
                />
              </View>
              {itens.length > 1 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remover animal"
                  onPress={() => removerAnimal(item.idTemp)}
                  style={estilos.botaoRemoverItem}
                >
                  <Feather name="trash-2" size={20} color={cores.ember} />
                </Pressable>
              ) : null}
            </View>
          </Cartao>
        ))}

        <Botao
          titulo="+ Incluir outro animal"
          variante="secundario"
          onPress={() => adicionarAnimal()}
        />
      </View>

      <Campo
        rotulo="Observações (opcional)"
        value={observacoes}
        onChangeText={setObservacoes}
        placeholder="Ex.: Condições de pagamento, frete, lote negociado"
        multiline
        numberOfLines={3}
      />

      <Botao
        titulo={id ? 'Salvar alterações' : 'Confirmar venda'}
        carregando={salvando}
        onPress={salvar}
      />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  titulo: {
    ...tipografia.headingSm,
    color: cores.tinta,
    marginBottom: espaco.sm,
  },
  secaoAnimais: {
    gap: espaco.md,
    marginTop: espaco.sm,
  },
  cabecalhoSecao: {
    gap: espaco.xs,
  },
  rotuloSecao: {
    ...tipografia.bodyMedia,
    color: cores.tinta,
  },
  subtituloSecao: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    letterSpacing: 0,
  },
  sugestoes: {
    gap: espaco.xs,
    paddingVertical: espaco.xs,
  },
  ajudaSugestao: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    letterSpacing: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaco.xs,
  },
  chip: {
    paddingHorizontal: espaco.sm + 2,
    paddingVertical: 4,
    borderRadius: raio.interativo,
    backgroundColor: cores.paper,
    borderWidth: 1,
    borderColor: cores.fio,
  },
  chipDesabilitado: {
    opacity: 0.5,
  },
  chipTexto: {
    ...tipografia.caption,
    color: cores.tinta,
  },
  chipTextoDesabilitado: {
    color: cores.cinzaMedio,
  },
  cartaoItem: {
    padding: espaco.md,
  },
  linhaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
  },
  colunaBrinco: {
    flex: 3,
  },
  colunaPeso: {
    flex: 2,
  },
  botaoRemoverItem: {
    minWidth: toque.alvoMinimo,
    minHeight: toque.alvoMinimo,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: espaco.lg,
  },
});
