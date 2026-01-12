'use client'

import React from 'react'

import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Heading,
  Image,
  Stack,
  StackDivider,
  Text,
  VStack,
  useDisclosure
} from '@chakra-ui/react'

import type { WalletItem } from '@reown/appkit'
import { useAppKitAccount, useAppKitWallets, useDisconnect } from '@reown/appkit/react'

import { AppkitConnectDrawer } from '../../layout/AppkitConnectDrawer'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AccountCard } from '../AccountCard'

export default function DemoContentHeadless() {
  const currentAccount = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const controls = useDisclosure({ id: 'headless' })

  // Use the headless hook for deeplink testing
  const {
    connect,
    connectingWallet,
    deeplinkStatus,
    deeplinkError,
    deeplinkReady,
    openDeeplink,
    resetDeeplinkStatus
  } = useAppKitWallets()

  // Convert test wallet to WalletItem format with mobile deeplink support
  function createTestWalletItem(
    wallet: (typeof ConstantsUtil.DeeplinkTestWallets)[0]
  ): WalletItem & { mobile_link: string; link_mode: string | null } {
    return {
      id: wallet.id,
      name: wallet.name,
      imageUrl: wallet.image_url,
      connectors: [],
      walletInfo: {},
      isInjected: false,
      isRecent: false,
      mobile_link: wallet.mobile_link,
      link_mode: wallet.link_mode
    } as WalletItem & { mobile_link: string; link_mode: string | null }
  }

  async function handleTestWalletClick(wallet: (typeof ConstantsUtil.DeeplinkTestWallets)[0]) {
    try {
      await connect(createTestWalletItem(wallet))
    } catch (error) {
      console.error('Connection error:', error)
    }
  }

  return (
    <>
      <AppkitConnectDrawer controls={controls} />

      {/* Deeplink Test Section - Always visible for easy testing */}
      <Card marginTop={10} marginBottom={4} borderColor="blue.300" borderWidth={2}>
        <CardHeader bg="blue.50">
          <HStack>
            <Heading size="md">Deeplink Test</Heading>
            <Badge colorScheme="blue">Mobile Testing</Badge>
          </HStack>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Click between MetaMask and Zerion to test deeplink switching. Each click should open the
            correct wallet app with a fresh WC URI.
          </Text>
        </CardHeader>

        <CardBody>
          <VStack spacing={4} align="stretch">
            {/* Wallet Buttons */}
            <HStack spacing={4} wrap="wrap">
              {ConstantsUtil.DeeplinkTestWallets.map(wallet => (
                <Button
                  key={wallet.id}
                  size="lg"
                  variant={connectingWallet?.id === wallet.id ? 'solid' : 'outline'}
                  colorScheme={connectingWallet?.id === wallet.id ? 'blue' : 'gray'}
                  onClick={() => handleTestWalletClick(wallet)}
                  data-testid={`deeplink-test-${wallet.name.toLowerCase()}`}
                  leftIcon={
                    <Image
                      src={wallet.image_url}
                      boxSize="24px"
                      borderRadius="md"
                      alt={wallet.name}
                    />
                  }
                >
                  {wallet.name}
                  {connectingWallet?.id === wallet.id && (
                    <Badge ml={2} colorScheme="green" fontSize="xs">
                      Active
                    </Badge>
                  )}
                </Button>
              ))}
            </HStack>

            {/* Status Display */}
            <Box p={3} bg="gray.50" borderRadius="md">
              <HStack spacing={4} wrap="wrap">
                <Text fontSize="sm">
                  <strong>Connecting:</strong> {connectingWallet?.name || 'None'}
                </Text>
                <Text fontSize="sm">
                  <strong>Status:</strong>{' '}
                  <Badge
                    colorScheme={
                      deeplinkStatus === 'success'
                        ? 'green'
                        : deeplinkStatus === 'failed'
                          ? 'red'
                          : deeplinkStatus === 'pending'
                            ? 'yellow'
                            : 'gray'
                    }
                  >
                    {deeplinkStatus}
                  </Badge>
                  {deeplinkError && ` (${deeplinkError})`}
                </Text>
                <Text fontSize="sm">
                  <strong>Ready:</strong> {deeplinkReady ? 'Yes' : 'No'}
                </Text>
              </HStack>
            </Box>

            {/* Open Button - Shows when deeplink is ready */}
            {deeplinkReady && connectingWallet && (
              <Box p={3} bg="yellow.50" borderRadius="md">
                <Text fontSize="sm" mb={2}>
                  Tap Open to retry opening {connectingWallet.name}
                </Text>
                <HStack>
                  <Button colorScheme="blue" onClick={openDeeplink}>
                    Open {connectingWallet.name}
                  </Button>
                  <Button variant="ghost" onClick={resetDeeplinkStatus}>
                    Reset
                  </Button>
                </HStack>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      <Card marginTop={4} marginBottom={4}>
        <CardHeader>
          <Heading size="md">AppKit Interactions</Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4" flexWrap="wrap">
            <Box>
              <Stack spacing="2" alignItems="left" flexWrap="wrap">
                <Stack pb="2">
                  <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                    Default Button
                  </Text>
                  <Text fontSize="sm">{currentAccount?.address}</Text>
                  {currentAccount?.isConnected ? (
                    <Button
                      data-testid="headless-disconnect-button"
                      width="auto"
                      onClick={() => disconnect()}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button data-testid="headless-connect-button" onClick={controls.onOpen}>
                      Connect
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      <AccountCard account={currentAccount} />
    </>
  )
}
