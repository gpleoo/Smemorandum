module.exports = function (api) {
  const isWeb = api.caller((caller) => caller && caller.name === 'babel-loader');
  api.cache.using(() => isWeb);
  return {
    presets: ['babel-preset-expo'],
    plugins: isWeb ? [] : ['react-native-reanimated/plugin'],
  };
};
