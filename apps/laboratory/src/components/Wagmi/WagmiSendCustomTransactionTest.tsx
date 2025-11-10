import { useCallback, useState } from 'react'

import { Box, Button, Code, Stack, Text, Textarea } from '@chakra-ui/react'
import { type Address, type Hex } from 'viem'
import { useSendTransaction, useWalletClient } from 'wagmi'

import { useChakraToast } from '@/src/components/Toast'

const DEFAULT_TX_JSON = JSON.stringify(
  {
    from: '0xfd35fb6e73a683df4e05ab44e85a2a9c97eb7b14',
    to: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    data: '0xa9059cbb000000000000000000000000f70da97812cb96acdf810712aa562db8dfa3dbef0000000000000000000000000000000000000000000000000000000005f5e100c16004c24bd5b2e19bcd3e2b2af51b338c2880bcee79a847479ab98519879922',
    value: '0',
    chainId: 8453,
    maxFeePerGas: '3402575',
    maxPriorityFeePerGas: '1028858'
  },
  null,
  2
)

export function WagmiSendCustomTransactionTest() {
  const toast = useChakraToast()
  const [txJson, setTxJson] = useState(DEFAULT_TX_JSON)
  const [isLoading, setLoading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [signedTransaction, setSignedTransaction] = useState<string>('')

  const { data: walletClient } = useWalletClient()

  const { sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: hash => {
        setLoading(false)
        toast({
          title: 'Transaction Success',
          description: hash,
          type: 'success'
        })
      },
      onError: error => {
        setLoading(false)
        toast({
          title: 'Error',
          description: error?.message || 'Failed to send transaction',
          type: 'error'
        })
      }
    }
  })

  const prepareTransaction = useCallback((txParams: any) => {
    // Validate required fields
    if (!txParams.to) {
      throw new Error('Transaction "to" address is required')
    }

    // Prepare transaction parameters (explicitly excluding 'from' as wagmi handles it)
    const transaction: {
      to: Address
      data?: Hex
      value?: bigint
      gas?: bigint
      maxFeePerGas?: bigint
      maxPriorityFeePerGas?: bigint
      chainId?: number
    } = {
      to: txParams.to as Address
    }

    // Add optional fields if present
    if (txParams.data) {
      transaction.data = txParams.data as Hex
    }

    // Convert value to bigint (handle "0" string as well)
    if (txParams.value !== undefined) {
      const valueStr = String(txParams.value)
      transaction.value = valueStr === '0' ? 0n : BigInt(valueStr)
    }

    if (txParams.gas) {
      transaction.gas = BigInt(txParams.gas)
    }

    if (txParams.maxFeePerGas) {
      transaction.maxFeePerGas = BigInt(txParams.maxFeePerGas)
    }

    if (txParams.maxPriorityFeePerGas) {
      transaction.maxPriorityFeePerGas = BigInt(txParams.maxPriorityFeePerGas)
    }

    if (txParams.chainId) {
      transaction.chainId = Number(txParams.chainId)
    }

    console.log('Prepared transaction:', transaction)

    return transaction
  }, [])

  const onSignTransaction = useCallback(async () => {
    try {
      if (!walletClient) {
        throw new Error('Wallet client not available')
      }

      // Parse the JSON input
      const txParams = JSON.parse(txJson)
      const transaction = prepareTransaction(txParams)

      setIsSigning(true)

      console.log('Signing transaction:', transaction)

      // Sign the transaction using wallet client
      const signature = await walletClient.signTransaction(transaction)

      console.log('Signature received:', signature)

      // Create a JSON stringified result
      const result = JSON.stringify(
        {
          originalTransaction: txParams,
          preparedTransaction: {
            ...transaction,
            // Convert BigInt values to strings for JSON serialization
            value: transaction.value?.toString(),
            gas: transaction.gas?.toString(),
            maxFeePerGas: transaction.maxFeePerGas?.toString(),
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas?.toString()
          },
          signature,
          signedAt: new Date().toISOString()
        },
        null,
        2
      )

      setSignedTransaction(result)
      setIsSigning(false)

      toast({
        title: 'Transaction Signed',
        description: 'Transaction signed successfully',
        type: 'success'
      })
    } catch (error) {
      console.error('Sign transaction error:', error)
      setIsSigning(false)
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign transaction'
      toast({
        title: 'Error',
        description: errorMessage,
        type: 'error'
      })
    }
  }, [txJson, walletClient, prepareTransaction, toast])

  const onSendTransaction = useCallback(async () => {
    try {
      // Parse the JSON input
      const txParams = JSON.parse(txJson)
      const transaction = prepareTransaction(txParams)

      setLoading(true)
      console.log('Sending transaction:', transaction)

      // Send the transaction
      sendTransaction(transaction)
    } catch (error) {
      console.error('Send transaction error:', error)
      setLoading(false)
      const errorMessage = error instanceof Error ? error.message : 'Invalid transaction JSON'
      toast({
        title: 'Error',
        description: errorMessage,
        type: 'error'
      })
    }
  }, [txJson, sendTransaction, prepareTransaction, toast])

  return (
    <Stack spacing={4}>
      <Text fontSize="sm" color="gray.500">
        Enter transaction parameters as JSON:
      </Text>
      <Textarea
        value={txJson}
        onChange={e => setTxJson(e.target.value)}
        placeholder="Enter transaction JSON..."
        minHeight="250px"
        fontFamily="monospace"
        fontSize="sm"
        data-testid="custom-transaction-input"
      />

      <Stack direction="row" spacing={3}>
        <Button
          data-testid="sign-custom-transaction-button"
          onClick={onSignTransaction}
          isDisabled={isSigning || isLoading || !txJson || !walletClient}
          isLoading={isSigning}
          colorScheme="purple"
        >
          Sign Transaction
        </Button>

        <Button
          data-testid="send-custom-transaction-button"
          onClick={onSendTransaction}
          isDisabled={isLoading || isSigning || !txJson}
          isLoading={isLoading}
          colorScheme="blue"
        >
          Send Transaction
        </Button>
      </Stack>

      {signedTransaction && (
        <Box>
          <Text fontSize="sm" color="gray.500" mb={2}>
            Signed Transaction (JSON):
          </Text>
          <Code
            display="block"
            whiteSpace="pre-wrap"
            p={4}
            borderRadius="md"
            fontSize="xs"
            data-testid="signed-transaction-output"
          >
            {signedTransaction}
          </Code>
        </Box>
      )}
    </Stack>
  )
}
