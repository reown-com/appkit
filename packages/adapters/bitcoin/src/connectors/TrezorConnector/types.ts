import type { CaipNetwork } from '@reown/appkit-common'

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

  export type ConstructorParams = {
    requestedChains: CaipNetwork[]
  }

  export type GetWalletParams = {
    requestedChains: CaipNetwork[]
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

  export type SignTransactionParams = {
    inputs: TrezorInput[]
    outputs: (TrezorOutput | TrezorChangeOutput)[]
    coin: string
    version?: number
    locktime?: number
  }
}
