import { PhantomWalletAdapter as SolanaPhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { signAndSendTransaction } from './utils.js'

export class PhantomWalletAdapter extends SolanaPhantomWalletAdapter {
  signAndSendTransaction = signAndSendTransaction(this)
}
