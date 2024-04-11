import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Column } from '@/components/ui/column'
import { Span } from '@/components/ui/typography'

export function Web3ModalButtons() {
  return (
    <Card className="mt-8 md:mt-16 mb-6">
      <CardHeader className="border-b border-muted bg-muted/20 px-6 py-4">
        <CardTitle className="text-lg">Web3Modal Interactions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Column className="divide-y divide-muted">
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4">
            <Span className="text-sm uppercase">Connect / Account Button</Span>
            <w3m-button />
          </Column>
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4">
            <Span className="text-sm uppercase">Network Button</Span>
            <w3m-network-button />
          </Column>
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4">
            <Span className="text-sm uppercase">Onramp Widget</Span>
            <w3m-onramp-widget />
          </Column>
        </Column>
      </CardContent>
    </Card>
  )
}
