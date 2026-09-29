export type ResumoPastos = {
  totalPastos: number;
  areaTotalHectares: number;
  pastosBons: number;
};

export type ResumoGastos = {
  totalMesCentavos: number;
  quantidadeLancamentosMes: number;
  totalGeralCentavos: number;
};

export type GastoPorCategoria = {
  categoriaId: number;
  categoriaNome: string;
  totalCentavos: number;
  quantidade: number;
};

export type ResumoFazenda = {
  pastos: ResumoPastos;
  gastos: ResumoGastos;
};

export interface RepositorioDashboard {
  obterResumoFazenda(mesAno?: string): Promise<ResumoFazenda>;
  obterGastosPorCategoria(): Promise<GastoPorCategoria[]>;
}
