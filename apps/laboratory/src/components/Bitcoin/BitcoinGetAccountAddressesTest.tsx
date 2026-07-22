import { useState } from 'react'

import { Box, Button, Code, Text } from '@chakra-ui/react'

import type { BitcoinConnector } from '@reown/appkit-adapter-bitcoin'
import { useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

export function BitcoinGetAccountAddressesTest() {
  const toast = useChakraToast()
  const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122')

  const [isLoading, setIsLoading] = useState(false)
  const [addresses, setAddresses] = useState<BitcoinConnector.AccountAddress[] | null>(null)

  async function onGetAccountAddresses() {
    if (!walletProvider) {
      throw Error('No connection detected')
    }

    setIsLoading(true)
    setAddresses(null)

    try {
      const result = await walletProvider.getAccountAddresses()
      setAddresses(result)
      toast({
        title: ConstantsUtil.SigningSucceededToastTitle,
        description: `Found ${result.length} addresses`,
        type: 'success'
      })
    } catch (error) {
      toast({
        title: ConstantsUtil.SigningFailedToastTitle,
        description: (error as Error).message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        data-testid="get-account-addresses-button"
        onClick={onGetAccountAddresses}
        width="auto"
        isLoading={isLoading}
        mb={4}
      >
        Get Account Addresses
      </Button>

      {addresses && addresses.length > 0 && (
        <Box mt={2}>
          <Text fontWeight="bold" mb={2}>
            Addresses ({addresses.length}):
          </Text>
          {addresses.map((addr, index) => (
            <Box key={index} mb={3} p={2} borderWidth="1px" borderRadius="md">
              <Text fontSize="sm">
                <strong>Address:</strong> {addr.address}
              </Text>
              <Text fontSize="sm">
                <strong>Public Key:</strong> {addr.publicKey || 'N/A'}
              </Text>
              <Text fontSize="sm">
                <strong>Path:</strong> {addr.path || 'N/A'}
              </Text>
              <Text fontSize="sm">
                <strong>Purpose:</strong> {addr.purpose}
              </Text>
            </Box>
          ))}
          <Text fontWeight="bold" mt={4} mb={2}>
            Raw Response:
          </Text>
          <Code display="block" whiteSpace="pre-wrap" p={2} fontSize="xs">
            {JSON.stringify(addresses, null, 2)}
          </Code>
        </Box>
      )}
    </>
  )
}
