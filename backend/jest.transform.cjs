const ts = require('../frontend/node_modules/typescript');

// Os testes de dados rodam em Node, sem carregar os módulos nativos do Expo.
module.exports = {
  process(sourceText, sourcePath) {
    return { code: ts.transpileModule(sourceText, {
      fileName: sourcePath,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        inlineSourceMap: true,
        inlineSources: true,
      },
    }).outputText };
  },
};
