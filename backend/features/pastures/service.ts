import type {
  EntradaLeituraPasto, EntradaMovimentoPasto, FiltroMovimentos, RepositorioManejoPastos,
} from './types';
import { hojeLocal, validarData, validarId, validarMedicao } from './rules';

export class ServicoManejoPastos {
  constructor(private readonly repo: RepositorioManejoPastos, private readonly hoje = hojeLocal) {}

  async registrarLeitura(entrada: EntradaLeituraPasto) {
    validarId(entrada.pastoId);
    validarData(entrada.dataLeitura, this.hoje());
    validarMedicao(entrada);
    return this.repo.registrarLeitura(entrada);
  }

  async listarLeituras(pastoId: number) {
    validarId(pastoId);
    return this.repo.listarLeituras(pastoId);
  }

  async moverAnimal(animalId: number, entrada: EntradaMovimentoPasto) {
    validarId(animalId);
    this.validarMovimento(entrada);
    return this.repo.moverAnimal(animalId, entrada);
  }

  async moverLote(loteId: number, entrada: EntradaMovimentoPasto) {
    validarId(loteId);
    this.validarMovimento(entrada);
    return this.repo.moverLote(loteId, entrada);
  }

  async listarMovimentos(filtro: FiltroMovimentos = {}) {
    for (const id of [filtro.pastoId, filtro.animalId, filtro.loteId]) if (id !== undefined) validarId(id);
    return this.repo.listarMovimentos(filtro);
  }

  async obterPainel(pastoId: number) {
    validarId(pastoId);
    return this.repo.obterPainel(pastoId, this.hoje());
  }

  async listarDescansos(pastoId: number) {
    validarId(pastoId);
    return this.repo.listarDescansos(pastoId, this.hoje());
  }

  private validarMovimento(entrada: EntradaMovimentoPasto) {
    if (entrada.pastoDestinoId !== null) validarId(entrada.pastoDestinoId);
    validarData(entrada.dataMovimento, this.hoje());
  }
}
