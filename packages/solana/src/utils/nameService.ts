import type { Schema } from 'borsh'
import { PublicKey } from '@solana/web3.js'
import type { Tag } from '@web3modal/scaffold-utils/solana'

// Class used solely for borsh deserialize function
export class FavouriteDomain {
  public tag: Tag
  public nameAccount: PublicKey

  public constructor(obj: { tag: number, nameAccount: Uint8Array }) {
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

export class NameRegistry {
  public parentName: PublicKey
  public owner: PublicKey
  public class: PublicKey
  public data: Buffer | undefined

  public constructor(obj: { parentName: Uint8Array, owner: Uint8Array, class: Uint8Array }) {
    this.parentName = new PublicKey(obj.parentName)
    this.owner = new PublicKey(obj.owner)
    this.class = new PublicKey(obj.class)
  }

  public static schema: Schema = new Map([
    [
      NameRegistry,
      {
        kind: 'struct',
        fields: [
          ['parentName', [32]],
          ['owner', [32]],
          ['class', [32]]
        ]
      }
    ]
  ])
}
