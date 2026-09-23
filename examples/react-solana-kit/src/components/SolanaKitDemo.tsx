import { useState } from 'react'

import { fromLegacyPublicKey, fromLegacyTransactionInstruction } from '@solana/compat'
import {
  type Blockhash,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash
} from '@solana/kit'
import { SystemProgram } from '@solana/web3.js'
import bs58 from 'bs58'

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

  // Build and sign a transaction using only @solana/kit primitives, no
  // @solana/web3.js classes involved on the dApp side.
  async function onSignSolanaKitTransaction(send: boolean) {
    try {
      setIsLoading(true)

      if (!walletProvider?.publicKey || !walletProvider.address) {
        throw Error('Connect a wallet first')
      }
      if (!connection) {
        throw Error('No connection set')
      }

      const feePayer = walletProvider.address
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

      const instruction = fromLegacyTransactionInstruction(
        SystemProgram.transfer({
          fromPubkey: walletProvider.publicKey,
          toPubkey: walletProvider.publicKey,
          lamports: SELF_TRANSFER_LAMPORTS
        })
      )

      const message = appendTransactionMessageInstructions(
        [instruction],
        setTransactionMessageLifetimeUsingBlockhash(
          { blockhash: blockhash as Blockhash, lastValidBlockHeight: BigInt(lastValidBlockHeight) },
          setTransactionMessageFeePayer(
            fromLegacyPublicKey(walletProvider.publicKey),
            createTransactionMessage({ version: 0 })
          )
        )
      )
      const kitTransaction = compileTransaction(message)

      print(`Built a solana-kit transaction for fee payer ${feePayer}`)

      if (send) {
        const signature = await walletProvider.signAndSendTransaction(kitTransaction)
        print(`signAndSendTransaction() -> signature: ${signature}`)
      } else {
        const signedTransaction = await walletProvider.signTransaction(kitTransaction)
        const signatureBytes = Object.values(signedTransaction.signatures)[0]
        print(
          `signTransaction() -> solana-kit Transaction, signature: ${
            signatureBytes ? bs58.encode(signatureBytes) : 'missing'
          }`
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
