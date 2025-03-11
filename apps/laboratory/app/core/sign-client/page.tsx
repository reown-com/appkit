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
import base58 from 'bs58'
import { toHex } from 'viem'

import { createAppKit } from '@reown/appkit/basic'
import { bitcoin, solana } from '@reown/appkit/networks'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

import { OPTIONAL_NAMESPACES, PROJECT_ID, networks } from '../constants'

const appKit = createAppKit({
  projectId: PROJECT_ID,
  networks,
  manualWCControl: true
})

export default function SignClientPage() {
  const toast = useChakraToast()
  const [signClient, setSignClient] = useState<SignClient | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null)
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [network, setNetwork] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function initialize() {
      try {
        const client = await SignClient.init({ projectId: PROJECT_ID })
        setSignClient(client)

        // Get last session if exists
        const sessions = client.session.getAll()
        const lastSession = sessions[sessions.length - 1]

        if (lastSession) {
          setSession(lastSession)
          setAccount(lastSession?.namespaces?.['eip155']?.accounts?.[0]?.split(':')[2])
          setNetwork(lastSession?.namespaces?.['eip155']?.chains?.[0])
        }

        // Event listeners
        client.on('session_update', ({ topic, params }) => {
          const { namespaces } = params
          const _session = client.session.get(topic)
          setSession({ ..._session, namespaces })
        })
        client.on('session_delete', () => {
          setSession(null)
          setAccount(undefined)
          setNetwork(undefined)
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
      setIsLoading(true)
      const { uri, approval } = await signClient.connect({
        optionalNamespaces: OPTIONAL_NAMESPACES
      })

      if (uri) {
        appKit.subscribeEvents(({ data }: { data: { event: string } }) => {
          if (data.event === 'MODAL_CLOSE') {
            setIsLoading(false)
          }
        })
        appKit?.open({ uri })
        signClient.on('proposal_expire', () => {
          setIsLoading(false)
        })
        const newSession = await approval()
        setSession(newSession)
        setAccount(newSession?.namespaces['eip155']?.accounts?.[0]?.split(':')[2])
        setNetwork(newSession?.namespaces['eip155']?.chains?.[0])
        appKit?.close()
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast({
        title: 'Connection Error',
        description: error instanceof Error ? error.message : 'Failed to connect',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDisconnect() {
    if (!signClient || !session) {
      return
    }

    try {
      await signClient.disconnect({
        topic: session.topic,
        reason: {
          code: 0,
          message: 'user_disconnected'
        }
      })
      await appKit?.disconnect()
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
        params: ['Hello AppKit!', account]
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

    return map[namespace as keyof typeof map]
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

      if (!network) {
        toast({
          title: 'Error',
          description: 'Network not supported by laboratory',
          type: 'error'
        })

        return
      }

      const signature: string = await signClient.request({
        topic: session.topic,
        chainId: network,
        request: payload
      })

      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature || 'Message signed successfully',
        type: 'success'
      })
    } catch (error) {
      console.error('Signing error:', error)
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: error instanceof Error ? error.message : 'Failed to sign message',
        type: 'error'
      })
    }
  }

  async function handleSwitchNetwork(newNetwork: string) {
    if (!signClient || !session) {
      return
    }

    const [namespace] = newNetwork.split(':')

    const isChainAllowed =
      session?.namespaces?.[namespace as keyof typeof session.namespaces]?.chains?.includes(
        newNetwork
      )
    const isSameNetwork = network === newNetwork

    if (isSameNetwork) {
      return
    }

    const isEip155 = newNetwork.startsWith('eip155')

    try {
      if (isEip155) {
        const supportsSwitchNetwork = session?.namespaces?.['eip155']?.methods?.includes(
          'wallet_switchEthereumChain'
        )

        if (supportsSwitchNetwork && !isChainAllowed) {
          const [, chainId] = newNetwork.split(':')
          if (!chainId) {
            throw new Error('Invalid network')
          }
          await signClient.request({
            topic: session.topic,
            chainId: newNetwork,
            request: {
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: toHex(chainId) }]
            }
          })
        }
      } else if (!isChainAllowed) {
        toast({
          title: 'Error',
          description: 'Chain not supported by wallet',
          type: 'error'
        })

        return
      }

      setAccount(
        session?.namespaces?.[namespace as keyof typeof session.namespaces]?.accounts?.[0]?.split(
          ':'
        )[2]
      )
      setNetwork(newNetwork)
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
                isLoading={isLoading}
                loadingText="Connecting..."
                data-testid="connect-button"
              >
                Connect
              </Button>
            )}
          </Box>

          {session && (
            <>
              <Box mb={4}>
                <Heading size="xs" textTransform="uppercase" pb="2">
                  Network
                </Heading>
                <Stack direction="row" spacing={4}>
                  <Button onClick={() => handleSwitchNetwork('eip155:1')} size="sm">
                    Ethereum
                  </Button>
                  <Button onClick={() => handleSwitchNetwork('eip155:137')} size="sm">
                    Polygon
                  </Button>
                  <Button onClick={() => handleSwitchNetwork(solana.caipNetworkId)} size="sm">
                    Solana
                  </Button>
                  <Button onClick={() => handleSwitchNetwork(bitcoin.caipNetworkId)} size="sm">
                    Bitcoin
                  </Button>
                </Stack>
              </Box>

              <Box mb={4}>
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
