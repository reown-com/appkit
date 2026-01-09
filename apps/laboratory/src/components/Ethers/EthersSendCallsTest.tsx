import { useState } from 'react'

import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Box,
  Card,
  CardBody,
  Link,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber
} from '@chakra-ui/react'
import { Button, Heading, Spacer, Stack, Text } from '@chakra-ui/react'
import { BrowserProvider, type Eip1193Provider } from 'ethers'
import { type WalletCapabilities, parseGwei, toHex } from 'viem'

import type { Address, Hex } from '@reown/appkit-common'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { AddTransactionModal } from '@/src/components/AddTransactionModal'
import { useChakraToast } from '@/src/components/Toast'
import { useCapabilities } from '@/src/hooks/useCapabilities'
import { useEthersActiveCapabilities } from '@/src/hooks/useEthersActiveCapabilities'
import { vitalikEthAddress } from '@/src/utils/DataUtil'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES } from '@/src/utils/EIP5792Utils'

export function EthersSendCallsTest({
  onCallsHash,
  capabilities
}: {
  onCallsHash: (hash: string) => void
  capabilities: WalletCapabilities
}) {
  const [isLoading, setIsLoading] = useState(false)

  const { chainId } = useAppKitNetwork()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')
  const [transactionsToBatch, setTransactionsToBatch] = useState<{ value: string; to: string }[]>(
    []
  )
  const { isMethodSupported } = useEthersActiveCapabilities()
  const { isSupported, currentChainsInfo, supportedChains, supportedChainsName } = useCapabilities({
    capabilities,
    capability: WALLET_CAPABILITIES.ATOMIC_BATCH,
    chainId: chainId ? toHex(chainId) : undefined
  })
  const toast = useChakraToast()

  const [isOpen, setIsOpen] = useState(false)
  function onSubmit(args: { to: string; eth: string }) {
    setLastCallsBatchId(null)
    setTransactionsToBatch(prev => [
      ...prev,
      {
        to: args.to as Address,
        data: '0x' as Hex,
        value: `0x${parseGwei(args.eth).toString(16)}`
      }
    ])
  }

  function onClose() {
    setIsOpen(false)
  }

  const [lastCallsBatchId, setLastCallsBatchId] = useState<string | null>(null)

  function onAddTransactionButtonClick() {
    setIsOpen(true)
  }

  function onRemoveTransaction(index: number) {
    setTransactionsToBatch(prev => prev.filter((_, i) => i !== index))
  }

  async function onSendCalls() {
    try {
      setIsLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      if (!chainId) {
        throw Error('chain not selected')
      }
      const provider = new BrowserProvider(walletProvider, chainId)
      const calls = [
        {
          to: vitalikEthAddress as Address,
          data: '0x' as Hex,
          value: `0x0`
        },
        {
          to: vitalikEthAddress as Address,
          value: '0x00',
          data: '0xdeadbeef'
        }
      ]
      const sendCallsParams = {
        version: '1.0',
        chainId: `0x${BigInt(chainId).toString(16)}`,
        from: address,
        calls: transactionsToBatch.length ? transactionsToBatch : calls
      }
      const result = await provider.send(EIP_5792_RPC_METHODS.WALLET_SEND_CALLS, [sendCallsParams])
      const batchCallHash = result?.id
      setLastCallsBatchId(batchCallHash)
      toast({
        title: 'Success',
        description: batchCallHash,
        type: 'success'
      })
      setTransactionsToBatch([])
      onCallsHash(batchCallHash)
    } catch {
      toast({
        title: 'SendCalls Error',
        description: 'Failed to send calls',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected || !walletProvider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (!isMethodSupported(EIP_5792_RPC_METHODS.WALLET_SEND_CALLS)) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support the "wallet_sendCalls" RPC method
      </Text>
    )
  }

  if (supportedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account does not support the atomic batch feature
      </Text>
    )
  }

  if (!isSupported) {
    return (
      <Text fontSize="md" color="yellow">
        Switch to {supportedChainsName} to test this feature
      </Text>
    )
  }

  return currentChainsInfo ? (
    <>
      <Box>
        <Stack direction={['column', 'column', 'row']}>
          <Stack direction={['column']}>
            (
            {transactionsToBatch.length ? (
              transactionsToBatch.map((tx, index) => (
                <>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>
                          ({index + 1}) Sending
                          <DeleteIcon
                            style={{ float: 'right', cursor: 'pointer' }}
                            onClick={() => onRemoveTransaction(index)}
                          />
                        </StatLabel>
                        <StatNumber>{parseInt(tx.value, 16) / 1000000000} ETH</StatNumber>
                        <StatHelpText>to {tx.to}</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>{' '}
                  <Spacer />
                </>
              ))
            ) : (
              <Button data-testid="send-calls-button" onClick={onSendCalls} isDisabled={isLoading}>
                Send Batch Calls to Vitalik
              </Button>
            )}
            )
          </Stack>
          <Spacer />
          <Link onClick={onAddTransactionButtonClick}>
            <Button variant="outline" colorScheme="blue" isDisabled={isLoading}>
              <AddIcon mr={2} /> Add Transaction
            </Button>
          </Link>
        </Stack>
        {transactionsToBatch.length ? (
          <Button data-testid="send-calls-button" onClick={onSendCalls} isDisabled={isLoading}>
            Send Calls
          </Button>
        ) : null}
      </Box>
      <AddTransactionModal isOpen={isOpen} onSubmit={onSubmit} onClose={onClose} />

      <Spacer m={2} />
      {lastCallsBatchId && (
        <>
          <Heading size="xs">Last batch call ID:</Heading>
          <Text data-testid="send-calls-id">{lastCallsBatchId}</Text>
        </>
      )}
    </>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {supportedChainsName} to test atomic batch feature
    </Text>
  )
}
