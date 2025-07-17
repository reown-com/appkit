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

/*
 * Example network config:
 * const suiTestnet = {
 *   id: 784,
 *   chainNamespace: 'sui' as const,
 *   caipNetworkId: 'sui:testnet',
 *   name: 'Sui',
 *   nativeCurrency: { name: 'SUI', symbol: 'SUI', decimals: 9 },
 *   rpcUrls: { default: { http: ['https://fullnode.testnet.sui.io:443'] } },
 *   connectParams: {
 *     methods: ['sui_signPersonalMessage'],
 *     chains: ['sui:testnet'],
 *     events: []
 *   }
 * }
 */

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
    projectId: process.env['NEXT_PUBLIC_PROJECT_ID']!,
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
        accounts: [],
        namespace: 'sui'
      },
      {
        methods: ['stx_signMessage'],
        chains: [stacksMainnet as CustomCaipNetwork],
        events: ['stx_chainChanged'],
        accounts: [],
        namespace: 'stacks'
      }
    ]
  })

  return universalConnector
}

export default function UniversalConnectorPage() {
  const [universalConnector, setUniversalConnector] = useState<UniversalConnector | null>(null)
  const [session, setSession] = useState<SessionTypes.Struct | null>(null)

  async function connect() {
    if (!universalConnector) {
      return
    }

    const { session: providerSession } = await universalConnector.connect()
    setSession(providerSession ?? null)
  }

  async function disconnect() {
    if (!universalConnector) {
      return
    }
    await universalConnector.disconnect()
    setSession(null)
  }

  async function signSuiMessage(message: string) {
    if (!universalConnector) {
      return
    }

    console.log('>> Signing message in SUI...', message, universalConnector)
    await universalConnector.request(
      {
        method: 'sui_signPersonalMessage',
        params: [message]
      },
      'sui:mainnet'
    )
  }

  async function signStacksMessage(message: string) {
    if (!universalConnector) {
      return
    }

    console.log(
      '>> Signing message in Stacks...',
      message,
      session?.namespaces['stacks']?.accounts[0]
    )
    await universalConnector.request(
      {
        method: 'stx_signMessage',
        params: {
          message,
          address: session?.namespaces['stacks']?.accounts[0]
        }
      },
      'stacks:1'
    )
  }

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
              <>
                <Button onClick={disconnect}>Disconnect</Button>
                <Button onClick={() => signSuiMessage('Hello, world!')}>Sign SUI Message</Button>
                <Button onClick={() => signStacksMessage('Hello, world!')}>
                  Sign Stacks Message
                </Button>
              </>
            ) : (
              <Button onClick={connect}>Connect</Button>
            )}
          </Box>

          {session && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Session
              </Heading>
              <Text>{JSON.stringify(session, null, 2)}</Text>
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
