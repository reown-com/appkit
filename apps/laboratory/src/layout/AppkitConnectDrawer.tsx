import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Spinner,
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

interface SelectedWallet {
  wallet: WalletItem
  namespace?: ChainNamespace
}

function useHistory() {
  const [history, setHistory] = useState<ViewState[]>(['connect'])

  function push(view: ViewState) {
    setHistory(prev => [...prev, view])
  }

  function pop() {
    setHistory(prev => prev.slice(0, -1))
  }

  function reset() {
    setHistory(['connect'])
  }

  return { history, push, pop, reset }
}

export function AppkitConnectDrawer({ controls }: Props) {
  const { isOpen, onClose } = controls
  const toast = useToast()
  const { history, push, pop, reset } = useHistory()
  const isMobile = CoreHelperUtil.isMobile()

  // Selected wallet state for mobile two-step flow
  const [selectedWallet, setSelectedWallet] = useState<SelectedWallet | null>(null)

  // AppKit hooks
  const { isConnected } = useAppKitAccount()
  const { wcUri, isFetchingWcUri, connectingWallet, connect, resetConnectingWallet, getWcUri } =
    useAppKitWallets()

  const currentView = history[history.length - 1]

  // Check if we should show the Open button (mobile, non-injected wallet selected)
  const shouldShowOpenButton = isMobile && selectedWallet && !selectedWallet.wallet.isInjected

  function handleClose() {
    reset()
    resetConnectingWallet()
    setSelectedWallet(null)
    onClose()
  }

  /**
   * Handle wallet selection. On mobile for non-injected wallets, this triggers
   * the two-step flow: select wallet → prefetch URI → user clicks Open.
   */
  async function handleWalletSelect(wallet: WalletItem, namespace?: ChainNamespace) {
    // For injected wallets or desktop, connect directly
    if (wallet.isInjected || !isMobile) {
      await handleConnect(wallet, namespace)

      return
    }

    // Mobile non-injected wallet: two-step flow
    setSelectedWallet({ wallet, namespace })
    // Start prefetching WC URI so it's ready when user clicks Open
    getWcUri()
  }

  /**
   * Handle the actual connection (called directly for injected/desktop,
   * or from Open button for mobile non-injected wallets).
   */
  async function handleConnect(wallet: WalletItem, namespace?: ChainNamespace) {
    await connect(wallet, namespace)
      .then(() => {
        toast({ title: 'Connected', status: 'success' })
        setSelectedWallet(null)
      })
      .catch(() => {
        toast({ title: 'Connection declined', status: 'error' })
      })
  }

  /**
   * Handle Open button click on mobile - triggers the deeplink synchronously.
   */
  function handleOpenWallet() {
    if (selectedWallet) {
      handleConnect(selectedWallet.wallet, selectedWallet.namespace)
    }
  }

  function handleSeeAll() {
    push('search')
  }

  function handleBack() {
    resetConnectingWallet()
    setSelectedWallet(null)
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
    if (!isFetchingWcUri && wcUri && !isMobile) {
      push('qrcode')
    }
  }, [isFetchingWcUri, wcUri, isMobile])

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent data-testid="headless-drawer">
        <DrawerCloseButton data-testid="headless-drawer-close-button" />
        <DrawerBody pt={8} pb={shouldShowOpenButton ? 4 : 8}>
          {currentView === 'connect' && (
            <AppKitHeadlessInjectedWallets
              onConnect={handleWalletSelect}
              onSeeAll={handleSeeAll}
              selectedWalletId={selectedWallet?.wallet.id}
            />
          )}
          {currentView === 'search' && (
            <AppKitHeadlessWcWallets
              onConnect={handleWalletSelect}
              onBack={handleBack}
              selectedWalletId={selectedWallet?.wallet.id}
            />
          )}
          {wcUri && connectingWallet && currentView === 'qrcode' && (
            <AppKitHeadlessQRCode onBack={handleBack} onCopyUri={handleCopyUri} />
          )}
        </DrawerBody>

        {/* Mobile Open button - shown when a non-injected wallet is selected */}
        {shouldShowOpenButton && (
          <DrawerFooter borderTopWidth="1px" pt={4} pb={6}>
            <Box width="100%">
              <Button
                width="100%"
                size="lg"
                colorScheme="blue"
                onClick={handleOpenWallet}
                isDisabled={isFetchingWcUri || !wcUri}
                data-testid="open-wallet-button"
              >
                {isFetchingWcUri ? (
                  <>
                    <Spinner size="sm" mr={2} />
                    Preparing...
                  </>
                ) : (
                  `Open ${selectedWallet.wallet.name}`
                )}
              </Button>
            </Box>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
