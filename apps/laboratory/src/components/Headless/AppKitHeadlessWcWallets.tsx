import { useEffect, useState } from 'react'

import { ArrowBackIcon, SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text
} from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import { type WalletItem2, useAppKitConnect } from '@reown/appkit-controllers/react'
import '@reown/appkit-ui/wui-icon'

import { WcWalletItem } from './WcWalletItem'

interface Props {
  connectingWallet:
    | {
        name: string
        imageUrl: string
      }
    | undefined
  onConnect: (wallet: WalletItem2, namespace?: ChainNamespace) => void
  onBack: () => void
  onLoadMore?: () => void
}

export function AppKitHeadlessWcWallets({ onConnect, onBack, onLoadMore }: Props) {
  const { wallets, isFetchingWcWallets } = useAppKitConnect()

  const wcWallets = wallets.filter(w => !w.isInjected)

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    onLoadMore?.()
  }, [])

  return (
    <Flex direction="column" gap={4} height="100%">
      {/* Header with Back Button */}
      <Flex align="center" gap={3}>
        <IconButton
          aria-label="Go back"
          icon={<ArrowBackIcon />}
          variant="ghost"
          onClick={onBack}
          size="sm"
        />
        <Text fontSize="lg" fontWeight="semibold">
          Search Wallets
        </Text>
      </Flex>

      {/* Search Input */}
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoFocus
        />
      </InputGroup>

      {/* Wallets List */}
      <Box flex={1} overflowY="auto" pr={2}>
        {isFetchingWcWallets && wcWallets.length === 0 ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="lg" />
          </Flex>
        ) : wcWallets.length === 0 ? (
          <Box p={8} textAlign="center">
            <Text color="gray.500">No wallets found</Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Try a different search term
            </Text>
          </Box>
        ) : (
          <Flex direction="column" gap="2">
            {wcWallets.map(item => (
              <WcWalletItem key={item.name + item.id} item={item} onConnect={onConnect} />
            ))}
          </Flex>
        )}

        {/* Load More Button */}
        {onLoadMore && (
          <Button
            width="100%"
            variant="outline"
            onClick={onLoadMore}
            isLoading={isFetchingWcWallets}
            loadingText="Loading..."
            mt={4}
          >
            Load More Wallets
          </Button>
        )}
      </Box>
    </Flex>
  )
}
