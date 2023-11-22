import type { Address, Chain, Hex, Transport } from 'viem'
import type { SmartAccount } from 'permissionless/accounts'

// -- Types ----------------------------------------------------------------------------------------
export type SafeVersion = '1.4.1'

export type PrivateKeySafeSmartAccount<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined
> = SmartAccount<'privateKeySafeSmartAccount', transport, chain>

export type SmartAccountEnabledChain = 5 | 11155111

export interface CreateSafeSmartAccountArgs {
  ownerAddress: Hex
  ownerSignMessage: (args: unknown) => Promise<string>
  ownerSignTypedData: (args: unknown) => Promise<string>
  safeVersion: SafeVersion
  entryPoint: Address
  addModuleLibAddress?: Address
  safe4337ModuleAddress?: Address
  safeProxyFactoryAddress?: Address
  safeSingletonAddress?: Address
  saltNonce?: bigint
}
