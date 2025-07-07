const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-safe-area-context': path.resolve(__dirname, 'shims/react-native-safe-area-context'),
  '@daily-co/daily-js': path.resolve(__dirname, 'node_modules/@daily-co/react-native-daily-js'),
};

module.exports = config; 