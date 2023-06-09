/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { AuthClientTypes } from '@walletconnect/auth-client'
import { AuthClient, generateNonce } from '@walletconnect/auth-client'
import type { WalletConnectModalConfig } from '@walletconnect/modal'
import { WalletConnectModal } from '@walletconnect/modal'

// -- Types ----------------------------------------------------------------
export interface Web3ModalAuthOptions {
  projectId: string
  metadata: AuthClientTypes.Metadata
  modalOptions?: Omit<WalletConnectModalConfig, 'projectId' | 'walletConnectVersion'>
}

export interface Web3ModalAuthSignInArguments {
  statement: string
  chainId?: string
  aud?: string
  domain?: string
}

// -- Client ---------------------------------------------------------------
export class Web3ModalAuth {
  #options: Web3ModalAuthOptions
  #modal: WalletConnectModal
  #initAuthClientPromise?: Promise<void> = undefined
  #authClient?: InstanceType<typeof AuthClient> = undefined

  public constructor(options: Web3ModalAuthOptions) {
    this.#options = options
    this.#modal = this.#initModal()
    this.#initAuthClient()
  }

  // -- public ------------------------------------------------------------
  public async signIn(args: Web3ModalAuthSignInArguments) {
    const { chainId, statement, aud, domain } = args
    const defaultChainId = chainId ?? 'eip155:1'
    const defaultAud = aud ?? location.href
    const defaultDomain = domain ?? location.host

    return new Promise<{ valid: boolean; address: string; cacao: Record<string, string> }>(
      async (resolve, reject) => {
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
          // @ts-expect-error - result exists
          if (params.result) {
            resolve({
              valid: true,
              // @ts-expect-error - result exists
              address: params.result.p.iss.split(':')[4],
              // @ts-expect-error - result exists
              cacao: params.result
            })
          } else {
            // @ts-expect-error - message exists
            reject(new Error(params.message))
          }
        })

        const { uri } = await this.#authClient!.request({
          aud: defaultAud,
          domain: defaultDomain,
          chainId: defaultChainId,
          type: 'eip4361',
          nonce: generateNonce(),
          statement
        })

        if (uri) {
          await this.#modal.openModal({ uri, standaloneChains: [defaultChainId] })
        }
      }
    )
  }

  // -- private -----------------------------------------------------------
  #initModal() {
    const { modalOptions, projectId } = this.#options

    return new WalletConnectModal({
      ...modalOptions,
      enableAuthMode: true,
      walletConnectVersion: 2,
      projectId
    })
  }

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
