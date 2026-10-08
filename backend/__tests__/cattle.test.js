const { DatabaseSync } = require('node:sqlite');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { inicializarBanco } = require('../data/sqlite/database');
const { RepositorioAnimaisSqlite } = require('../data/sqlite/cattleRepository');
const { ServicoAnimais } = require('../features/cattle/service');

// Executa o SQL real com uma interface assíncrona compatível com expo-sqlite.
function abrir(caminho) {
  const sqlite = new DatabaseSync(caminho);
  return {
    sqlite,
    execAsync: async (sql) => { sqlite.exec(sql); },
    getFirstAsync: async (sql, ...params) => sqlite.prepare(sql).get(...params) ?? null,
    getAllAsync: async (sql, ...params) => sqlite.prepare(sql).all(...params),
    runAsync: async (sql, ...params) => {
      const resultado = sqlite.prepare(sql).run(...params);
      return { changes: Number(resultado.changes), lastInsertRowId: Number(resultado.lastInsertRowid) };
    },
  };
}

const entrada = {
  brinco: 'AB-123', sexo: 'femea', dataNascimento: '2024-03-10',
  idadeEstimadaMeses: null, raca: 'Nelore', observacoes: 'Matriz',
};
const hoje = new Date(2026, 8, 29);
let pasta, caminho, db, repo, servico;

beforeEach(async () => {
  pasta = mkdtempSync(join(tmpdir(), 'bovr-cattle-'));
  caminho = join(pasta, 'bovr.db');
  db = abrir(caminho);
  await inicializarBanco(db);
  repo = new RepositorioAnimaisSqlite(db);
  servico = new ServicoAnimais(repo);
});

afterEach(() => {
  db.sqlite.close();
  rmSync(pasta, { recursive: true, force: true });
});

test('salva todos os dados e consulta pelo brinco após fechar e reabrir o banco', async () => {
  const id = await servico.salvar({ ...entrada, brinco: ' AB-123 ', raca: ' Nelore ' });
  db.sqlite.close();
  db = abrir(caminho);
  await inicializarBanco(db);
  const reaberto = new ServicoAnimais(new RepositorioAnimaisSqlite(db));
  await expect(reaberto.consultarPorBrinco(' ab-123 ', hoje)).resolves.toEqual([
    { ...entrada, id, situacao: 'ativo', idade: { meses: 30, estimada: false } },
  ]);
});

test('consulta inexistente retorna lista vazia e rejeita brinco vazio', async () => {
  await expect(servico.consultarPorBrinco('inexistente')).resolves.toEqual([]);
  await expect(servico.consultarPorBrinco('   ')).rejects.toMatchObject({ codigo: 'validacao' });
  await expect(servico.obter(999)).resolves.toBeNull();
  await expect(servico.exigirAnimal(999)).rejects.toMatchObject({ codigo: 'nao_encontrado' });
});

test('consulta é exata e trata caracteres especiais como valores', async () => {
  await servico.salvar(entrada);
  await expect(servico.consultarPorBrinco('AB')).resolves.toEqual([]);
  await expect(servico.consultarPorBrinco("' OR 1=1 --")).resolves.toEqual([]);
});

test('impede duplicidade ativa sem distinguir caixa e espaços externos', async () => {
  await servico.salvar(entrada);
  await expect(servico.salvar({ ...entrada, brinco: ' ab-123 ' }))
    .rejects.toMatchObject({ codigo: 'duplicado' });
  expect(await repo.listar()).toHaveLength(1);
});

test('o índice do banco impede duplicidade mesmo sem a checagem do serviço', async () => {
  await repo.criar(entrada);
  await expect(repo.criar({ ...entrada, brinco: 'ab-123' }))
    .rejects.toMatchObject({ codigo: 'duplicado' });
  await expect(db.runAsync(
    "INSERT INTO cattle (ear_tag, sex, estimated_age_months, breed) VALUES (?, 'macho', 12, 'Nelore')",
    ' AB-123 ',
  )).rejects.toThrow(/UNIQUE constraint failed/);
});

test('dois cadastros concorrentes resultam em um único animal ativo', async () => {
  const resultados = await Promise.allSettled([
    servico.salvar(entrada), servico.salvar({ ...entrada, brinco: 'ab-123' }),
  ]);
  expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  expect(resultados.find((r) => r.status === 'rejected').reason.codigo).toBe('duplicado');
  expect(await repo.listar()).toHaveLength(1);
});

