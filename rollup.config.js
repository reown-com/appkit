import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import minifyHtmlLiterals from 'rollup-plugin-minify-html-literals'

export default function createConfig(packageName) {
  const sharedOutput = {
    exports: 'named',
    name: packageName,
    sourcemap: true
  }

  const esbuildConfig = {
    minify: true,
    tsconfig: './tsconfig.json',
    platform: 'browser',
    treeShaking: true
  }

  return [
    {
      input: './index.ts',
      plugins: [minifyHtmlLiterals(), esbuild(esbuildConfig)],
      output: [{ file: './dist/index.js', format: 'es', ...sharedOutput }]
    },
    {
      input: './index.ts',
      plugins: [
        minifyHtmlLiterals(),
        nodeResolve({ browser: true }),
        commonjs(),
        esbuild(esbuildConfig)
      ],
      output: [
        { file: './dist/index.umd.js', format: 'umd', inlineDynamicImports: true, ...sharedOutput }
      ]
    }
  ]
}
