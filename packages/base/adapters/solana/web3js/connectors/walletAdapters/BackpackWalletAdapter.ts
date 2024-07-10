import { BackpackWalletAdapter as SolanaBackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { signAndSendTransaction } from './utils.js'

export class BackpackWalletAdapter extends SolanaBackpackWalletAdapter {
  signAndSendTransaction = signAndSendTransaction(this)
}
