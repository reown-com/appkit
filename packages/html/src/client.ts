import type { ConfigCtrlState } from '@web3modal/core'
import { ClientCtrl, ConfigCtrl, ModalCtrl, OptionsCtrl } from '@web3modal/core'
import type { EthereumClient } from '@web3modal/ethereum'

/**
 * Types
 */
type Web3ModalConfig = Omit<ConfigCtrlState, 'enableStandaloneMode' | 'standaloneChains'>
type OpenOptions = Parameters<typeof ModalCtrl.open>[0]

/**
 * Client
 */
export class Web3Modal {
  private initialized = false
  private queueOpen = false
  private queueOpenOptions: OpenOptions = undefined

  public constructor(config: Web3ModalConfig, client: EthereumClient) {
    ClientCtrl.setEthereumClient(client)
    ConfigCtrl.setConfig(config)
    this.initUi()
  }

  private async initUi() {
    if (typeof window !== 'undefined') {
      await import('@web3modal/ui')
      const modal = document.createElement('w3m-modal')
      document.body.insertAdjacentElement('beforeend', modal)
    }
    this.initialized = true
    if (this.queueOpen) {
      this.openModal(this.queueOpenOptions)
      this.queueOpenOptions = undefined
      this.queueOpen = false
    }
  }

  public openModal = (options?: OpenOptions) => {
    if (this.initialized) {
      ModalCtrl.open(options)
    } else {
      this.queueOpen = true
      this.queueOpenOptions = options
    }
  }

  public closeModal = ModalCtrl.close

  public subscribeModal = ModalCtrl.subscribe

  public setTheme = ConfigCtrl.setThemeConfig

  public setSelectedChain = OptionsCtrl.setSelectedChain

  public getSelectedChain = OptionsCtrl.setSelectedChain

  public subscribeSelectedChain = OptionsCtrl.subscribe
}
