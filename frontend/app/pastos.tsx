import { StyleSheet, Text, View } from 'react-native';

import { BadgeQualidade } from '../src/components/BadgeQualidade';
import { Cartao } from '../src/components/Cartao';
import { EmBreve } from '../src/components/EmBreve';
import { cores, espaco, tipografia, type Qualidade } from '../src/theme/tokens';

/**
 * Critério de classificação do Documento de Visão (RF-15.2). Fica aqui só como
 * legenda visual; o cálculo em si entra com o módulo, junto do cadastro de
 * pasto e da leitura datada que o P-05 exige.
 */
const CRITERIOS: { qualidade: Qualidade; criterio: string }[] = [
  { qualidade: 'boa', criterio: 'Altura adequada, capim verde e cobertura ≥ 80%' },
  { qualidade: 'regular', criterio: 'Um dos três critérios fora da condição adequada' },
  { qualidade: 'ruim', criterio: 'Dois ou mais critérios fora da condição adequada' },
];

export default function TelaPastos() {
  return (
    <EmBreve
      titulo="Gestão dos Pastos"
      previa={
        <Cartao>
          <Text style={estilos.titulo}>Qualidade do pasto</Text>
          <View style={estilos.lista}>
            {CRITERIOS.map(({ qualidade, criterio }) => (
              <View key={qualidade} style={estilos.linha}>
                <View style={estilos.coluna}>
                  <BadgeQualidade qualidade={qualidade} />
                </View>
                <Text style={estilos.criterio}>{criterio}</Text>
              </View>
            ))}
          </View>
        </Cartao>
      }
      requisitos={[
        'RF-15  Cadastro de pastos e classificação de qualidade',
        'RF-16  Altura, condição do capim e cobertura do solo',
        'RF-17  Movimentação de animais e lotes entre pastos',
        'RF-18  Ocupação, tempo de permanência e descanso',
      ]}
    />
  );
}

const estilos = StyleSheet.create({
  titulo: {
    ...tipografia.caption,
    color: cores.cinzaMedio,
    textTransform: 'uppercase',
    marginBottom: espaco.lg,
  },
  lista: {
    gap: espaco.md,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaco.md,
  },
  /** Largura fixa nos badges para os critérios alinharem numa coluna só. */
  coluna: {
    width: 88,
  },
  criterio: {
    ...tipografia.body,
    color: cores.cinzaMedio,
    flex: 1,
  },
});
