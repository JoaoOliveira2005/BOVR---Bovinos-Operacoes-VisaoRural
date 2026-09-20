import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../src/components/Botao';
import { Cartao } from '../src/components/Cartao';
import { EstadoTela } from '../src/components/EstadoTela';
import { Tela } from '../src/components/Tela';
import { useServicoPastos } from '../src/data/sqlite/pastureServices';
import { mensagemErro } from '../src/domain/errors';
import type { Pasto } from '../src/features/pastures/types';
import { cores, espaco, tipografia, toque } from '../src/theme/tokens';

const ROTULOS_CONDICAO = { verde: 'Verde', parcialmente_seco: 'Parcialmente seco', seco: 'Seco' } as const;

export default function TelaPastos() {
  const router = useRouter();
  const servico = useServicoPastos();
  const [pastos, setPastos] = useState<Pasto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try { setPastos(await servico.listarPastos()); setErro(null); }
    catch (causa) { setErro(mensagemErro(causa)); }
    finally { setCarregando(false); }
  }, [servico]);

  useFocusEffect(useCallback(() => { void carregar(); }, [carregar]));

  const excluir = (pasto: Pasto) => Alert.alert('Excluir pasto?', `O pasto “${pasto.nome}” será excluído definitivamente.`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: async () => {
      try { await servico.excluirPasto(pasto.id); await carregar(); }
      catch (causa) { Alert.alert('Não foi possível excluir', mensagemErro(causa)); }
    } },
  ]);

  return (
    <Tela>
      <View style={estilos.acoes}>
        <Botao titulo="Cadastrar pasto" onPress={() => router.push('/pasto-form')} />
        <Botao titulo="Tipos de capim" variante="secundario" onPress={() => router.push('/tipos-capim')} />
      </View>
      {carregando ? <EstadoTela mensagem="Carregando pastos…" carregando /> : null}
      {erro ? <EstadoTela mensagem={erro} /> : null}
      {!carregando && !erro && pastos.length === 0 ? <EstadoTela mensagem="Nenhum pasto cadastrado. Cadastre o primeiro para começar." /> : null}
      {pastos.map((pasto) => (
        <Cartao key={pasto.id} style={estilos.cartao}>
          <View style={estilos.cabecalho}>
            <View style={estilos.tituloBloco}>
              <Text style={estilos.titulo}>{pasto.nome}</Text>
              <Text style={estilos.subtitulo}>{pasto.tipoCapimNome}</Text>
            </View>
            <Pressable accessibilityLabel={`Editar ${pasto.nome}`} onPress={() => router.push({ pathname: '/pasto-form', params: { id: String(pasto.id) } })} style={estilos.icone}>
              <Feather name="edit-2" size={20} color={cores.tinta} />
            </Pressable>
          </View>
          <View style={estilos.dados}>
            <Text style={estilos.dado}>{pasto.areaHectares} ha</Text>
            <Text style={estilos.dado}>{pasto.alturaAtualCm} cm</Text>
            <Text style={estilos.dado}>{pasto.coberturaPercentual}% coberto</Text>
          </View>
          <Text style={estilos.condicao}>Condição: {ROTULOS_CONDICAO[pasto.condicaoCapim]}</Text>
          <Botao titulo="Excluir" variante="perigo" onPress={() => excluir(pasto)} />
        </Cartao>
      ))}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  acoes: { gap: espaco.sm }, cartao: { gap: espaco.lg },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.md },
  tituloBloco: { flex: 1, gap: espaco.xs }, titulo: { ...tipografia.subheading, color: cores.tinta },
  subtitulo: { ...tipografia.body, color: cores.cinzaMedio },
  icone: { minWidth: toque.alvoMinimo, minHeight: toque.alvoMinimo, alignItems: 'center', justifyContent: 'center' },
  dados: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  dado: { ...tipografia.bodyMedia, color: cores.tinta, backgroundColor: cores.neutro, paddingHorizontal: espaco.md, paddingVertical: espaco.sm },
  condicao: { ...tipografia.body, color: cores.cinzaMedio },
});
