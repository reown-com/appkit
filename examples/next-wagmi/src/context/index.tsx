'use client'

import { config } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import React, { ReactNode } from 'react'
import { State, WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

createWeb3Modal({
  wagmiConfig: config,
  projectId: 'bd4997ce3ede37c95770ba10a3804dad'
})

function ContextProvider({
  children,
  initialState
}: {
  children: ReactNode
  initialState: State | undefined
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
