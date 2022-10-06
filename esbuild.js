/* eslint-disable @typescript-eslint/no-var-requires */
const NodeModulesPolyfillPlugin =
  require('@esbuild-plugins/node-modules-polyfill').NodeModulesPolyfillPlugin;

const NodeGlobalPolyfillPlugin =
  require('@esbuild-plugins/node-globals-polyfill').NodeGlobalsPolyfillPlugin;

const cssModulesPlugin = require('esbuild-css-modules-plugin');

const esbuild = require('esbuild');

const argv = process.argv.slice(2);

esbuild.build({
  logLevel: 'info',
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: argv.indexOf('--no-minify') === -1,
  target: 'es2020',
  format: 'esm',
  outfile: './dist/index.esm.js',
  outbase: './src',
  treeShaking: true,
  watch: argv.indexOf('--watch') !== -1,
  external: ['react', 'react-dom', 'wagmi', 'ethers', '@wagmi/core'],
  platform: 'browser',
  loader: { '.svg': 'dataurl' },
  plugins: [
    cssModulesPlugin(),
    NodeModulesPolyfillPlugin(),
    NodeGlobalPolyfillPlugin({
      process: true,
      buffer: true,
    }),
  ],
});

esbuild.build({
  logLevel: 'info',
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  target: 'es2020',
  format: 'cjs',
  watch: argv.indexOf('--watch') !== -1,
  loader: { '.svg': 'dataurl' },
  outfile: './dist/index.cjs.js',
  outbase: './src',
  treeShaking: true,
  external: ['react', 'react-dom'],
  plugins: [cssModulesPlugin()],
});
