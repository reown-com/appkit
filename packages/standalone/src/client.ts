import type { ConfigCtrlState } from '@web3modal/core'
import { ConfigCtrl, ModalCtrl } from '@web3modal/core'

/**
 * Types
 */
type Web3ModalConfig = Omit<ConfigCtrlState, 'enableStandaloneMode'>
type OpenOptions = Parameters<typeof ModalCtrl.open>[0]

/**
 * Client
 */
export class Web3Modal {
  private initialized = false
  private queueOpen = false
  private queueOpenOptions: OpenOptions = undefined

  public constructor(config: Web3ModalConfig) {
    ConfigCtrl.setConfig({ enableStandaloneMode: true, ...config })
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
}
