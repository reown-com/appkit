/* eslint-disable @typescript-eslint/no-non-null-assertion */
import SignClient from '@walletconnect/sign-client'
import type { Web3ModalConfig } from '@web3modal/standalone'
import { Web3Modal } from '@web3modal/standalone'

// -- Types ----------------------------------------------------------------
export type Web3ModalSignSession = SignClient['session']['values'][number]

export interface Web3ModalSignOptions {
  projectId: string
  metadata: SignClient['metadata']
  relayUrl?: string
  modalOptions?: Omit<Web3ModalConfig, 'projectId' | 'walletConnectVersion'>
}

export type Web3ModalSignConnectArguments = Parameters<SignClient['connect']>[0]

export type Web3ModalSignRequestArguments = Parameters<SignClient['request']>[0]

export type Web3ModalSignDisconnectArguments = Parameters<SignClient['disconnect']>[0]

// -- Client ---------------------------------------------------------------
export class Web3ModalSign {
  #options: Web3ModalSignOptions
  #modal?: Web3Modal
  #initSignClientPromise?: Promise<void> = undefined
  #signClient?: InstanceType<typeof SignClient> = undefined

  public constructor(options: Web3ModalSignOptions) {
    this.#options = options
    this.#initModal()
    this.#initSignClient()
  }

  // -- public ------------------------------------------------------------
  public async connect(args: Web3ModalSignConnectArguments) {
    const { requiredNamespaces, optionalNamespaces } = args

    return new Promise<Web3ModalSignSession>(async (resolve, reject) => {
      if (!this.#signClient) {
        await this.#initSignClient()
      }

      const unsubscribeModal = this.#modal!.subscribeModal(state => {
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
        await this.#modal!.openModal({ uri, standaloneChains: Array.from(standaloneChains) })
      }

      const session = await approval()
      unsubscribeModal()
      this.#modal!.closeModal()

      resolve(session)
    })
  }

  public async disconnect(args: Web3ModalSignDisconnectArguments) {
    if (!this.#signClient) {
      await this.#initSignClient()
    }
    await this.#signClient!.disconnect(args)
  }

  public async request<Result>(args: Web3ModalSignRequestArguments) {
    if (!this.#signClient) {
      await this.#initSignClient()
    }

    const result = await this.#signClient!.request(args)

    return result as Result
  }

  public async getActiveSession() {
    if (!this.#signClient) {
      await this.#initSignClient()
    }

    return this.#signClient!.session.getAll().at(-1)
  }

  // -- private -----------------------------------------------------------
  #initModal() {
    const { modalOptions, projectId } = this.#options
    this.#modal = new Web3Modal({
      ...modalOptions,
      walletConnectVersion: 2,
      projectId
    })
  }

  async #initSignClient() {
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
  }
}
