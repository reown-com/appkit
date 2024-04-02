import { toast } from 'sonner'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers'
import { sepolia, optimism } from '../../utils/ChainsUtil'
import { useState } from 'react'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Row } from '@/components/ui/row'
import { Column } from '@/components/ui/column'
import { Span } from '@/components/ui/typography'
import Link from 'next/link'

export function EthersTransactionTest() {
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
        value: ethers.parseUnits('0.0001', 'gwei')
      })
      toast.success('Success', { description: tx.hash })
    } catch {
      toast.error('Error', {
        description: 'Failed to sign transaction'
      })
    } finally {
      setLoading(false)
    }
  }

  const allowedChains = [sepolia.chainId, optimism.chainId]

  return allowedChains.includes(Number(chainId)) && address ? (
    <Column className="sm:flex-row sm:items-center w-full gap-4 justify-between">
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={loading}
        variant={'secondary'}
      >
        Send Transaction to Vitalik
      </Button>

      <Row className="gap-2">
        <Link
          className={cn(buttonVariants({ variant: 'outline' }))}
          target="_blank"
          href="https://sepoliafaucet.com"
        >
          Sepolia Faucet 1
        </Link>

        <Link
          className={cn(buttonVariants({ variant: 'outline' }))}
          target="_blank"
          href="https://www.infura.io/faucet/sepolia"
        >
          Sepolia Faucet 2
        </Link>
      </Row>
    </Column>
  ) : (
    <Span className="text-red-700 dark:text-red-400">
      Switch to Sepolia or OP to test this feature
    </Span>
  )
}
