/**
 * Repositório de animais em memória — PROVISÓRIO.
 *
 * A tabela `cattle` ainda não existe no schema (`database.ts` está na versão 1,
 * com pastos e gastos). Criá-la é a Issue #3, do backend.
 *
 * Este repositório existe só para a tela de cadastro funcionar e ser
 * demonstrável enquanto isso. Ele implementa `RepositorioAnimais`, o mesmo
 * contrato que o repositório SQLite vai implementar — quando ele chegar,
 * troca-se o `useServicoAnimais` e nenhuma tela muda.
 *
 * ⚠️ Os dados somem quando o app é fechado. Não é armazenamento (RF-32/RF-33).
 */
import type { Animal, EntradaAnimal, RepositorioAnimais } from '../../features/cattle/types';

/**
 * Estado no módulo, não na instância: o hook recria o repositório a cada tela,
 * e sem isto o animal cadastrado sumiria ao voltar para a lista.
 */
const animais: Animal[] = [];
let proximoId = 1;

function normalizar(brinco: string): string {
  return brinco.trim().toLowerCase();
}

export class RepositorioAnimaisMemoria implements RepositorioAnimais {
  async listar(): Promise<Animal[]> {
    return [...animais].sort((a, b) => b.id - a.id);
  }

  async obter(id: number): Promise<Animal | null> {
    return animais.find((animal) => animal.id === id) ?? null;
  }

  async existeAtivoComBrinco(brinco: string, ignorarId?: number): Promise<boolean> {
    const alvo = normalizar(brinco);
    return animais.some(
      (animal) =>
        animal.situacao === 'ativo' &&
        animal.id !== ignorarId &&
        normalizar(animal.brinco) === alvo,
    );
  }

  async criar(entrada: EntradaAnimal): Promise<number> {
    const id = proximoId++;
    animais.push({ ...entrada, id, situacao: 'ativo' });
    return id;
  }

  async atualizar(id: number, entrada: EntradaAnimal): Promise<void> {
    const indice = animais.findIndex((animal) => animal.id === id);
    if (indice >= 0) animais[indice] = { ...animais[indice], ...entrada };
  }
}
