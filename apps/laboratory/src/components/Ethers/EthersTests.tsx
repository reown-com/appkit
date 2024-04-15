import { useWeb3ModalAccount } from '@web3modal/ethers/react'
import { EthersSignMessageTest } from './EthersSignMessageTest'
import { EthersSignTypedDataTest } from './EthersSignTypedDataTest'
import { EthersTransactionTest } from './EthersTransactionTest'
import { EthersWriteContractTest } from './EthersWriteContractTest'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Column } from '@/components/ui/column'
import { Span } from '@/components/ui/typography'

export function EthersTests() {
  const { isConnected } = useWeb3ModalAccount()

  return isConnected ? (
    <Card className="mb-6">
      <CardHeader className="border-b border-muted bg-muted dark:bg-muted/20 rounded-t-md px-6 py-4">
        <CardTitle className="text-lg">Test Interactions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 divide-y divide-muted">
        <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4">
          <Span className="text-sm uppercase">Sign Message</Span>
          <EthersSignMessageTest />
        </Column>
        <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4">
          <Span className="text-sm uppercase">Sign Typed Data</Span>
          <EthersSignTypedDataTest />
        </Column>
        <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4">
          <Span className="text-sm uppercase">Sign Transaction</Span>
          <EthersTransactionTest />
        </Column>
        <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4">
          <Span className="text-sm uppercase">Contract Write</Span>
          <EthersWriteContractTest />
        </Column>
      </CardContent>
    </Card>
  ) : null
}
