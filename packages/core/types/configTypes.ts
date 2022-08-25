import type { EthereumClient } from '@web3modal/ethereum'

export interface ConfigOptions {
  projectId: string
  theme?: 'dark' | 'light'
  accentColor?:
    | 'blackWhite'
    | 'blue'
    | 'default'
    | 'green'
    | 'magenta'
    | 'orange'
    | 'purple'
    | 'teal'
  ethereumClient?: EthereumClient
}
