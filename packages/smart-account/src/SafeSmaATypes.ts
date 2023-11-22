import type { Chain, Hex, Transport } from 'viem'
import type { SmartAccount } from 'permissionless/accounts'

// -- Types ----------------------------------------------------------------------------------------
export type SafeVersion = '1.4.1'

export type PrivateKeySafeSmartAccount<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined
> = SmartAccount<'privateKeySafeSmartAccount', transport, chain>

export type SmartAccountEnabledChain = 11155111

export interface CreateSafeSmartAccountArgs {
  chainId: SmartAccountEnabledChain
  ownerAddress: Hex
  ownerSignMessage: (args: unknown) => Promise<string>
  ownerSignTypedData: (args: unknown) => Promise<string>
}
