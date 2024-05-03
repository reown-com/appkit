import { Button, Stack, Link, Text, Spacer } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/web3/react'
import {
  utils as web3Utils,
  // @TODO consider using this code instead of the next line: eth, Web3Context, ETH_DATA_FORMAT,
  Web3
} from 'web3'
import { optimism, sepolia } from '../../utils/ChainsUtil'
import { useState } from 'react'

import { constAbi, address as donutAddress } from '../../utils/DonutContract'
import { useChakraToast } from '../Toast'

export function Web3WriteContractTest() {
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

      const web3 = new Web3({ provider: walletProvider, config: { defaultNetworkId: chainId } })
      const contract = new web3.eth.Contract(constAbi, donutAddress)

      const tx = await contract.methods
        .purchase(1, { value: web3Utils.toWei('0.0001', 'ether') })
        .send({ from: address })

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
        Purchase crypto donut
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
