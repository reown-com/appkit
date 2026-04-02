import { useState } from 'react'

import { AddIcon } from '@chakra-ui/icons'
import { Button, Link, Spacer, Stack, Text } from '@chakra-ui/react'
import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers'

import { mainnet } from '@reown/appkit/networks'
import {
  type Provider,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider
} from '@reown/appkit/react'

import { AddTransactionModal } from '@/src/components/AddTransactionModal'
import { useChakraToast } from '@/src/components/Toast'
import { vitalikEthAddress } from '@/src/utils/DataUtil'

export function EthersTransactionTest() {
  const toast = useChakraToast()
  const { chainId } = useAppKitNetwork()
  const { address } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider<Provider>('eip155')
  const [isLoading, setIsLoading] = useState(false)
  const [customTx, setCustomTx] = useState<{
    to: string
    value: bigint
    data?: string
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function onSendTransaction() {
    try {
      setIsLoading(true)
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = new JsonRpcSigner(provider, address)

      const txParams = customTx || {
        to: vitalikEthAddress,
        value: ethers.parseUnits('0.0001', 'gwei')
      }

      const tx = await signer.sendTransaction(txParams)

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
      setIsLoading(false)
    }
  }

  function onConfigureTransaction(params: { eth: string; to: string; data?: string }) {
    setCustomTx({
      to: params.to,
      value: ethers.parseUnits(params.eth, 'gwei'),
      data: params.data
    })
    setIsModalOpen(false)
  }

  function onCloseModal() {
    setIsModalOpen(false)
  }

  return chainId !== mainnet.id && address ? (
    <>
      <Stack direction={['column', 'column', 'row']}>
        <Button
          data-testid="sign-transaction-button"
          onClick={onSendTransaction}
          isDisabled={isLoading}
        >
          {customTx ? 'Send Custom Transaction' : 'Send Transaction to Vitalik'}
        </Button>

        <Button
          variant="outline"
          colorScheme="blue"
          onClick={() => setIsModalOpen(true)}
          isDisabled={isLoading}
        >
          <AddIcon mr={2} /> Configure Transaction
        </Button>

        {customTx && (
          <Button
            variant="outline"
            colorScheme="red"
            onClick={() => setCustomTx(null)}
            isDisabled={isLoading}
          >
            Reset to Default
          </Button>
        )}

        <Spacer />

        <Link isExternal href="https://sepoliafaucet.com">
          <Button variant="outline" colorScheme="blue" isDisabled={isLoading}>
            Sepolia Faucet 1
          </Button>
        </Link>

        <Link isExternal href="https://www.infura.io/faucet/sepolia">
          <Button variant="outline" colorScheme="orange" isDisabled={isLoading}>
            Sepolia Faucet 2
          </Button>
        </Link>
      </Stack>
      <AddTransactionModal
        isOpen={isModalOpen}
        onSubmit={onConfigureTransaction}
        onClose={onCloseModal}
      />
    </>
  ) : (
    <Text fontSize="md" color="yellow">
      Feature not enabled on Ethereum Mainnet
    </Text>
  )
}
