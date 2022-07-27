import { Config } from '@stencil/core'

export const config: Config = {
  namespace: 'web3modal-core',
  enableCache: false,
  invisiblePrehydration: false,
  sourceMap: true,
  devServer: {
    reloadStrategy: 'pageReload'
  },
  outputTargets: [
    {
      type: 'dist'
    }
  ]
}
