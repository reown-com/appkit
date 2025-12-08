'use client'

import Image from 'next/image'
import Link from 'next/link'

import { useAppKitAccount } from '@reown/appkit/react'

import { AccountCard } from '@/components/AccountCard'
import { ConnectCard } from '@/components/ConnectCard'
import { FieldDescription } from '@/components/ui/field'
import { initializeAppKit } from '@/lib/appkit'

initializeAppKit()

export default function LoginPage() {
  const { address } = useAppKitAccount()

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full items-center flex-col gap-4">
        {address ? <AccountCard /> : <ConnectCard />}
        <FieldDescription className="px-6 text-center">
          AppKit Headless in in-progress at the moment and available to limited users.
        </FieldDescription>
        <div className="flex items-center gap-2 text-base text-muted-foreground self-center font-medium">
          UX by
          <Image src="/reown-logo-dark.png" alt="AppKit" width={90} height={25} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground self-center">
          <Link
            href="https://reown.com"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Website
          </Link>
          ·
          <Link
            href="https://dashboardreown.com"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Docs
          </Link>
          ·
          <Link
            href="https://docs.reown.com"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
