const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;
config.resolver.resolverMainFields = ['main', 'browser', 'react-native'];

module.exports = withNativeWind(config, { input: './global.css' });