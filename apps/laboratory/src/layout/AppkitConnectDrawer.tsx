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
  type WalletItem2,
  useAppKitAccount,
  useAppKitConnect
} from '@reown/appkit-controllers/react'

import { AppKitHeadlessInjectedWallets } from '@/src/components/Headless/AppKitHeadlessInjectedWallets'
import { AppKitHeadlessQRCode } from '@/src/components/Headless/AppKitHeadlessQRCode'
import { AppKitHeadlessWcWallets } from '@/src/components/Headless/AppKitHeadlessWcWallets'

type ViewState = 'connect' | 'search' | 'qrcode'

interface Props {
  controls: ReturnType<typeof useDisclosure>
}

export function AppkitConnectDrawer({ controls }: Props) {
  const { isOpen, onClose } = controls
  const toast = useToast()
  const { isConnected } = useAppKitAccount()
  const [wcUri, setWcUri] = useState<string | undefined>(undefined)
  const { wallets, connect, fetchWcWallets } = useAppKitConnect({
    onHandleWcUri: uri => {
      setWcUri(uri)
      setCurrentView('qrcode')
    }
  })

  // View state management
  const [currentView, setCurrentView] = useState<ViewState>('connect')
  const [connectingWallet, setConnectingWallet] = useState<WalletItem2 | undefined>(undefined)

  // Reset view when drawer closes
  const handleClose = () => {
    setCurrentView('connect')
    setConnectingWallet(undefined)
    setWcUri(undefined)
    onClose()
  }

  const handleConnect = async (wallet: WalletItem2, namespace?: ChainNamespace) => {
    setConnectingWallet(wallet)

    await connect(wallet, namespace)
  }

  const handleSeeAll = () => {
    setCurrentView('search')
  }

  function handleBack() {
    setWcUri(undefined)

    if (currentView === 'qrcode') {
      setCurrentView('search')
    } else if (currentView === 'search') {
      setCurrentView('connect')
    }
  }

  const handleLoadMore = async () => {
    // Fetch more wallets (pagination will be handled by ApiController)
    await fetchWcWallets()
  }

  const handleCopyUri = () => {
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

  console.log('wallets', wallets)

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody pt={8}>
          {/* Render different views based on state */}
          {currentView === 'connect' && (
            <AppKitHeadlessInjectedWallets onConnect={handleConnect} onSeeAll={handleSeeAll} />
          )}

          {currentView === 'search' && (
            <AppKitHeadlessWcWallets
              connectingWallet={connectingWallet}
              onConnect={handleConnect}
              onBack={handleBack}
              onLoadMore={handleLoadMore}
            />
          )}

          {wcUri && connectingWallet && currentView === 'qrcode' && (
            <AppKitHeadlessQRCode
              wallet={connectingWallet}
              onBack={handleBack}
              onCopyUri={handleCopyUri}
            />
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
