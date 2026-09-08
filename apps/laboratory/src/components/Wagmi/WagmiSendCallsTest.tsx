import { useCallback, useState } from 'react'

import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Link,
  Spacer,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text
} from '@chakra-ui/react'
import { type WalletCapabilities, parseGwei, toHex } from 'viem'
import { useAccount } from 'wagmi'
import { useSendCalls } from 'wagmi/experimental'

import type { Address, Hex } from '@reown/appkit-common'
import { useAppKitAccount } from '@reown/appkit/react'

import { AddTransactionModal } from '@/src/components/AddTransactionModal'
import { useChakraToast } from '@/src/components/Toast'
import { useCapabilities } from '@/src/hooks/useCapabilities'
import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'
import { vitalikEthAddress } from '@/src/utils/DataUtil'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES } from '@/src/utils/EIP5792Utils'

const TEST_TX_1 = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.0001')
}
const TEST_TX_2 = {
  to: vitalikEthAddress as Address,
  data: '0xdeadbeef' as Address
}

export function WagmiSendCallsTest({ capabilities }: { capabilities: WalletCapabilities }) {
  const { chain } = useAccount()
  const { isSupported, supportedChains, supportedChainsName } = useCapabilities({
    capabilities,
    capability: WALLET_CAPABILITIES.ATOMIC_BATCH,
    chainId: chain?.id ? toHex(chain.id) : undefined
  })

  const { isMethodSupported } = useWagmiAvailableCapabilities()

  const { address } = useAppKitAccount({ namespace: 'eip155' })
  const { status } = useAccount()

  const isConnected = status === 'connected'

  if (!isConnected || !address) {
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

  return <ConnectedTestContent />
}

function ConnectedTestContent() {
  const toast = useChakraToast()
  const [lastCallsBatchId, setLastCallsBatchId] = useState<string | null>(null)
  const [transactionsToBatch, setTransactionsToBatch] = useState<
    { to: Address; value: bigint; data?: Hex }[]
  >([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { sendCalls, isPending: isLoading } = useSendCalls({
    mutation: {
      onSuccess: hash => {
        setLastCallsBatchId(hash.id)
        toast({
          title: 'SendCalls Success',
          description: hash.id,
          type: 'success'
        })
        setTransactionsToBatch([])
      },
      onError: () => {
        toast({
          title: 'SendCalls Error',
          description: 'Failed to send calls',
          type: 'error'
        })
      }
    }
  })

  const onSendCalls = useCallback(() => {
    const calls = transactionsToBatch.length ? transactionsToBatch : [TEST_TX_1, TEST_TX_2]
    sendCalls({
      calls
    })
  }, [sendCalls, transactionsToBatch])

  function onSubmit(args: { to: string; eth: string; data?: string }) {
    setLastCallsBatchId(null)
    setTransactionsToBatch(prev => [
      ...prev,
      {
        to: args.to as Address,
        value: parseGwei(args.eth),
        data: args.data as Hex | undefined
      }
    ])
  }

  function onClose() {
    setIsModalOpen(false)
  }

  function onAddTransactionButtonClick() {
    setIsModalOpen(true)
  }

  function onRemoveTransaction(index: number) {
    setTransactionsToBatch(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <Box>
        <Stack direction={['column', 'column', 'row']}>
          <Stack direction={['column']}>
            {transactionsToBatch.length ? (
              transactionsToBatch.map((tx, index) => (
                <Box key={index}>
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
                        <StatNumber>{Number(tx.value) / 1000000000} ETH</StatNumber>
                        <StatHelpText>to {tx.to}</StatHelpText>
                        {tx.data && <StatHelpText>data: {tx.data}</StatHelpText>}
                      </Stat>
                    </CardBody>
                  </Card>
                  <Spacer />
                </Box>
              ))
            ) : (
              <Button
                data-testid="send-calls-button"
                onClick={onSendCalls}
                disabled={!sendCalls}
                isDisabled={isLoading}
                isLoading={isLoading}
              >
                Send Batch Calls to Vitalik
              </Button>
            )}
          </Stack>
          <Spacer />
          <Link onClick={onAddTransactionButtonClick}>
            <Button variant="outline" colorScheme="blue" isDisabled={isLoading}>
              <AddIcon mr={2} /> Add Transaction
            </Button>
          </Link>
        </Stack>
        {transactionsToBatch.length ? (
          <Button
            data-testid="send-calls-button"
            onClick={onSendCalls}
            disabled={!sendCalls}
            isDisabled={isLoading}
            isLoading={isLoading}
          >
            Send Calls
          </Button>
        ) : null}
      </Box>
      <AddTransactionModal isOpen={isModalOpen} onSubmit={onSubmit} onClose={onClose} />

      <Spacer m={2} />
      {lastCallsBatchId && (
        <>
          <Heading size="xs">Last batch call ID:</Heading>
          <Text data-testid="send-calls-id">{lastCallsBatchId}</Text>
        </>
      )}
    </>
  )
}
