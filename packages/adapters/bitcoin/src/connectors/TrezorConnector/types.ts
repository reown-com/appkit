import type { CaipNetwork, CaipNetworkId } from '@reown/appkit-common'

export namespace TrezorConnector {
  export type Network = 'Bitcoin' | 'Testnet'

  export type ScriptType =
    | 'SPENDADDRESS'
    | 'SPENDMULTISIG'
    | 'SPENDWITNESS'
    | 'SPENDP2SHWITNESS'
    | 'SPENDTAPROOT'

  export type InputScriptType =
    | 'SPENDADDRESS'
    | 'SPENDMULTISIG'
    | 'SPENDWITNESS'
    | 'SPENDP2SHWITNESS'
    | 'SPENDTAPROOT'

  export type OutputScriptType =
    | 'PAYTOADDRESS'
    | 'PAYTOMULTISIG'
    | 'PAYTOWITNESS'
    | 'PAYTOP2SHWITNESS'
    | 'PAYTOTAPROOT'
    | 'PAYTOOPRETURN'

  /**
   * Blockbook endpoints per network, used by TrezorConnect to fetch the previous
   * transactions it needs to verify inputs before signing. Override to point at a
   * self-hosted instance.
   */
  export type BlockbookUrls = Partial<Record<Network, string[]>>

  export type ConstructorParams = {
    requestedChains: CaipNetwork[]
    /**
     * The active bip122 network. Without it the connector cannot know whether to
     * derive mainnet or testnet paths, and would default to mainnet on a
     * testnet-only dapp.
     */
    requestedCaipNetworkId?: CaipNetworkId
    blockbookUrls?: BlockbookUrls
  }

  export type GetWalletParams = {
    requestedChains: CaipNetwork[]
    requestedCaipNetworkId?: CaipNetworkId
    blockbookUrls?: BlockbookUrls
  }

  export type TrezorInput = {
    address_n: number[]
    prev_hash: string
    prev_index: number
    amount: string
    script_type: InputScriptType
    sequence?: number
  }

  export type TrezorOutput = {
    address: string
    amount: string
    script_type: OutputScriptType
  }

  export type TrezorChangeOutput = {
    address_n: number[]
    amount: string
    script_type: OutputScriptType
  }

  /**
   * OP_RETURN outputs carry their payload as hex and must have a zero amount;
   * they have neither an address nor a derivation path.
   */
  export type TrezorOpReturnOutput = {
    op_return_data: string
    amount: '0'
    script_type: 'PAYTOOPRETURN'
  }

  export type AnyTrezorOutput = TrezorOutput | TrezorChangeOutput | TrezorOpReturnOutput

  /**
   * A previous transaction, supplied so the device can verify input amounts
   * without consulting a backend.
   */
  export type TrezorRefTransaction = {
    hash: string
    version: number
    lock_time: number
    inputs: {
      prev_hash: string
      prev_index: number
      script_sig: string
      sequence: number
    }[]
    bin_outputs: {
      amount: string
      script_pubkey: string
    }[]
  }

  export type SignTransactionParams = {
    inputs: TrezorInput[]
    outputs: AnyTrezorOutput[]
    coin: string
    version?: number
    locktime?: number
  }
}
