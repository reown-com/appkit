import { useState } from 'react'

import { Button, Spacer, Stack } from '@chakra-ui/react'
import { PublicKey, VersionedTransaction } from '@solana/web3.js'
import bs58 from 'bs58'

import { type Provider, useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'

export function SolanaSignJupiterSwapTest() {
  const toast = useChakraToast()
  const { connection } = useAppKitConnection()
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const [loading, setLoading] = useState(false)

  async function onSignVersionedTransaction() {
    try {
      setLoading(true)
      if (!walletProvider?.publicKey) {
        throw Error('user is disconnected')
      }

      if (!connection) {
        throw Error('no connection set')
      }

      const transaction = await createJupiterSwapTransaction({
        publicKey: walletProvider.publicKey
      })
      const signedTransaction = await walletProvider.signTransaction(transaction)
      const signature = signedTransaction.signatures[0]

      if (!signature) {
        throw Error('Empty signature')
      }

      toast({
        title: 'Success',
        description: bs58.encode(signature),
        type: 'success'
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSignVersionedTransaction}
        isDisabled={loading}
      >
        Sign Jupiter Swap Transaction
      </Button>
      <Spacer />
    </Stack>
  )
}

type CreateJupiterSwapTransactionParams = {
  publicKey: PublicKey
}

async function createJupiterSwapTransaction({ publicKey }: CreateJupiterSwapTransactionParams) {
  const qs = new URLSearchParams({
    inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    outputMint: 'So11111111111111111111111111111111111111112',
    amount: '100000',
    slippageBps: '300',
    swapMode: 'ExactIn',
    onlyDirectRoutes: 'false',
    asLegacyTransaction: 'false',
    maxAccounts: '64',
    minimizeSlippage: 'false'
  })

  const quoteResponse = await (
    await fetch(`https://quote-api.jup.ag/v6/quote?${qs.toString()}`)
  ).json()
  const swapResponse = await (
    await fetch('https://quote-api.jup.ag/v6/swap', {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userPublicKey: publicKey.toString(),
        wrapAndUnwrapSol: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 4000000,
            global: false,
            priorityLevel: 'high'
          }
        },
        asLegacyTransaction: false,
        dynamicComputeUnitLimit: true,
        allowOptimizedWrappedSolTokenAccount: false,
        quoteResponse,
        dynamicSlippage: { maxBps: 300 }
      }),
      method: 'POST'
    })
  ).json()

  return VersionedTransaction.deserialize(Buffer.from(swapResponse.swapTransaction, 'base64'))
}
