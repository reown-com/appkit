'use client'

import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
  Text
} from '@chakra-ui/react'
import type { SessionTypes } from '@walletconnect/types'

import type { CustomCaipNetwork } from '@reown/appkit-common'
import { UniversalConnector } from '@reown/appkit-universal-connector'

const suiMainnet: CustomCaipNetwork<'sui'> = {
  id: 784,
  chainNamespace: 'sui' as const,
  caipNetworkId: 'sui:mainnet',
  name: 'Sui',
  nativeCurrency: { name: 'SUI', symbol: 'SUI', decimals: 9 },
  rpcUrls: { default: { http: ['https://fullnode.mainnet.sui.io:443'] } }
}

const stacksMainnet: CustomCaipNetwork<'stacks'> = {
  id: 1,
  chainNamespace: 'stacks' as const,
  caipNetworkId: 'stacks:1',
  name: 'Stacks',
  nativeCurrency: { name: 'STX', symbol: 'STX', decimals: 6 },
  rpcUrls: { default: { http: ['https://stacks-node-mainnet.stacks.co'] } }
}

async function getUniversalConnector() {
  const universalConnector = await UniversalConnector.init({
    projectId: process.env['NEXT_PUBLIC_PROJECT_ID'] ?? '',
    metadata: {
      name: 'Universal Connector',
      description: 'Universal Connector',
      url: 'https://appkit.reown.com',
      icons: ['https://appkit.reown.com/icon.png']
    },
    networks: [
      {
        methods: ['sui_signPersonalMessage'],
        chains: [suiMainnet as CustomCaipNetwork],
        events: [],
        namespace: 'sui'
      },
      {
        methods: ['stx_signMessage'],
        chains: [stacksMainnet as CustomCaipNetwork],
        events: ['stx_chainChanged'],
        namespace: 'stacks'
      }
    ]
  })

  return universalConnector
}

// Helper component to render a readable view of the WalletConnect session
function SessionDetails({ session }: { session: SessionTypes.Struct }) {
  return (
    <Stack spacing="3">
      <Box>
        <Heading size="sm">General</Heading>
        <Text>
          <strong>Topic:</strong> {session.topic}
        </Text>
        <Text>
          <strong>Relay protocol:</strong> {session.relay.protocol}
        </Text>
        <Text>
          <strong>Expiry:</strong> {new Date(session.expiry * 1000).toLocaleString()}
        </Text>
      </Box>

      <Box>
        <Heading size="sm">Namespaces</Heading>
        <Stack spacing="3" pl="4" borderLeftWidth="1px" borderColor="gray.200">
          {Object.entries(session.namespaces).map(([key, ns]) => (
            <Box key={key}>
              <Heading size="xs" textTransform="uppercase">
                {key}
              </Heading>
              <Text>
                <strong>Chains:</strong> {ns.chains?.join(', ') || '-'}
              </Text>
              <Text>
                <strong>Methods:</strong> {ns.methods.join(', ') || '-'}
              </Text>
              {ns.events.length > 0 && (
                <Text>
                  <strong>Events:</strong> {ns.events.join(', ')}
                </Text>
              )}
              <Text>
                <strong>Accounts:</strong> {ns.accounts.join(', ')}
              </Text>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box>
        <Heading size="sm">Peer</Heading>
        <Text>
          <strong>Name:</strong> {session.peer.metadata.name}
        </Text>
        <Text>
          <strong>Description:</strong> {session.peer.metadata.description}
        </Text>
        <Text>
          <strong>URL:</strong> {session.peer.metadata.url}
        </Text>
      </Box>
    </Stack>
  )
}

export default function UniversalConnectorPage() {
  const [universalConnector, setUniversalConnector] = useState<UniversalConnector>()
  const [session, setSession] = useState<SessionTypes.Struct>()

  async function connect() {
    if (!universalConnector) {
      return
    }

    const { session: providerSession } = await universalConnector.connect()
    setSession(providerSession)
  }

  async function disconnect() {
    if (!universalConnector) {
      return
    }
    await universalConnector.disconnect()
  }

  async function signSuiMessage(message: string) {
    if (!universalConnector) {
      return
    }

    try {
      const account = session?.namespaces['sui']?.accounts[0]
      if (!account) {
        throw new Error('No account found')
      }

      const result = await universalConnector.request(
        {
          method: 'sui_signPersonalMessage',
          params: [message]
        },
        'sui:mainnet'
      )

      // eslint-disable-next-line no-console
      console.log('>> Sui Sign Message result', result)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('>> Sui Sign Message error', error)
    }
  }

  async function signStacksMessage(message: string) {
    if (!universalConnector) {
      return
    }

    try {
      const account = session?.namespaces['stacks']?.accounts[0]
      if (!account) {
        throw new Error('No account found')
      }

      const result = await universalConnector.request(
        {
          method: 'stx_signMessage',
          params: {
            message,
            address: account
          }
        },
        'stacks:1'
      )
      // eslint-disable-next-line no-console
      console.log('>> Stacks Sign Message result', result)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('>> Stacks Sign Message error', error)
    }
  }

  useEffect(() => {
    setSession(universalConnector?.provider.session)
  }, [universalConnector?.provider.session])

  useEffect(() => {
    getUniversalConnector().then(setUniversalConnector)
  }, [])

  return (
    <Card data-testid="universal-provider-example" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Universal Connector Example</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Connection
            </Heading>

            {session ? (
              <Stack direction="row" spacing={4}>
                <Button onClick={disconnect}>Disconnect</Button>
                <Button onClick={() => signSuiMessage('Hello, world!')}>Sign SUI Message</Button>
                <Button onClick={() => signStacksMessage('Hello, world!')}>
                  Sign Stacks Message
                </Button>
              </Stack>
            ) : (
              <Button onClick={connect}>Connect</Button>
            )}
          </Box>

          {session && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Session
              </Heading>
              <SessionDetails session={session} />
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
