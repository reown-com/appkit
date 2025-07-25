import { Box, Heading, Stack, Text } from '@chakra-ui/react'

import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES } from '@/src/utils/EIP5792Utils'

export function WagmiWalletCapabilitiesDebug() {
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { chainId } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider('eip155')

  // For Wagmi adapter
  const wagmiAtomicBatchCapabilities = useWagmiAvailableCapabilities({
    capability: WALLET_CAPABILITIES.ATOMIC_BATCH,
    method: EIP_5792_RPC_METHODS.WALLET_SEND_CALLS,
  })

  const wagmiPaymasterCapabilities = useWagmiAvailableCapabilities({
    capability: WALLET_CAPABILITIES.PAYMASTER_SERVICE,
    method: EIP_5792_RPC_METHODS.WALLET_SEND_CALLS,
  })

  const wagmiPermissionsCapabilities = useWagmiAvailableCapabilities({
    capability: WALLET_CAPABILITIES.PERMISSIONS,
    method: EIP_5792_RPC_METHODS.WALLET_SEND_CALLS,
  })

  if (!isConnected || !address) {
    return null
  }

  const atomicBatchChainsName = wagmiAtomicBatchCapabilities?.supportedChains?.map(chain => chain.name).join(', ')
  const paymasterChainsName = wagmiPaymasterCapabilities?.supportedChains?.map(chain => chain.name).join(', ')
  const permissionsChainsName = wagmiPermissionsCapabilities?.supportedChains?.map(chain => chain.name).join(', ')

  // Fix: Check atomic/atomicBatch support for the current chain
  const chainKey = String(chainId)
  const atomicBatchSupported = (
    wagmiAtomicBatchCapabilities?.availableCapabilities?.[chainKey]?.atomicBatch?.supported ??
    wagmiAtomicBatchCapabilities?.availableCapabilities?.[chainKey]?.atomic?.supported
  )

  return (
    <Box>
      <Heading size="xs" textTransform="uppercase" pb="2">
        Wallet Capabilities
      </Heading>
      <Stack spacing={4}>
        {/* Atomic Batch */}
        <Box>
          <Text fontWeight="bold" color="gray.500">
            Atomic Batch
          </Text>
          <Text color={atomicBatchSupported ? 'green.500' : 'red.500'}>
            {atomicBatchSupported ? 'Supported' : 'Not Supported'}
          </Text>
          {atomicBatchSupported && atomicBatchChainsName && (
            <Text fontSize="sm" color="gray.600">
              Supported chains: {atomicBatchChainsName}
            </Text>
          )}
          {/* Debug output */}
          <Text fontSize="xs" color="blue.500">
            Debug: wagmi - Current Chain: {chainId} - Provider: {walletProvider?.constructor.name}
          </Text>
        </Box>

        {/* Paymaster Service */}
        <Box>
          <Text fontWeight="bold" color="gray.500">
            Paymaster Service
          </Text>
          <Text color={wagmiPaymasterCapabilities?.isSupported ? 'green.500' : 'red.500'}>
            {wagmiPaymasterCapabilities?.isSupported ? 'Supported' : 'Not Supported'}
          </Text>
          {wagmiPaymasterCapabilities?.isSupported && paymasterChainsName && (
            <Text fontSize="sm" color="gray.600">
              Supported chains: {paymasterChainsName}
            </Text>
          )}
          {/* Debug output */}
          <Text fontSize="xs" color="blue.500">
            Debug: wagmi - Paymaster Chains: {paymasterChainsName || 'None'}
          </Text>
        </Box>

        {/* Permissions */}
        <Box>
          <Text fontWeight="bold" color="gray.500">
            Permissions
          </Text>
          <Text color={wagmiPermissionsCapabilities?.isSupported ? 'green.500' : 'red.500'}>
            {wagmiPermissionsCapabilities?.isSupported ? 'Supported' : 'Not Supported'}
          </Text>
          {wagmiPermissionsCapabilities?.isSupported && permissionsChainsName && (
            <Text fontSize="sm" color="gray.600">
              Supported chains: {permissionsChainsName}
            </Text>
          )}
          {/* Debug output */}
          <Text fontSize="xs" color="blue.500">
            Debug: wagmi - Permissions Chains: {permissionsChainsName || 'None'}
          </Text>
        </Box>

        {/* Raw wallet_getCapabilities debug */}
        <Box>
          <Text fontWeight="bold" color="gray.500">
            Raw wallet_getCapabilities
          </Text>
          <Box as="pre" fontSize="xs" color="purple.600" bg="gray.50" p={2} borderRadius="md" overflowX="auto">
            {JSON.stringify(wagmiAtomicBatchCapabilities?.availableCapabilities, null, 2)}
          </Box>
        </Box>
      </Stack>
    </Box>
  )
} 