import * as React from 'react'

import { Box, Text } from '@chakra-ui/react'
import { Heading } from '@chakra-ui/react'
import UniversalProvider from '@walletconnect/universal-provider'

import { useAppKitProvider } from '@reown/appkit/react'

export function RelayClientInfo() {
  const [clientId, setClientId] = React.useState<string | undefined>(undefined)
  const { walletProvider, walletProviderType } = useAppKitProvider<UniversalProvider>('eip155')

  async function getClientId() {
    if (walletProviderType === 'WALLET_CONNECT') {
      return await walletProvider?.client?.core?.crypto?.getClientId()
    }

    return undefined
  }

  React.useEffect(() => {
    getClientId().then(setClientId)
  }, [walletProvider])

  return (
    <Box>
      <Heading size="xs" textTransform="uppercase" pb="2">
        Relay Client ID
      </Heading>
      <Text data-testid="w3m-client-id">{clientId}</Text>
    </Box>
  )
}
