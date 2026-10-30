import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../src/components/Badge';
import { Botao } from '../src/components/Botao';
import { Cartao } from '../src/components/Cartao';
import { EstadoTela } from '../src/components/EstadoTela';
import { Tela } from '../src/components/Tela';
import { useServicoAnimais } from '../../backend/data/sqlite/cattleServices';
import { mensagemErro } from '../src/domain/errors';
import { descreverIdade, idadeDoAnimal } from '../src/features/cattle/idade';
import type { Animal } from '../src/features/cattle/types';
import { cores, espaco, raio, tipografia, toque } from '../src/theme/tokens';

const ROTULO_SEXO = { male: 'Macho', female: 'Fêmea' } as const;

type AbaGado = 'ativos' | 'historico';

/** RF-01.4 — idade a partir da data ou da estimativa, marcada quando é estimada. */
function textoIdade(animal: Animal): string {
  const idade = idadeDoAnimal(animal);
  if (!idade) return 'idade não informada';
  return idade.estimada ? `${descreverIdade(idade.meses)} (estimada)` : descreverIdade(idade.meses);
}

export default function TelaGado() {
  const router = useRouter();
  const servico = useServicoAnimais();
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<AbaGado>('ativos');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setAnimais(await servico.listar());
      setErro(null);
    } catch (causa) {
      const msg = mensagemErro(causa);
      console.error('[TelaGado] Erro ao listar animais:', { mensagem: msg, causa });
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }, [servico]);

  useFocusEffect(useCallback(() => { void carregar(); }, [carregar]));

  const animaisAtivos = useMemo(() => animais.filter((a) => a.situacao === 'active'), [animais]);
  const animaisHistorico = useMemo(() => animais.filter((a) => a.situacao !== 'active'), [animais]);

  const animaisExibidos = abaAtiva === 'ativos' ? animaisAtivos : animaisHistorico;

  const registrarMorte = (animal: Animal) => {
    const executarMorte = async () => {
      try {
        await servico.marcarComoMorto(animal.id);
        await carregar();
      } catch (causa) {
        const mensagem = mensagemErro(causa);
        console.error('[TelaGado] Erro ao registrar morte:', { animal, mensagem, causa });
        if (Platform.OS === 'web') {
          window.alert(`Não foi possível registrar morte: ${mensagem}`);
        } else {
          Alert.alert('Não foi possível registrar morte', mensagem);
        }
      }
    };

    const textoConfirmacao = `O animal brinco “${animal.brinco}” será registrado como morto. Ele sairá do rebanho ativo e será desconsiderado de vendas planejadas automaticamente.`;

    if (Platform.OS === 'web') {
      if (window.confirm(`${textoConfirmacao} Confirma?`)) {
        void executarMorte();
      }
    } else {
      Alert.alert('Registrar morte do animal?', textoConfirmacao, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar morte', style: 'destructive', onPress: () => void executarMorte() },
      ]);
    }
  };

  const excluir = (animal: Animal) => {
    const executarExclusao = async () => {
      try {
        await servico.excluir(animal.id);
        await carregar();
      } catch (causa) {
        const mensagem = mensagemErro(causa);
        console.error('[TelaGado] Erro ao excluir animal:', { animal, mensagem, causa });
        if (Platform.OS === 'web') {
          window.alert(`Não foi possível excluir: ${mensagem}`);
        } else {
          Alert.alert('Não foi possível excluir', mensagem);
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`O animal brinco “${animal.brinco}” será excluído definitivamente. Confirma?`)) {
        void executarExclusao();
      }
    } else {
      Alert.alert('Excluir animal?', `O animal brinco “${animal.brinco}” será excluído definitivamente.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => { void executarExclusao(); } },
      ]);
    }
  };

  return (
    <Tela>
      {/* RNF-07 + P-11 — o cadastro tem que ser alcançável daqui direto: início
          (1) → gado (2) → cadastro (3). Um nível a mais estouraria os 3 passos. */}
      <Botao titulo="Cadastrar animal" onPress={() => router.push('/animal-form')} />

      {/* Seletor de Abas: Rebanho Ativo vs Histórico (RF-04 / RF-06.1) */}
      <View style={estilos.abasContainer}>
        {(['ativos', 'historico'] as AbaGado[]).map((tab) => {
          const ativa = abaAtiva === tab;
          const rotulo = tab === 'ativos'
            ? `Rebanho ativo (${animaisAtivos.length})`
            : `Histórico (${animaisHistorico.length})`;
          return (
            <Pressable
              key={tab}
              onPress={() => setAbaAtiva(tab)}
              style={[estilos.aba, ativa && estilos.abaAtiva]}
            >
              <Text style={[estilos.abaTexto, ativa && estilos.abaTextoAtivo]}>
                {rotulo}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {carregando ? (
        <EstadoTela mensagem="Carregando animais…" carregando />
      ) : erro ? (
        <EstadoTela mensagem={erro} />
      ) : animaisExibidos.length === 0 ? (
        <EstadoTela
          mensagem={
            abaAtiva === 'ativos'
              ? 'Nenhum animal ativo no rebanho. Animais vendidos ou mortos foram excluídos do rebanho ativo.'
              : 'Nenhum animal no histórico de baixas (vendidos/mortos).'
          }
        />
      ) : (
        <View style={estilos.lista}>
          {/* RF-04 — quantidade total de animais ativos. */}
          <Text style={estilos.contagem}>
            {animaisExibidos.length} {animaisExibidos.length === 1 ? 'animal' : 'animais'}{' '}
            {abaAtiva === 'ativos' ? 'no rebanho ativo' : 'no histórico'}
          </Text>

          {animaisExibidos.map((animal) => (
            <Cartao key={animal.id} style={estilos.cartao}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Brinco ${animal.brinco}, ${ROTULO_SEXO[animal.sexo]}, ${animal.raca}`}
                onPress={() => router.push({ pathname: '/animal-form', params: { id: String(animal.id) } })}
              >
                <View style={estilos.linha}>
                  <View style={estilos.dados}>
                    <View style={estilos.brincoLinha}>
                      <Text style={estilos.brinco}>Brinco {animal.brinco}</Text>
                      {animal.situacao !== 'active' ? (
                        <Badge
                          texto={animal.situacao === 'sold' ? 'Vendido' : animal.situacao === 'dead' ? 'Morto' : 'Transferido'}
                          variante={animal.situacao === 'sold' ? 'suave' : 'contorno'}
                        />
                      ) : null}
                    </View>
                    <Text style={estilos.detalhe}>
                      {ROTULO_SEXO[animal.sexo]} · {animal.raca} · {textoIdade(animal)}
                    </Text>
                  </View>
                  <Feather name="edit-2" size={18} color={cores.cinzaMedio} />
                </View>
                {animal.observacoes ? (
                  <Text style={estilos.observacoes} numberOfLines={2}>{animal.observacoes}</Text>
                ) : null}
              </Pressable>
              <View style={estilos.botoesLinha}>
                {animal.situacao === 'active' ? (
                  <Botao
                    titulo="Registrar morte"
                    variante="secundario"
                    onPress={() => registrarMorte(animal)}
                    style={estilos.botaoMorte}
                  />
                ) : null}
                <Botao
                  titulo="Excluir"
                  variante="perigo"
                  onPress={() => excluir(animal)}
                  style={estilos.botaoExcluir}
                />
              </View>
            </Cartao>
          ))}
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
  lista: { gap: espaco.md },
  cartao: { gap: espaco.md },
  contagem: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    textTransform: 'uppercase',
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, minHeight: toque.alvoMinimo - espaco.xl },
  brincoLinha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  dados: { flex: 1, gap: 2 },
  brinco: { ...tipografia.bodyMedia, color: cores.tinta },
  detalhe: { ...tipografia.caption, letterSpacing: 0, color: cores.cinzaMedio },
  observacoes: { ...tipografia.caption, letterSpacing: 0, color: cores.cinzaMedio, marginTop: espaco.md },
  botoesLinha: { flexDirection: 'row', gap: espaco.sm },
  botaoMorte: { flex: 1 },
  botaoExcluir: { flex: 1 },
});
