import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import esbuild from 'rollup-plugin-esbuild'
import litCss from 'rollup-plugin-lit-css'
import minifyHtml from 'rollup-plugin-minify-html-literals'

const nodeVersion = Number(process.versions.node.split('.')[0])
if (nodeVersion < 16) {
  throw new Error('Node version must be 16.x or higher')
}

export default function createConfig(packageJson) {
  const output = {
    exports: 'named',
    name: packageJson.name,
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
      output: [{ file: './dist/index.js', format: 'es', ...output }]
    },
    {
      input: './index.ts',
      plugins: [
        replacePlugin,
        litCssPlugin,
        minifyHtml.default(),
        esbuildPlugin,
        json(),
        commonjs({ include: /node_modules/, requireReturnsDefault: 'auto' }),
        resolve()
      ],
      output: [
        {
          file: './umd/index.js',
          format: 'umd',
          inlineDynamicImports: true,
          extend: true,
          ...output
        }
      ]
    }
  ]
}
