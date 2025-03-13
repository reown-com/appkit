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
import UniversalProvider from '@walletconnect/universal-provider'
import base58 from 'bs58'
import { toHex } from 'viem'

import { AppKit, createAppKit } from '@reown/appkit/core'
import { bitcoin, solana } from '@reown/appkit/networks'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

import { OPTIONAL_NAMESPACES, PROJECT_ID, networks } from '../constants'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

export default function UniversalProviderPage() {
  const toast = useChakraToast()
  const [provider, setProvider] = useState<UniversalProvider | null>(null)
  const [appKit, setAppKit] = useState<AppKit | null>(null)
  const [account, setAccount] = useState<string | undefined>(undefined)
  const [network, setNetwork] = useState<string | undefined>(undefined)
  const [balance, setBalance] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize Universal Provider
        const universalProvider = await UniversalProvider.init({ projectId: PROJECT_ID })
        setProvider(universalProvider)

        // Initialize AppKit with Universal Provider
        const akInstance = createAppKit({
          projectId: PROJECT_ID,
          networks,
          universalProvider,
          manualWCControl: true
        })
        setAppKit(akInstance)

        // Event listeners
        universalProvider.on('chainChanged', (chainId: string) => {
          setNetwork(chainId)
        })

        universalProvider.on('disconnect', () => {
          setAccount(undefined)
          setNetwork(undefined)
          setBalance(undefined)
        })

        universalProvider.on('accountsChanged', (accounts: string[]) => {
          setAccount(accounts[0])
        })

        universalProvider.on('connect', async (session: any) => {
          await akInstance.close()
          setAccount(session?.session?.namespaces?.eip155?.accounts?.[0]?.split(':')[2])
          const chain = session?.session?.namespaces?.eip155?.chains?.[0]

          if (isNaN(Number(chain))) {
            setNetwork(chain)
          } else {
            setNetwork(`eip155:${chain}`)
          }
        })

        // Check if already connected
        if (universalProvider.session) {
          setAccount(
            universalProvider.session?.namespaces?.['eip155']?.accounts?.[0]?.split(':')[2]
          )
          setNetwork(universalProvider.session?.namespaces?.['eip155']?.chains?.[0])
        }
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }

    initialize()
  }, [])

  async function handleConnect() {
    if (!provider || !appKit) {
      return
    }

    try {
      setIsLoading(true)
      await appKit.open()
      appKit.subscribeEvents(({ data }: any) => {
        if (data.event === 'MODAL_CLOSE') {
          setIsLoading(false)
        }
      })
      await provider.connect({ optionalNamespaces: OPTIONAL_NAMESPACES })
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
    if (!provider) {
      return
    }

    try {
      await provider.disconnect()
      setAccount(undefined)
      setNetwork(undefined)
      setBalance(undefined)
      toast({
        title: ConstantsUtil.DisconnectingSuccessToastTitle,
        description: 'Successfully disconnected',
        type: 'success'
      })
    } catch (error) {
      console.error('Disconnect error:', error)
      toast({
        title: ConstantsUtil.DisconnectingFailedToastTitle,
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
    if (!provider || !account) {
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

      const signature: string = await provider.request(payload, network)

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
    if (!provider?.session) {
      return
    }

    const [namespace] = newNetwork.split(':')

    const isChainAllowed =
      provider?.session?.namespaces?.[
        namespace as keyof typeof provider.session.namespaces
      ]?.chains?.includes(newNetwork)
    const isSameNetwork = network === newNetwork

    if (isSameNetwork) {
      return
    }

    const isEip155 = newNetwork.startsWith('eip155')

    try {
      if (isEip155) {
        const hasSupportForSwitchNetwork = provider?.session?.namespaces?.[
          'eip155'
        ]?.methods?.includes('wallet_switchEthereumChain')

        if (hasSupportForSwitchNetwork && !isChainAllowed) {
          const [, chainId] = newNetwork.split(':')
          if (!chainId) {
            throw new Error('Invalid network')
          }
          await provider.request(
            {
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: toHex(chainId) }]
            },
            newNetwork
          )
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
        provider.session?.namespaces?.[
          namespace as keyof typeof provider.session.namespaces
        ]?.accounts?.[0]?.split(':')[2]
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
    <Card data-testid="universal-provider-example" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Universal Provider Example</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Connection
            </Heading>

            {account ? (
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

          {account && (
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
                  Actions
                </Heading>
                <Stack direction="row" spacing={4}>
                  <Button onClick={handleSignMessage} data-testid="sign-message-button">
                    Sign Message
                  </Button>
                </Stack>
              </Box>

              <Box>
                <Heading size="xs" textTransform="uppercase" pb="2">
                  Session Info
                </Heading>
                <Stack spacing={2}>
                  <Text fontSize="sm">Network: {network}</Text>
                  <Text fontSize="sm">Account: {account}</Text>
                  {balance && <Text fontSize="sm">Balance: {balance}</Text>}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
