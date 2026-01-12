import { useEffect, useState } from 'react'

import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Text,
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
    // Only navigate to QR code view when actively connecting to a wallet
    // (not just because a pre-generated URI exists)
    if (!isFetchingWcUri && wcUri && connectingWallet) {
      push('qrcode')
    }
  }, [isFetchingWcUri, wcUri, connectingWallet])

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent data-testid="headless-drawer">
        <DrawerCloseButton data-testid="headless-drawer-close-button" />
        <DrawerBody pt={8} pb={8}>
          {isMobile && deeplinkReady && connectingWallet && (
            <>
              <Text mb={2} fontSize="sm" color="gray.500">
                Tap Open to continue in {connectingWallet.name}
              </Text>
              <Button mb={4} colorScheme="blue" onClick={openDeeplink}>
                Open {connectingWallet.name}
              </Button>
              <Divider my={4} />
            </>
          )}

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
