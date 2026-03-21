const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  config.transformer.babelTransformerPath = require.resolve(
    "react-native-svg-transformer"
  );

  config.resolver.assetExts = config.resolver.assetExts.filter(
    (ext) => ext !== "svg"
  );
  config.resolver.sourceExts.push("svg");

  return withNativeWind(config, { input: "./global.css" });
})();
