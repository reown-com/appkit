import { PhantomWalletAdapter as SolanaPhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { Transaction, VersionedTransaction } from '@solana/web3.js'

import { SolStoreUtil } from '../../utils/scaffold/index.js'

import type { ConfirmOptions, Signer } from '@solana/web3.js'

export class PhantomWalletAdapter extends SolanaPhantomWalletAdapter {
  async signAndSendTransaction(
    transactionParam: Transaction | VersionedTransaction,
    signers: Signer[],
    confirmOptions?: ConfirmOptions
  ) {
    if (!SolStoreUtil.state.connection) {
      throw Error('Not Connected')
    }

    if (transactionParam instanceof VersionedTransaction) {
      throw Error('Versioned transactions are not supported')
    }

    if (signers.length) {
      transactionParam.partialSign(...signers)
    }

    const signature = await this.sendTransaction(
      transactionParam,
      SolStoreUtil.state.connection,
      confirmOptions
    )

    if (signature) {
      const latestBlockHash = await SolStoreUtil.state.connection?.getLatestBlockhash()
      if (latestBlockHash?.blockhash) {
        await SolStoreUtil.state.connection?.confirmTransaction({
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature
        })

        return signature
      }
    }

    throw Error('Transaction Failed')
  }
}
