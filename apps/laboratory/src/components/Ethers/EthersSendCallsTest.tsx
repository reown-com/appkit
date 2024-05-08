import { Button, Stack, Link, Text, Spacer } from '@chakra-ui/react'
import { useState } from 'react'
import { sepolia } from '../../utils/ChainsUtil'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { useChakraToast } from '../Toast'
import { parseGwei, type Address } from 'viem'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { BrowserProvider } from 'ethers'

export type SendCallsParams = {
  version: string
  chainId: `0x${string}` // Hex chain id
  from: `0x${string}`
  calls: {
    to?: `0x${string}` | undefined
    data?: `0x${string}` | undefined
    value?: `0x${string}` | undefined // Hex value
  }[]
  capabilities?: Record<string, any> | undefined
}

export function EthersSendCallsTest() {
  const toast = useChakraToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)

  function formatTestBatchCall(accountAddress: string, chainId: number) {
    // preparing calldata for batch send
    const amountToSend = parseGwei('0.001').toString(16)
    const calls = [
      {
        to: vitalikEthAddress as `0x${string}`,
        data: '0x' as `0x${string}`,
        value: `0x${amountToSend}` as `0x${string}`
      },
      {
        to: vitalikEthAddress as Address,
        data: '0xdeadbeef' as `0x${string}`
      }
    ]
    const sendCallsRequestParams: SendCallsParams = {
      version: '1.0',
      chainId: `0x${BigInt(chainId).toString(16)}`,
      from: accountAddress as `0x${string}`,
      calls: calls
    }

    return sendCallsRequestParams
  }

  async function onSendCalls() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      if (!chainId) throw Error('Select chain')
      const provider = new BrowserProvider(walletProvider, chainId)
      const sendCallsParams = formatTestBatchCall(address, chainId)
      console.log(sendCallsParams)
      const batchCallHash = await provider.send('wallet_sendCalls', [sendCallsParams])

      toast({
        title: 'Success',
        description: batchCallHash,
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
      <Button data-test-id="sign-transaction-button" onClick={onSendCalls} isDisabled={loading}>
        Send Batch Calls to Vitalik
      </Button>

      <Spacer />

      <Link isExternal href="https://sepoliafaucet.com">
        <Button variant="outline" colorScheme="blue" isDisabled={loading}>
          Sepolia Faucet 1
        </Button>
      </Link>

      <Link isExternal href="https://www.infura.io/faucet/sepolia">
        <Button variant="outline" colorScheme="orange" isDisabled={loading}>
          Sepolia Faucet 2
        </Button>
      </Link>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Sepolia to test this feature
    </Text>
  )
}
