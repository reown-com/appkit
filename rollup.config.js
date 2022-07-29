import esbuild from 'rollup-plugin-esbuild'

export default function createConfig(packageName, packageDependencies) {
  return [
    {
      input: './index.ts',
      plugins: [
        esbuild({
          minify: true,
          tsconfig: './tsconfig.json',
          platform: 'browser',
          treeShaking: true
        })
      ],
      output: {
        file: './dist/index.js',
        format: 'es',
        exports: 'named',
        name: packageName,
        sourcemap: true
      }
    }
  ]
}
