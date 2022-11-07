import esbuild from 'rollup-plugin-esbuild'
import minifyHtml from 'rollup-plugin-minify-html-literals'
import scss from 'rollup-plugin-scss'
import autoprefixer from 'autoprefixer'
import postcss from 'postcss'

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
      plugins: [
        minifyHtml.default(),
        esbuildPlugin,
        scss({
          output: false,
          processor: () => postcss([autoprefixer()]),
          failOnError: true,
          outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : undefined
        })
      ],
      output: [{ file: './dist/index.js', format: 'es', ...sharedOutput }]
    }
  ]
}
