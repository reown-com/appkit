import { PublicKey } from '@solana/web3.js'

import type { Schema } from 'borsh'
import type { Tag } from '@web3modal/scaffold-utils/solana'

// Class used solely for borsh deserialize function
export class FavouriteDomain {
  public tag: Tag
  public nameAccount: PublicKey

  public constructor(obj: { tag: number; nameAccount: Uint8Array }) {
    this.tag = obj.tag as Tag
    this.nameAccount = new PublicKey(obj.nameAccount)
  }

  public static schema: Schema = new Map([
    [
      FavouriteDomain,
      {
        kind: 'struct',
        fields: [
          ['tag', 'u8'],
          ['nameAccount', [32]]
        ]
      }
    ]
  ])
}
