import { Button, Stack, Text, Spacer } from '@chakra-ui/react'
import { useState } from 'react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useChakraToast } from '../Toast'
import { parseGwei, type Address } from 'viem'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { BrowserProvider } from 'ethers'
import type { GetCapabilitiesResult } from '../../types/EIP5792'
import { getChain } from '../../utils/ChainsUtil'
import { parseJSON } from '../../utils/CommonUtils'

export function EthersSendCallsTest() {
  const toast = useChakraToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)
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
      const amountToSend = parseGwei('0.001').toString(16)
      const calls = [
        {
          to: vitalikEthAddress as `0x${string}`,
          data: '0x' as `0x${string}`,
          value: `0x${amountToSend}`
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
        calls
      }
      const batchCallHash = await provider.send('wallet_sendCalls', [sendCallsParams])
      toast({
        title: 'Success',
        description: batchCallHash,
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

  function isSendCallsSupported(): boolean {
    const provider = walletProvider as Awaited<ReturnType<typeof EthereumProvider['init']>>;
    return Boolean(
      provider?.signer?.session?.namespaces?.['eip155']?.methods?.includes('wallet_sendCalls')
    );
  }
 
  function getAtomicBatchAllowedChainInfo(): { chainIds: number[]; chainNames: string[] } {
    const provider = walletProvider as Awaited<ReturnType<(typeof EthereumProvider)['init']>>
    if (address && chainId && provider?.signer?.session?.sessionProperties) {
      const walletCapabilitiesString = provider.signer.session.sessionProperties['capabilities']
      const walletCapabilities = walletCapabilitiesString && parseJSON(walletCapabilitiesString)
      const accountCapabilities = walletCapabilities[address] as GetCapabilitiesResult
      const chainIds = Object.keys(accountCapabilities).map(chainIdAsHex => Number(chainIdAsHex))
      const chainNames = chainIds.map(id => getChain(id)?.name ?? `Unknown Chain(${id})`)

      return { chainIds, chainNames }
    }

    return { chainIds: [], chainNames: [] }
  }

  const allowedChains = getAtomicBatchAllowedChainInfo()

  if(!isSendCallsSupported()) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet do not support this feature
      </Text>
    )
  }

  if (allowedChains.chainIds.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account do not support this feature
      </Text>
    )
  }

  return allowedChains.chainIds.includes(Number(chainId)) && address ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button data-test-id="sign-transaction-button" onClick={onSendCalls} isDisabled={loading}>
        Send Batch Calls to Vitalik
      </Button>
      <Spacer />
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {allowedChains.chainNames} to test this feature
    </Text>
  )
}
