import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../src/components/Botao';
import { Campo } from '../src/components/Campo';
import { EstadoTela } from '../src/components/EstadoTela';
import { Seletor } from '../src/components/Seletor';
import { Tela } from '../src/components/Tela';
import { useServicoPastos } from '../../backend/data/sqlite/pastureServices';
import { mensagemErro } from '../src/domain/errors';
import type { CondicaoCapim, TipoCapim } from '../src/features/pastures/types';
import { cores, espaco, raio, tipografia } from '../src/theme/tokens';

const numero = (valor: string) => Number(valor.trim().replace(',', '.'));

export default function FormularioPasto() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : undefined;
  const servico = useServicoPastos();
  const [tipos, setTipos] = useState<TipoCapim[]>([]);
  const [nome, setNome] = useState('');
  const [area, setArea] = useState('');
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [altura, setAltura] = useState('');
  const [condicao, setCondicao] = useState<CondicaoCapim>('verde');
  const [cobertura, setCobertura] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemErroGeral, setMensagemErroGeral] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const lista = await servico.listarTipos();
        setTipos(lista);
        if (id) {
          const pasto = await servico.exigirPasto(id);
          setNome(pasto.nome);
          setArea(String(pasto.areaHectares).replace('.', ','));
          setTipoId(pasto.tipoCapimId);
          setAltura(String(pasto.alturaAtualCm).replace('.', ','));
          setCondicao(pasto.condicaoCapim);
          setCobertura(String(pasto.coberturaPercentual));
        } else if (lista.length === 1) setTipoId(lista[0].id);
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
    })();
  }, [id, servico]);

  const opcoesTipos = useMemo(
    () => tipos.map((tipo) => ({ valor: tipo.id, rotulo: tipo.nome })),
    [tipos],
  );

  const salvar = async () => {
    setMensagemErroGeral(null);

    if (!nome.trim() || !area.trim() || tipoId === null || !altura.trim() || !cobertura.trim()) {
      const msg = 'Preencha todos os campos obrigatórios do pasto.';
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
      await servico.salvarPasto(
        {
          nome,
          areaHectares: numero(area),
          tipoCapimId: tipoId,
          alturaAtualCm: numero(altura),
          condicaoCapim: condicao,
          coberturaPercentual: Number(cobertura),
        },
        id,
      );
      router.back();
    } catch (causa) {
      const msg = mensagemErro(causa);
      setMensagemErroGeral(msg);
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
        <EstadoTela mensagem="Carregando formulário…" carregando />
      </Tela>
    );
  }

  return (
    <Tela>
      <Text style={estilos.titulo}>{id ? 'Editar pasto' : 'Novo pasto'}</Text>

      {mensagemErroGeral ? (
        <View style={estilos.bannerErro}>
          <Feather name="alert-triangle" size={18} color={cores.ember} />
          <Text style={estilos.textoBannerErro}>{mensagemErroGeral}</Text>
        </View>
      ) : null}

      {tipos.length === 0 ? (
        <>
          <EstadoTela mensagem="Cadastre um tipo de capim antes de criar um pasto." />
          <Botao
            titulo="Cadastrar tipo de capim"
            onPress={() => router.replace('/tipos-capim')}
          />
        </>
      ) : (
        <>
          <Campo
            rotulo="Nome"
            value={nome}
            onChangeText={(txt) => {
              setNome(txt);
              setMensagemErroGeral(null);
            }}
            placeholder="Ex.: Pasto Norte"
          />
          <Campo
            rotulo="Área (ha)"
            value={area}
            onChangeText={(txt) => {
              setArea(txt);
              setMensagemErroGeral(null);
            }}
            keyboardType="decimal-pad"
            placeholder="0,00"
          />
          <Seletor
            rotulo="Tipo de capim"
            valor={tipoId}
            opcoes={opcoesTipos}
            aoSelecionar={(tid) => {
              setTipoId(tid);
              setMensagemErroGeral(null);
            }}
          />
          <Campo
            rotulo="Altura atual (cm)"
            value={altura}
            onChangeText={(txt) => {
              setAltura(txt);
              setMensagemErroGeral(null);
            }}
            keyboardType="decimal-pad"
            placeholder="0,0"
          />
          <Seletor
            rotulo="Condição do capim"
            valor={condicao}
            opcoes={[
              { valor: 'verde', rotulo: 'Verde' },
              { valor: 'parcialmente_seco', rotulo: 'Parcialmente seco' },
              { valor: 'seco', rotulo: 'Seco' },
            ]}
            aoSelecionar={(c) => {
              setCondicao(c);
              setMensagemErroGeral(null);
            }}
          />
          <Campo
            rotulo="Cobertura do solo (%)"
            value={cobertura}
            onChangeText={(txt) => {
              setCobertura(txt);
              setMensagemErroGeral(null);
            }}
            keyboardType="number-pad"
            placeholder="0 a 100"
          />
          <Botao
            titulo={id ? 'Salvar alterações' : 'Cadastrar pasto'}
            carregando={salvando}
            onPress={salvar}
          />
        </>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  titulo: { ...tipografia.headingSm, color: cores.tinta, marginBottom: espaco.sm },
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
  textoBannerErro: {
    ...tipografia.bodyMedia,
    color: cores.ember,
    flex: 1,
  },
});
