'use client'

import { IoArrowBack } from 'react-icons/io5'

import { Button, Card, Heading } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { WagmiProvider } from 'wagmi'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import DemoContent from '@/src/components/DemoContent'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { getAppKitAdapters, getAppKitConfigByName } from '@/src/utils/AppKitConfigUtil'

const queryClient = new QueryClient()

export default function Page() {
  const searchParams = useSearchParams()
  const config = getAppKitConfigByName(searchParams.get('name') || '')

  if (!config) {
    return (
      <Card p={4} mt={2}>
        <Heading size="xs" textTransform="uppercase" pb="2">
          Config not found
        </Heading>
        <Link href="/">
          <Button leftIcon={<IoArrowBack />}>Home</Button>
        </Link>
      </Card>
    )
  }

  const adapters = getAppKitAdapters(config.adapters, config.wagmiConfig)
  const appKitConfig = { ...config, adapters }
  const hasWagmi = config?.adapters?.includes('wagmi')

  if (hasWagmi && config.wagmiConfig) {
    const wagmiAdapter = adapters.find(a => a.namespace === 'eip155') as WagmiAdapter

    return (
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppKitProvider config={appKitConfig}>
            <DemoContent config={config} />
          </AppKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
  }

  return (
    <AppKitProvider config={appKitConfig}>
      <DemoContent config={config} />
    </AppKitProvider>
  )
}
