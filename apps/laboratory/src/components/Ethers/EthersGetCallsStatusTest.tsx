import { Button, Stack, Text, Input } from '@chakra-ui/react'
import { useState } from 'react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { useChakraToast } from '../Toast'
import { BrowserProvider } from 'ethers'
import { type GetCallsStatusParams } from '../../types/EIP5792'
import { EIP_5792_RPC_METHODS, getCapabilitySupportedChainInfoForEthers } from '../../utils/EIP5792Utils'

export function EthersGetCallsStatusTest() {
  const toast = useChakraToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)
  const ethereumProvider =
    walletProvider && (walletProvider as Awaited<ReturnType<(typeof EthereumProvider)['init']>>)
  const [batchCallId, setBatchCallId] = useState('')

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
        description: JSON.stringify(batchCallsStatus),
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

  function isGetCallsStatusSupported(): boolean {
    return Boolean(
      ethereumProvider?.signer?.session?.namespaces?.['eip155']?.methods?.includes(
        EIP_5792_RPC_METHODS.WALLET_GET_CALLS_STATUS
      )
    )
  }

  if (!address || !ethereumProvider) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }

  if (!isGetCallsStatusSupported()) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet do not support this feature
      </Text>
    )
  }

  const allowedChains = getCapabilitySupportedChainInfoForEthers('atomicBatch',ethereumProvider, address)

  if (allowedChains.length === 0) {
    return (
      <Text fontSize="md" color="yellow">
        Account do not support this feature
      </Text>
    )
  }

  return allowedChains.find(chainInfo => chainInfo.chainId === Number(chainId)) && address ? (
    <Stack direction={['column', 'column', 'row']}>
      <Input
        placeholder="0xf34ffa..."
        onChange={e => setBatchCallId(e.target.value)}
        value={batchCallId}
      />
      <Button
        data-test-id="sign-transaction-button"
        onClick={onGetCallsStatus}
        isDisabled={loading}
      >
        Get Calls Status
      </Button>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to {allowedChains.map(ci => ci.chainName).join(', ')} to test this feature
    </Text>
  )
}
