// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      buffer: require.resolve('buffer/'),
      url: require.resolve('url'),
      fs: require.resolve('fs'),
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
    },
  },
  output: {
    path: __dirname + '/dist',
    filename: 'index.js',
    library: {
      name: 'slashauthReact',
      type: 'amd',
    },
    chunkFormat: 'module',
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
