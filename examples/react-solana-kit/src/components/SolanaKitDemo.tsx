import { useState } from 'react'

import { getTransferSolInstruction } from '@solana-program/system'
import {
  type Blockhash,
  appendTransactionMessageInstructions,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getSignatureFromTransaction,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash
} from '@solana/kit'

import { type Provider, useAppKitConnection } from '@reown/appkit-adapter-solana/react'

import { useAppKitAccount, useAppKitProvider } from '../config'

const SELF_TRANSFER_LAMPORTS = 100

export function SolanaKitDemo() {
  const { isConnected } = useAppKitAccount({ namespace: 'solana' })
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { connection } = useAppKitConnection()

  const [isLoading, setIsLoading] = useState(false)
  const [log, setLog] = useState<string[]>([])

  function print(line: string) {
    setLog(current => [...current, line])
  }

  // The adapter's Provider type is additive: `publicKey` (legacy web3.js) and
  // `address` (solana-kit) always describe the same connected account.
  async function onReadAddress() {
    if (!walletProvider?.publicKey) {
      print('Not connected.')
      return
    }

    print(`provider.publicKey (legacy PublicKey): ${walletProvider.publicKey.toBase58()}`)
    print(`provider.address (solana-kit Address): ${walletProvider.address ?? 'n/a'}`)
  }

  // Build and sign a transaction using only @solana/kit (+ @solana-program/system
  // for the instruction), no @solana/web3.js on the dApp side at all. The wallet
  // does the actual signing, so `source` is a noop signer: it carries the address
  // without being able to sign itself.
  async function onSignSolanaKitTransaction(send: boolean) {
    try {
      setIsLoading(true)

      if (!walletProvider?.address) {
        throw Error('Connect a wallet first')
      }
      if (!connection) {
        throw Error('No connection set')
      }

      const feePayer = walletProvider.address
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

      const instruction = getTransferSolInstruction({
        source: createNoopSigner(feePayer),
        destination: feePayer,
        amount: SELF_TRANSFER_LAMPORTS
      })

      const message = appendTransactionMessageInstructions(
        [instruction],
        setTransactionMessageLifetimeUsingBlockhash(
          { blockhash: blockhash as Blockhash, lastValidBlockHeight: BigInt(lastValidBlockHeight) },
          setTransactionMessageFeePayer(feePayer, createTransactionMessage({ version: 0 }))
        )
      )
      const kitTransaction = compileTransaction(message)

      print(`Built a solana-kit transaction for fee payer ${feePayer}`)

      if (send) {
        const signature = await walletProvider.signAndSendTransaction(kitTransaction)
        print(`signAndSendTransaction() -> signature: ${signature}`)
      } else {
        const signedTransaction = await walletProvider.signTransaction(kitTransaction)
        print(
          `signTransaction() -> solana-kit Transaction, signature: ${getSignatureFromTransaction(signedTransaction)}`
        )
      }
    } catch (err) {
      print(`Error: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <section className="code-container" style={{ width: '100%' }}>
        <p>Connect a Solana wallet to try the @solana/kit integration.</p>
      </section>
    )
  }

  return (
    <section className="code-container" style={{ width: '100%' }}>
      <h2 className="code-container-title">@solana/kit integration</h2>
      <div className="action-button-list" style={{ marginBottom: '1rem' }}>
        <button onClick={onReadAddress}>Read address (legacy + solana-kit)</button>
        <button onClick={() => onSignSolanaKitTransaction(false)} disabled={isLoading}>
          Sign solana-kit transaction
        </button>
        <button onClick={() => onSignSolanaKitTransaction(true)} disabled={isLoading}>
          Sign and send solana-kit transaction
        </button>
      </div>
      <div className="code-container-content">
        {log.length === 0 ? (
          <pre>Output will show up here.</pre>
        ) : (
          log.map((line, index) => <pre key={index}>{line}</pre>)
        )}
      </div>
    </section>
  )
}

export default SolanaKitDemo
