/* eslint-disable @typescript-eslint/no-var-requires */
const NodeModulesPolyfillPlugin =
  require('@esbuild-plugins/node-modules-polyfill').NodeModulesPolyfillPlugin;

const NodeGlobalPolyfillPlugin =
  require('@esbuild-plugins/node-globals-polyfill').NodeGlobalsPolyfillPlugin;

const { nodeExternalsPlugin } = require('esbuild-node-externals');

const esbuild = require('esbuild');

esbuild.build({
  logLevel: 'info',
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: false,
  target: 'es2019',
  format: 'esm',
  outfile: './dist/index.esm.js',
  outbase: './src',
  treeShaking: true,
  external: ['react', 'react-dom'],
  plugins: [
    NodeModulesPolyfillPlugin(),
    NodeGlobalPolyfillPlugin({
      process: true,
      buffer: true,
    }),
  ],
  watch: {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error);
      else console.log('watch build succeeded:', result);
    },
  },
});

esbuild.build({
  logLevel: 'info',
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  target: 'es2019',
  format: 'cjs',
  outfile: './dist/index.cjs.js',
  outbase: './src',
  treeShaking: true,
  external: ['react', 'react-dom'],
  plugins: [],
  platform: 'node',
  watch: {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error);
      else console.log('watch build succeeded:', result);
    },
  },
});
