import * as ts from 'typescript';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';

import pkg from './package.json';

const basicOptions = {
  input: './index.ts',

  context: 'window',

  plugins: [
    typescript({
      typescript: ts,
      useTsconfigDeclarationDir: true,
    }),
    json(),
    commonjs({
      include: /node_modules/,
    }),
  ],
};

const umdOptions = {
  ...basicOptions,
  output: [
    {
      format: 'umd',
      name: 'KhulnasoftLab', // or another valid identifier, no dashes
      file: 'dist/index.umd.js',
      sourcemap: true,
      amd: {
        id: '@khulnasoft.com/sdk',
      },
    },
  ],
  plugins: basicOptions.plugins.concat([resolve()]),
};

const umdMinOptions = {
  ...basicOptions,
  output: [
    {
      format: 'umd',
      name: 'KhulnasoftLab', // or another valid identifier, no dashes
      file: pkg.unpkg,
      sourcemap: true,
      amd: {
        id: '@khulnasoft.com/sdk',
      },
    },
  ],
  plugins: basicOptions.plugins.concat([resolve(), uglify()]),
};

const externalModuleOptions = {
  ...basicOptions,
  output: [
    {
      format: 'cjs',
      file: pkg.main,
      sourcemap: true,
    },
    {
      format: 'es',
      file: pkg.module,
      sourcemap: true,
    },
  ],
  // Only mark dependencies as external, except react and react-dom
  external: Object.keys(pkg.dependencies || {}).filter(
    dep => dep !== 'react' && dep !== 'react-dom'
  ),
  plugins: basicOptions.plugins.concat([
    resolve({
      only: [/^\.{0,2}\//],
    }),
  ]),
};

export default [umdOptions, umdMinOptions, externalModuleOptions];
