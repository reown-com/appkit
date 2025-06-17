import { useEffect, useState } from 'react'

import { Button, Flex, Input, Stack, Text, Tooltip } from '@chakra-ui/react'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { BrowserProvider, type Eip1193Provider, Interface } from 'ethers'
import { parseGwei, type Address, type Hex, type WalletCapabilities, toHex } from 'viem'

import { W3mFrameProvider } from '@reown/appkit-wallet'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { vitalikEthAddress } from '@/src/utils/DataUtil'
import { abi, address as donutAddress } from '@/src/utils/DonutContract'
import {
  EIP_5792_RPC_METHODS,
  WALLET_CAPABILITIES,
  getCapabilitySupportedChainInfo
} from '@/src/utils/EIP5792Utils'

// Define CallObject type (can be moved to a shared types file later)
type CallObject = {
  to: Address | `0x${string}`;
  value?: `0x${string}`;
  data?: `0x${string}` | undefined;
};

export function EthersSendCallsWithPaymasterServiceTest() {
  const [paymasterServiceUrl, setPaymasterServiceUrl] = useState<string>('')
  const [isLoading, setLoading] = useState(false)

  // Add state for async support check
  const [checkingSupportSendCallsPaymaster, setCheckingSupportSendCallsPaymaster] = useState(true);
  const [isSendCallsSupportedStatePaymaster, setIsSendCallsSupportedStatePaymaster] = useState(false);

  const { chainId } = useAppKitNetwork()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')
  const toast = useChakraToast()

  const [paymasterServiceSupportedChains, setPaymasterServiceSupportedChains] = useState<
    Awaited<ReturnType<typeof getCapabilitySupportedChainInfo>>
  >([])

  const currentChainsInfo = paymasterServiceSupportedChains.find(
    chainInfo => chainInfo.chainId === Number(chainId)
  )

  async function onSendCalls(donut?: boolean) {
    try {
      setLoading(true)
      if (!walletProvider || !address || !chainId) {
        throw Error('user is disconnected');
      }
      if (!paymasterServiceUrl) {
        throw Error('paymasterServiceUrl not set');
      }
      const provider = new BrowserProvider(walletProvider, chainId);
      const amountToSend = parseGwei('0.001').toString(16);

      const donutInterface = new Interface(abi);
      const encodedCallData = donutInterface.encodeFunctionData('getBalance', [address]);

      const callsForTest: CallObject[] = donut
        ? [
            {
              to: donutAddress,
              data: encodedCallData as `0x${string}`
            }
          ]
        : [
            {
              to: vitalikEthAddress as Address,
              value: `0x${amountToSend}` 
              // data is undefined
            },
            {
              to: vitalikEthAddress as Address,
              data: '0xdeadbeef'
              // value is undefined
            }
          ];
      
      const sanitizeCall = (call: CallObject): CallObject => {
        const newCall = { ...call };
        if (newCall.data === '0x') {
          delete newCall.data;
        }
        return newCall;
      };
      const callsToSend = callsForTest.map(sanitizeCall);

      const paymasterCapability = {
        paymasterService: {
          url: paymasterServiceUrl
        }
      };

      let sendError: any = null;
      let rawBatchResult: any = null;

      // Attempt 1: Try with V2.0.0 payload
      const sendCallsParamsV2 = {
        version: "2.0.0",
        chainId: `0x${BigInt(chainId).toString(16)}`,
        from: address,
        calls: callsToSend,
        atomicRequired: true,
        capabilities: paymasterCapability 
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
            calls: callsToSend,
            capabilities: paymasterCapability 
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

      if (sendError || !rawBatchResult) {
        throw sendError || new Error('Failed to send calls with paymaster and no hash or result received');
      }
      
      let finalBatchCallHash: string | null = null;
      if (typeof rawBatchResult === 'string') {
        finalBatchCallHash = rawBatchResult;
      } else if (typeof rawBatchResult === 'object' && rawBatchResult !== null && typeof rawBatchResult.id === 'string') {
        finalBatchCallHash = rawBatchResult.id;
      } else {
        console.error('[EthersSendCallsWithPaymasterServiceTest] Unexpected result format from wallet_sendCalls:', rawBatchResult); 
        throw new Error('Unexpected result format from wallet_sendCalls');
      }

      if (!finalBatchCallHash) {
        throw new Error('Extracted batch call hash is null or empty');
      }
      
      toast({
        title: 'SendCalls Success',
        description: finalBatchCallHash,
        type: 'success'
      })
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

  // Renamed and made async
  async function checkSendCallsSupportPaymasterAsync(): Promise<boolean> {
    if (!walletProvider || !address || !chainId) {
      return false;
    }
    if (walletProvider instanceof W3mFrameProvider) {
      return true; // Or more specific capability check if available for W3mFrameProvider
    }
    if (walletProvider instanceof UniversalProvider) {
      return Boolean(
        walletProvider?.session?.namespaces?.['eip155']?.methods?.includes(
          EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
        )
      );
    }
    if (typeof (walletProvider as unknown as Eip1193Provider).request === 'function') {
      try {
        const currentChainHex = toHex(parseInt(String(chainId), 10)) as Hex;
        const capabilities = await (walletProvider as unknown as Eip1193Provider).request({
          method: 'wallet_getCapabilities',
          params: [address]
        }) as Record<Hex, WalletCapabilities>; 
        if (capabilities && capabilities[currentChainHex]) {
          const chainCaps = capabilities[currentChainHex];
          const metamaskAtomic = (chainCaps as any).atomic;
          if (metamaskAtomic && typeof metamaskAtomic === 'object' && metamaskAtomic.status === 'supported') {
            return true;
          }
          if (chainCaps[WALLET_CAPABILITIES.ATOMIC_BATCH]?.supported === true) {
            return true;
          }
        }
      } catch (e) {
        console.error('[EthersSendCallsWithPaymasterServiceTest] ERROR fetching/processing capabilities:', e); 
        return false;
      }
    }
    return false;
  }

  useEffect(() => {
    async function checkSupport() {
      if (isConnected && walletProvider && address && chainId) {
        setCheckingSupportSendCallsPaymaster(true);
        const supported = await checkSendCallsSupportPaymasterAsync();
        setIsSendCallsSupportedStatePaymaster(supported);
        setCheckingSupportSendCallsPaymaster(false);
      } else {
        setIsSendCallsSupportedStatePaymaster(false);
        setCheckingSupportSendCallsPaymaster(false);
      }
    }
    checkSupport();
  }, [isConnected, walletProvider, address, chainId]);

  const paymasterServiceSupportedChainNames = paymasterServiceSupportedChains
    .map(ci => ci.chainName)
    .join(', ')

  if (!isConnected || !walletProvider || !address) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (checkingSupportSendCallsPaymaster) {
    return (
      <Text fontSize="md" color="blue">
        Checking wallet capabilities for sendCalls with Paymaster...
      </Text>
    );
  }
  if (!isSendCallsSupportedStatePaymaster) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support wallet_sendCalls rpc
      </Text>
    )
  }
  if (paymasterServiceSupportedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account does not support paymaster service feature
      </Text>
    )
  }

  return currentChainsInfo ? (
    <Stack direction={['column', 'column', 'column']}>
      <Tooltip label="Paymaster Service URL should be of ERC-7677 paymaster service proxy">
        <Input
          placeholder="https://paymaster-api.reown.com/11155111/rpc?projectId=..."
          onChange={e => setPaymasterServiceUrl(e.target.value)}
          value={paymasterServiceUrl}
          isDisabled={isLoading}
          whiteSpace="nowrap"
          textOverflow="ellipsis"
        />
      </Tooltip>
      <Flex dir="col">
        <Button
          width={'fit-content'}
          data-testid="send-calls-paymaster-service-button"
          onClick={() => onSendCalls()}
          isDisabled={isLoading || !paymasterServiceUrl}
        >
          SendCalls w/ Paymaster Service
        </Button>

        <Button
          width={'fit-content'}
          data-testid="send-calls-paymaster-service-button"
          onClick={() => onSendCalls(true)}
          isDisabled={isLoading || !paymasterServiceUrl}
        >
          Send Donut Calls w/ Paymaster Service
        </Button>
      </Flex>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {paymasterServiceSupportedChainNames} to test paymaster service feature
    </Text>
  )
}