test.each(['vendido', 'morto', 'transferido'])('permite reutilizar brinco de animal %s e preserva os detalhes históricos', async (situacao) => {
  const anterior = await servico.salvar(entrada);
  await db.runAsync('UPDATE cattle SET status = ? WHERE id = ?', situacao, anterior);
  const atual = await servico.salvar({ ...entrada, dataNascimento: null, idadeEstimadaMeses: 18 });
  const encontrados = await servico.consultarPorBrinco('AB-123', hoje);
  expect(encontrados.map((a) => [a.id, a.situacao])).toEqual([[atual, 'ativo'], [anterior, situacao]]);
  expect(encontrados[0].idade).toEqual({ meses: 18, estimada: true });
  await servico.salvar({ ...entrada, observacoes: 'Histórico corrigido' }, anterior);
  await expect(servico.obter(anterior)).resolves.toMatchObject({
    situacao, observacoes: 'Histórico corrigido',
  });
  // Nem uma reativação direta pode criar dois ativos com o mesmo brinco.
  await expect(db.runAsync("UPDATE cattle SET status = 'ativo' WHERE id = ?", anterior))
    .rejects.toThrow(/UNIQUE constraint failed/);
});

test('edita sem conflito consigo mesmo e impede conflito com outro ativo', async () => {
  const id = await servico.salvar(entrada);
  await servico.salvar({ ...entrada, raca: 'Angus', observacoes: null }, id);
  await expect(servico.obter(id)).resolves.toMatchObject({ raca: 'Angus', observacoes: null });
  const outro = await servico.salvar({ ...entrada, brinco: '456' });
  await expect(servico.salvar({ ...entrada, brinco: 'ab-123' }, outro))
    .rejects.toMatchObject({ codigo: 'duplicado' });
  await expect(repo.atualizar(outro, entrada)).rejects.toMatchObject({ codigo: 'duplicado' });
  await expect(servico.obter(outro)).resolves.toMatchObject({ brinco: '456' });
  await expect(repo.atualizar(999, { ...entrada, brinco: 'novo' }))
    .rejects.toMatchObject({ codigo: 'nao_encontrado' });
});

test('calcula a idade na consulta e só conta meses completos', async () => {
  await servico.salvar(entrada);
  expect((await servico.consultarPorBrinco(entrada.brinco, new Date(2026, 2, 9)))[0].idade)
    .toEqual({ meses: 23, estimada: false });
  expect((await servico.consultarPorBrinco(entrada.brinco, new Date(2026, 2, 10)))[0].idade)
    .toEqual({ meses: 24, estimada: false });
});

test.each([
  { brinco: ' ' }, { dataNascimento: '2025-02-31' },
  { dataNascimento: '2999-01-01' }, { dataNascimento: null },
  { idadeEstimadaMeses: 12 }, { dataNascimento: null, idadeEstimadaMeses: -1 },
])('não persiste entrada inválida: %j', async (alteracao) => {
  await expect(servico.salvar({ ...entrada, ...alteracao }))
    .rejects.toMatchObject({ codigo: 'validacao' });
  expect(await repo.listar()).toEqual([]);
});

test('migra versão 1 para a versão atual sem perder pastos ou gastos e pode reinicializar', async () => {
  // Reconstitui o schema da versão anterior a partir da migração real.
  await db.execAsync('DROP TABLE cattle; PRAGMA user_version = 1;');
  await db.runAsync("INSERT INTO grass_types (name, min_height_cm, max_height_cm) VALUES ('Teste', 10, 20)");
  await db.runAsync(`INSERT INTO pastures
    (name, area_hectares, grass_type_id, current_height_cm, grass_condition, coverage_percent)
    VALUES ('Pasto teste', 1, 1, 15, 'verde', 90)`);
  await db.runAsync(`INSERT INTO expenses (description, category_id, amount_cents, expense_date)
    VALUES ('Compra teste', 1, 12345, '2026-09-29')`);
  await inicializarBanco(db);
  await servico.salvar(entrada);
  await inicializarBanco(db);
  expect((await db.getFirstAsync('PRAGMA user_version')).user_version).toBe(3);
  expect((await db.getFirstAsync('SELECT name FROM pastures')).name).toBe('Pasto teste');
  expect((await db.getFirstAsync('SELECT amount_cents FROM expenses')).amount_cents).toBe(12345);
  expect(await repo.listar()).toHaveLength(1);
  expect(await db.getAllAsync('SELECT * FROM expense_categories')).toHaveLength(4);
});

test('falha na migração faz rollback e permite nova tentativa', async () => {
  await db.execAsync('DROP TABLE cattle; PRAGMA user_version = 1;');
  const executar = db.execAsync;
  const falhando = { ...db, execAsync: async (sql) => {
    if (sql.startsWith('PRAGMA user_version = 3')) throw new Error('falha simulada');
    return executar(sql);
  } };
  await expect(inicializarBanco(falhando)).rejects.toThrow('falha simulada');
  expect((await db.getFirstAsync('PRAGMA user_version')).user_version).toBe(1);
  expect(await db.getFirstAsync("SELECT name FROM sqlite_master WHERE name = 'cattle'"))
    .toBeNull();
  await inicializarBanco(db);
  await expect(servico.salvar(entrada)).resolves.toBe(1);
});
