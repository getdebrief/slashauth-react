const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    fs: false,
    net: false,
    tls: false,
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    zlib: require.resolve('browserify-zlib'),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);
  const npmLinkPaths = {
    react: path.join(__dirname, './node_modules/react'),
    'react-dom': path.join(__dirname, 'node_modules/react-dom'),
    wagmi: path.join(__dirname, 'node_modules/wagmi'),
    '@wagmi/core': path.join(__dirname, 'node_modules/@wagmi/core'),
    ethers: path.join(__dirname, 'node_modules/ethers'),
  };
  if (process.env.REACT_APP_BUILD === 'development') {
    const alias = config.resolve.alias || {};
    Object.assign(alias, npmLinkPaths);
    config.resolve.alias = alias;

    const idx = config.resolve.plugins.findIndex(
      (plugin) => plugin.constructor.name === 'ModuleScopePlugin'
    );
    if (idx !== -1) {
      config.resolve.plugins.splice(idx, 1);
    }
  }

  config.ignoreWarnings = [/Failed to parse source map/];
  return config;
};
