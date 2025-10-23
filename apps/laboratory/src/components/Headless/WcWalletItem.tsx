import { Box, Flex, Image, Text } from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import { type WalletItem2 } from '@reown/appkit-controllers/react'
import '@reown/appkit-ui/wui-icon'

interface Props {
  item: WalletItem2
  onConnect: (wallet: WalletItem2, namespace?: ChainNamespace) => void
}

export function WcWalletItem({ item, onConnect }: Props) {
  return (
    <Box
      key={item.name}
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
            boxSize="32px"
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

        <wui-icon name="chevronRight" color="default"></wui-icon>
      </Flex>

      {/* Wallet chains info */}
    </Box>
  )
}
