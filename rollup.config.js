import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import minifyHtmlLiterals from 'rollup-plugin-minify-html-literals'

export default function createConfig(packageName) {
  const sharedOutput = {
    exports: 'named',
    name: packageName,
    sourcemap: true
  }

  const esbuildPlugin = esbuild({
    minify: true,
    tsconfig: './tsconfig.json',
    platform: 'browser',
    treeShaking: true,
    loaders: {
      '.json': 'json'
    }
  })

  return [
    {
      input: './index.ts',
      plugins: [minifyHtmlLiterals(), esbuildPlugin],
      output: [{ file: './dist/index.js', format: 'es', ...sharedOutput }]
    },
    {
      input: './index.ts',
      plugins: [
        minifyHtmlLiterals(),
        nodeResolve({ browser: true, preferBuiltins: true }),
        json(),
        commonjs(),
        esbuildPlugin
      ],
      output: [
        { file: './dist/index.umd.js', format: 'umd', inlineDynamicImports: true, ...sharedOutput }
      ]
    }
  ]
}
