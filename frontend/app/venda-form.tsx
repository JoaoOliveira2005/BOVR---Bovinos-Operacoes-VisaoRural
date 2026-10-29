import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useServicoAnimais } from '../../backend/data/sqlite/cattleServices';
import { useServicoVendas } from '../../backend/data/sqlite/saleServices';
import type { Animal } from '../../backend/features/cattle/types';
import type { EntradaItemVenda, TipoVenda } from '../../backend/features/sales/types';
import { Badge } from '../src/components/Badge';
import { Botao } from '../src/components/Botao';
import { Campo } from '../src/components/Campo';
import { Cartao } from '../src/components/Cartao';
import { EstadoTela } from '../src/components/EstadoTela';
import { Seletor } from '../src/components/Seletor';
import { Tela } from '../src/components/Tela';
import { mensagemErro } from '../src/domain/errors';
import { descreverIdade, idadeDoAnimal } from '../src/features/cattle/idade';
import { data, dataParaIso, isoParaData, mascararData } from '../src/lib/formato';
import { cores, espaco, raio, tipografia, toque } from '../src/theme/tokens';

type ItemFormulario = {
  idTemp: string;
  animalId?: number | null;
  brinco: string;
  pesoKg: string;
  manual?: boolean;
};

const ROTULO_SEXO = { macho: 'Macho', femea: 'Fêmea' } as const;

