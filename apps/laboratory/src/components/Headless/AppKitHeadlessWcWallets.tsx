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
import '@reown/appkit-ui/wui-icon'
import { type UseAppKitWalletsReturn, useAppKitWallets } from '@reown/appkit/react'

import { WcWalletItem } from './WcWalletItem'

interface Props {
  connectingWallet: UseAppKitWalletsReturn['data'][number] | undefined
  onConnect: (wallet: UseAppKitWalletsReturn['data'][number], namespace?: ChainNamespace) => void
  onBack: () => void
}

export function AppKitHeadlessWcWallets({ connectingWallet, onConnect, onBack }: Props) {
  const { data, isFetchingWcUri, isFetchingWallets, page, count, fetchWallets } = useAppKitWallets()

  const wcWallets = data.filter(w => !w.isInjected)

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchWallets?.()
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
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoFocus
        />
      </InputGroup>

      {/* Wallets List */}
      <Box flex={1} overflowY="auto" pr={2}>
        {isFetchingWallets && wcWallets.length === 0 ? (
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
              <WcWalletItem
                key={item.name + item.id}
                item={item}
                onConnect={onConnect}
                isConnecting={isFetchingWcUri && connectingWallet?.id === item.id}
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
