import { SolflareWalletAdapter as SolanaSolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { signAndSendTransaction } from './utils.js'

export class SolflareWalletAdapter extends SolanaSolflareWalletAdapter {
  signAndSendTransaction = signAndSendTransaction(this)
}
