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

## Validação em Docker

Na raiz, execute:

```sh
docker compose up --build --abort-on-container-exit --exit-code-from tests
```

Executa TypeScript, os testes existentes e os testes do backend. Estes usam
SQLite real (`node:sqlite`) com um adaptador da interface assíncrona utilizada
pelo Expo. Cobrem persistência após reabertura, migrações, consulta, idade e
unicidade inclusive no banco. Não substituem um teste no dispositivo Android.
