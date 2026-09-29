const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// A camada de dados fica fora da raiz do aplicativo.
config.watchFolders = [...config.watchFolders, path.resolve(__dirname, '../backend')];
config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths || []),
  path.resolve(__dirname, 'node_modules'),
];
config.resolver.assetExts.push('wasm');

module.exports = config;
