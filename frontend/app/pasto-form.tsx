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
  const [condicao, setCondicao] = useState<CondicaoCapim>('green');
  const [cobertura, setCobertura] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Estados de erro por campo
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [erroArea, setErroArea] = useState<string | null>(null);
  const [erroTipo, setErroTipo] = useState<string | null>(null);
  const [erroAltura, setErroAltura] = useState<string | null>(null);
  const [erroCobertura, setErroCobertura] = useState<string | null>(null);
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
        } else if (lista.length === 1) {
          setTipoId(lista[0].id);
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
    })();
  }, [id, servico]);

  const opcoesTipos = useMemo(
    () => tipos.map((tipo) => ({ valor: tipo.id, rotulo: tipo.nome })),
    [tipos],
  );

  const limparErros = () => {
    setErroNome(null);
    setErroArea(null);
    setErroTipo(null);
    setErroAltura(null);
    setErroCobertura(null);
    setMensagemErroGeral(null);
  };

  const salvar = async () => {
    limparErros();

    const nomeLimpo = nome.trim();
    const areaNum = numero(area);
    const alturaNum = numero(altura);
    const coberturaLimpa = cobertura.trim().replace('%', '').replace(',', '.');
    const coberturaNum = Math.round(Number(coberturaLimpa));

    let temErro = false;

    if (!nomeLimpo) {
      setErroNome('Informe o nome do pasto.');
      temErro = true;
    }

    if (!area.trim() || isNaN(areaNum) || areaNum <= 0) {
      setErroArea('A área deve ser um número maior que zero (ex.: 2,5).');
      temErro = true;
    }

    if (tipoId === null) {
      setErroTipo('Selecione o tipo de capim.');
      temErro = true;
    }

    if (!altura.trim() || isNaN(alturaNum) || alturaNum < 0) {
      setErroAltura('A altura atual deve ser maior ou igual a zero (ex.: 20).');
      temErro = true;
    }

    if (!cobertura.trim() || isNaN(coberturaNum) || coberturaNum < 0 || coberturaNum > 100) {
      setErroCobertura('A cobertura do solo deve ser um percentual inteiro entre 0 e 100.');
      temErro = true;
    }

    if (temErro) {
      const msg = 'Revise os campos destacados abaixo.';
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
          nome: nomeLimpo,
          areaHectares: areaNum,
          tipoCapimId: tipoId!,
          alturaAtualCm: alturaNum,
          condicaoCapim: condicao,
          coberturaPercentual: coberturaNum,
        },
        id,
      );
      router.back();
    } catch (causa) {
      const msg = mensagemErro(causa);
      setMensagemErroGeral(msg);

      const msgLower = msg.toLowerCase();
      if (msgLower.includes('nome')) setErroNome(msg);
      if (msgLower.includes('área') || msgLower.includes('area')) setErroArea(msg);
      if (msgLower.includes('capim')) setErroTipo(msg);
      if (msgLower.includes('altura')) setErroAltura(msg);
      if (msgLower.includes('cobertura')) setErroCobertura(msg);

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
              setErroNome(null);
              setMensagemErroGeral(null);
            }}
            erro={erroNome}
            placeholder="Ex.: Pasto Norte"
          />

          <Campo
            rotulo="Área (ha)"
            value={area}
            onChangeText={(txt) => {
              setArea(txt);
              setErroArea(null);
              setMensagemErroGeral(null);
            }}
            erro={erroArea}
            keyboardType="decimal-pad"
            placeholder="0,00"
          />

          <View style={estilos.secaoCampo}>
            <Seletor
              rotulo="Tipo de capim"
              valor={tipoId}
              opcoes={opcoesTipos}
              aoSelecionar={(tid) => {
                setTipoId(tid);
                setErroTipo(null);
                setMensagemErroGeral(null);
              }}
            />
            {erroTipo ? <Text style={estilos.erroCampo}>{erroTipo}</Text> : null}
          </View>

          <Campo
            rotulo="Altura atual (cm)"
            value={altura}
            onChangeText={(txt) => {
              setAltura(txt);
              setErroAltura(null);
              setMensagemErroGeral(null);
            }}
            erro={erroAltura}
            keyboardType="decimal-pad"
            placeholder="0,0"
          />

          <Seletor
            rotulo="Condição do capim"
            valor={condicao}
            opcoes={[
              { valor: 'green', rotulo: 'Verde' },
              { valor: 'partly_dry', rotulo: 'Parcialmente seco' },
              { valor: 'dry', rotulo: 'Seco' },
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
              setErroCobertura(null);
              setMensagemErroGeral(null);
            }}
            erro={erroCobertura}
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
  secaoCampo: {
    gap: espaco.xs,
  },
  erroCampo: {
    ...tipografia.caption,
    letterSpacing: 0,
    color: cores.ember,
  },
});
