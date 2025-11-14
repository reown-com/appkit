'use client'

import { useEffect } from 'react'

import { ArrowRight, Facebook, Github } from 'lucide-react'

import { useAppKitWallet } from '@reown/appkit-wallet-button/react'
import type { ChainNamespace } from '@reown/appkit/networks'
import { WalletItem, useAppKitWallets } from '@reown/appkit/react'

import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldSeparator } from '@/components/ui/field'

import { WalletItemSkeleton } from './WalletItemSkeleton'
import { WalletListItem } from './WalletListItem'

type Props = {
  connectingWallet: WalletItem | undefined
  onConnect: (wallet: WalletItem, namespace?: ChainNamespace) => void
  onOpenNamespaceDialog: (wallet: WalletItem) => void
  setShowWalletSearch: (show: boolean) => void
}

function WalletsSkeleton() {
  return (
    <>
      <WalletItemSkeleton />
      <WalletItemSkeleton />
      <WalletItemSkeleton />
    </>
  )
}

export function ConnectContent({
  connectingWallet,
  onConnect,
  onOpenNamespaceDialog,
  setShowWalletSearch
}: Props) {
  const { isInitialized, data, fetchWallets, isFetchingWallets } = useAppKitWallets()
  const { connect: connectWithWalletButton } = useAppKitWallet()

  const wcWallet = data.find(w => !w.isInjected && w.name === 'WalletConnect')
  const injectedWallets = data.filter(w => w.isInjected)
  const hasNoInjectedWallets = injectedWallets.length === 0
  const firstFiveWcWallets = data
    .filter(w => !w.isInjected && w.name !== 'WalletConnect')
    .slice(0, 5)

  useEffect(() => {
    if (isInitialized && hasNoInjectedWallets && firstFiveWcWallets.length === 0) {
      fetchWallets({ entries: 5 })
    }
  }, [isInitialized])

  return (
    <div className="p-6">
      <CardHeader className="text-start p-0 pb-4">
        <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
        <CardDescription>
          Connect your wallet with the following wallets or search for a wallet.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form>
          <FieldGroup className="flex flex-col">
            <FieldGroup className="flex flex-col gap-2">
              <Field className="max-h-[300px] overflow-y-auto">
                {isInitialized ? (
                  <>
                    {wcWallet ? (
                      <WalletListItem
                        connectingWallet={connectingWallet}
                        wallet={wcWallet}
                        onClick={onConnect}
                      />
                    ) : null}
                    {hasNoInjectedWallets ? (
                      isFetchingWallets ? (
                        <WalletsSkeleton />
                      ) : (
                        firstFiveWcWallets.map(w => (
                          <WalletListItem
                            key={w.id}
                            connectingWallet={connectingWallet}
                            wallet={w}
                            onClick={onConnect}
                          />
                        ))
                      )
                    ) : (
                      injectedWallets.map(item => {
                        const isMultiChain = item.connectors.length > 1

                        return (
                          <WalletListItem
                            key={item.id}
                            connectingWallet={connectingWallet}
                            wallet={item}
                            onClick={() => {
                              if (isMultiChain) {
                                onOpenNamespaceDialog(item)
                              } else {
                                onConnect(item, item.connectors[0].chain)
                              }
                            }}
                          />
                        )
                      })
                    )}
                  </>
                ) : (
                  <WalletsSkeleton />
                )}
              </Field>
              <Field>
                <Button
                  type="button"
                  variant="default"
                  className="w-full"
                  onClick={() => setShowWalletSearch(true)}
                >
                  <div className="w-full">Search Wallets</div>
                  <ArrowRight />
                </Button>
              </Field>
            </FieldGroup>
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              or connect with
            </FieldSeparator>
            <Field className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => connectWithWalletButton('github')}
              >
                <Github />
                <span className="sr-only">Login with Apple</span>
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => connectWithWalletButton('google')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                <span className="sr-only">Login with Google</span>
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => connectWithWalletButton('facebook')}
              >
                <Facebook />
                <span className="sr-only">Login with Meta</span>
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </div>
  )
}
