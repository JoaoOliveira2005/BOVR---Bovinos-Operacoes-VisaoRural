# Dados e serviços locais

O código desta pasta executa dentro do aplicativo offline. O domínio de animais
(tipos, validações, idade e serviço) fica em `features/cattle/`, sem depender de
arquivos de domínio ou telas do frontend. As ferramentas de teste e as bibliotecas
Expo continuam instaladas a partir de `frontend/package.json`.

Os módulos de pastos e gastos foram movidos para `data/sqlite/` e preservam
seus contratos existentes. No frontend, os ajustes são de imports e configuração
para essa mudança de pasta; as telas e o tema da `dev` são preservados.

## Animais

- `data/sqlite/database.ts`: migração 2 cria `cattle` e o índice único de brinco
  entre animais ativos. A atualização preserva os dados da versão 1.
- `data/sqlite/cattleRepository.ts`: cadastro, edição, listagem, consulta por ID
  e consulta exata por brinco, ignorando caixa e espaços externos.
- `features/cattle/service.ts`: valida cadastro e edição;
  `consultarPorBrinco(brinco)` retorna os dados completos e `idade`, com
  `{ meses, estimada }`. Sem correspondência, retorna `[]`; brinco vazio gera
  erro de validação. A idade calculada é atualizada na consulta, não armazenada.
- Como um brinco pode ser reutilizado, a consulta retorna uma lista: primeiro
  o animal ativo, depois os históricos do mais recente para o mais antigo.

O cadastro e a consulta estão disponíveis para o squad de frontend integrar à
interface. A `dev` mantém a tela de Gado como placeholder: não foram importadas
as telas da `main`. O hook `data/sqlite/cattleServices.ts` fornece o serviço
via `useServicoAnimais()` dentro do `SQLiteProvider`.

```ts
const id = await servico.salvar({
  brinco: '1234', sexo: 'femea', dataNascimento: '2024-03-10',
  idadeEstimadaMeses: null, raca: 'Nelore', observacoes: null,
});
const animais = await servico.consultarPorBrinco('1234');
```

Erros de animais usam `ErroDominio` de `backend/domain/errors.ts`, com `codigo`
(`validacao`, `duplicado`, `nao_encontrado` ou `persistencia`) e mensagem em
português. O frontend deve consumir esse contrato ao integrar o módulo.

## Pastos: cadastro, qualidade e manejo (RF-15 a RF-18)

A migração 3 preserva os cadastros existentes e adiciona leituras de qualidade,
localização dos animais, movimentações e períodos de descanso. Para cadastros
antigos, a data da leitura e a localização ficam desconhecidas (`null`); nenhuma
data histórica é inventada. O cadastro/tipos de capim continua disponível pelo
hook `useServicoPastos()`; o manejo é fornecido por `useServicoManejoPastos()`,
ambos em `data/sqlite/pastureServices.ts`, dentro do `SQLiteProvider`.

`salvarPasto()` aceita `dataLeitura?: string` (AAAA-MM-DD). No cadastro inicial,
registra uma leitura com essa data; se omitida pelo formulário existente, usa a
data local de hoje. Na edição, registra uma nova leitura quando a medição ou o
tipo de capim muda, ou quando uma data é explicitamente informada. Alterar apenas
nome/área não cria outra leitura. `obterPasto()`/`listarPastos()` retornam também
`qualidade` e `dataLeitura`; a qualidade atual usa os limites atuais do capim.

O serviço de manejo oferece:

| Método | Resultado |
| --- | --- |
| `registrarLeitura(entrada)` | ID da leitura; atualiza os dados atuais se for a mais recente |
| `listarLeituras(pastoId)` | Histórico por data/ID decrescente, com qualidade e limites usados na leitura |
| `moverAnimal(animalId, entrada)` | IDs das movimentações registradas |
| `moverLote(loteId, entrada)` | IDs das movimentações dos integrantes ativos, em uma única transação |
| `listarMovimentos({ pastoId?, animalId?, loteId? })` | Rotações por data/ID decrescente; filtros combinados com E |
| `obterPainel(pastoId)` | Lotação, permanência individual/em lote, descanso atual e último concluído |
| `listarDescansos(pastoId)` | Todos os períodos de descanso, abertos ou concluídos, em dias |

```ts
await manejo.registrarLeitura({
  pastoId: 1, dataLeitura: '2026-10-13', alturaAtualCm: 30,
  condicaoCapim: 'verde', coberturaPercentual: 90,
});
await manejo.moverAnimal(7, { pastoDestinoId: 2, dataMovimento: '2026-10-13' });
await manejo.moverLote(3, { pastoDestinoId: 2, dataMovimento: '2026-10-13' });
const painel = await manejo.obterPainel(2);
const historico = await manejo.listarMovimentos({ animalId: 7 });
```

Regras e contratos para integração:

- Boa: altura entre mínimo e máximo (inclusive), capim verde e cobertura ≥80%.
  Regular: exatamente um desses critérios falha. Ruim: dois ou três falham.
  Cada leitura guarda os parâmetros e a classificação originais; mudar o tipo
  de capim ou seus limites não reclassifica o histórico.
- Datas são reais, sem futuro, em AAAA-MM-DD. Leituras antigas podem ser
  incluídas por `registrarLeitura()` sem substituir a medição mais recente.
- Origem `null` significa primeira alocação/animal sem pasto. Destino `null`
  registra saída sem outro pasto. É necessário registrar a saída antes de
  alterar a situação do animal para vendido/morto/transferido.
- Movimentos não podem anteceder a última movimentação do animal ou dos pastos
  envolvidos. Isso conserva a ordem usada para calcular permanência e descanso.
- O lote usa `herds` e `cattle.herd_id`, adicionados pela migração como contrato
  para o módulo de lotes. O cadastro/edição de lotes continua sendo tarefa desse
  módulo. Cada integrante movimentado gera uma linha com seu `herd_id` e sua
  origem real, inclusive quando o lote está dividido. Integrantes já no destino
  conservam sua entrada original; um movimento sem alteração é rejeitado.
- Descanso inicia quando sai o último animal e termina quando entra o primeiro.
  Um pasto nunca ocupado tem descanso desconhecido (`null`). O painel separa
  `descansoAtual` de `ultimoDescansoConcluido`. Dias são diferenças de calendário,
  sem arredondamento por fuso horário; movimentações no mesmo dia podem ter 0 dias.
- Para lotes com entradas distintas, o painel informa `diasMinimos` e
  `diasMaximos` de permanência dos integrantes presentes, além dos dias individuais.
- Pastos com histórico de rotação não podem ser excluídos. Sem rotação, excluir
  o cadastro remove suas leituras. As referências preservam tipos de capim usados
  em leituras históricas. As gravações são atômicas; no nativo usam uma conexão
  separada com FK ativada antes da transação. No web usam a conexão do provider,
  serializando as transações dos serviços de pastos.

Os erros usam o contrato existente de pastos (`ErroDominio` em
`frontend/src/domain/errors.ts`), reconhecido pelas telas atuais. As telas de
leituras, movimentos e painel ficam para integração do frontend.

## Validação em Docker

Na raiz, execute:

```sh
docker compose up --build --abort-on-container-exit --exit-code-from tests
```

Executa TypeScript, os testes existentes e os testes do backend. Estes usam
SQLite real (`node:sqlite`) com um adaptador da interface assíncrona utilizada
pelo Expo. Cobrem persistência após reabertura, migrações, consulta, idade e
unicidade inclusive no banco. Não substituem um teste no dispositivo Android.
