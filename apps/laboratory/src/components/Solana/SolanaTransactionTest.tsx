import { Button, useToast, Stack, Link, Text, Spacer } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { solanaTestnet } from '../../utils/ChainsUtil'
import { useState } from 'react'

export function SolanaTransactionTest() {
  const toast = useToast()
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
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
        value: ethers.parseUnits('0.001', 'gwei')
      })
      toast({ title: 'Succcess', description: tx.blockHash, status: 'success', isClosable: true })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to sign transaction',
        status: 'error',
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }

  return chainId === solanaTestnet.chainId && address ? (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        isDisabled={loading}
      >
        Send Transaction to Vitalik
      </Button>

      <Spacer />

      <Link isExternal href="https://solfaucet.com/">
        <Button variant="outline" colorScheme="blue" isDisabled={loading}>
          Solana Faucet 1
        </Button>
      </Link>
    </Stack>
  ) : (
    <Text fontSize="md" color="yellow">
      Switch to Solana Testnet to test this feature
    </Text>
  )
}
