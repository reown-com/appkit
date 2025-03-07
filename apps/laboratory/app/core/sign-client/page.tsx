/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
'use client'

import React, { useEffect, useState } from 'react'

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
import SignClient from '@walletconnect/sign-client'
import type { SessionNamespace } from '@walletconnect/universal-provider'
import base58 from 'bs58'

import { AppKit, createAppKit } from '@reown/appkit/basic'
import { bitcoin, mainnet, polygon, solana } from '@reown/appkit/networks'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

// Constants
const PROJECT_ID = ConstantsUtil.ProjectId
const OPTIONAL_NAMESPACES = {
  eip155: {
    methods: [
      'eth_sendTransaction',
      'eth_signTransaction',
      'eth_sign',
      'personal_sign',
      'eth_signTypedData',
      'wallet_switchEthereumChain'
    ],
    chains: ['eip155:1', 'eip155:137'],
    events: ['chainChanged', 'accountsChanged']
  },
  solana: {
    methods: ['solana_signMessage'],
    chains: [solana.caipNetworkId],
    events: ['chainChanged', 'accountsChanged']
  },
  bip122: {
    methods: ['signMessage'],
    chains: [bitcoin.caipNetworkId],
    events: ['chainChanged', 'accountsChanged']
  }
}

const networks = [mainnet, polygon, solana, bitcoin]

export default function SignClientPage() {
  const toast = useChakraToast()
  const [signClient, setSignClient] = useState<SignClient | null>(null)
  const [modal, setModal] = useState<AppKit | null>(null)
  const [session, setSession] = useState<SessionNamespace | null>(null)
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [network, setNetwork] = useState<string | undefined>(undefined)

  useEffect(() => {
    async function initialize() {
      try {
        const client = await SignClient.init({ projectId: PROJECT_ID })
        setSignClient(client)

        const appKit = createAppKit({
          projectId: PROJECT_ID,
          networks,
          manualWCControl: true
        })

        setModal(appKit)

        // Get last session if exists
        const sessions = client.session.getAll()
        const lastSession = sessions[sessions.length - 1]

        if (lastSession) {
          setSession(lastSession)
          setAccount(lastSession?.namespaces?.eip155?.accounts?.[0]?.split(':')[2])
          setNetwork(lastSession?.namespaces?.eip155?.chains?.[0])
        }

        // Event listeners
        client.on('session_update', ({ topic, params }) => {
          const { namespaces } = params
          const _session = client.session.get(topic)
          setSession({ ..._session, namespaces })
        })
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }

    initialize()
  }, [])

  async function handleConnect() {
    if (!signClient) {
      return
    }

    try {
      setLoading(true)
      const { uri, approval } = await signClient.connect({
        optionalNamespaces: OPTIONAL_NAMESPACES
      })

      if (uri) {
        modal.open({ uri })
        const newSession = await approval()
        setSession(newSession)
        setAccount(newSession?.namespaces['eip155']?.accounts?.[0]?.split(':')[2])
        setNetwork(newSession?.namespaces['eip155']?.chains?.[0])
        modal.close()
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast({
        title: 'Connection Error',
        description: error instanceof Error ? error.message : 'Failed to connect',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect() {
    if (!signClient || !session) {
      return
    }

    try {
      await signClient.disconnect({ topic: session.topic })
      setSession(null)
      setAccount(undefined)
      setNetwork(undefined)
    } catch (error) {
      console.error('Disconnect error:', error)
      toast({
        title: 'Disconnect Error',
        description: error instanceof Error ? error.message : 'Failed to disconnect',
        type: 'error'
      })
    }
  }

  function getPayload() {
    if (!account || !network) {
      return null
    }

    const map = {
      solana: {
        method: 'solana_signMessage',
        params: {
          message: base58.encode(new TextEncoder().encode('Hello Appkit!')),
          pubkey: account
        }
      },
      eip155: {
        method: 'personal_sign',
        params: [account, 'Hello AppKit!']
      },
      bip122: {
        method: 'signMessage',
        params: {
          message: 'Hello AppKit!',
          account
        }
      }
    }

    const [namespace] = network.split(':')

    return map[namespace || '']
  }

  async function handleSignMessage() {
    if (!signClient || !account || !session) {
      toast({
        title: 'Error',
        description: 'User is disconnected',
        type: 'error'
      })

      return
    }

    try {
      const payload = getPayload()

      if (!payload) {
        toast({
          title: 'Error',
          description: 'Chain not supported by laboratory',
          type: 'error'
        })

        return
      }

      const sig = await signClient.request({
        topic: session.topic,
        chainId: network,
        request: payload
      })

      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: 'Message signed successfully',
        type: 'success'
      })

      console.log('Signature:', sig)
    } catch (error) {
      console.error('Signing error:', error)
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: error instanceof Error ? error.message : 'Failed to sign message',
        type: 'error'
      })
    }
  }

  async function handleSwitchNetwork(newNetwork: string, chainId: string) {
    if (!signClient || !session) {
      return
    }

    try {
      setNetwork(newNetwork)

      if (newNetwork.startsWith('eip155')) {
        await signClient.request({
          topic: session.topic,
          chainId: newNetwork,
          request: {
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }]
          }
        })
        setAccount(session?.namespaces?.eip155?.accounts?.[0]?.split(':')[2])
      } else if (newNetwork.startsWith('solana')) {
        setAccount(session?.namespaces?.solana?.accounts?.[0].split(':')[2])
      } else if (newNetwork.startsWith('bip122')) {
        setAccount(session?.namespaces?.bip122?.accounts?.[0].split(':')[2])
      }
    } catch (error) {
      console.error('Network switch error:', error)
      toast({
        title: 'Network Switch Error',
        description: error instanceof Error ? error.message : 'Failed to switch network',
        type: 'error'
      })
    }
  }

  return (
    <Card data-testid="sign-client-example" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Sign Client Example</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Connection
            </Heading>

            {session ? (
              <Button onClick={handleDisconnect} data-testid="disconnect-button">
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                isLoading={loading}
                loadingText="Connecting..."
                data-testid="connect-button"
              >
                Connect
              </Button>
            )}
          </Box>

          {session && (
            <>
              <Box>
                <Heading size="xs" textTransform="uppercase" pb="2">
                  Network
                </Heading>
                <Stack direction="row" spacing={4}>
                  <Button onClick={() => handleSwitchNetwork('eip155:1', '0x1')} size="sm">
                    Ethereum
                  </Button>
                  <Button onClick={() => handleSwitchNetwork('eip155:137', '0x89')} size="sm">
                    Polygon
                  </Button>
                  <Button onClick={() => handleSwitchNetwork(solana.caipNetworkId, '')} size="sm">
                    Solana
                  </Button>
                  <Button onClick={() => handleSwitchNetwork(bitcoin.caipNetworkId, '')} size="sm">
                    Bitcoin
                  </Button>
                </Stack>
              </Box>

              <Box>
                <Heading size="xs" textTransform="uppercase" pb="2">
                  Sign Message
                </Heading>
                <Button onClick={handleSignMessage} data-testid="sign-message-button">
                  Sign Message
                </Button>
              </Box>

              <Box>
                <Heading size="xs" textTransform="uppercase" pb="2">
                  Session Info
                </Heading>
                <Stack spacing={2}>
                  <Text fontSize="sm">Network: {network}</Text>
                  <Text fontSize="sm">Account: {account}</Text>
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
