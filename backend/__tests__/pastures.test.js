const { DatabaseSync } = require('node:sqlite');
const { mkdtempSync, rmSync, readFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { inicializarBanco } = require('../data/sqlite/database');
const { RepositorioPastosSqlite, RepositorioTiposCapimSqlite } = require('../data/sqlite/pastureRepository');
const { RepositorioManejoPastosSqlite } = require('../data/sqlite/pastureManagementRepository');
const { ServicoManejoPastos } = require('../features/pastures/service');
const { ServicoPastos } = require('../../frontend/src/features/pastures/service');
const { classificarQualidade, diasEntre } = require('../features/pastures/rules');

function abrir(caminho) {
  const sqlite = new DatabaseSync(caminho);
  return {
    sqlite,
    closeAsync: async () => { sqlite.close(); },
    execAsync: async (sql) => { sqlite.exec(sql); },
    getFirstAsync: async (sql, ...params) => sqlite.prepare(sql).get(...params) ?? null,
    getAllAsync: async (sql, ...params) => sqlite.prepare(sql).all(...params),
    runAsync: async (sql, ...params) => {
      const resultado = sqlite.prepare(sql).run(...params);
      return { changes: Number(resultado.changes), lastInsertRowId: Number(resultado.lastInsertRowid) };
    },
  };
}

let pasta, caminho, db, cadastro, manejo, repo, tipo, norte, sul;
const entrada = {
  nome: 'Norte', areaHectares: 2.5, alturaAtualCm: 20,
  condicaoCapim: 'green', coberturaPercentual: 80, dataLeitura: '2026-09-01',
};
function conectar() {
  repo = new RepositorioPastosSqlite(db);
  cadastro = new ServicoPastos(repo, new RepositorioTiposCapimSqlite(db));
  manejo = new ServicoManejoPastos(new RepositorioManejoPastosSqlite(db), () => '2026-10-13');
}
async function animal(brinco, lote = null, situacao = 'active') {
  return (await db.runAsync(
    `INSERT INTO cattle (tag_number, sex, estimated_age_months, breed, herd_id, status)
     VALUES (?, 'female', 24, 'Nelore', ?, ?)`, brinco, lote, situacao,
  )).lastInsertRowId;
}
const mover = (animalId, pastoDestinoId, dataMovimento) => manejo.moverAnimal(animalId, { pastoDestinoId, dataMovimento });

beforeEach(async () => {
  pasta = mkdtempSync(join(tmpdir(), 'bovr-pastures-'));
  caminho = join(pasta, 'bovr.db');
  db = abrir(caminho);
  await inicializarBanco(db);
  conectar();
  tipo = await cadastro.salvarTipo({ nome: 'Braquiária', alturaMinimaCm: 20, alturaMaximaCm: 40 });
  norte = await cadastro.salvarPasto({ ...entrada, tipoCapimId: tipo });
  sul = await cadastro.salvarPasto({ ...entrada, nome: 'Sul', tipoCapimId: tipo });
});
afterEach(() => { db.sqlite.close(); rmSync(pasta, { recursive: true, force: true }); });

test.each([
  [20, 'green', 80, 'good'], [40, 'green', 100, 'good'],
  [19, 'green', 80, 'fair'], [41, 'green', 80, 'fair'],
  [20, 'partly_dry', 80, 'fair'], [20, 'dry', 80, 'fair'],
  [20, 'green', 79, 'fair'], [19, 'dry', 80, 'poor'],
  [20, 'dry', 79, 'poor'], [19, 'green', 79, 'poor'], [19, 'dry', 79, 'poor'],
])('classifica altura %s, condição %s, cobertura %s como %s', (altura, condicao, cobertura, esperado) => {
  expect(classificarQualidade(altura, condicao, cobertura, 20, 40)).toBe(esperado);
});

test('salvar pasto registra leitura datada; editar apenas nome/área não inventa outra medição', async () => {
  await expect(cadastro.obterPasto(norte)).resolves.toMatchObject({ qualidade: 'good', dataLeitura: '2026-09-01' });
  const { dataLeitura, ...semData } = entrada;
  await cadastro.salvarPasto({ ...semData, nome: 'Novo nome', tipoCapimId: tipo }, norte);
  expect(await manejo.listarLeituras(norte)).toHaveLength(1);
  await cadastro.salvarPasto({ ...entrada, alturaAtualCm: 10, tipoCapimId: tipo, dataLeitura: '2026-09-03' }, norte);
  const leituras = await manejo.listarLeituras(norte);
  expect(leituras.map((l) => [l.dataLeitura, l.qualidade])).toEqual([['2026-09-03', 'fair'], ['2026-09-01', 'good']]);
});

test('leituras históricas preservam as medições atuais e os limites originais do capim', async () => {
  await manejo.registrarLeitura({ ...entrada, pastoId: norte, alturaAtualCm: 10, dataLeitura: '2026-08-30' });
  await expect(cadastro.obterPasto(norte)).resolves.toMatchObject({ alturaAtualCm: 20, dataLeitura: '2026-09-01' });
  await cadastro.salvarTipo({ nome: 'Braquiária', alturaMinimaCm: 30, alturaMaximaCm: 50 }, tipo);
  await expect(cadastro.obterPasto(norte)).resolves.toMatchObject({ qualidade: 'fair' });
  expect((await manejo.listarLeituras(norte))[0]).toMatchObject({ qualidade: 'good', alturaMinimaCm: 20, alturaMaximaCm: 40 });
  await manejo.registrarLeitura({ ...entrada, pastoId: norte, dataLeitura: '2026-09-02' });
  expect((await manejo.listarLeituras(norte))[0]).toMatchObject({ qualidade: 'fair', alturaMinimaCm: 30 });
});

test.each([
  { dataLeitura: '2026-02-30' }, { dataLeitura: '13/10/2026' }, { dataLeitura: '2026-10-14' },
  { alturaAtualCm: NaN }, { alturaAtualCm: -1 }, { coberturaPercentual: 80.5 },
  { coberturaPercentual: 101 }, { condicaoCapim: 'molhado' }, { pastoId: 0 },
])('rejeita leitura inválida sem gravar: %j', async (alteracao) => {
  await expect(manejo.registrarLeitura({ ...entrada, pastoId: norte, ...alteracao }))
    .rejects.toMatchObject({ codigo: 'validacao' });
  expect(await manejo.listarLeituras(norte)).toHaveLength(1);
});

test('registra origem/destino e calcula permanência após reabrir o banco', async () => {
  const id = await animal('A');
  await mover(id, norte, '2026-09-01');
  await mover(id, sul, '2026-09-10');
  db.sqlite.close(); db = abrir(caminho); await inicializarBanco(db); conectar();
  expect(await manejo.listarMovimentos({ animalId: id })).toEqual([
    expect.objectContaining({ animalId: id, pastoOrigemId: norte, pastoDestinoId: sul, dataMovimento: '2026-09-10' }),
    expect.objectContaining({ animalId: id, pastoOrigemId: null, pastoDestinoId: norte, dataMovimento: '2026-09-01' }),
  ]);
  expect(await manejo.obterPainel(sul)).toMatchObject({ quantidadeAnimais: 1, animais: [{ animalId: id, diasPermanencia: 33 }] });
  expect(await manejo.obterPainel(norte)).toMatchObject({ quantidadeAnimais: 0, descansoAtual: { diasDescanso: 33 } });
});

test('descanso começa somente na última saída e fecha na primeira entrada', async () => {
  const a = await animal('A'), b = await animal('B');
  await mover(a, norte, '2026-09-01'); await mover(b, norte, '2026-09-02');
  await mover(a, sul, '2026-09-05');
  expect(await manejo.listarDescansos(norte)).toEqual([]);
  await mover(b, sul, '2026-09-10');
  expect((await manejo.obterPainel(norte)).descansoAtual).toMatchObject({ dataInicio: '2026-09-10', diasDescanso: 33 });
  await mover(a, norte, '2026-09-15'); await mover(b, norte, '2026-09-18');
  expect(await manejo.obterPainel(norte)).toMatchObject({
    quantidadeAnimais: 2, descansoAtual: null,
    ultimoDescansoConcluido: { dataInicio: '2026-09-10', dataFim: '2026-09-15', diasDescanso: 5 },
  });
  expect(await manejo.listarDescansos(norte)).toHaveLength(1);
});

test('movimenta lote dividido, mantém integrantes já no destino e registra cada origem', async () => {
  const lote = (await db.runAsync("INSERT INTO herds (name) VALUES ('Lote 1')")).lastInsertRowId;
  const a = await animal('A', lote), b = await animal('B', lote), c = await animal('C', lote);
  await animal('Vendido', lote, 'sold');
  await mover(a, norte, '2026-09-01'); await mover(b, sul, '2026-09-02');
  const ids = await manejo.moverLote(lote, { pastoDestinoId: sul, dataMovimento: '2026-09-10' });
  expect(ids).toHaveLength(2);
  expect(await manejo.listarMovimentos({ loteId: lote })).toEqual([
    expect.objectContaining({ animalId: c, pastoOrigemId: null, pastoDestinoId: sul }),
    expect.objectContaining({ animalId: a, pastoOrigemId: norte, pastoDestinoId: sul }),
  ]);
  expect(await manejo.obterPainel(sul)).toMatchObject({
    quantidadeAnimais: 3,
    lotes: [{ loteId: lote, quantidadeAnimais: 3, diasMinimos: 33, diasMaximos: 41 }],
  });
  expect((await manejo.obterPainel(sul)).animais.find((a) => a.animalId === b).dataEntrada).toBe('2026-09-02');
});

test('falha no segundo integrante faz rollback de todo o lote, incluindo descanso', async () => {
  const lote = (await db.runAsync("INSERT INTO herds (name) VALUES ('Lote')")).lastInsertRowId;
  const a = await animal('A', lote), b = await animal('B', lote);
  await mover(a, norte, '2026-09-01'); await mover(b, norte, '2026-09-01');
  await db.execAsync(`CREATE TRIGGER falha_movimento BEFORE UPDATE OF pasture_id ON cattle
    WHEN NEW.id = ${b} BEGIN SELECT RAISE(ABORT, 'falha simulada'); END;`);
  await expect(manejo.moverLote(lote, { pastoDestinoId: sul, dataMovimento: '2026-09-05' }))
    .rejects.toMatchObject({ codigo: 'persistencia' });
  expect((await manejo.obterPainel(norte)).quantidadeAnimais).toBe(2);
  expect((await manejo.obterPainel(sul)).quantidadeAnimais).toBe(0);
  expect(await manejo.listarMovimentos({ loteId: lote })).toEqual([]);
  expect(await manejo.listarDescansos(norte)).toEqual([]);
});

test('rejeita datas fora de ordem no animal e nos pastos envolvidos', async () => {
  const a = await animal('A'), b = await animal('B');
  await mover(a, norte, '2026-09-10');
  await expect(mover(b, norte, '2026-09-09')).rejects.toMatchObject({ codigo: 'validacao' });
  await mover(a, null, '2026-09-12');
  await expect(mover(a, sul, '2026-09-11')).rejects.toMatchObject({ codigo: 'validacao' });
  expect(await manejo.listarMovimentos()).toHaveLength(2);
});

test('rejeita destino inexistente, movimento sem alteração, inativo e data futura', async () => {
  const a = await animal('A'), vendido = await animal('V', null, 'sold');
  await expect(mover(a, 999, '2026-09-01')).rejects.toMatchObject({ codigo: 'nao_encontrado' });
  await expect(mover(a, null, '2026-09-01')).rejects.toMatchObject({ codigo: 'validacao' });
  await expect(mover(vendido, norte, '2026-09-01')).rejects.toMatchObject({ codigo: 'validacao' });
  await expect(mover(a, norte, '2026-10-14')).rejects.toMatchObject({ codigo: 'validacao' });
  await expect(manejo.moverLote(999, { pastoDestinoId: norte, dataMovimento: '2026-09-01' }))
    .rejects.toMatchObject({ codigo: 'nao_encontrado' });
  await mover(a, norte, '2026-09-01');
  await expect(mover(a, norte, '2026-09-02')).rejects.toMatchObject({ codigo: 'validacao' });
});

test('transferências concorrentes são serializadas e mantêm a origem real', async () => {
  const a = await animal('A');
  await Promise.all([mover(a, norte, '2026-09-01'), mover(a, sul, '2026-09-01')]);
  expect(await manejo.listarMovimentos({ animalId: a })).toEqual([
    expect.objectContaining({ pastoOrigemId: norte, pastoDestinoId: sul }),
    expect.objectContaining({ pastoOrigemId: null, pastoDestinoId: norte }),
  ]);
  expect((await manejo.listarDescansos(norte))[0].dataInicio).toBe('2026-09-01');
});

test('protege histórico de rotação e exige saída antes de uma baixa', async () => {
  const a = await animal('A'); await mover(a, norte, '2026-09-01');
  await expect(cadastro.excluirPasto(norte)).rejects.toMatchObject({ codigo: 'em_uso' });
  await expect(db.runAsync("UPDATE cattle SET status = 'sold' WHERE id = ?", a)).rejects.toThrow(/Retire o animal/);
  await mover(a, null, '2026-09-05');
  await db.runAsync("UPDATE cattle SET status = 'sold' WHERE id = ?", a);
  expect((await manejo.obterPainel(norte)).quantidadeAnimais).toBe(0);
  await cadastro.excluirPasto(sul); // pasto ainda sem rotação pode ser excluído com suas leituras
  expect(await cadastro.obterPasto(sul)).toBeNull();
});

test('conexão separada mantém FK, usa o mesmo arquivo e fecha após sucesso/rollback', async () => {
  let aberturas = 0, fechamentos = 0;
  const abrirConexao = async () => {
    const conexao = abrir(caminho);
    aberturas++;
    const fechar = conexao.closeAsync;
    conexao.closeAsync = async () => { fechamentos++; await fechar(); };
    return conexao;
  };
  const cadastroIsolado = new ServicoPastos(
    new RepositorioPastosSqlite(db, abrirConexao), new RepositorioTiposCapimSqlite(db, abrirConexao),
  );
  const isolado = new ServicoManejoPastos(new RepositorioManejoPastosSqlite(db, abrirConexao), () => '2026-10-13');
  const a = await animal('A');
  await isolado.moverAnimal(a, { pastoDestinoId: norte, dataMovimento: '2026-09-01' });
  await expect(cadastroIsolado.excluirTipo(tipo)).rejects.toMatchObject({ codigo: 'em_uso' });
  expect(await isolado.obterPainel(norte)).toMatchObject({ quantidadeAnimais: 1 });
  await expect(isolado.moverAnimal(a, { pastoDestinoId: 999, dataMovimento: '2026-09-02' }))
    .rejects.toMatchObject({ codigo: 'nao_encontrado' });
  expect(await manejo.listarMovimentos({ animalId: a })).toHaveLength(1);
  expect(aberturas).toBe(4);
  expect(fechamentos).toBe(aberturas);
});

test('erro ao gravar a leitura faz rollback do cadastro e dos dados atuais', async () => {
  await db.execAsync(`CREATE TRIGGER falha_leitura BEFORE INSERT ON pasture_inspections
    BEGIN SELECT RAISE(ABORT, 'falha simulada'); END;`);
  await expect(cadastro.salvarPasto({ ...entrada, tipoCapimId: tipo, nome: 'Não salvar' }))
    .rejects.toMatchObject({ codigo: 'persistencia' });
  await expect(cadastro.salvarPasto({ ...entrada, tipoCapimId: tipo, alturaAtualCm: 10 }, norte))
    .rejects.toMatchObject({ codigo: 'persistencia' });
  expect(await cadastro.listarPastos()).toHaveLength(2);
  expect(await cadastro.obterPasto(norte)).toMatchObject({ alturaAtualCm: 20 });
});

test('dias de calendário consideram ano bissexto e saída/entrada no mesmo dia', async () => {
  expect(diasEntre('2024-02-28', '2024-03-01')).toBe(2);
  expect(diasEntre('2026-01-01', '2026-01-01')).toBe(0);
  const a = await animal('A');
  await mover(a, norte, '2026-09-01'); await mover(a, sul, '2026-09-02'); await mover(a, norte, '2026-09-02');
  expect((await manejo.listarDescansos(norte))[0].diasDescanso).toBe(0);
});

test('migra versão 2 preservando cadastros, sem inventar datas de leitura nem localização', async () => {
  db.sqlite.close(); rmSync(caminho, { force: true }); db = abrir(caminho);
  const fonte = readFileSync(join(__dirname, '../data/sqlite/database.ts'), 'utf8');
  for (const versao of [1, 2]) db.sqlite.exec(fonte.match(new RegExp('const MIGRACAO_' + versao + ' = `([\\s\\S]*?)`;'))[1]);
  db.sqlite.exec('PRAGMA foreign_keys = ON; PRAGMA user_version = 2;');
  await db.runAsync("INSERT INTO grass_types (name,min_height_cm,max_height_cm) VALUES ('Capim antigo',20,40)");
  await db.runAsync(`INSERT INTO pastures (name,area_hectares,grass_type_id,current_height_cm,grass_condition,coverage_percent)
    VALUES ('Pasto antigo',2,1,20,'green',80)`);
  const a = (await db.runAsync(`INSERT INTO cattle (tag_number,sex,estimated_age_months,breed)
    VALUES ('Antigo','female',24,'Nelore')`)).lastInsertRowId;
  await inicializarBanco(db); conectar(); await inicializarBanco(db);
  expect((await db.getFirstAsync('PRAGMA user_version')).user_version).toBe(3);
  expect(await cadastro.obterPasto(1)).toMatchObject({ nome: 'Pasto antigo', qualidade: 'good', dataLeitura: null });
  expect(await manejo.listarLeituras(1)).toEqual([]);
  expect(await db.getFirstAsync('SELECT pasture_id,herd_id FROM cattle WHERE id = ?', a))
    .toEqual({ pasture_id: null, herd_id: null });
});
