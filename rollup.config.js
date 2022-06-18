import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pluginJson from '@rollup/plugin-json';
import nodeExternals from 'rollup-plugin-node-externals';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import polyfill from 'rollup-plugin-polyfill-node';

import packageJson from './package.json';

const extensions = ['.js', '.ts', '.tsx'];

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      resolve({
        browser: true,
      }),
      polyfill({
        include: ['browser', 'process'],
      }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      pluginJson(),
      peerDepsExternal(),
    ],
    external: ['react', 'react-dom'],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/types.d.ts' }],
    plugins: [dts()],
    inlineDynamicImports: true,
  },
];
