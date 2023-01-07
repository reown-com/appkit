import esbuild from 'rollup-plugin-esbuild'
import litCss from 'rollup-plugin-lit-css'
import minifyHtml from 'rollup-plugin-minify-html-literals'

export default function createConfig(packageName) {
  const output = {
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

  const litCssPlugin = litCss({
    include: ['**/*.css'],
    uglify: true
  })

  return [
    {
      input: './index.ts',
      plugins: [litCssPlugin, minifyHtml.default(), esbuildPlugin],
      output: [{ file: './dist/index.js', format: 'es', ...output }]
    }
  ]
}
