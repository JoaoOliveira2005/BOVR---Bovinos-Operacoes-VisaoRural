import { EmBreve } from '../src/components/EmBreve';

export default function TelaVendas() {
  return (
    <EmBreve
      titulo="Vendas"
      requisitos={[
        'RF-19  Registro de venda com comprador, peso e valor bruto',
        'RF-20  Histórico e filtro por período, comprador, animal ou lote',
        'RF-21  Vendas planejadas, separadas das realizadas',
      ]}
    />
  );
}
