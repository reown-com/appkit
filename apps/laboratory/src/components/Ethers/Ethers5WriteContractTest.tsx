import { useState } from 'react'

import { Button, Link, Spacer, Stack, Text } from '@chakra-ui/react'
import { ethers } from 'ethers5'

import { optimism, sepolia } from '@reown/appkit/networks'
import {
  type Provider,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider
} from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { abi, address as donutAddress } from '@/src/utils/DonutContract'

export function Ethers5WriteContractTest() {
  const [loading, setLoading] = useState(false)

  const toast = useChakraToast()
  const { address } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<Provider>('eip155')

  async function onSendTransaction() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const provider = new ethers.providers.Web3Provider(walletProvider, chainId)
      const signer = provider.getSigner(address)
      const contract = new ethers.Contract(donutAddress, abi, signer)
      // @ts-expect-error ethers types are correct
      const tx = await contract.purchase(1, { value: ethers.parseEther('0.00001') })
      toast({
        title: 'Success',
        description: tx.hash,
        type: 'success'
      })
    } catch (e) {
      toast({
        title: 'Error',
        // @ts-expect-error - error is unknown
        description: e?.message || 'Failed to sign transaction',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }
  const allowedChains = [sepolia.id, optimism.id]

  return allowedChains.find(chain => chain === chainId) && address ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-testid="sign-transaction-button"
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
