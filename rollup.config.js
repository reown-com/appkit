import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import esbuild from 'rollup-plugin-esbuild'
import litCss from 'rollup-plugin-lit-css'
import minifyHtml from 'rollup-plugin-minify-html-literals'
import nodePolyfill from 'rollup-plugin-polyfill-node'

export default function createConfig(packageJson, isBundle = false) {
  const esbuildPluginEs = esbuild({
    minify: true,
    tsconfig: 'tsconfig.json',
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

  const plugnsCommon = [replacePlugin, litCssPlugin, minifyHtml.default()]
  const pluginsEs = [...plugnsCommon, esbuildPluginEs]
  const pluginsUmd = [
    ...plugnsCommon,
    esbuildPluginEs,
    nodeResolve({ browser: true }),
    commonjs(),
    json(),
    nodePolyfill()
  ]

  const config = [
    {
      input: './index.ts',
      plugins: pluginsEs,
      output: [{ file: './dist/index.js', format: 'es', sourcemap: true }]
    }
  ]

  if (isBundle) {
    config.push({
      input: './bundle.ts',
      plugins: pluginsUmd,
      output: [{ dir: './dist/cdn', format: 'es', sourcemap: true }]
    })
  }

  return config
}
