import { useWeb3ModalAccount } from '@web3modal/solana/react'

import { SolanaSignTransactionTest } from './SolanaSignTransactionTest'
import { SolanaSendTransactionTest } from './SolanaSendTransactionTest'
import { solana } from '../../utils/ChainsUtil'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Span } from '@/components/ui/typography'
import { Column } from '@/components/ui/column'

export function SolanaTests() {
  const { isConnected, currentChain } = useWeb3ModalAccount()

  return isConnected ? (
    <Card className="mb-6">
      <CardHeader className="border-b border-muted bg-muted/20 px-6 py-4">
        <CardTitle className="text-lg">Test Interactions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Column className="divide-y divide-muted items-start">
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4 w-full">
            <Span className="text-sm uppercase">Sign Message</Span>
            {currentChain?.chainId !== solana.chainId && (
              <Span className="text-red-700 dark:text-red-400">
                Please ensure your wallet is connected to the {currentChain?.name}
              </Span>
            )}
          </Column>

          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4 w-full">
            <Span className="text-sm uppercase">Sign Transaction</Span>
            <SolanaSignTransactionTest />
          </Column>
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4 w-full">
            <Span className="text-sm uppercase">Sign and Send Transaction</Span>
            <SolanaSendTransactionTest />
          </Column>
        </Column>
      </CardContent>
    </Card>
  ) : null
}
