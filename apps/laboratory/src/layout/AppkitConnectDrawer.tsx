import { useEffect, useState } from 'react'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
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
  const { wcUri, isFetchingWcUri, connectingWallet, connect, resetConnectingWallet } =
    useAppKitWallets()

  const currentView = history[history.length - 1]

  function handleClose() {
    push('connect')
    resetConnectingWallet()
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
    resetConnectingWallet()
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
    if (!isFetchingWcUri && wcUri && !CoreHelperUtil.isMobile()) {
      push('qrcode')
    }
  }, [isFetchingWcUri, wcUri])

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent data-testid="headless-drawer">
        <DrawerCloseButton data-testid="headless-drawer-close-button" />
        <DrawerBody pt={8} pb={8}>
          {currentView === 'connect' && (
            <AppKitHeadlessInjectedWallets onConnect={handleConnect} onSeeAll={handleSeeAll} />
          )}
          {currentView === 'search' && (
            <AppKitHeadlessWcWallets onConnect={handleConnect} onBack={handleBack} />
          )}
          {wcUri && connectingWallet && currentView === 'qrcode' && (
            <AppKitHeadlessQRCode onBack={handleBack} onCopyUri={handleCopyUri} />
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
