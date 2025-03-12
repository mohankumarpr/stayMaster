const {getDefaultConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  
  return {
    ...config,
    transformer: {
      ...config.transformer,
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      ...config.resolver,
      assetExts: [...config.resolver.assetExts.filter(ext => ext !== 'svg'), 'png', 'jpg', 'jpeg', 'gif'],
      sourceExts: [...config.resolver.sourceExts, 'svg'],
    },
  };
})();