import { TrustWalletAdapter as SolanaTrustWalletAdapter } from '@solana/wallet-adapter-trust'
import { signAndSendTransaction } from './utils.js'

export class TrustWalletAdapter extends SolanaTrustWalletAdapter {
  signAndSendTransaction = signAndSendTransaction(this)
}
