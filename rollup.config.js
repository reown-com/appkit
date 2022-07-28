import esbuild from 'rollup-plugin-esbuild'

export default function createConfig(packageName, packageDependencies) {
  return [
    {
      input: './index.ts',
      plugins: [
        esbuild({
          minify: true,
          tsconfig: './tsconfig.json'
        })
      ],
      external: packageDependencies,
      output: [
        {
          file: './dist/index.cjs.js',
          format: 'cjs',
          exports: 'named',
          name: packageName,
          sourcemap: true
        },
        {
          file: './dist/index.es.js',
          format: 'es',
          exports: 'named',
          name: packageName,
          sourcemap: true
        },
        {
          file: './dist/index.umd.js',
          format: 'umd',
          exports: 'named',
          name: packageName,
          sourcemap: true
        }
      ]
    }
  ]
}
