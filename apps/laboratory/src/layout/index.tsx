'use client'

import type { ReactNode } from 'react'

import { ChakraProvider, ColorModeScript, Container } from '@chakra-ui/react'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

import { LayoutHeader } from '@/src/layout/LayoutHeader'

type Props = {
  children: ReactNode | ReactNode[]
  session: Session | null
}

export default function Layout({ children, session }: Props) {
  return (
    <ChakraProvider>
      <ColorModeScript initialColorMode="system" />
      <SessionProvider session={session} refetchInterval={0}>
        <Container maxW="100ch">
          <LayoutHeader />
          <main>{children}</main>
        </Container>
      </SessionProvider>
    </ChakraProvider>
  )
}
