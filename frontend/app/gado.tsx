import { EmBreve } from '../src/components/EmBreve';

export default function TelaGado() {
  return (
    <EmBreve
      titulo="Controle do Gado"
      requisitos={[
        'RF-01  Cadastro individual por número do brinco',
        'RF-02  Lotes e histórico de lotes do animal',
        'RF-03  Consulta por brinco, sexo, idade, raça, lote e pasto',
        'RF-08  Situação reprodutiva e previsão de parto',
        'RF-11  Vacinação e ocorrências de saúde',
      ]}
    />
  );
}
