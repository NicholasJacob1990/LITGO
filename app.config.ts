export default ({ config }: { config: any }) => ({
  ...config,
  plugins: [
    ...((config.plugins || [])),
    // 'expo-maps', // Removido pois estamos usando react-native-maps
  ],
}); 