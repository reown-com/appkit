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
  Text
} from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import { type UseAppKitWalletsReturn, useAppKitWallets } from '@reown/appkit/react'

import { useDebounceValue } from '@/src/hooks/useDebounceValue'

import { WcWalletItem } from './WcWalletItem'

interface Props {
  onConnect: (
    wallet: UseAppKitWalletsReturn['wcWallets'][number],
    namespace?: ChainNamespace
  ) => void
  onBack: () => void
  selectedWalletId?: string
}

export function AppKitHeadlessWcWallets({ onConnect, onBack, selectedWalletId }: Props) {
  const {
    wcWallets,
    isFetchingWcUri,
    isFetchingWallets,
    page,
    count,
    connectingWallet,
    fetchWallets
  } = useAppKitWallets()

  const [inputValue, setInputValue] = useState('')
  const searchQuery = useDebounceValue(inputValue, 500)

  useEffect(() => {
    fetchWallets?.()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 0) {
      fetchWallets?.({ query: searchQuery })
    } else {
      fetchWallets?.()
    }
  }, [searchQuery])

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
          Search Wallets ({count})
        </Text>
      </Flex>

      {/* Search Input */}
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search by name..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          autoFocus
        />
      </InputGroup>

      {/* Wallets List */}
      <Box flex={1} overflowY="auto" pr={2}>
        {wcWallets.length === 0 ? (
          <Box p={8} textAlign="center">
            <Text color="gray.500">No wallets found</Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Try a different search term
            </Text>
          </Box>
        ) : (
          <Flex direction="column" gap="2">
            {wcWallets.map(item => (
              <WcWalletItem
                key={item.name + item.id}
                item={item}
                onConnect={onConnect}
                isConnecting={isFetchingWcUri && connectingWallet?.id === item.id}
                isSelected={selectedWalletId === item.id}
              />
            ))}
          </Flex>
        )}

        {/* Load More Button */}
        <Button
          width="100%"
          variant="outline"
          onClick={() => {
            fetchWallets?.({ page: page + 1 })
          }}
          isLoading={isFetchingWallets}
          loadingText="Loading..."
          mt={4}
        >
          Load More Wallets
        </Button>
      </Box>
    </Flex>
  )
}
