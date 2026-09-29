import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../src/components/Badge';
import { Botao } from '../src/components/Botao';
import { Cartao } from '../src/components/Cartao';
import { EstadoTela } from '../src/components/EstadoTela';
import { Tela } from '../src/components/Tela';
import { useServicoAnimais } from '../src/data/memoria/cattleServices';
import { mensagemErro } from '../src/domain/errors';
import { descreverIdade, idadeDoAnimal } from '../src/features/cattle/idade';
import type { Animal } from '../src/features/cattle/types';
import { cores, espaco, tipografia, toque } from '../src/theme/tokens';

const ROTULO_SEXO = { macho: 'Macho', femea: 'Fêmea' } as const;

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
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setAnimais(await servico.listar());
      setErro(null);
    } catch (causa) {
      setErro(mensagemErro(causa));
    } finally {
      setCarregando(false);
    }
  }, [servico]);

  useFocusEffect(useCallback(() => { void carregar(); }, [carregar]));

  return (
    <Tela>
      {/* RNF-07 + P-11 — o cadastro tem que ser alcançável daqui direto: início
          (1) → gado (2) → cadastro (3). Um nível a mais estouraria os 3 passos. */}
      <Botao titulo="Cadastrar animal" onPress={() => router.push('/animal-form')} />

      {carregando ? (
        <EstadoTela mensagem="Carregando animais…" carregando />
      ) : erro ? (
        <EstadoTela mensagem={erro} />
      ) : animais.length === 0 ? (
        <EstadoTela mensagem="Nenhum animal cadastrado ainda. Comece cadastrando o primeiro do rebanho." />
      ) : (
        <View style={estilos.lista}>
          {/* RF-04 — quantidade total de animais ativos. */}
          <Text style={estilos.contagem}>
            {animais.length} {animais.length === 1 ? 'animal' : 'animais'}
          </Text>

          {animais.map((animal) => (
            <Pressable
              key={animal.id}
              accessibilityRole="button"
              accessibilityLabel={`Brinco ${animal.brinco}, ${ROTULO_SEXO[animal.sexo]}, ${animal.raca}`}
              onPress={() => router.push({ pathname: '/animal-form', params: { id: String(animal.id) } })}
            >
              <Cartao>
                <View style={estilos.linha}>
                  <View style={estilos.dados}>
                    <Text style={estilos.brinco}>Brinco {animal.brinco}</Text>
                    <Text style={estilos.detalhe}>
                      {ROTULO_SEXO[animal.sexo]} · {animal.raca} · {textoIdade(animal)}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={cores.cinzaMedio} />
                </View>
                {animal.observacoes ? (
                  <Text style={estilos.observacoes} numberOfLines={2}>{animal.observacoes}</Text>
                ) : null}
              </Cartao>
            </Pressable>
          ))}
        </View>
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  lista: { gap: espaco.md },
  contagem: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    textTransform: 'uppercase',
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, minHeight: toque.alvoMinimo - espaco.xl },
  dados: { flex: 1, gap: 2 },
  brinco: { ...tipografia.bodyMedia, color: cores.tinta },
  detalhe: { ...tipografia.caption, letterSpacing: 0, color: cores.cinzaMedio },
  observacoes: { ...tipografia.caption, letterSpacing: 0, color: cores.cinzaMedio, marginTop: espaco.md },
});
