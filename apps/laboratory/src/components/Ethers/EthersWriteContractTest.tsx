import { toast } from 'sonner'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { BrowserProvider, JsonRpcSigner, ethers } from 'ethers'
import { optimism, sepolia } from '../../utils/ChainsUtil'
import { useState } from 'react'

import { abi, address as donutAddress } from '../../utils/DonutContract'
import { Column } from '@/components/ui/column'
import { Button, buttonVariants } from '@/components/ui/button'
import { Row } from '@/components/ui/row'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Span } from '@/components/ui/typography'

export function EthersWriteContractTest() {
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
      const contract = new ethers.Contract(donutAddress, abi, signer)
      // @ts-expect-error ethers types are correct
      const tx = await contract.purchase(1, { value: ethers.parseEther('0.0001') })
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
        Purchase crypto donut
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
