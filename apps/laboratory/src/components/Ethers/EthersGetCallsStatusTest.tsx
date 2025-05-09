import { useEffect, useState } from 'react'

import { Button, Input, Stack, Text } from '@chakra-ui/react'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { BrowserProvider } from 'ethers'

import { W3mFrameProvider } from '@reown/appkit-wallet'
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider
} from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { type GetCallsStatusParams } from '@/src/types/EIP5792'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES } from '@/src/utils/EIP5792Utils'
import { type Hex, type WalletCapabilities, toHex } from 'viem'
import { type Eip1193Provider } from 'ethers'

export function EthersGetCallsStatusTest({ callsHash }: { callsHash: string }) {
  const [isLoading, setLoading] = useState(false)
  const [batchCallId, setBatchCallId] = useState(callsHash)

  const [checkingSupportGetCallsStatus, setCheckingSupportGetCallsStatus] = useState(true)
  const [isGetCallsStatusSupportedState, setIsGetCallsStatusSupportedState] = useState(false)

  const { chainId } = useAppKitNetwork()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')
  const toast = useChakraToast()

  useEffect(() => {
    setBatchCallId(callsHash)
  }, [callsHash])

  async function onGetCallsStatus() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      if (!chainId) {
        throw Error('chain not selected')
      }
      if (!batchCallId) {
        throw Error('call id not valid')
      }
      const provider = new BrowserProvider(walletProvider, chainId)
      const batchCallsStatus = await provider.send(EIP_5792_RPC_METHODS.WALLET_GET_CALLS_STATUS, [
        batchCallId as GetCallsStatusParams
      ])
      toast({
        title: 'Success',
        description: "Successfully fetched call status. Check console for details.",
        type: 'success'
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to get call status',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  async function checkGetCallsStatusSupportAsync(): Promise<boolean> {
    if (!walletProvider || !address || !chainId) {
      return false
    }

    if (walletProvider instanceof W3mFrameProvider) {
      return true
    }

    if (walletProvider instanceof UniversalProvider) {
      return Boolean(
        walletProvider?.session?.namespaces?.['eip155']?.methods?.includes(
          EIP_5792_RPC_METHODS.WALLET_GET_CALLS_STATUS
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
        console.error('[EthersGetCallsStatusTest] ERROR fetching/processing capabilities:', e);
        return false;
      }
    }
    return false;
  }

  useEffect(() => {
    async function checkSupport() {
      if (isConnected && walletProvider && address && chainId) {
        setCheckingSupportGetCallsStatus(true);
        const supported = await checkGetCallsStatusSupportAsync();
        setIsGetCallsStatusSupportedState(supported);
        setCheckingSupportGetCallsStatus(false);
      } else {
        setIsGetCallsStatusSupportedState(false);
        setCheckingSupportGetCallsStatus(false);
      }
    }
    checkSupport();
  }, [isConnected, walletProvider, address, chainId]);

  if (!isConnected || !address || !walletProvider) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (checkingSupportGetCallsStatus) {
    return (
      <Text fontSize="md" color="blue">
        Checking wallet capabilities for getCallsStatus...
      </Text>
    );
  }
  if (!isGetCallsStatusSupportedState) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support wallet_getCallsStatus rpc method
      </Text>
    )
  }

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Input
        placeholder="0xf34ffa..."
        onChange={e => setBatchCallId(e.target.value)}
        value={batchCallId}
        isDisabled={isLoading}
      />
      <Button
        data-testid="get-calls-status-button"
        onClick={onGetCallsStatus}
        isDisabled={isLoading}
      >
        Get Calls Status
      </Button>
    </Stack>
  )
}
