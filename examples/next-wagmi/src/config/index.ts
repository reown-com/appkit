import { cookieStorage, createStorage } from '@wagmi/core'
import { EVMWagmiClient } from '@rerock/adapter-wagmi'

export const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const wagmiAdapter = new EVMWagmiClient({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true
})

export const config = wagmiAdapter.wagmiConfig
