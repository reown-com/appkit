/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { AuthClientTypes } from '@walletconnect/auth-client'
import { AuthClient, generateNonce } from '@walletconnect/auth-client'
import type { Web3ModalConfig } from '@web3modal/standalone'
import { Web3Modal } from '@web3modal/standalone'

// -- Types ----------------------------------------------------------------
export interface Web3ModalAuthOptions {
  projectId: string
  metadata: AuthClientTypes.Metadata
  modalOptions?: Omit<Web3ModalConfig, 'projectId' | 'walletConnectVersion'>
}

export interface Web3ModalAuthConnectArguments {
  statement: string
}

// -- Client ---------------------------------------------------------------
export class Web3ModalAuth {
  #modal: Web3Modal
  #options: Web3ModalAuthOptions
  #initAuthClientPromise?: Promise<void> = undefined
  #authClient?: InstanceType<typeof AuthClient> = undefined

  public constructor(options: Web3ModalAuthOptions) {
    this.#options = options
    const { projectId, modalOptions } = options
    this.#modal = new Web3Modal({
      ...modalOptions,
      walletConnectVersion: 2,
      projectId
    })
    this.#initAuthClient()
  }

  // -- public ------------------------------------------------------------
  public async connect(args: Web3ModalAuthConnectArguments) {
    return new Promise(async (resolve, reject) => {
      if (!this.#authClient) {
        await this.#initAuthClient()
      }

      const unsubscribeModal = this.#modal.subscribeModal(state => {
        if (!state.open) {
          unsubscribeModal()
          reject(new Error('Modal closed'))
        }
      })

      this.#authClient!.once('auth_response', ({ params }) => {
        unsubscribeModal()
        this.#modal.closeModal()
        // @ts-expect-error yes it is
        if (params.result?.s && params.result?.p) {
          resolve({
            // @ts-expect-error yes it is
            signature: params.result.s.s,
            // @ts-expect-error yes it is
            address: params.result.p.iss.split(':')[4]
          })
        } else {
          // @ts-expect-error yes it is
          reject(new Error(params.message))
        }
      })

      const { uri } = await this.#authClient!.request({
        aud: window.location.href,
        domain: window.location.hostname.split('.').slice(-2).join('.'),
        chainId: 'eip155:1',
        type: 'eip4361',
        nonce: generateNonce(),
        statement: args.statement
      })

      if (uri) {
        await this.#modal.openModal({ uri })
      }
    })
  }

  // -- private -----------------------------------------------------------
  async #initAuthClient() {
    if (!this.#initAuthClientPromise && typeof window !== 'undefined') {
      this.#initAuthClientPromise = this.#createAuthClient()
    }

    return this.#initAuthClientPromise
  }

  async #createAuthClient() {
    this.#authClient = await AuthClient.init({
      metadata: this.#options.metadata,
      projectId: this.#options.projectId
    })
  }
}
