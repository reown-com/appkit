import Link from 'next/link'
import { Column } from '@/components/ui/column'
import Image from 'next/image'
import { Row } from '@/components/ui/row'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { GitHubLogoIcon, MixIcon, ReaderIcon } from '@radix-ui/react-icons'
import { ModeToggle } from '@/components/theme-toggle'
import { Span } from '@/components/ui/typography'
import { ConfigurationDialog } from '@/components/configuration-dialog'

export function LayoutHeader() {
  return (
    <Column className="gap-6 items-center py-6 flex-wrap md:flex-row md:justify-between md:items-center">
      <Link href="/">
        <Image alt="web3modal logo" src="/logo.png" width={200} height={100} />
      </Link>

      <Row className="gap-4 justify-end">
        <Row className="gap-1 justify-end">
          <Link
            className={cn(buttonVariants({ variant: 'ghost' }))}
            target="_blank"
            href="https://github.com/WalletConnect/web3modal"
          >
            <GitHubLogoIcon className="mr-0 sm:mr-2" />
            <Span className="hidden sm:inline-block">GitHub</Span>
          </Link>
          <Link
            className={cn(buttonVariants({ variant: 'ghost' }))}
            target="_blank"
            href="https://gallery.web3modal.com"
          >
            <MixIcon className="mr-0 sm:mr-2" />
            <Span className="hidden sm:inline-block">Components</Span>
          </Link>
          <Link
            className={cn(buttonVariants({ variant: 'ghost' }))}
            target="_blank"
            href="https://docs.walletconnect.com/web3modal/about"
          >
            <ReaderIcon className="mr-0 sm:mr-2" />
            <Span className="hidden sm:inline-block">Docs</Span>
          </Link>
        </Row>

        <ModeToggle />

        <ConfigurationDialog />
      </Row>
    </Column>
  )
}
