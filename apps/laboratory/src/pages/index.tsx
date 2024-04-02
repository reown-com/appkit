import { wagmiSdkOptions, ethersSdkOptions, solanaSdkOptions } from '../utils/DataUtil'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Column } from '@/components/ui/column'
import { Row } from '@/components/ui/row'
import { P, Span } from '@/components/ui/typography'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import WagmiIcon from '@/components/icons/wagmi'
import EthersIcon from '@/components/icons/ethers'
import SolanaIcon from '@/components/icons/solana'

export default function HomePage() {
  return (
    <Column className="gap-4 mt-8 md:mt-16">
      <Card>
        <CardHeader className="border-b border-muted bg-muted/20 px-6 py-4 flex flex-row items-center justify-start gap-2">
          <WagmiIcon className="w-8 h-8 inline-block text-primary" />
          <CardTitle className="text-lg !mt-0">Wagmi</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Column className="divide-y divide-muted/50">
            {wagmiSdkOptions.map(option => (
              <Row key={option.link} className="py-4 first:pt-0 last:pb-0">
                <Column className="flex-row gap-6 sm:flex-row sm:items-center sm:justify-between w-full">
                  <Column className="items-start gap-2">
                    <Span className="text-base">{option.title}</Span>
                    <P className="!mt-0 text-base text-muted-foreground">{option.description}</P>
                  </Column>
                  <Link href={option.link}>
                    <Button variant="outline">
                      Go <ArrowRightIcon className="ml-2" />
                    </Button>
                  </Link>
                </Column>
              </Row>
            ))}
          </Column>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-muted bg-muted/20 px-6 py-4 flex flex-row items-center justify-start gap-2">
          <EthersIcon className="w-8 h-8 inline-block text-primary" />
          <CardTitle className="text-lg !mt-0">Ethers</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Column className="divide-y divide-muted/50">
            {ethersSdkOptions.map(option => (
              <Row key={option.link} className="py-4 first:pt-0 last:pb-0">
                <Column className="flex-row gap-6 sm:flex-row sm:items-center sm:justify-between w-full">
                  <Column className="items-start gap-2">
                    <Span className="text-base">{option.title}</Span>
                    <P className="!mt-0 text-base text-muted-foreground">{option.description}</P>
                  </Column>
                  <Link href={option.link}>
                    <Button variant="outline">
                      Go <ArrowRightIcon className="ml-2" />
                    </Button>
                  </Link>
                </Column>
              </Row>
            ))}
          </Column>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-muted bg-muted/20 px-6 py-4 flex flex-row items-center justify-start gap-2">
          <SolanaIcon className="w-8 h-8 inline-block text-primary" />
          <CardTitle className="text-lg !mt-0">Solana</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Column className="divide-y divide-muted/50">
            {solanaSdkOptions.map(option => (
              <Row key={option.link} className="py-4 first:pt-0 last:pb-0">
                <Column className="flex-row gap-6 sm:flex-row sm:items-center sm:justify-between w-full">
                  <Column className="items-start gap-2">
                    <Span className="text-base">{option.title}</Span>
                    <P className="!mt-0 text-base text-muted-foreground">{option.description}</P>
                  </Column>
                  <Link href={option.link}>
                    <Button variant="outline">
                      Go <ArrowRightIcon className="ml-2" />
                    </Button>
                  </Link>
                </Column>
              </Row>
            ))}
          </Column>
        </CardContent>
      </Card>
    </Column>
  )
}
