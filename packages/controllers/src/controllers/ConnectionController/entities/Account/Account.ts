import type { Balance, CaipAddress, ChainNamespace, SocialProvider } from '@reown/appkit-common'

import type { NamespaceTypeMap, PreferredAccountTypes } from '../../../../utils/TypeUtil.js'

export type Metadata = { label: string; icon: string }
export type AccountType = NamespaceTypeMap[ChainNamespace]
export type AccountProps = {
  address: string
  caipAddress: CaipAddress
  type: AccountType
  namespace: ChainNamespace
  metadata: Metadata
}
export type EmbeddedWalletProps = {
  userInfo?: Record<string, unknown>
  authProvider: SocialProvider
  accountType: PreferredAccountTypes[ChainNamespace]
  isSmartAccountDeployed: boolean
}

export abstract class Account {
  public address: string
  public caipAddress: CaipAddress
  public type: AccountType
  public namespace: ChainNamespace
  public metadata: { label: string; icon: string }

  // Balance
  public balance?: string
  public balanceSymbol?: string
  public balanceLoading?: boolean
  public tokenBalance?: Balance[]

  // Identity
  public profileName?: string | null
  public profileImage?: string | null

  // UI / misc
  public addressLabels: Map<string, string>
  public addressExplorerUrl?: string
  public smartAccountDeployed?: boolean
  public socialProvider?: SocialProvider
  public preferredAccountType?: NamespaceTypeMap[keyof NamespaceTypeMap]

  constructor({ address, caipAddress, type, namespace, metadata }: AccountProps) {
    this.address = address
    this.namespace = namespace
    this.caipAddress = caipAddress

    this.type = type
    this.metadata = metadata

    // Initialize additional fields
    this.addressLabels = new Map()
  }
}
