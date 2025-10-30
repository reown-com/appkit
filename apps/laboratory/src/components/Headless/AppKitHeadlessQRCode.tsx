import QRCode from 'react-qr-code'

import { ArrowBackIcon, CopyIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, IconButton, Image, Spinner, Text, VStack } from '@chakra-ui/react'

import { type UseAppKitWalletsReturn, useAppKitWallets } from '@reown/appkit/react'

interface Props {
  wallet: UseAppKitWalletsReturn['data'][number]
  onBack: () => void
  onCopyUri?: () => void
}

export function AppKitHeadlessQRCode({ wallet, onBack, onCopyUri }: Props) {
  const { wcUri, isFetchingWcUri } = useAppKitWallets()

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
          Scan QR Code
        </Text>
      </Flex>

      {/* Wallet Info */}
      <Flex align="center" gap={3} p={3} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md">
        {wallet.imageUrl ? (
          <Image
            src={wallet.imageUrl}
            alt={wallet.name}
            boxSize="40px"
            borderRadius="md"
            fallback={
              <Box
                boxSize="40px"
                bg="gray.200"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="sm" fontWeight="bold">
                  {wallet.name.charAt(0)}
                </Text>
              </Box>
            }
          />
        ) : (
          <Box
            boxSize="40px"
            bg="gray.200"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="sm" fontWeight="bold">
              {wallet.name.charAt(0)}
            </Text>
          </Box>
        )}
        <VStack align="flex-start" spacing={0} flex={1}>
          <Text fontWeight="medium">{wallet.name}</Text>
          <Text fontSize="xs" color="gray.500">
            Connecting via WalletConnect
          </Text>
        </VStack>
      </Flex>

      {/* QR Code Placeholder */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="2px dashed"
        borderColor="gray.300"
        borderRadius="lg"
        p={8}
        bg="white"
        _dark={{ bg: 'gray.800' }}
        position="relative"
      >
        <Button
          position="absolute"
          top={3}
          right={3}
          size="xs"
          leftIcon={<CopyIcon />}
          onClick={onCopyUri}
          variant="ghost"
          colorScheme="blue"
        >
          Copy
        </Button>
        {isFetchingWcUri ? (
          <Spinner />
        ) : (
          <QRCode
            value={wcUri || ''}
            size={200}
            style={{ height: 'auto', maxWidth: '100%', width: 'auto' }}
            data-testid="qr-code"
            data-value={wcUri || ''}
          />
        )}
      </Box>

      {/* Instructions */}
      <VStack spacing={2} p={4} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="md">
        <Text fontSize="sm" fontWeight="medium" color="blue.800" _dark={{ color: 'blue.100' }}>
          Connection Instructions:
        </Text>
        <Text fontSize="xs" color="blue.700" _dark={{ color: 'blue.200' }} textAlign="center">
          1. Open {wallet.name} on your phone
          <br />
          2. Scan the QR code above
          <br />
          3. Approve the connection request
        </Text>
      </VStack>
    </Flex>
  )
}
