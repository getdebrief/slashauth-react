// const replaceNodeBuiltIns = () => {
//   const replace = {
//     crypto: require.resolve('crypto-browserify'),
//     stream: require.resolve('stream-browserify'),
//     assert: require.resolve('assert'),
//     http: require.resolve('stream-http'),
//     https: require.resolve('https-browserify'),
//     os: require.resolve('os-browserify'),
//     url: require.resolve('url'),
//   };
//   const filter = RegExp(`^(${Object.keys(replace).join('|')})$`);
//   return {
//     name: 'replaceNodeBuiltIns',
//     setup(build) {
//       build.onResolve({ filter }, (arg) => ({
//         path: replace[arg.path],
//       }));
//     },
//   };
// };

// require('esbuild')
//   .build({
//     format: 'esm',
//     outdir: './dist',
//     outbase: './src',
//     minify: true,
//     pure: ['React.createElement'],
//     platform: 'browser',
//     target: 'es2019',
//     entryPoints: process.argv.slice(1),
//     plugins: [replaceNodeBuiltIns()],
//   })
//   .catch(() => process.exit(1));

// require('esbuild')
//   .build({
//     format: 'esm',
//     outfile: './dist/slashauth-react.esm.js',
//     outbase: './src',
//     minify: true,
//     pure: ['React.createElement'],
//     platform: 'browser',
//     target: 'es2019',
//     entryPoints: ['./src/index.ts'],
//     plugins: [replaceNodeBuiltIns()],
//   })
//   .catch(() => process.exit(1));

// const build = require('esbuild');
const NodeModulesPolyfillPlugin =
  require('@esbuild-plugins/node-modules-polyfill').NodeModulesPolyfillPlugin;

const NodeGlobalPolyfillPlugin =
  require('@esbuild-plugins/node-globals-polyfill').NodeGlobalsPolyfillPlugin;
// import { build } from 'esbuild';
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

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
