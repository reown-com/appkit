import { Button, Stack, Link, Text, Spacer } from '@chakra-ui/react'
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
  type Provider
} from '@reown/appkit-new/react'
import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers'
import { useState } from 'react'
import { mainnet } from '@reown/appkit-new/networks'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { useChakraToast } from '../Toast'

export function EthersTransactionTest() {
  const toast = useChakraToast()
  const { chainId } = useAppKitNetwork()
  const { address } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('eip155')
  const [loading, setLoading] = useState(false)

  async function onSendTransaction() {
    try {
      setLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = new JsonRpcSigner(provider, address)
      const tx = await signer.sendTransaction({
        to: vitalikEthAddress,
        value: ethers.parseUnits('0.0001', 'gwei')
      })

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

  return chainId !== mainnet.id && address ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-testid="sign-transaction-button"
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
      Feature not enabled on Ethereum Mainnet
    </Text>
  )
}
