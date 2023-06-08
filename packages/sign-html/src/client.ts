/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { WalletConnectModalConfig } from '@walletconnect/modal'
import { WalletConnectModal } from '@walletconnect/modal'
import SignClient from '@walletconnect/sign-client'

// -- Types ----------------------------------------------------------------
export type Web3ModalSignSession = SignClient['session']['values'][number]

export interface Web3ModalSignOptions {
  projectId: string
  metadata: SignClient['metadata']
  relayUrl?: string
  modalOptions?: Omit<WalletConnectModalConfig, 'projectId' | 'walletConnectVersion'>
}

export type Web3ModalSignConnectArguments = Parameters<SignClient['connect']>[0]

export type Web3ModalSignRequestArguments = Parameters<SignClient['request']>[0]

export type Web3ModalSignDisconnectArguments = Parameters<SignClient['disconnect']>[0]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Web3ModalEventCallback = (data: any) => void

// -- Client ---------------------------------------------------------------
export class Web3ModalSign {
  #options: Web3ModalSignOptions
  #modal: WalletConnectModal
  #initSignClientPromise?: Promise<void> = undefined
  #signClient?: InstanceType<typeof SignClient> = undefined

  public constructor(options: Web3ModalSignOptions) {
    this.#options = options
    this.#modal = this.#initModal()
    this.#initModal()
    this.#initSignClient()
  }

  // -- public ------------------------------------------------------------
  public async connect(args: Web3ModalSignConnectArguments) {
    const { requiredNamespaces, optionalNamespaces } = args

    return new Promise<Web3ModalSignSession>(async (resolve, reject) => {
      await this.#initSignClient()

      const unsubscribeModal = this.#modal.subscribeModal(state => {
        if (!state.open) {
          unsubscribeModal()
          reject(new Error('Modal closed'))
        }
      })

      const { uri, approval } = await this.#signClient!.connect(args)

      if (uri) {
        const standaloneChains = new Set<string>()
        if (requiredNamespaces) {
          Object.values(requiredNamespaces).forEach(({ chains }) => {
            if (chains) {
              chains.forEach(chain => standaloneChains.add(chain))
            }
          })
        }
        if (optionalNamespaces) {
          Object.values(optionalNamespaces).forEach(({ chains }) => {
            if (chains) {
              chains.forEach(chain => standaloneChains.add(chain))
            }
          })
        }
        await this.#modal.openModal({ uri, standaloneChains: Array.from(standaloneChains) })
      }

      try {
        const session = await approval()
        resolve(session)
      } catch (err) {
        reject(err)
      } finally {
        unsubscribeModal()
        this.#modal.closeModal()
      }
    })
  }

  public async disconnect(args: Web3ModalSignDisconnectArguments) {
    await this.#initSignClient()
    await this.#signClient!.disconnect(args)
  }

  public async request<Result>(args: Web3ModalSignRequestArguments) {
    await this.#initSignClient()

    const result = await this.#signClient!.request(args)

    return result as Result
  }

  public async getSessions() {
    await this.#initSignClient()

    return this.#signClient!.session.getAll()
  }

  public async getSession() {
    await this.#initSignClient()

    return this.#signClient!.session.getAll().at(-1)
  }

  public async onSessionEvent(callback: Web3ModalEventCallback) {
    await this.#initSignClient()
    this.#signClient!.on('session_event', callback)
  }

  public async offSessionEvent(callback: Web3ModalEventCallback) {
    await this.#initSignClient()
    this.#signClient!.off('session_event', callback)
  }

  public async onSessionUpdate(callback: Web3ModalEventCallback) {
    await this.#initSignClient()
    this.#signClient!.on('session_update', callback)
  }

  public async offSessionUpdate(callback: Web3ModalEventCallback) {
    await this.#initSignClient()
    this.#signClient!.off('session_update', callback)
  }

  public async onSessionDelete(callback: Web3ModalEventCallback) {
    await this.#initSignClient()
    this.#signClient!.on('session_delete', callback)
  }

  public async offSessionDelete(callback: Web3ModalEventCallback) {
    await this.#initSignClient()
    this.#signClient!.off('session_delete', callback)
  }

  public async onSessionExpire(callback: Web3ModalEventCallback) {
    await this.#initSignClient()
    this.#signClient!.on('session_expire', callback)
  }

  public async offSessionExpire(callback: Web3ModalEventCallback) {
    await this.#initSignClient()
    this.#signClient!.off('session_expire', callback)
  }

  // -- private -----------------------------------------------------------
  #initModal() {
    const { modalOptions, projectId } = this.#options

    return new WalletConnectModal({
      ...modalOptions,
      walletConnectVersion: 2,
      projectId
    })
  }

  async #initSignClient() {
    if (this.#signClient) {
      return true
    }

    if (!this.#initSignClientPromise && typeof window !== 'undefined') {
      this.#initSignClientPromise = this.#createSignClient()
    }

    return this.#initSignClientPromise
  }

  async #createSignClient() {
    this.#signClient = await SignClient.init({
      metadata: this.#options.metadata,
      projectId: this.#options.projectId,
      relayUrl: this.#options.relayUrl
    })
    const clientId = await this.#signClient.core.crypto.getClientId()
    localStorage.setItem('W3M_WALLETCONNECT_CLIENT_ID', clientId)
  }
}
