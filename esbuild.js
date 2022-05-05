const NodeModulesPolyfillPlugin =
  require('@esbuild-plugins/node-modules-polyfill').NodeModulesPolyfillPlugin;

const NodeGlobalPolyfillPlugin =
  require('@esbuild-plugins/node-globals-polyfill').NodeGlobalsPolyfillPlugin;

require('esbuild').build({
  logLevel: 'info',
  // entryPoints: process.argv.slice(1),
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  target: 'es2019',
  format: 'esm',
  outdir: './dist',
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
});
