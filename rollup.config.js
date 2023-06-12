import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import esbuild from 'rollup-plugin-esbuild'
import litCss from 'rollup-plugin-lit-css'
import minifyHtml from 'rollup-plugin-minify-html-literals'
import polyfillNode from 'rollup-plugin-polyfill-node'

export default function createConfig(packageJson) {
  const output = {
    exports: 'named',
    name: packageJson.name
  }

  const esbuildPlugin = esbuild({
    minify: true,
    tsconfig: './tsconfig.json',
    platform: 'browser',
    treeShaking: true,
    sourceMap: true,
    loaders: {
      '.json': 'json'
    }
  })

  const litCssPlugin = litCss({
    include: ['**/*.css'],
    uglify: true
  })

  const replacePlugin = replace({
    'process.env.ROLLUP_W3M_VERSION': JSON.stringify(packageJson.version)
  })

  const plugins = [replacePlugin, litCssPlugin, minifyHtml.default(), esbuildPlugin]

  return [
    {
      input: './index.ts',
      plugins,
      output: [{ file: './dist/index.es.js', format: 'es', ...output }]
    },
    {
      input: './index.ts',
      plugins: [...plugins],
      output: [
        {
          file: './dist/index.umd.js',
          format: 'umd',
          ...output
        }
      ]
    },
    {
      input: './index.ts',
      plugins: [
        ...plugins,
        json(),
        polyfillNode(),
        commonjs(),
        resolve({
          extensions: ['.js', '.json'],
          preferBuiltins: false
        })
      ],
      output: [
        {
          file: './dist/index.cjs',
          format: 'cjs',
          inlineDynamicImports: true,
          ...output
        }
      ]
    }
  ]
}
