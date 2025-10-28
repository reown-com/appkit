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
  type UseAppKitWalletsReturn,
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

export function AppkitConnectDrawer({ controls }: Props) {
  const { isOpen, onClose } = controls
  const toast = useToast()
  const { isConnected } = useAppKitAccount()
  const [wcUri, setWcUri] = useState<string | undefined>(undefined)
  const { connect } = useAppKitWallets({
    onHandleWcUri: uri => {
      setWcUri(uri)
      setCurrentView('qrcode')
    }
  })

  // View state management
  const [currentView, setCurrentView] = useState<ViewState>('connect')
  const [connectingWallet, setConnectingWallet] = useState<
    UseAppKitWalletsReturn['data'][number] | undefined
  >(undefined)

  // Reset view when drawer closes
  function handleClose() {
    setCurrentView('connect')
    setConnectingWallet(undefined)
    setWcUri(undefined)
    onClose()
  }

  async function handleConnect(
    wallet: UseAppKitWalletsReturn['data'][number],
    namespace?: ChainNamespace
  ) {
    setConnectingWallet(wallet)

    await connect(wallet, namespace)
      .then(() => {
        toast({ title: 'Connected', status: 'success' })
      })
      .catch(() => {
        toast({ title: 'Connection declined', status: 'error' })
        setConnectingWallet(undefined)
      })
  }

  function handleSeeAll() {
    setCurrentView('search')
  }

  function handleBack() {
    setWcUri(undefined)
    setConnectingWallet(undefined)

    if (currentView === 'qrcode') {
      setCurrentView('search')
    } else if (currentView === 'search') {
      setCurrentView('connect')
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

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody pt={8}>
          {/* Render different views based on state */}
          {currentView === 'connect' && (
            <AppKitHeadlessInjectedWallets
              connectingWallet={connectingWallet}
              onConnect={handleConnect}
              onSeeAll={handleSeeAll}
            />
          )}

          {currentView === 'search' && (
            <AppKitHeadlessWcWallets
              connectingWallet={connectingWallet}
              onConnect={handleConnect}
              onBack={handleBack}
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
