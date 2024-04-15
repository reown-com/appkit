import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { SIWESession } from '@web3modal/siwe'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Column } from '@/components/ui/column'
import { Span } from '@/components/ui/typography'

export function SiweData() {
  const [ready, setReady] = useState(false)
  const { data, status } = useSession()
  const session = data as unknown as SIWESession

  useEffect(() => {
    setReady(true)
  }, [])

  return ready ? (
    <Card className="mb-6">
      <CardHeader className="border-b border-muted bg-muted dark:bg-muted/20 rounded-t-md px-6 py-4">
        <CardTitle className="text-lg">SIWE Session Details</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Column className="divide-y divide-muted">
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4">
            <Span className="text-sm uppercase">Session Status</Span>
            <Span data-testid="w3m-authentication-status" className="text-muted-foreground">
              {status}
            </Span>
          </Column>

          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4">
            <Span className="text-sm uppercase">Session Network</Span>
            <Span className="text-muted-foreground">{`eip155:${session?.chainId}`}</Span>
          </Column>
          <Column className="py-4 first:pt-0 last:pb-0 items-start gap-4">
            <Span className="text-sm uppercase">Session Network Address</Span>
            <Span className="text-muted-foreground">{session?.address || '-'}</Span>
          </Column>
        </Column>
      </CardContent>
    </Card>
  ) : null
}
