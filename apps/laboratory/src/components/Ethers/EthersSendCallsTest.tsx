import {
  Box,
  Link,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Button, Stack, Text, Spacer, Heading } from '@chakra-ui/react'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { useChakraToast } from '../Toast'
import { parseGwei, type Address } from 'viem'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { BrowserProvider, type Eip1193Provider } from 'ethers'
import {
  EIP_5792_RPC_METHODS,
  WALLET_CAPABILITIES,
  getCapabilitySupportedChainInfo
} from '../../utils/EIP5792Utils'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import { AddTransactionModal } from '../AddTransactionModal'
import { W3mFrameProvider } from '@reown/appkit-wallet'
type Provider = W3mFrameProvider | Awaited<ReturnType<(typeof UniversalProvider)['init']>>

export function EthersSendCallsTest({ onCallsHash }: { onCallsHash: (hash: string) => void }) {
  const [loading, setLoading] = useState(false)

  const { chainId } = useAppKitNetwork()
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')
  const [transactionsToBatch, setTransactionsToBatch] = useState<{ value: string; to: string }[]>(
    []
  )
  const toast = useChakraToast()

  const [isOpen, setIsOpen] = useState(false)
  function onSubmit(args: { to: string; eth: string }) {
    setLastCallsBatchId(null)
    setTransactionsToBatch(prev => [
      ...prev,
      {
        to: args.to as `0x${string}`,
        data: '0x' as `0x${string}`,
        value: `0x${parseGwei(args.eth).toString(16)}`
      }
    ])
  }

  function onClose() {
    setIsOpen(false)
  }

  const [atomicBatchSupportedChains, setAtomicBatchSupportedChains] = useState<
    Awaited<ReturnType<typeof getCapabilitySupportedChainInfo>>
  >([])

  const [lastCallsBatchId, setLastCallsBatchId] = useState<string | null>(null)

  useEffect(() => {
    if (address && walletProvider) {
      getCapabilitySupportedChainInfo(
        WALLET_CAPABILITIES.ATOMIC_BATCH,
        walletProvider as unknown as Provider,
        address
      ).then(capabilities => setAtomicBatchSupportedChains(capabilities))
    } else {
      setAtomicBatchSupportedChains([])
    }
  }, [address, walletProvider, isConnected])

  const atomicBatchSupportedChainsNames = atomicBatchSupportedChains
    .map(ci => ci.chainName)
    .join(', ')
  const currentChainsInfo = atomicBatchSupportedChains.find(
    chainInfo => chainInfo.chainId === Number(chainId)
  )

  function onAddTransactionButtonClick() {
    setIsOpen(true)
  }

  function onRemoveTransaction(index: number) {
    setTransactionsToBatch(prev => prev.filter((_, i) => i !== index))
  }

  async function onSendCalls() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      if (!chainId) {
        throw Error('chain not selected')
      }
      const provider = new BrowserProvider(walletProvider, chainId)
      const calls = [
        {
          to: vitalikEthAddress as `0x${string}`,
          data: '0x' as `0x${string}`,
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
      const batchCallHash = await provider.send(EIP_5792_RPC_METHODS.WALLET_SEND_CALLS, [
        sendCallsParams
      ])

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
        title: 'Error',
        description: 'Failed to send calls',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }
  function isSendCallsSupported(): boolean {
    if (walletProvider instanceof W3mFrameProvider) {
      return true
    }
    if (walletProvider instanceof UniversalProvider) {
      return Boolean(
        walletProvider?.session?.namespaces?.['eip155']?.methods?.includes(
          EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
        )
      )
    }

    return false
  }

  if (!isConnected || !walletProvider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (!isSendCallsSupported()) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support wallet_sendCalls rpc
      </Text>
    )
  }
  if (atomicBatchSupportedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account does not support atomic batch feature
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
              <Button data-test-id="send-calls-button" onClick={onSendCalls} isDisabled={loading}>
                Send Batch Calls to Vitalik
              </Button>
            )}
            )
          </Stack>
          <Spacer />
          <Link onClick={onAddTransactionButtonClick}>
            <Button variant="outline" colorScheme="blue" isDisabled={loading}>
              <AddIcon mr={2} /> Add Transaction
            </Button>
          </Link>
        </Stack>
        {transactionsToBatch.length ? (
          <Button data-test-id="send-calls-button" onClick={onSendCalls} isDisabled={loading}>
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
      Switch to {atomicBatchSupportedChainsNames} to test atomic batch feature
    </Text>
  )
}
