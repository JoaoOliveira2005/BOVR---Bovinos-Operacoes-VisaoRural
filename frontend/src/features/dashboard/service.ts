import type { GastoPorCategoria, RepositorioDashboard, ResumoFazenda } from './types';

export class ServicoDashboard {
  constructor(private readonly repositorio: RepositorioDashboard) {}

  obterResumoFazenda(mesAno?: string): Promise<ResumoFazenda> {
    return this.repositorio.obterResumoFazenda(mesAno);
  }

  obterGastosPorCategoria(): Promise<GastoPorCategoria[]> {
    return this.repositorio.obterGastosPorCategoria();
  }
}
