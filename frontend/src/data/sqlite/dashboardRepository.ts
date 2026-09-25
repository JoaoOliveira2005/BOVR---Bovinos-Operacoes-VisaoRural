import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  GastoPorCategoria,
  RepositorioDashboard,
  ResumoFazenda,
} from '../../features/dashboard/types';

export class RepositorioDashboardSqlite implements RepositorioDashboard {
  constructor(private readonly db: SQLiteDatabase) {}

  async obterResumoFazenda(mesAno?: string): Promise<ResumoFazenda> {
    const mesReferencia = mesAno ?? new Date().toISOString().slice(0, 7);

    const linhaPastos = await this.db.getFirstAsync<{ total: number; area_total: number }>(
      'SELECT COUNT(*) as total, COALESCE(SUM(area_hectares), 0) as area_total FROM pastures',
    );

    const pastosDetalhados = await this.db.getAllAsync<{
      current_height_cm: number;
      grass_condition: string;
      coverage_percent: number;
      min_height_cm: number;
      max_height_cm: number;
    }>(
      `SELECT p.current_height_cm, p.grass_condition, p.coverage_percent,
              g.min_height_cm, g.max_height_cm
       FROM pastures p
       JOIN grass_types g ON g.id = p.grass_type_id`,
    );

    let pastosBons = 0;
    for (const p of pastosDetalhados) {
      const alturaAdequada =
        p.current_height_cm >= p.min_height_cm && p.current_height_cm <= p.max_height_cm;
      const condicaoBoa = p.grass_condition === 'verde';
      const coberturaBoa = p.coverage_percent >= 70;
      if (alturaAdequada && condicaoBoa && coberturaBoa) {
        pastosBons++;
      }
    }

    const linhaGastosMes = await this.db.getFirstAsync<{ total: number; qtd: number }>(
      'SELECT COALESCE(SUM(amount_cents), 0) as total, COUNT(*) as qtd FROM expenses WHERE expense_date LIKE ?',
      `${mesReferencia}%`,
    );

    const linhaGastosGeral = await this.db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(amount_cents), 0) as total FROM expenses',
    );

    return {
      pastos: {
        totalPastos: linhaPastos?.total ?? 0,
        areaTotalHectares: Math.round((linhaPastos?.area_total ?? 0) * 100) / 100,
        pastosBons,
      },
      gastos: {
        totalMesCentavos: linhaGastosMes?.total ?? 0,
        quantidadeLancamentosMes: linhaGastosMes?.qtd ?? 0,
        totalGeralCentavos: linhaGastosGeral?.total ?? 0,
      },
    };
  }

  async obterGastosPorCategoria(): Promise<GastoPorCategoria[]> {
    const linhas = await this.db.getAllAsync<{
      categoria_id: number;
      categoria_nome: string;
      total_centavos: number;
      quantidade: number;
    }>(
      `SELECT c.id as categoria_id, c.name as categoria_nome,
              COALESCE(SUM(e.amount_cents), 0) as total_centavos,
              COUNT(e.id) as quantidade
       FROM expense_categories c
       JOIN expenses e ON e.category_id = c.id
       GROUP BY c.id, c.name
       ORDER BY total_centavos DESC`,
    );

    return linhas.map((linha) => ({
      categoriaId: linha.categoria_id,
      categoriaNome: linha.categoria_nome,
      totalCentavos: linha.total_centavos,
      quantidade: linha.quantidade,
    }));
  }
}
