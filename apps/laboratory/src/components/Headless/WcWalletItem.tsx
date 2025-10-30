import { ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Flex, Image, Spinner, Text } from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import type { UseAppKitWalletsReturn } from '@reown/appkit/react'

interface Props {
  item: UseAppKitWalletsReturn['data'][number]
  onConnect: (wallet: UseAppKitWalletsReturn['data'][number], namespace?: ChainNamespace) => void
  isConnecting: boolean
}

export function WcWalletItem({ item, onConnect, isConnecting }: Props) {
  return (
    <Box
      key={item.name}
      data-testid={`wc-wallet-item-${item.name.replace(/\s+/g, '')}`}
      p={3}
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      cursor="pointer"
      onClick={() => onConnect(item)}
      _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}
      position="relative"
    >
      <Flex align="center" gap={3}>
        {/* Wallet Icon */}
        {item.imageUrl ? (
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
        ) : (
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
        )}

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
