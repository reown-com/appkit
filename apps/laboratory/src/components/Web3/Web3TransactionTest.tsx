import { Button, Stack, Link, Text, Spacer } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from 'web3modal-web3js/react'

import { Web3Eth } from 'web3-eth'
import { toWei } from 'web3-utils'

import { sepolia, optimism } from '../../utils/ChainsUtil'
import { useState } from 'react'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { useChakraToast } from '../Toast'

export function Web3TransactionTest() {
  const toast = useChakraToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const [loading, setLoading] = useState(false)

  async function onSendTransaction() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }

      const web3Eth = new Web3Eth({
        provider: walletProvider,
        config: { defaultNetworkId: chainId }
      })
      /**
       * Alternative to the above you can use the following:
       * ```
       * import { Web3 } from 'web3'
       * ...
       * const web3 = new Web3({ provider: walletProvider, config: { defaultNetworkId: chainId } })
       * ```
       * And later in the code: you can use `web3.eth` instead of `web3Eth`, and `web3.utils.toWei(...)` instead of `toWei(...)`.
       */

      const tx = await web3Eth.sendTransaction({
        from: address,
        to: vitalikEthAddress,
        value: toWei('0.0001', 'ether')
      })

      toast({
        title: 'Success',
        description: tx.transactionHash,
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

  const allowedChains = [sepolia.chainId, optimism.chainId]

  return allowedChains.includes(Number(chainId)) && address ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        isDisabled={loading}
      >
        Send Transaction to Vitalik
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
      Switch to Sepolia or OP to test this feature
    </Text>
  )
}
