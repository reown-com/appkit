import { useState } from 'react'

import { Box, Button, Input, InputGroup, InputLeftAddon, Stack } from '@chakra-ui/react'
import type { Address } from '@solana/kit'

import {
  type Provider,
  createSPLTokenTransactionKit,
  useAppKitConnection
} from '@reown/appkit-adapter-solana/react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { ErrorUtil } from '@/src/utils/ErrorUtil'

export function SolanaSPLTransferKitTest() {
  const toast = useChakraToast()
  const { address } = useAppKitAccount({ namespace: 'solana' })
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { connection } = useAppKitConnection()
  const [isLoading, setIsLoading] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [tokenMint, setTokenMint] = useState('')
  const [amount, setAmount] = useState('')

  async function buildTransaction() {
    if (!walletProvider?.address || !address) {
      throw Error('user is disconnected')
    }
    if (!connection) {
      throw Error('no connection set')
    }

    return createSPLTokenTransactionKit({
      provider: walletProvider,
      connection,
      to: recipient as Address,
      amount: Number(amount),
      tokenMint: tokenMint as Address
    })
  }

  async function onSignTransaction() {
    try {
      setIsLoading(true)
      const transaction = await buildTransaction()
      if (!walletProvider) {
        throw Error('user is disconnected')
      }

      const signedTransaction = await walletProvider.signTransaction(transaction)

      toast({
        title: 'Success',
        description: `messageBytes length: ${signedTransaction.messageBytes.length}`,
        type: 'success'
      })
    } catch (err) {
      toast({
        title: 'Transaction Error',
        description: ErrorUtil.getErrorMessage(err),
        type: 'error',
        partialDescription: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSignAndSendTransaction() {
    try {
      setIsLoading(true)
      const transaction = await buildTransaction()
      if (!walletProvider) {
        throw Error('user is disconnected')
      }

      const signature = await walletProvider.signAndSendTransaction(transaction)

      toast({
        title: 'Success',
        description: signature,
        type: 'success'
      })
    } catch (err) {
      toast({
        title: 'Transaction Error',
        description: ErrorUtil.getErrorMessage(err),
        type: 'error',
        partialDescription: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!address) {
    return null
  }

  return (
    <Stack direction="column" spacing={2}>
      <Box display="flex" width="100%" gap="2" mb="2">
        <InputGroup>
          <InputLeftAddon>Recipient</InputLeftAddon>
          <Input value={recipient} onChange={e => setRecipient(e.currentTarget.value)} />
        </InputGroup>

        <InputGroup>
          <InputLeftAddon>Token Mint</InputLeftAddon>
          <Input value={tokenMint} onChange={e => setTokenMint(e.currentTarget.value)} />
        </InputGroup>

        <InputGroup>
          <InputLeftAddon>Amount</InputLeftAddon>
          <Input value={amount} onChange={e => setAmount(e.currentTarget.value)} type="number" />
        </InputGroup>
      </Box>

      <Button
        data-testid="sign-spl-transfer-kit-button"
        onClick={onSignTransaction}
        isDisabled={isLoading}
      >
        Sign SPL Token Transfer (solana-kit)
      </Button>
      <Button
        data-testid="sign-and-send-spl-transfer-kit-button"
        onClick={onSignAndSendTransaction}
        isDisabled={isLoading}
      >
        Sign and Send SPL Token Transfer (solana-kit)
      </Button>
    </Stack>
  )
}