function textoIdade(animal: Animal): string {
  const idade = idadeDoAnimal(animal);
  if (!idade) return 'idade não informada';
  return idade.estimada ? `${descreverIdade(idade.meses)} (est.)` : descreverIdade(idade.meses);
}

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
  const [itens, setItens] = useState<ItemFormulario[]>([]);

  const [todosAnimais, setTodosAnimais] = useState<Animal[]>([]);
  const [animaisDisponiveis, setAnimaisDisponiveis] = useState<Animal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Estados de erro para feedback visual instantâneo
  const [erroComprador, setErroComprador] = useState<string | null>(null);
  const [erroData, setErroData] = useState<string | null>(null);
  const [erroValor, setErroValor] = useState<string | null>(null);
  const [erroAnimais, setErroAnimais] = useState<string | null>(null);
  const [mensagemErroGeral, setMensagemErroGeral] = useState<string | null>(null);

  // Estados do Modal de Seleção de Gado do Rebanho
  const [modalSelecaoVisivel, setModalSelecaoVisivel] = useState(false);
  const [buscaModal, setBuscaModal] = useState('');
  const [filtroSexoModal, setFiltroSexoModal] = useState<'todos' | 'macho' | 'femea'>('todos');
  const [selecionadosNoModal, setSelecionadosNoModal] = useState<Set<number>>(new Set());
  const [trocandoItemTempId, setTrocandoItemTempId] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      const listaAnimais = await servicoAnimais.listar();
      setTodosAnimais(listaAnimais);
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
              manual:
                !it.animalId &&
                !listaAnimais.some((a) => a.brinco.toUpperCase() === it.brinco.toUpperCase()),
            })),
          );
        }
      }
    } catch (causa) {
      const msg = mensagemErro(causa);
      setMensagemErroGeral(msg);
      if (Platform.OS === 'web') {
        window.alert(`Não foi possível carregar: ${msg}`);
      } else {
        Alert.alert('Não foi possível carregar', msg);
      }
    } finally {
      setCarregando(false);
    }
  }, [id, servicoVendas, servicoAnimais]);

  useFocusEffect(
    useCallback(() => {
      void carregarDados();
    }, [carregarDados]),
  );

  const atualizarAnimaisRebanho = async () => {
    try {
      const listaAnimais = await servicoAnimais.listar();
      setTodosAnimais(listaAnimais);
      setAnimaisDisponiveis(listaAnimais.filter((a) => a.situacao === 'ativo'));
    } catch {
      // Ignora falha de atualização momentânea
    }
  };

  // Animais do rebanho ativo que ainda não foram adicionados nesta venda
  const animaisNaoAdicionados = useMemo(() => {
    const brincosAdicionados = new Set(itens.map((it) => it.brinco.trim().toUpperCase()));
    const idsAdicionados = new Set(
      itens.map((it) => it.animalId).filter((aid): aid is number => typeof aid === 'number'),
    );
    return animaisDisponiveis.filter(
      (a) => !idsAdicionados.has(a.id) && !brincosAdicionados.has(a.brinco.toUpperCase()),
    );
  }, [animaisDisponiveis, itens]);

  // Animais filtrados na busca do modal
  const animaisModalFiltrados = useMemo(() => {
    const termo = buscaModal.trim().toLowerCase();
    return animaisDisponiveis.filter((animal) => {
      if (filtroSexoModal !== 'todos' && animal.sexo !== filtroSexoModal) {
        return false;
      }
      if (termo) {
        const bateBrinco = animal.brinco.toLowerCase().includes(termo);
        const bateRaca = animal.raca.toLowerCase().includes(termo);
        if (!bateBrinco && !bateRaca) return false;
      }
      return true;
    });
  }, [animaisDisponiveis, buscaModal, filtroSexoModal]);

  const limparErros = () => {
    setErroComprador(null);
    setErroData(null);
    setErroValor(null);
    setErroAnimais(null);
    setMensagemErroGeral(null);
  };

  const abrirModalSelecao = () => {
    void atualizarAnimaisRebanho();
    setTrocandoItemTempId(null);
    setBuscaModal('');
    setFiltroSexoModal('todos');
    setSelecionadosNoModal(new Set());
    setModalSelecaoVisivel(true);
  };

  const abrirModalParaTroca = (idTemp: string) => {
    void atualizarAnimaisRebanho();
    setTrocandoItemTempId(idTemp);
    setBuscaModal('');
    setFiltroSexoModal('todos');
    setSelecionadosNoModal(new Set());
    setModalSelecaoVisivel(true);
  };

  const fecharModal = () => {
    setModalSelecaoVisivel(false);
    setTrocandoItemTempId(null);
  };

  const adicionarAnimal = (animal: Animal) => {
    const jaAdicionado = itens.some(
      (it) =>
        it.animalId === animal.id ||
        it.brinco.trim().toUpperCase() === animal.brinco.toUpperCase(),
    );
    if (jaAdicionado) return;

    setItens((atuais) => [
      ...atuais,
      {
        idTemp: String(Date.now() + Math.random()),
        animalId: animal.id,
        brinco: animal.brinco,
        pesoKg: '',
        manual: false,
      },
    ]);
    setErroAnimais(null);
    setMensagemErroGeral(null);
  };

  const adicionarManual = () => {
    setItens((atuais) => [
      ...atuais,
      {
        idTemp: String(Date.now() + Math.random()),
        animalId: null,
        brinco: '',
        pesoKg: '',
        manual: true,
      },
    ]);
    setErroAnimais(null);
    setMensagemErroGeral(null);
  };

  const removerAnimal = (idTemp: string) => {
    setItens((atuais) => atuais.filter((it) => it.idTemp !== idTemp));
  };

  const atualizarItem = (idTemp: string, campo: 'brinco' | 'pesoKg', valorTexto: string) => {
    setItens((atuais) =>
      atuais.map((it) => {
        if (it.idTemp !== idTemp) return it;
        return { ...it, [campo]: valorTexto };
      }),
    );
    setErroAnimais(null);
    setMensagemErroGeral(null);
  };

  const aoClicarAnimalModal = (animal: Animal) => {
    // Modo de troca de animal em uma linha específica
    if (trocandoItemTempId) {
      setItens((atuais) =>
        atuais.map((it) => {
          if (it.idTemp !== trocandoItemTempId) return it;
          return {
            ...it,
            animalId: animal.id,
            brinco: animal.brinco,
            manual: false,
          };
        }),
      );
      fecharModal();
      return;
    }

    // Modo de seleção múltipla para inclusão
    setSelecionadosNoModal((anteriores) => {
      const novos = new Set(anteriores);
      if (novos.has(animal.id)) {
        novos.delete(animal.id);
      } else {
        novos.add(animal.id);
      }
      return novos;
    });
  };

  const confirmarSelecaoModal = () => {
    const novosItens: ItemFormulario[] = [];
    for (const animalId of selecionadosNoModal) {
      const animal = animaisDisponiveis.find((a) => a.id === animalId);
      if (animal) {
        novosItens.push({
          idTemp: String(Date.now() + Math.random()),
          animalId: animal.id,
          brinco: animal.brinco,
          pesoKg: '',
          manual: false,
        });
      }
    }
    setItens((atuais) => [...atuais, ...novosItens]);
    setErroAnimais(null);
    setMensagemErroGeral(null);
    fecharModal();
  };

  const alternarSelecionarTodosModal = () => {
    const disponiveisParaSelecao = animaisModalFiltrados.filter((a) => {
      return !itens.some(
        (it) =>
          it.idTemp !== trocandoItemTempId &&
          (it.animalId === a.id ||
            it.brinco.trim().toUpperCase() === a.brinco.toUpperCase()),
      );
    });

    const todosJaMarcados =
      disponiveisParaSelecao.length > 0 &&
      disponiveisParaSelecao.every((a) => selecionadosNoModal.has(a.id));

    if (todosJaMarcados) {
      setSelecionadosNoModal(new Set());
    } else {
      setSelecionadosNoModal(new Set(disponiveisParaSelecao.map((a) => a.id)));
    }
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
    limparErros();

    let temErro = false;

    if (!comprador.trim()) {
      setErroComprador('Informe o nome do comprador.');
      temErro = true;
    }

    const dataIso = dataParaIso(dataVenda);
    if (!dataVenda.trim()) {
      setErroData('Informe a data da venda.');
      temErro = true;
    } else if (!dataIso) {
      setErroData('Data inválida. Use o formato DD/MM/AAAA.');
      temErro = true;
    }

    const centavos = reaisParaCentavos(valor);
    if (!valor.trim() || centavos <= 0) {
      setErroValor('Informe o valor total bruto da venda (R$).');
      temErro = true;
    }

    if (itens.length === 0) {
      setErroAnimais('Adicione pelo menos um animal à venda.');
      temErro = true;
    } else {
      const itemSemBrinco = itens.find((it) => !it.brinco.trim());
      if (itemSemBrinco) {
        setErroAnimais('Informe o número do brinco para todos os animais da venda.');
        temErro = true;
      } else {
        const itemSemPeso = itens.find(
          (it) => !it.pesoKg.trim() || Number(it.pesoKg.replace(',', '.')) <= 0,
        );
        if (itemSemPeso) {
          setErroAnimais(`Informe o peso (kg) válido para o animal brinco ${itemSemPeso.brinco}.`);
          temErro = true;
        }
      }
    }

    if (temErro) {
      const msg = 'Preencha todos os campos obrigatórios antes de confirmar a venda.';
      setMensagemErroGeral(msg);
      if (Platform.OS === 'web') {
        window.alert(`Atenção: ${msg}`);
      } else {
        Alert.alert('Atenção', msg);
      }
      return;
    }

    setSalvando(true);
    try {
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
          data: dataIso!,
          valorBrutoCentavos: centavos,
          observacoes: observacoes.trim() || null,
          itens: itensValidados,
        },
        id,
      );

      router.back();
    } catch (causa) {
      const msg = mensagemErro(causa);
      setMensagemErroGeral(msg);

      if (msg.toLowerCase().includes('comprador')) {
        setErroComprador(msg);
      } else if (msg.toLowerCase().includes('data')) {
        setErroData(msg);
      } else if (msg.toLowerCase().includes('valor')) {
        setErroValor(msg);
      } else if (msg.toLowerCase().includes('animal') || msg.toLowerCase().includes('brinco') || msg.toLowerCase().includes('peso')) {
        setErroAnimais(msg);
      }

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

      {/* Banner de Erro em Destaque */}
      {mensagemErroGeral ? (
        <View style={estilos.bannerErro}>
          <Feather name="alert-triangle" size={18} color={cores.ember} />
          <Text style={estilos.textoBannerErro}>{mensagemErroGeral}</Text>
        </View>
      ) : null}

      <Seletor rotulo="Tipo de venda" valor={tipo} opcoes={OPCOES_TIPO} aoSelecionar={setTipo} />

      <Campo
        rotulo="Comprador"
        value={comprador}
        onChangeText={(txt) => {
          setComprador(txt);
          setErroComprador(null);
          setMensagemErroGeral(null);
        }}
        erro={erroComprador}
        placeholder="Ex.: Frigorífico Boi Gordo / João Silva"
      />

      <Campo
        rotulo="Data da venda"
        ajuda="Formato DD/MM/AAAA"
        value={dataVenda}
        onChangeText={(txt) => {
          setDataVenda(mascararData(txt));
          setErroData(null);
          setMensagemErroGeral(null);
        }}
        erro={erroData}
        keyboardType="number-pad"
        placeholder="DD/MM/AAAA"
        maxLength={10}
      />

      <Campo
        rotulo="Valor total bruto (R$)"
        value={valor}
        onChangeText={(txt) => {
          setValor(txt);
          setErroValor(null);
          setMensagemErroGeral(null);
        }}
        erro={erroValor}
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

        {erroAnimais ? (
          <View style={estilos.bannerErroSecao}>
            <Feather name="alert-circle" size={16} color={cores.ember} />
            <Text style={estilos.textoBannerErro}>{erroAnimais}</Text>
          </View>
        ) : null}

        {/* Sugestões de animais ativos rápidos para adicionar com 1 toque */}
        {animaisNaoAdicionados.length > 0 ? (
          <View style={estilos.sugestoes}>
            <Text style={estilos.ajudaSugestao}>Adicionar rápido do rebanho:</Text>
            <View style={estilos.chipsContainer}>
              {animaisNaoAdicionados.slice(0, 8).map((animal) => (
                <Pressable
                  key={animal.id}
                  onPress={() => adicionarAnimal(animal)}
                  style={estilos.chip}
                >
                  <Text style={estilos.chipTexto}>
                    +{animal.brinco} ({animal.raca})
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Lista de animais adicionados ou Card de Estado Vazio */}
        {itens.length === 0 ? (
          <Cartao style={[estilos.cartaoVazio, erroAnimais ? estilos.cartaoVazioErro : null]}>
            <View style={estilos.iconeVazioContainer}>
              <Feather name="check-circle" size={32} color={erroAnimais ? cores.ember : cores.cinzaMedio} />
            </View>
            <Text style={estilos.vazioTitulo}>Nenhum animal adicionado ainda</Text>
            <Text style={estilos.vazioTexto}>
              {animaisDisponiveis.length > 0
                ? 'Escolha os animais do seu rebanho cadastrado para incluir nesta venda.'
                : 'Cadastre animais no módulo Gado ou digite o brinco manualmente.'}
            </Text>
            <View style={estilos.vazioBotoes}>
              {animaisDisponiveis.length > 0 ? (
                <Botao
                  titulo="Escolher gado do rebanho"
                  onPress={abrirModalSelecao}
                />
              ) : (
                <Botao
                  titulo="+ Cadastrar animal no Gado"
                  onPress={() => router.push('/animal-form')}
                />
              )}
              <Botao
                titulo="+ Digitar brinco manual"
                variante="secundario"
                onPress={adicionarManual}
              />
            </View>
          </Cartao>
        ) : (
          itens.map((item, index) => {
            const animalInfo =
              (item.animalId ? todosAnimais.find((a) => a.id === item.animalId) : null) ??
              todosAnimais.find(
                (a) => a.brinco.trim().toUpperCase() === item.brinco.trim().toUpperCase(),
              );

            const ehDoRebanho = Boolean(animalInfo && !item.manual);

            return (
              <Cartao key={item.idTemp} style={estilos.cartaoItem}>
                <View style={estilos.cabecalhoItemAnimal}>
                  <View style={estilos.infoAnimal}>
                    <View style={estilos.linhaBrinco}>
                      <Feather
                        name={ehDoRebanho ? 'check-circle' : 'edit-3'}
                        size={16}
                        color={ehDoRebanho ? cores.tintaSuave : cores.cinzaMedio}
                      />
                      <Text style={estilos.tituloBrinco}>
                        {ehDoRebanho
                          ? `Brinco ${animalInfo?.brinco}`
                          : item.brinco.trim()
                          ? `Brinco ${item.brinco}`
                          : `Animal #${index + 1}`}
                      </Text>
                      <Badge
                        texto={ehDoRebanho ? 'Do rebanho' : 'Manual'}
                        variante={ehDoRebanho ? 'suave' : 'contorno'}
                      />
                    </View>
                    {ehDoRebanho && animalInfo ? (
                      <Text style={estilos.subtituloAnimal}>
                        {ROTULO_SEXO[animalInfo.sexo]} · {animalInfo.raca} ·{' '}
                        {textoIdade(animalInfo)}
                      </Text>
                    ) : null}
                  </View>

                  <View style={estilos.acoesItemAnimal}>
                    {animaisDisponiveis.length > 0 ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Trocar por gado do rebanho"
                        onPress={() => abrirModalParaTroca(item.idTemp)}
                        style={estilos.botaoTrocar}
                      >
                        <Feather name="repeat" size={14} color={cores.cinzaMedio} />
                        <Text style={estilos.textoTrocar}>Trocar</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remover animal"
                      onPress={() => removerAnimal(item.idTemp)}
                      style={estilos.botaoRemover}
                    >
                      <Feather name="trash-2" size={18} color={cores.ember} />
                    </Pressable>
                  </View>
                </View>

                {ehDoRebanho ? (
                  <View style={estilos.campoPesoContainer}>
                    <Campo
                      rotulo="Peso na venda (kg)"
                      value={item.pesoKg}
                      onChangeText={(txt) => atualizarItem(item.idTemp, 'pesoKg', txt)}
                      keyboardType="decimal-pad"
                      placeholder="Ex: 480"
                    />
                  </View>
                ) : (
                  <View style={estilos.linhaCamposManuais}>
                    <View style={estilos.colunaBrinco}>
                      <Campo
                        rotulo="Nº do brinco"
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
                  </View>
                )}
              </Cartao>
            );
          })
        )}

        {/* Botões de Ação para Inclusão de Animais */}
        {itens.length > 0 ? (
          <View style={estilos.botoesAdicionarLinha}>
            {animaisDisponiveis.length > 0 ? (
              <Botao
                titulo="+ Escolher gado do rebanho"
                variante="secundario"
                onPress={abrirModalSelecao}
                style={estilos.botaoFlex}
              />
            ) : null}
            <Botao
              titulo="+ Brinco manual"
              variante="secundario"
              onPress={adicionarManual}
              style={estilos.botaoManual}
            />
          </View>
        ) : null}
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

      {/* Modal de Escolha de Gado do Rebanho */}
      <Modal
        visible={modalSelecaoVisivel}
        animationType="slide"
        transparent
        onRequestClose={fecharModal}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalConteudo}>
            {/* Cabeçalho do Modal */}
            <View style={estilos.modalCabecalho}>
              <View style={estilos.modalCabecalhoTexto}>
                <Text style={estilos.modalTitulo}>
                  {trocandoItemTempId ? 'Trocar animal' : 'Escolher gado do rebanho'}
                </Text>
                <Text style={estilos.modalSubtitulo}>
                  {trocandoItemTempId
                    ? 'Toque no animal para substituí-lo na venda'
                    : 'Selecione os animais para incluir na venda'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar seleção"
                onPress={fecharModal}
                style={estilos.modalBotaoFechar}
              >
                <Feather name="x" size={22} color={cores.tinta} />
              </Pressable>
            </View>

            {/* Campo de Busca */}
            <Campo
              rotulo=""
              value={buscaModal}
              onChangeText={setBuscaModal}
              placeholder="Buscar por brinco ou raça…"
            />

            {/* Filtro por Sexo */}
            <View style={estilos.filtroSexoLinha}>
              {(['todos', 'macho', 'femea'] as const).map((opcao) => {
                const ativo = filtroSexoModal === opcao;
                const rotulos: Record<'todos' | 'macho' | 'femea', string> = {
                  todos: 'Todos',
                  macho: 'Machos',
                  femea: 'Fêmeas',
                };
                return (
                  <Pressable
                    key={opcao}
                    onPress={() => setFiltroSexoModal(opcao)}
                    style={[estilos.filtroChip, ativo && estilos.filtroChipAtivo]}
                  >
                    <Text style={[estilos.filtroChipTexto, ativo && estilos.filtroChipTextoAtivo]}>
                      {rotulos[opcao]}
                    </Text>
                  </Pressable>
                );
              })}

              {!trocandoItemTempId ? (
                <Pressable
                  onPress={alternarSelecionarTodosModal}
                  style={estilos.botaoSelecionarTodos}
                >
                  <Text style={estilos.textoSelecionarTodos}>
                    {animaisModalFiltrados.length > 0 &&
                    animaisModalFiltrados.every((a) => selecionadosNoModal.has(a.id))
                      ? 'Desmarcar'
                      : 'Marcar todos'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* Lista de Animais */}
            <ScrollView
              style={estilos.modalLista}
              contentContainerStyle={estilos.modalListaConteudo}
              keyboardShouldPersistTaps="handled"
            >
              {animaisModalFiltrados.length === 0 ? (
                <View style={estilos.modalVazio}>
                  <Text style={estilos.modalVazioTexto}>
                    Nenhum animal ativo encontrado no rebanho.
                  </Text>
                </View>
              ) : (
                animaisModalFiltrados.map((animal) => {
                  const jaAdicionado = itens.some(
                    (it) =>
                      it.idTemp !== trocandoItemTempId &&
                      (it.animalId === animal.id ||
                        it.brinco.trim().toUpperCase() === animal.brinco.toUpperCase()),
                  );

                  const selecionado = selecionadosNoModal.has(animal.id);

                  return (
                    <Pressable
                      key={animal.id}
                      disabled={jaAdicionado}
                      onPress={() => aoClicarAnimalModal(animal)}
                      style={[
                        estilos.itemAnimalModal,
                        selecionado && estilos.itemAnimalModalSelecionado,
                        jaAdicionado && estilos.itemAnimalModalDesabilitado,
                      ]}
                    >
                      <View style={estilos.itemAnimalEsquerda}>
                        {!trocandoItemTempId ? (
                          <Feather
                            name={
                              jaAdicionado
                                ? 'check'
                                : selecionado
                                ? 'check-square'
                                : 'square'
                            }
                            size={20}
                            color={
                              jaAdicionado
                                ? cores.cinzaMedio
                                : selecionado
                                ? cores.tintaSuave
                                : cores.cinzaMedio
                            }
                          />
                        ) : (
                          <Feather name="chevron-right" size={18} color={cores.cinzaMedio} />
                        )}

                        <View style={estilos.itemAnimalDados}>
                          <Text
                            style={[
                              estilos.itemAnimalBrinco,
                              jaAdicionado && estilos.itemAnimalBrincoDesabilitado,
                            ]}
                          >
                            Brinco {animal.brinco}
                          </Text>
                          <Text style={estilos.itemAnimalDetalhes}>
                            {ROTULO_SEXO[animal.sexo]} · {animal.raca} · {textoIdade(animal)}
                          </Text>
                        </View>
                      </View>

                      {jaAdicionado ? (
                        <Badge texto="Já adicionado" variante="contorno" />
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            {/* Rodapé do Modal */}
            <View style={estilos.modalRodape}>
              {!trocandoItemTempId ? (
                <Botao
                  titulo={
                    selecionadosNoModal.size > 0
                      ? `Adicionar à venda (${selecionadosNoModal.size})`
                      : 'Selecione os animais acima'
                  }
                  disabled={selecionadosNoModal.size === 0}
                  onPress={confirmarSelecaoModal}
                />
              ) : null}
              <Botao titulo="Cancelar" variante="secundario" onPress={fecharModal} />
            </View>
          </View>
        </View>
      </Modal>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  titulo: {
    ...tipografia.headingSm,
    color: cores.tinta,
    marginBottom: espaco.sm,
  },
  bannerErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.md,
    borderRadius: raio.interativo,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderWidth: 1,
    borderColor: cores.ember,
    marginBottom: espaco.sm,
  },
  bannerErroSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs + 2,
    padding: espaco.sm,
    borderRadius: raio.aninhado,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderWidth: 1,
    borderColor: cores.ember,
  },
  textoBannerErro: {
    ...tipografia.bodyMedia,
    color: cores.ember,
    flex: 1,
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
    paddingVertical: 5,
    borderRadius: raio.interativo,
    backgroundColor: cores.paper,
    borderWidth: 1,
    borderColor: cores.fio,
  },
  chipTexto: {
    ...tipografia.caption,
    color: cores.tinta,
  },
  cartaoVazio: {
    padding: espaco.xl,
    alignItems: 'center',
    gap: espaco.sm,
    borderStyle: 'dashed',
    borderColor: cores.fio,
  },
  cartaoVazioErro: {
    borderColor: cores.ember,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  iconeVazioContainer: {
    marginBottom: espaco.xs,
  },
  vazioTitulo: {
    ...tipografia.bodyMedia,
    color: cores.tinta,
  },
  vazioTexto: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    textAlign: 'center',
    letterSpacing: 0,
    marginBottom: espaco.sm,
  },
  vazioBotoes: {
    width: '100%',
    gap: espaco.sm,
  },
  cartaoItem: {
    padding: espaco.md,
    gap: espaco.sm,
  },
  cabecalhoItemAnimal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.sm,
  },
  infoAnimal: {
    flex: 1,
    gap: 2,
  },
  linhaBrinco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs + 2,
  },
  tituloBrinco: {
    ...tipografia.bodyMedia,
    color: cores.tinta,
  },
  subtituloAnimal: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    letterSpacing: 0,
  },
  acoesItemAnimal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  botaoTrocar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espaco.sm,
    paddingVertical: 4,
    borderRadius: raio.aninhado,
    backgroundColor: cores.neutro,
  },
  textoTrocar: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
  },
  botaoRemover: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campoPesoContainer: {
    marginTop: espaco.xs,
  },
  linhaCamposManuais: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    marginTop: espaco.xs,
  },
  colunaBrinco: {
    flex: 3,
  },
  colunaPeso: {
    flex: 2,
  },
  botoesAdicionarLinha: {
    flexDirection: 'row',
    gap: espaco.sm,
  },
  botaoFlex: {
    flex: 1,
  },
  botaoManual: {
    paddingHorizontal: espaco.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalConteudo: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: cores.canvas,
    borderTopLeftRadius: raio.cartao,
    borderTopRightRadius: raio.cartao,
    borderWidth: 1,
    borderColor: cores.fio,
    maxHeight: '88%',
    padding: espaco.lg,
    gap: espaco.md,
  },
  modalCabecalho: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalCabecalhoTexto: {
    flex: 1,
    gap: 2,
  },
  modalTitulo: {
    ...tipografia.subheading,
    color: cores.tinta,
  },
  modalSubtitulo: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    letterSpacing: 0,
  },
  modalBotaoFechar: {
    minWidth: toque.alvoMinimo - espaco.md,
    minHeight: toque.alvoMinimo - espaco.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtroSexoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
  },
  filtroChip: {
    paddingHorizontal: espaco.md,
    paddingVertical: 6,
    borderRadius: raio.interativo,
    borderWidth: 1,
    borderColor: cores.fio,
    backgroundColor: cores.paper,
  },
  filtroChipAtivo: {
    backgroundColor: cores.tintaSuave,
    borderColor: cores.tintaSuave,
  },
  filtroChipTexto: {
    ...tipografia.caption,
    color: cores.tinta,
  },
  filtroChipTextoAtivo: {
    color: cores.tintaInversa,
  },
  botaoSelecionarTodos: {
    marginLeft: 'auto',
    paddingHorizontal: espaco.sm,
    paddingVertical: 6,
  },
  textoSelecionarTodos: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
  },
  modalLista: {
    maxHeight: 340,
  },
  modalListaConteudo: {
    gap: espaco.sm,
    paddingVertical: espaco.xs,
  },
  itemAnimalModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: espaco.md,
    borderRadius: raio.interativo,
    backgroundColor: cores.paper,
    borderWidth: 1,
    borderColor: cores.fio,
  },
  itemAnimalModalSelecionado: {
    borderColor: cores.tintaSuave,
    backgroundColor: cores.superficieAlt,
  },
  itemAnimalModalDesabilitado: {
    opacity: 0.45,
  },
  itemAnimalEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    flex: 1,
  },
  itemAnimalDados: {
    gap: 2,
  },
  itemAnimalBrinco: {
    ...tipografia.bodyMedia,
    color: cores.tinta,
  },
  itemAnimalBrincoDesabilitado: {
    color: cores.cinzaMedio,
  },
  itemAnimalDetalhes: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    letterSpacing: 0,
  },
  modalVazio: {
    padding: espaco.xl,
    alignItems: 'center',
  },
  modalVazioTexto: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    textAlign: 'center',
  },
  modalRodape: {
    gap: espaco.sm,
    marginTop: espaco.xs,
  },
});
