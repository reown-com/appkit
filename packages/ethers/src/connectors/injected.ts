import { EthersConstantsUtil } from '../utils/EthersConstantsUtil.js'
import { EthersHelpersUtil } from '../utils/EthersHelpersUtil.js'
import { EthersStoreUtil } from '../utils/EthersStoreUtil.js'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import type { ConnectorType } from '@web3modal/core'
import type { Provider } from '../utils/EthersTypesUtil.js'

export type InjectedOptions = {
  id?: string
  type?: ConnectorType
  getProvider?: () => Provider | undefined
}

export class Injected {
  id: string
  type: ConnectorType
  getProvider: () => Provider | undefined

  constructor({ type, id, getProvider }: InjectedOptions = {}) {
    this.id = id ?? ConstantsUtil.INJECTED_CONNECTOR_ID
    this.type = type ?? 'INJECTED'
    if (getProvider) {
      this.getProvider = getProvider
    } else {
      this.getProvider = () => {
        if (typeof window !== 'undefined') {
          return window.ethereum as Provider | undefined
        }

        return undefined
      }
    }
  }

  checkActive() {
    const provider = this.getProvider()
    const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID)

    if (provider) {
      if (walletId === this.id) {
        this.setProvider(provider)
        this.watch()
      }
    }
  }

  async setProvider(provider: Provider) {
    window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, this.id)

    if (provider) {
      const { address, chainId } = await EthersHelpersUtil.getUserInfo(provider)
      if (address && chainId) {
        EthersStoreUtil.setChainId(chainId)
        EthersStoreUtil.setProviderType(this.type)
        EthersStoreUtil.setProvider(provider)
        EthersStoreUtil.setIsConnected(true)
        EthersStoreUtil.setAddress(address)
      }
    }
  }

  async connect() {
    const provider = this.getProvider()
    if (!provider) {
      throw new Error('provider is undefined')
    }
    try {
      EthersStoreUtil.setError(undefined)
      await provider.request({ method: 'eth_requestAccounts' })
      this.setProvider(provider)
    } catch (error) {
      EthersStoreUtil.setError(error)
    }
  }

  disconnect() {
    const provider = this.getProvider()

    localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
    EthersStoreUtil.reset()

    provider?.emit('disconnect')
  }

  watch() {
    const provider = this.getProvider()

    function disconnectHandler() {
      localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
      EthersStoreUtil.reset()

      provider?.removeListener('disconnect', disconnectHandler)
      provider?.removeListener('accountsChanged', accountsChangedHandler)
      provider?.removeListener('chainChanged', chainChangedHandler)
    }

    function accountsChangedHandler(accounts: string[]) {
      const currentAccount = accounts?.[0]
      if (currentAccount) {
        EthersStoreUtil.setAddress(currentAccount)
      } else {
        localStorage.removeItem(EthersConstantsUtil.WALLET_ID)
        EthersStoreUtil.reset()
      }
    }

    function chainChangedHandler(chainId: string) {
      if (chainId) {
        EthersStoreUtil.setChainId(Number(chainId))
      }
    }

    if (provider) {
      provider.on('disconnect', disconnectHandler)
      provider.on('accountsChanged', accountsChangedHandler)
      provider.on('chainChanged', chainChangedHandler)
    }
  }

  async switchNetwork(chainId: number) {
    const provider = this.getProvider()
    const chains = EthersStoreUtil.state.supportedChains
    const chain = chains.find(c => c.chainId === chainId)

    if (provider && chain) {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
        })
        EthersStoreUtil.setChainId(chain.chainId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (switchError: any) {
        if (
          switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
          switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
          switchError?.data?.originalError?.code ===
            EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
        ) {
          await EthersHelpersUtil.addEthereumChain(provider, chain)
        } else {
          throw new Error('Chain is not supported')
        }
      }
    } else if (!chain) {
      throw new Error('Chain is not supported')
    }
  }
}
