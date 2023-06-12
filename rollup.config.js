import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import esbuild from 'rollup-plugin-esbuild'
import litCss from 'rollup-plugin-lit-css'
import minifyHtml from 'rollup-plugin-minify-html-literals'

export default function createConfig(packageJson, scriptBundleName) {
  const esbuildPluginEs = esbuild({
    minify: true,
    tsconfig: 'tsconfig.json',
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

  const plugnsCommon = [replacePlugin, litCssPlugin, minifyHtml.default()]
  const pluginsEs = [...plugnsCommon, esbuildPluginEs]
  const pluginsUmd = [...plugnsCommon, esbuildPluginEs, nodeResolve(), commonjs(), json()]

  const config = [
    {
      input: './index.ts',
      plugins: pluginsEs,
      output: [
        { file: './dist/index.es.js', format: 'es', exports: 'named', name: packageJson.name }
      ]
    }
  ]

  if (scriptBundleName) {
    config.push({
      input: './index.ts',
      inlineDynamicImports: true,
      plugins: pluginsUmd,
      output: [
        { file: './dist/index.bundle.js', format: 'es', exports: 'named', name: scriptBundleName }
      ]
    })
  }

  return config
}
