import { toast } from 'sonner'
import { parseGwei, type Address } from 'viem'
import { useEstimateGas, useSendTransaction, useAccount } from 'wagmi'
import { vitalikEthAddress } from '../../utils/DataUtil'
import { useCallback, useState } from 'react'
import { optimism, optimismSepolia, sepolia } from 'wagmi/chains'
import { Span } from '@/components/ui/typography'
import { Row } from '@/components/ui/row'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Column } from '@/components/ui/column'
import Link from 'next/link'

const TEST_TX = {
  to: vitalikEthAddress as Address,
  value: parseGwei('0.001')
}

export function WagmiTransactionTest() {
  const { status, chain } = useAccount()
  const { data: gas, error: prepareError } = useEstimateGas(TEST_TX)
  const [isLoading, setLoading] = useState(false)
  const isConnected = status === 'connected'

  const { sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: hash => {
        setLoading(false)
        toast.success('Transaction Success', {
          description: hash
        })
      },
      onError: () => {
        setLoading(false)
        toast.error('Error', {
          description: 'Failed to send transaction'
        })
      }
    }
  })

  const onSendTransaction = useCallback(() => {
    if (prepareError) {
      toast.error('Error', {
        description: 'Not enough funds for transaction'
      })
    } else {
      setLoading(true)
      sendTransaction({
        ...TEST_TX,
        gas
      })
    }
  }, [sendTransaction, prepareError])

  const allowedChains = [sepolia.id, optimism.id, optimismSepolia.id] as number[]

  return allowedChains.includes(Number(chain?.id)) && status === 'connected' ? (
    <Column className="sm:flex-row sm:items-center w-full gap-4 justify-between">
      <Button
        data-test-id="sign-transaction-button"
        onClick={onSendTransaction}
        disabled={isLoading || !isConnected}
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
