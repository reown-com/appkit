import type {
  CreateSiweMessageArgs,
  VerifySiweMessageArgs,
  SiweControllerClient,
  PublicStateControllerState,
  SiweControllerClientState
} from '@web3modal/core'
import { Web3ModalScaffold, type ScaffoldOptions } from '@web3modal/scaffold'

// -- Types ---------------------------------------------------------------------
export interface Web3ModalSiweClientOptions extends ScaffoldOptions {
  siweConfig: SiweControllerClient
}

export type Web3ModalState = PublicStateControllerState & SiweControllerClientState

// -- Client --------------------------------------------------------------------
export class Web3ModalSiwe extends Web3ModalScaffold {
  private options: Web3ModalSiweClientOptions | undefined = undefined

  public constructor(options: Web3ModalSiweClientOptions) {
    const { siweConfig, ...w3mOptions } = options

    const siweControllerClient: SiweControllerClient = {
      getNonce: async () => {
        const nonce = await siweConfig.getNonce()
        if (!nonce) {
          throw new Error('siweControllerClient:getNonce - nonce is undefined')
        }

        return nonce
      },
      createMessage: (args: CreateSiweMessageArgs) => {
        const message = siweConfig.createMessage(args)

        if (!message) {
          throw new Error('siweControllerClient:createMessage - message is undefined')
        }

        return message
      },

      verifyMessage: async (args: VerifySiweMessageArgs) => {
        const isValid = await siweConfig.verifyMessage(args)

        if (!isValid) {
          throw new Error('siweControllerClient:createMessage - message is not valid')
        }

        return isValid
      },

      getSession: async () => {
        const session = await siweConfig.getSession()
        if (!session) {
          throw new Error('siweControllerClient:getSession - session is undefined')
        }

        return session
      },
      signOut: async () => siweConfig.signOut()
    }

    super({
      ...w3mOptions,
      siweControllerClient
    })

    this.options = options
  }

  // -- Public ------------------------------------------------------------------
  public override getState() {
    const state = super.getState()

    return state
  }

  public override subscribeState(callback: (state: Web3ModalState) => void) {
    return super.subscribeState(state => callback(state))
  }
}
