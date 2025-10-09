import { Address } from 'viem'

export const AccountUtil = {
  privateKeyEvm: process.env.EIP155_PRIVATE_KEY as Address,
  privateKeySolana: new Uint8Array(
    (process.env.SOLANA_PRIVATE_KEY as string).split(',') as unknown as number[]
  ),
  privateKeyBitcoin: process.env.BIP122_PRIVATE_KEY,
  privateKeyTon: process.env.TON_PRIVATE_KEY_1 as string
}
