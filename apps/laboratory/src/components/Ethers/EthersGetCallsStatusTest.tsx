import { Button, Stack, Text, Input } from '@chakra-ui/react'
import { useState } from 'react'
import { sepolia } from '../../utils/ChainsUtil'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { useChakraToast } from '../Toast'
import { BrowserProvider } from 'ethers'

export type GetCallsStatusParams = `0x${string}`

export function EthersGetCallsStatusTest() {
  const toast = useChakraToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)
  const [batchCallId, setBatchCallId] = useState('')

  async function onGetCallsStatus() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      if (!chainId) throw Error('chain not selected')
      if (!batchCallId) throw Error('call tx hash not valid')
      const provider = new BrowserProvider(walletProvider, chainId)
      const batchCallsStatus = await provider.send('wallet_getCallsStatus', [
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
        description: 'Failed to sign transaction',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const allowedChains = [sepolia.chainId]

  return allowedChains.includes(Number(chainId)) && address ? (
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
      Switch to Sepolia to test this feature
    </Text>
  )
}
