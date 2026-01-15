import { ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Flex, Image, Spinner, Text } from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import type { WalletItem } from '@reown/appkit/react'

interface Props {
  item: WalletItem
  onConnect: (wallet: WalletItem, namespace?: ChainNamespace) => void
  isConnecting: boolean
  isSelected?: boolean
}

export function WcWalletItem({ item, onConnect, isConnecting, isSelected }: Props) {
  return (
    <Box
      key={item.name}
      data-testid={`wallet-button-${item.name}`}
      p={3}
      border={isSelected ? '2px' : '1px'}
      borderColor={isSelected ? 'blue.500' : 'gray.200'}
      borderRadius="md"
      cursor="pointer"
      bg={isSelected ? 'blue.50' : undefined}
      onClick={() => onConnect(item)}
      _hover={{ bg: isSelected ? 'blue.100' : 'gray.50', _dark: { bg: isSelected ? 'blue.900' : 'gray.700' } }}
      _dark={{ bg: isSelected ? 'blue.900' : undefined, borderColor: isSelected ? 'blue.400' : 'gray.600' }}
      position="relative"
    >
      <Flex align="center" gap={3}>
        {/* Wallet Icon */}
        <Image
          src={item.imageUrl}
          alt={item.name}
          boxSize="40px"
          borderRadius="md"
          fallback={
            <Box
              boxSize="32px"
              bg="gray.200"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="xs" fontWeight="bold">
                {item.name.charAt(0)}
              </Text>
            </Box>
          }
        />

        {/* Wallet Name */}
        <Text fontWeight="medium" flex={1}>
          {item.name}
        </Text>

        {isConnecting ? <Spinner color="gray.300" /> : <ChevronRightIcon color="gray.500" />}
      </Flex>

      {/* Wallet chains info */}
    </Box>
  )
}
