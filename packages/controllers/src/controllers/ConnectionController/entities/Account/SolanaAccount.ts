import { Account, type AccountProps, type EmbeddedWalletProps } from './Account.js'

type SolanaAccountProps = AccountProps &
  EmbeddedWalletProps & {
    type: 'eoa'
    publicKey: string
  }

export class SolanaAccount extends Account {
  public override type: 'eoa'
  public publicKey: string
  public userInfo?: Record<string, unknown>
  constructor({
    address,
    caipAddress,
    namespace,
    metadata,
    publicKey,
    userInfo
  }: SolanaAccountProps) {
    super({ address, caipAddress, type: 'eoa', namespace, metadata })

    this.type = 'eoa'
    this.publicKey = publicKey
    this.userInfo = userInfo
  }
}
