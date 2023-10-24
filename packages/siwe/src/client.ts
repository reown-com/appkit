import {
  type CreateSIWEMessageArgs,
  type VerifySIWEMessageArgs,
  type SIWEControllerClient
} from '@web3modal/core'

// -- Types ---------------------------------------------------------------------
export interface Web3ModalSIWEClientOptions {
  siweConfig: SIWEControllerClient
}

// -- Client --------------------------------------------------------------------
export class Web3ModalSIWEClient {
  private options: Web3ModalSIWEClientOptions

  public client: SIWEControllerClient

  public constructor(options: Web3ModalSIWEClientOptions) {
    this.options = options

    this.client = {
      getNonce: async () => {
        const nonce = await this.options.siweConfig.getNonce()
        if (!nonce) {
          throw new Error('siweControllerClient:getNonce - nonce is undefined')
        }

        return nonce
      },
      createMessage: (args: CreateSIWEMessageArgs) => {
        const message = this.options.siweConfig.createMessage(args)

        if (!message) {
          throw new Error('siweControllerClient:createMessage - message is undefined')
        }

        return message
      },

      verifyMessage: async (args: VerifySIWEMessageArgs) => {
        const isValid = await this.options.siweConfig.verifyMessage(args)

        if (!isValid) {
          throw new Error('siweControllerClient:createMessage - message is not valid')
        }

        return isValid
      },

      getSession: async () => {
        const session = await this.options.siweConfig.getSession()
        if (!session) {
          throw new Error('siweControllerClient:getSession - session is undefined')
        }

        return session
      },
      signOut: async () => await this.options.siweConfig.signOut()
    }
  }
}
