import { Account, type AccountProps } from './Account.js'

type BitcoinAccountProps = AccountProps & {
  type: 'ordinal' | 'payment'
  publicKey: string
  path: string
}

export class BitcoinAccount extends Account {
  public override type: 'ordinal' | 'payment'
  public publicKey: string
  public path: string
  constructor({
    address,
    caipAddress,
    namespace,
    metadata,
    publicKey,
    type,
    path
  }: BitcoinAccountProps) {
    super({ address, caipAddress, type, namespace, metadata })

    this.type = type
    this.publicKey = publicKey
    this.path = path
  }
}
