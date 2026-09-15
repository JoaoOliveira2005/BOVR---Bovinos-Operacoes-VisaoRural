import { EmBreve } from '../src/components/EmBreve';

export default function TelaRelatorios() {
  return (
    <EmBreve
      titulo="Relatórios"
      requisitos={[
        'RF-26  Relatório de controle do gado',
        'RF-27  Relatório de vendas por período',
        'RF-28  Relatório de gastos por categoria',
        'RF-29  Resumo financeiro consolidado',
        'RF-30  Visualização na tela e exportação em PDF',
      ]}
    />
  );
}
