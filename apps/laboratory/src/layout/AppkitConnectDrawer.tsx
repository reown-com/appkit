import { useEffect, useState } from 'react'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Button,
  Text,
  VStack,
  HStack,
  Box,
  Image,
  Divider,
  Badge,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import {
  CoreHelperUtil,
  type WalletItem,
  useAppKitAccount,
  useAppKitWallets
} from '@reown/appkit/react'

import { AppKitHeadlessInjectedWallets } from '@/src/components/Headless/AppKitHeadlessInjectedWallets'
import { AppKitHeadlessQRCode } from '@/src/components/Headless/AppKitHeadlessQRCode'
import { AppKitHeadlessWcWallets } from '@/src/components/Headless/AppKitHeadlessWcWallets'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

type ViewState = 'connect' | 'search' | 'qrcode'

interface Props {
  controls: ReturnType<typeof useDisclosure>
}

function useHistory() {
  const [history, setHistory] = useState<ViewState[]>(['connect'])

  function push(view: ViewState) {
    setHistory(prev => [...prev, view])
  }

  function pop() {
    setHistory(prev => prev.slice(0, -1))
  }

  return { history, push, pop }
}

export function AppkitConnectDrawer({ controls }: Props) {
  const { isOpen, onClose } = controls
  const toast = useToast()
  const { history, push, pop } = useHistory()

  // AppKit hooks
  const { isConnected } = useAppKitAccount()
  const {
    wcUri,
    isFetchingWcUri,
    connectingWallet,
    connect,
    resetWcUri,
    deeplinkStatus,
    deeplinkError,
    resetDeeplinkStatus,
    deeplinkReady,
    openDeeplink
  } = useAppKitWallets()
  const isMobile = CoreHelperUtil.isMobile()

  const currentView = history[history.length - 1]

  function handleClose() {
    push('connect')
    if (!isMobile) {
      resetWcUri()
    }
    onClose()
  }

  async function handleConnect(wallet: WalletItem, namespace?: ChainNamespace) {
    await connect(wallet, namespace)
      .then(() => {
        toast({ title: 'Connected', status: 'success' })
      })
      .catch(() => {
        toast({ title: 'Connection declined', status: 'error' })
      })
  }

  function handleSeeAll() {
    push('search')
  }

  function handleBack() {
    if (!isMobile) {
      resetWcUri()
    }
    if (history.length > 1) {
      pop()
    }
  }

  function handleCopyUri() {
    if (wcUri) {
      navigator.clipboard.writeText(wcUri)
      toast({
        title: 'Copied!',
        description: 'WalletConnect URI copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true
      })
    }
  }

  useEffect(() => {
    if (isOpen && isConnected) {
      handleClose()
    }
  }, [isConnected, isOpen])

  useEffect(() => {
    if (!isFetchingWcUri && wcUri) {
      push('qrcode')
    }
  }, [isFetchingWcUri, wcUri])

  useEffect(() => {
    if (deeplinkStatus === 'failed' && deeplinkError === 'timeout') {
      toast({
        title: 'Can’t open wallet',
        description: 'It might not be installed. Install the app or try again.',
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
      resetDeeplinkStatus()
    }
  }, [deeplinkStatus, deeplinkError, resetDeeplinkStatus, toast])

  // Convert test wallets to WalletItem format for connect function
  function createTestWalletItem(wallet: (typeof ConstantsUtil.DeeplinkTestWallets)[0]): WalletItem {
    return {
      id: wallet.id,
      name: wallet.name,
      image: wallet.image_url,
      isInjected: false,
      connectors: [],
      // Include mobile_link and link_mode for deeplink functionality
      mobile_link: wallet.mobile_link,
      link_mode: wallet.link_mode
    } as WalletItem
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent data-testid="headless-drawer">
        <DrawerCloseButton data-testid="headless-drawer-close-button" />
        <DrawerBody pt={8} pb={8}>
          {/* Deeplink Test Section - For testing mobile deeplink flow */}
          {isMobile && (
            <Box mb={6} p={4} borderWidth={1} borderRadius="md" borderColor="blue.200" bg="blue.50">
              <HStack mb={3}>
                <Text fontWeight="bold" fontSize="sm">
                  Deeplink Test
                </Text>
                <Badge colorScheme="blue" fontSize="xs">
                  Mobile Only
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.600" mb={3}>
                Click between wallets to test deeplink switching. Each click should open the
                correct wallet app.
              </Text>
              <VStack spacing={2} align="stretch">
                {ConstantsUtil.DeeplinkTestWallets.map(wallet => (
                  <Button
                    key={wallet.id}
                    variant={connectingWallet?.id === wallet.id ? 'solid' : 'outline'}
                    colorScheme={connectingWallet?.id === wallet.id ? 'blue' : 'gray'}
                    size="md"
                    justifyContent="flex-start"
                    onClick={() => handleConnect(createTestWalletItem(wallet))}
                    data-testid={`deeplink-test-${wallet.name.toLowerCase()}`}
                  >
                    <HStack spacing={3}>
                      <Image src={wallet.image_url} boxSize="24px" borderRadius="md" />
                      <Text>{wallet.name}</Text>
                      {connectingWallet?.id === wallet.id && (
                        <Badge colorScheme="green" fontSize="xs" ml="auto">
                          Active
                        </Badge>
                      )}
                    </HStack>
                  </Button>
                ))}
              </VStack>
              {deeplinkStatus !== 'idle' && (
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Status: {deeplinkStatus}
                  {deeplinkError && ` (${deeplinkError})`}
                </Text>
              )}
            </Box>
          )}

          {isMobile && deeplinkReady && connectingWallet && (
            <>
              <Text mb={2} fontSize="sm" color="gray.500">
                Tap Open to continue in {connectingWallet.name}
              </Text>
              <Button mb={4} colorScheme="blue" onClick={openDeeplink}>
                Open {connectingWallet.name}
              </Button>
            </>
          )}

          {isMobile && <Divider my={4} />}

          {currentView === 'connect' && (
            <AppKitHeadlessInjectedWallets onConnect={handleConnect} onSeeAll={handleSeeAll} />
          )}
          {currentView === 'search' && (
            <AppKitHeadlessWcWallets onConnect={handleConnect} onBack={handleBack} />
          )}
          {!isMobile && wcUri && connectingWallet && currentView === 'qrcode' && (
            <AppKitHeadlessQRCode onBack={handleBack} onCopyUri={handleCopyUri} />
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
