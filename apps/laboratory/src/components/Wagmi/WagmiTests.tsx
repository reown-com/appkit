import { WagmiTransactionTest } from './WagmiTransactionTest'
import { WagmiSignMessageTest } from './WagmiSignMessageTest'
import { WagmiSignTypedDataTest } from './WagmiSignTypedDataTest'
import { WagmiWriteContractTest } from './WagmiWriteContractTest'
import { WagmiSendUSDCTest } from './WagmiSendUSDCTest'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Span } from '@/components/ui/typography'
import { Column } from '@/components/ui/column'

export function WagmiTests() {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-muted bg-muted dark:bg-muted/20 rounded-t-md px-6 py-4">
        <CardTitle className="text-lg">Test Interactions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Column className="divide-y divide-muted items-start">
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4 w-full">
            <Span className="text-sm uppercase">Sign Message</Span>
            <WagmiSignMessageTest />
          </Column>
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4 w-full">
            <Span className="text-sm uppercase">Sign Typed Data</Span>
            <WagmiSignTypedDataTest />
          </Column>

          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4 w-full">
            <Span className="text-sm uppercase">Sign Transaction</Span>
            <WagmiTransactionTest />
          </Column>
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4 w-full">
            <Span className="text-sm uppercase">Contract Write</Span>
            <WagmiWriteContractTest />
          </Column>
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4 w-full">
            <Span className="text-sm uppercase">USDC Send</Span>
            <WagmiSendUSDCTest />
          </Column>
        </Column>
      </CardContent>
    </Card>
  )
}
