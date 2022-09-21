/* eslint-disable @typescript-eslint/no-var-requires */
const NodeModulesPolyfillPlugin =
  require('@esbuild-plugins/node-modules-polyfill').NodeModulesPolyfillPlugin;

const NodeGlobalPolyfillPlugin =
  require('@esbuild-plugins/node-globals-polyfill').NodeGlobalsPolyfillPlugin;

const cssModulesPlugin = require('esbuild-css-modules-plugin');

const esbuild = require('esbuild');

esbuild.build({
  logLevel: 'info',
  entryPoints: ['srcv2/index.ts'],
  bundle: true,
  minify: false,
  target: 'es2020',
  format: 'esm',
  outfile: './distv2/index.esm.js',
  outbase: './srcv2',
  treeShaking: true,
  external: ['react', 'react-dom'],
  plugins: [
    NodeModulesPolyfillPlugin(),
    NodeGlobalPolyfillPlugin({
      process: true,
      buffer: true,
    }),
  ],
});

esbuild.build({
  logLevel: 'info',
  entryPoints: ['srcv2/index.ts'],
  bundle: true,
  minify: false,
  target: 'es2020',
  format: 'cjs',
  outfile: './distv2/index.cjs.js',
  outbase: './srcv2',
  treeShaking: true,
  external: ['react', 'react-dom'],
  plugins: [cssModulesPlugin()],
});
