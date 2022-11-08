import esbuild from 'rollup-plugin-esbuild'
import minifyHtml from 'rollup-plugin-minify-html-literals'
import litcss from 'rollup-plugin-lit-css'

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
        litcss({
          include: ['*/**/*.css'],
          uglify: true
        })
      ],
      output: [{ file: './dist/index.js', format: 'es', ...sharedOutput }]
    }
  ]
}
