import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Botao } from '../src/components/Botao';
import { Campo } from '../src/components/Campo';
import { EstadoTela } from '../src/components/EstadoTela';
import { Seletor } from '../src/components/Seletor';
import { Tela } from '../src/components/Tela';
import { useServicoPastos } from '../src/data/sqlite/pastureServices';
import { mensagemErro } from '../src/domain/errors';
import type { CondicaoCapim, TipoCapim } from '../src/features/pastures/types';
import { cores, espaco, tipografia } from '../src/theme/tokens';

const numero = (valor: string) => Number(valor.trim().replace(',', '.'));

export default function FormularioPasto() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : undefined;
  const servico = useServicoPastos();
  const [tipos, setTipos] = useState<TipoCapim[]>([]);
  const [nome, setNome] = useState(''); const [area, setArea] = useState('');
  const [tipoId, setTipoId] = useState<number | null>(null); const [altura, setAltura] = useState('');
  const [condicao, setCondicao] = useState<CondicaoCapim>('verde'); const [cobertura, setCobertura] = useState('');
  const [carregando, setCarregando] = useState(true); const [salvando, setSalvando] = useState(false);

  useEffect(() => { void (async () => {
    try {
      const lista = await servico.listarTipos(); setTipos(lista);
      if (id) {
        const pasto = await servico.exigirPasto(id);
        setNome(pasto.nome); setArea(String(pasto.areaHectares).replace('.', ',')); setTipoId(pasto.tipoCapimId);
        setAltura(String(pasto.alturaAtualCm).replace('.', ',')); setCondicao(pasto.condicaoCapim); setCobertura(String(pasto.coberturaPercentual));
      } else if (lista.length === 1) setTipoId(lista[0].id);
    } catch (causa) { Alert.alert('Não foi possível carregar', mensagemErro(causa)); }
    finally { setCarregando(false); }
  })(); }, [id, servico]);

  const opcoesTipos = useMemo(() => tipos.map((tipo) => ({ valor: tipo.id, rotulo: tipo.nome })), [tipos]);
  const salvar = async () => {
    setSalvando(true);
    try {
      await servico.salvarPasto({ nome, areaHectares: numero(area), tipoCapimId: tipoId ?? 0, alturaAtualCm: numero(altura), condicaoCapim: condicao, coberturaPercentual: Number(cobertura) }, id);
      router.back();
    } catch (causa) { Alert.alert('Revise os dados', mensagemErro(causa)); }
    finally { setSalvando(false); }
  };

  if (carregando) return <Tela><EstadoTela mensagem="Carregando formulário…" carregando /></Tela>;
  return (
    <Tela>
      <Text style={estilos.titulo}>{id ? 'Editar pasto' : 'Novo pasto'}</Text>
      {tipos.length === 0 ? <><EstadoTela mensagem="Cadastre um tipo de capim antes de criar um pasto." /><Botao titulo="Cadastrar tipo de capim" onPress={() => router.replace('/tipos-capim')} /></> : <>
        <Campo rotulo="Nome" value={nome} onChangeText={setNome} placeholder="Ex.: Pasto Norte" />
        <Campo rotulo="Área (ha)" value={area} onChangeText={setArea} keyboardType="decimal-pad" placeholder="0,00" />
        <Seletor rotulo="Tipo de capim" valor={tipoId} opcoes={opcoesTipos} aoSelecionar={setTipoId} />
        <Campo rotulo="Altura atual (cm)" value={altura} onChangeText={setAltura} keyboardType="decimal-pad" placeholder="0,0" />
        <Seletor rotulo="Condição do capim" valor={condicao} opcoes={[{ valor: 'verde', rotulo: 'Verde' }, { valor: 'parcialmente_seco', rotulo: 'Parcialmente seco' }, { valor: 'seco', rotulo: 'Seco' }]} aoSelecionar={setCondicao} />
        <Campo rotulo="Cobertura do solo (%)" value={cobertura} onChangeText={setCobertura} keyboardType="number-pad" placeholder="0 a 100" />
        <Botao titulo={id ? 'Salvar alterações' : 'Cadastrar pasto'} carregando={salvando} onPress={salvar} />
      </>}
    </Tela>
  );
}
const estilos = StyleSheet.create({ titulo: { ...tipografia.headingSm, color: cores.tinta, marginBottom: espaco.sm } });
