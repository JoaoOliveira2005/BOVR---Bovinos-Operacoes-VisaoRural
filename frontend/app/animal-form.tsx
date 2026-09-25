import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../src/components/Botao';
import { Campo } from '../src/components/Campo';
import { EstadoTela } from '../src/components/EstadoTela';
import { Seletor } from '../src/components/Seletor';
import { Tela } from '../src/components/Tela';
import { useServicoAnimais } from '../src/data/memoria/cattleServices';
import { ErroDominio, mensagemErro } from '../src/domain/errors';
import { descreverIdade, idadeEmMeses } from '../src/features/cattle/idade';
import type { EntradaAnimal, SexoAnimal } from '../src/features/cattle/types';
import { dataParaIso, isoParaData, mascararData } from '../src/lib/formato';
import { cores, espaco, tipografia } from '../src/theme/tokens';

/** RF-01.3 — a idade vem de uma fonte ou da outra, nunca das duas. */
type FonteIdade = 'nascimento' | 'estimativa';

const soDigitos = (texto: string) => texto.replace(/\D/g, '');

/**
 * Cadastro de animal — RF-01 a RF-01.4, B-03.
 *
 * Terceiro e último passo do RNF-07: início → gado → cadastro, contando a tela
 * inicial como primeiro passo (P-11). Por isso o botão que traz até aqui fica
 * na própria tela de Gado, sem nível intermediário.
 */
export default function FormularioAnimal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : undefined;
  const servico = useServicoAnimais();

  const [brinco, setBrinco] = useState('');
  const [sexo, setSexo] = useState<SexoAnimal | null>(null);
  const [fonteIdade, setFonteIdade] = useState<FonteIdade>('nascimento');
  const [nascimento, setNascimento] = useState('');
  const [anos, setAnos] = useState('');
  const [meses, setMeses] = useState('');
  const [raca, setRaca] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [carregando, setCarregando] = useState(Boolean(id));
  const [salvando, setSalvando] = useState(false);
  /** Erro do brinco fica no campo (RF-01.2); os demais vão para o alerta. */
  const [erroBrinco, setErroBrinco] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const animal = await servico.exigirAnimal(id);
        setBrinco(animal.brinco);
        setSexo(animal.sexo);
        setRaca(animal.raca);
        setObservacoes(animal.observacoes ?? '');
        if (animal.dataNascimento) {
          setFonteIdade('nascimento');
          setNascimento(isoParaData(animal.dataNascimento));
        } else if (animal.idadeEstimadaMeses !== null) {
          setFonteIdade('estimativa');
          setAnos(String(Math.floor(animal.idadeEstimadaMeses / 12)));
          setMeses(String(animal.idadeEstimadaMeses % 12));
        }
      } catch (causa) {
        Alert.alert('Não foi possível carregar', mensagemErro(causa));
      } finally {
        setCarregando(false);
      }
    })();
  }, [id, servico]);

  /** RF-01.4 — a idade aparece enquanto a data é digitada, antes de salvar. */
  const idadeCalculada = useMemo(() => {
    const iso = dataParaIso(nascimento);
    if (!iso) return null;
    const nascido = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(nascido.getTime()) || nascido > new Date()) return null;
    return descreverIdade(idadeEmMeses(iso));
  }, [nascimento]);

  const montarEntrada = (): EntradaAnimal => {
    const estimativa =
      Number(soDigitos(anos) || 0) * 12 + Number(soDigitos(meses) || 0);
    return {
      brinco,
      sexo: sexo as SexoAnimal,
      dataNascimento: fonteIdade === 'nascimento' ? dataParaIso(nascimento) : null,
      idadeEstimadaMeses:
        fonteIdade === 'estimativa' && (anos !== '' || meses !== '') ? estimativa : null,
      raca,
      observacoes: observacoes || null,
    };
  };

  const salvar = async () => {
    setErroBrinco(null);
    setSalvando(true);
    try {
      await servico.salvar(montarEntrada(), id);
      // RNF-10 — só volta depois que o salvamento resolveu.
      router.back();
    } catch (causa) {
      // RF-01.2 — o brinco duplicado marca o campo que o usuário precisa mudar,
      // em vez de esconder o problema num alerta que ele fecha e esquece.
      if (causa instanceof ErroDominio && causa.codigo === 'duplicado') {
        setErroBrinco(causa.message);
      } else {
        Alert.alert('Revise os dados', mensagemErro(causa));
      }
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <Tela><EstadoTela mensagem="Carregando animal…" carregando /></Tela>;
  }

  return (
    <Tela>
      <Text style={estilos.titulo}>{id ? 'Editar animal' : 'Novo animal'}</Text>

      <Campo
        rotulo="Número do brinco"
        value={brinco}
        onChangeText={(texto) => { setBrinco(texto); setErroBrinco(null); }}
        erro={erroBrinco}
        ajuda="Identificação principal do animal."
        placeholder="Ex.: 1234"
        keyboardType="number-pad"
        autoFocus={!id}
      />

      <Seletor
        rotulo="Sexo"
        valor={sexo}
        opcoes={[{ valor: 'macho', rotulo: 'Macho' }, { valor: 'femea', rotulo: 'Fêmea' }]}
        aoSelecionar={setSexo}
      />

      <Seletor
        rotulo="Idade"
        valor={fonteIdade}
        opcoes={[
          { valor: 'nascimento', rotulo: 'Sei a data de nascimento' },
          { valor: 'estimativa', rotulo: 'Idade estimada' },
        ]}
        aoSelecionar={setFonteIdade}
      />

      {fonteIdade === 'nascimento' ? (
        <Campo
          rotulo="Data de nascimento"
          value={nascimento}
          onChangeText={(texto) => setNascimento(mascararData(texto))}
          ajuda={idadeCalculada ? `Idade: ${idadeCalculada}.` : 'Formato DD/MM/AAAA.'}
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
        />
      ) : (
        <View style={estilos.idade}>
          <View style={estilos.metade}>
            <Campo
              rotulo="Anos"
              value={anos}
              onChangeText={(texto) => setAnos(soDigitos(texto).slice(0, 2))}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>
          <View style={estilos.metade}>
            <Campo
              rotulo="Meses"
              value={meses}
              onChangeText={(texto) => setMeses(soDigitos(texto).slice(0, 2))}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>
        </View>
      )}

      <Campo
        rotulo="Raça"
        value={raca}
        onChangeText={setRaca}
        placeholder="Ex.: Nelore"
        autoCapitalize="words"
      />

      <Campo
        rotulo="Observações"
        value={observacoes}
        onChangeText={setObservacoes}
        ajuda="Opcional."
        placeholder="Marcas, procedência, qualquer detalhe útil"
        multiline
        numberOfLines={4}
        style={estilos.areaTexto}
      />

      <Botao
        titulo={id ? 'Salvar alterações' : 'Cadastrar animal'}
        carregando={salvando}
        onPress={salvar}
      />
      <Botao titulo="Cancelar" variante="secundario" onPress={() => router.back()} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  titulo: { ...tipografia.headingSm, color: cores.tinta, marginBottom: espaco.sm },
  idade: { flexDirection: 'row', gap: espaco.md },
  metade: { flex: 1 },
  // `textAlignVertical` mantem o cursor no topo no Android; sem isso o texto
  // comeca verticalmente centralizado na caixa alta.
  areaTexto: { minHeight: 110, paddingTop: espaco.md, textAlignVertical: 'top' },
});
