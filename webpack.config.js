/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const { env } = process;

const tsConfigPath = (exports.tsConfigPath = path.join(
  __dirname,
  'tsconfig.json'
));

module.exports = {
  target: 'web',
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    'whatwg-fetch',
    './src/index.ts',
  ],
  // devtool: 'inline-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: tsConfigPath,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify'),
      url: require.resolve('url'),
    },
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [],
    symlinks: false,
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
  },
  performance: {
    hints: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // NODE_ENV: JSON.stringify(env.NODE_ENV) || JSON.stringify('production'),
        LINK_API_URL: JSON.stringify(env.LINK_API_URL),
        SDK_VERSION: JSON.stringify(require('./package.json').version),
      },
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
