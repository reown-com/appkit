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
import { getWallets } from '@wallet-standard/app'
import UniversalProvider from '@walletconnect/universal-provider'

import { SolanaWalletConnectStandardWallet } from '@reown/appkit-utils/wallet-standard'
import { AppKit, type CaipNetworkId, createAppKit } from '@reown/appkit/core'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

import { PROJECT_ID, networks } from '../constants'

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
          akInstance.disconnect()
        })

        universalProvider.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            akInstance.disconnect()
          }

          setAccount(accounts[0])
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        universalProvider.on('connect', async (session: any) => {
          await akInstance.close()
          setAccount(session?.session?.namespaces?.['solana']?.accounts?.[0]?.split(':')[2])
          const chain = session?.session?.namespaces?.['solana']?.chains?.[0]

          if (isNaN(Number(chain))) {
            setNetwork(chain)
          } else {
            setNetwork(`solana:${chain}`)
          }
        })

        // Check if already connected
        if (universalProvider.session) {
          setAccount(
            universalProvider.session?.namespaces?.['solana']?.accounts?.[0]?.split(':')[2]
          )
          setNetwork(universalProvider.session?.namespaces?.['solana']?.chains?.[0])
        }

        const { get } = getWallets()
        const wallets = get()
        if (!wallets.find(wallet => wallet.name === 'WalletConnect')) {
          SolanaWalletConnectStandardWallet.register(universalProvider)
        }
        setIsLoading(false)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Initialization error:', error)
      }
    }

    if (provider || isLoading) {
      return
    }
    setIsLoading(true)
    initialize()
  }, [provider, isLoading])

  useEffect(() => {
    if (provider?.session) {
      setAccount(provider.session?.namespaces?.['solana']?.accounts?.[0]?.split(':')[2])
      setNetwork(provider.session?.namespaces?.['solana']?.chains?.[0])
    }
  }, [provider?.session])

  async function handleConnect() {
    if (!provider || !appKit) {
      return
    }

    try {
      setIsLoading(true)
      appKit.subscribeEvents(({ data }) => {
        if (data.event === 'MODAL_CLOSE') {
          setIsLoading(false)
        }
      })
      const { get } = getWallets()
      const wallet = get().find(wallet => wallet.name === 'WalletConnect')
      if (wallet) {
        const connectFeature = wallet.features?.['standard:connect'] as {
          connect: () => Promise<{
            accounts: {
              address: string
              publicKey: Uint8Array<ArrayBuffer>
              chains: CaipNetworkId[]
              features: readonly [
                'solana:signAndSendTransaction',
                'solana:signTransaction',
                'solana:signMessage'
              ]
            }[]
          }>
        }
        const connect = connectFeature?.connect
        await connect()
      }
    } catch (error) {
      // eslint-disable-next-line no-console
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
      const wallet = getWallets()
        .get()
        .find(w => w.name === 'WalletConnect')
      if (wallet) {
        const disconnectFeature = wallet.features?.['standard:disconnect'] as {
          disconnect: () => Promise<void>
        }
        await disconnectFeature?.disconnect()
      }
      setAccount(undefined)
      setNetwork(undefined)
      setBalance(undefined)
      toast({
        title: ConstantsUtil.DisconnectingSuccessToastTitle,
        description: 'Successfully disconnected',
        type: 'success'
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Disconnect error:', error)
      toast({
        title: ConstantsUtil.DisconnectingFailedToastTitle,
        description: error instanceof Error ? error.message : 'Failed to disconnect',
        type: 'error'
      })
    }
  }

  async function handleSignMessage() {
    if (!provider || !account) {
      toast({
        title: 'Error',
        description: 'User is disconnected',
        type: 'error'
      })
    }

    try {
      const wallet = getWallets()
        .get()
        .find(w => w.name === 'WalletConnect')
      if (!wallet) {
        toast({
          title: 'Error',
          description: 'Wallet not found',
          type: 'error'
        })

        return
      }

      const signMessageFeature = wallet.features?.['solana:signMessage'] as {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        signMessage: (val: { message: Uint8Array; account: any }) => Promise<{ signature: string }>
      }

      const signMessage = signMessageFeature?.signMessage
      if (!signMessage) {
        toast({
          title: 'Error',
          description: 'Sign message feature not found',
          type: 'error'
        })
      }

      const account = wallet.accounts[0]

      const signature = await signMessage({
        message: new TextEncoder().encode('Hello Appkit!'),
        account
      })
      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: signature.signature || 'Message signed successfully',
        type: 'success'
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Signing error:', error)
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: error instanceof Error ? error.message : 'Failed to sign message',
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
