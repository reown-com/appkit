import { useEffect, useState } from 'react'

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
import { UniversalProvider } from '@walletconnect/universal-provider'
import { BrowserProvider, type Eip1193Provider } from 'ethers'
import { type Address, parseGwei, toHex, type Hex, type WalletCapabilities } from 'viem'

import { W3mFrameProvider } from '@reown/appkit-wallet'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { AddTransactionModal } from '@/src/components/AddTransactionModal'
import { useChakraToast } from '@/src/components/Toast'
import { vitalikEthAddress } from '@/src/utils/DataUtil'
import {
  EIP_5792_RPC_METHODS,
  WALLET_CAPABILITIES,
  getCapabilitySupportedChainInfo
} from '@/src/utils/EIP5792Utils'

type Provider = W3mFrameProvider | Awaited<ReturnType<(typeof UniversalProvider)['init']>>

// Define the type for a call object, aligning with EIP-5792
type CallObject = {
  to: Address | `0x${string}`;
  value?: `0x${string}`;
  data?: `0x${string}` | undefined;
};

export function EthersSendCallsTest({ onCallsHash }: { onCallsHash: (hash: string) => void }) {
  const [loading, setLoading] = useState(false)

  const [checkingSupport, setCheckingSupport] = useState(true)
  const [isSendCallsSupportedState, setIsSendCallsSupportedState] = useState(false)

  const { chainId } = useAppKitNetwork()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')
  const [transactionsToBatch, setTransactionsToBatch] = useState<CallObject[]>([])
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
        walletProvider,
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
      if (!walletProvider || !address || !chainId) {
        throw Error('user is disconnected')
      }
      if (!chainId) {
        throw Error('chain not selected')
      }
      const provider = new BrowserProvider(walletProvider, chainId)

      const defaultTestCalls: CallObject[] = [
        { to: vitalikEthAddress as `0x${string}`, value: "0x0" },
        { to: vitalikEthAddress as Address, value: "0x00", data: "0xdeadbeef" }
      ];

      const sanitizeCall = (call: CallObject): CallObject => {
        const newCall = { ...call };
        if (newCall.data === '0x') {
          delete newCall.data;
        }
        return newCall;
      };

      const callsToSend: CallObject[] = transactionsToBatch.length
        ? transactionsToBatch.map(sanitizeCall)
        : defaultTestCalls.map(sanitizeCall);

      let sendError: any = null;
      let rawBatchResult: any = null; // To store the raw result from provider.send

      // Attempt 1: Try with V2.0.0 payload
      const sendCallsParamsV2 = {
        version: "2.0.0",
        chainId: `0x${BigInt(chainId).toString(16)}`,
        from: address,
        calls: callsToSend,
        atomicRequired: true 
      };

      try {
        rawBatchResult = await provider.send(EIP_5792_RPC_METHODS.WALLET_SEND_CALLS, [sendCallsParamsV2]);
      } catch (e2) {
        sendError = e2;
        const errorMessage = (typeof e2 === 'object' && e2 !== null && 'message' in e2) ? String(e2.message) : '';
        const errorCode = (typeof e2 === 'object' && e2 !== null && 'code' in e2) ? e2.code : undefined;

        if (errorCode === -32000 || (errorMessage.toLowerCase().includes('version') && errorMessage.includes('1.0'))) {
          const sendCallsParamsV1 = {
            version: "1.0",
            chainId: `0x${BigInt(chainId).toString(16)}`,
            from: address,
            calls: callsToSend
          };
          try {
            rawBatchResult = await provider.send(EIP_5792_RPC_METHODS.WALLET_SEND_CALLS, [sendCallsParamsV1]);
            sendError = null;
          } catch (e1) {
            sendError = e1;
          }
        } else if (sendError) { 
          throw sendError;
        }
      }

      // Extract the actual hash string
      let finalBatchCallHash: string | null = null;
      if (typeof rawBatchResult === 'string') {
        finalBatchCallHash = rawBatchResult;
      } else if (typeof rawBatchResult === 'object' && rawBatchResult !== null && typeof rawBatchResult.id === 'string') {
        finalBatchCallHash = rawBatchResult.id;
      } else {
        console.error('[EthersSendCallsTest] Unexpected result format from wallet_sendCalls:', rawBatchResult);
        throw new Error('Unexpected result format from wallet_sendCalls');
      }

      if (!finalBatchCallHash) {
        throw new Error('Extracted batch call hash is null or empty');
      }

      setLastCallsBatchId(finalBatchCallHash);
      toast({
        title: 'Success',
        description: finalBatchCallHash, // Now this is a string
        type: 'success'
      });
      setTransactionsToBatch([]);
      onCallsHash(finalBatchCallHash); // Pass the string hash
    } catch (err) {
      console.error('[EthersSendCallsTest] Final error in onSendCalls:', err);
      toast({
        title: 'Error',
        description: (typeof err === 'object' && err !== null && 'message' in err) ? String(err.message) : 'Failed to send calls',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  async function checkSendCallsSupportAsync(): Promise<boolean> {
    if (!walletProvider || !address || !chainId) {
      return false
    }

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

    if (typeof (walletProvider as unknown as Eip1193Provider).request === 'function') {
      try {
        const currentChainHex = toHex(parseInt(String(chainId), 10)) as Hex

        const capabilities = await (walletProvider as unknown as Eip1193Provider).request({
          method: 'wallet_getCapabilities',
          params: [address]
        }) as Record<Hex, WalletCapabilities>

        if (capabilities && capabilities[currentChainHex]) {
          const chainCaps = capabilities[currentChainHex]
          
          const metamaskAtomicCapability = (chainCaps as any).atomic;
          if (metamaskAtomicCapability && typeof metamaskAtomicCapability === 'object' && metamaskAtomicCapability.status === 'supported') {
            return true;
          }

          if (chainCaps[WALLET_CAPABILITIES.ATOMIC_BATCH]?.supported === true) {
            return true
          } 
        }
      } catch (e) {
        console.error('[EthersSendCallsTest] ERROR fetching/processing capabilities:', e);
        return false
      }
    }

    return false
  }

  useEffect(() => {
    async function checkSupport() {
      if (isConnected && walletProvider && address && chainId) {
        setCheckingSupport(true)
        const supported = await checkSendCallsSupportAsync()
        setIsSendCallsSupportedState(supported)
        setCheckingSupport(false)
      } else {
        setIsSendCallsSupportedState(false)
        setCheckingSupport(false)
      }
    }
    checkSupport()
  }, [isConnected, walletProvider, address, chainId])

  if (!isConnected || !walletProvider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (checkingSupport) {
    return (
      <Text fontSize="md" color="blue">
        Checking wallet capabilities...
      </Text>
    )
  }
  if (!isSendCallsSupportedState) {
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
                        <StatNumber>{parseInt(tx.value ?? '0x0', 16) / 1000000000} ETH</StatNumber>
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
