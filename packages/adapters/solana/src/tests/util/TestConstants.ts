import { PublicKey } from '@solana/web3.js'
import { solanaChains } from '../../utils/chains.js'
import base58 from 'bs58'

export const TestConstants = {
  accounts: [
    {
      address: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP',
      publicKey: new PublicKey(base58.decode('2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP'))
    },
    {
      address: '2vRxHxMEmhTCJ4jctfso2MVZvaQkHQxXf9riMNS3CjSu',
      publicKey: new PublicKey(base58.decode('2vRxHxMEmhTCJ4jctfso2MVZvaQkHQxXf9riMNS3CjSu'))
    }
  ] as const satisfies TestConstants.Account[],

  chains: Object.values(solanaChains)
} as const

export namespace TestConstants {
  export type Account = {
    address: string
    publicKey: PublicKey
  }
}
