'use client'

import { useEffect, useRef, useState } from 'react'

import { ArrowLeftIcon, Loader2Icon, SearchIcon } from 'lucide-react'

import type { WalletItem } from '@reown/appkit'
import { useAppKitWallets } from '@reown/appkit/react'

import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { WalletListItem } from './WalletListItem'

type Props = {
  onBack: () => void
  onConnect: (wallet: WalletItem) => void
}

function useDebounceValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function AllWalletsContent({ onBack, onConnect }: Props) {
  const { wcWallets, wcUri, isFetchingWallets, page, count, fetchWallets, isMobile } =
    useAppKitWallets()

  // On mobile, wallets need the WC URI to be pre-generated before connecting
  const isWalletDisabled = isMobile && !wcUri
  const [inputValue, setInputValue] = useState('')
  const searchQuery = useDebounceValue(inputValue, 500)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Initial fetch
  useEffect(() => {
    fetchWallets?.()
  }, [])

  // Search effect
  useEffect(() => {
    if (searchQuery.length > 0) {
      fetchWallets?.({ query: searchQuery })
    } else {
      fetchWallets?.()
    }
  }, [searchQuery])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = loadMoreRef.current
    if (!observer || isFetchingWallets || searchQuery.length > 0) return

    const intersectionObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetchingWallets) {
          fetchWallets?.({ page: page + 1 })
        }
      },
      { threshold: 0.1 }
    )

    intersectionObserver.observe(observer)

    return () => {
      intersectionObserver.disconnect()
    }
  }, [page, isFetchingWallets, searchQuery, fetchWallets])

  return (
    <div className="flex flex-col gap-4 p-6">
      <CardHeader className="p-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onBack}
              className="shrink-0"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
          )}
          <CardTitle className="text-lg font-semibold">Search Wallets ({count})</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-0">
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Wallets List */}
        <div className="flex max-h-[400px] flex-col gap-2 overflow-y-auto">
          {wcWallets.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">No wallets found</p>
              <p className="text-muted-foreground/70 mt-2 text-xs">Try a different search term</p>
            </div>
          ) : (
            <>
              {wcWallets.map(item => (
                <WalletListItem
                  key={item.id}
                  wallet={item}
                  onConnect={onConnect}
                  onOpenNamespaceDialog={() => {}}
                  isDisabled={isWalletDisabled}
                />
              ))}

              {/* Intersection Observer Target */}
              {!isFetchingWallets && searchQuery.length === 0 && (
                <div ref={loadMoreRef} className="h-4" />
              )}

              {/* Loading Indicator */}
              {isFetchingWallets && (
                <div className="flex items-center justify-center py-4">
                  <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </div>
  )
}
