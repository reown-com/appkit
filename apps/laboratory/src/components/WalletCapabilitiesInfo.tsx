import { useEffect, useState } from 'react'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { type Hex } from 'viem'

import { W3mFrameProvider } from '@reown/appkit-wallet'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES, getCapabilitySupportedChainInfo } from '@/src/utils/EIP5792Utils'

interface WalletCapabilitiesInfoProps {
  adapter: 'wagmi' | 'ethers'
}

export function WalletCapabilitiesInfo({ adapter }: WalletCapabilitiesInfoProps) {
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { chainId } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider('eip155')

  // For Wagmi adapter
  const wagmiAtomicBatchCapabilities = useWagmiAvailableCapabilities({
    capability: WALLET_CAPABILITIES.ATOMIC_BATCH,
    method: EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
  })

  const wagmiPaymasterCapabilities = useWagmiAvailableCapabilities({
    capability: WALLET_CAPABILITIES.PAYMASTER_SERVICE,
    method: EIP_5792_RPC_METHODS.WALLET_SEND_CALLS
  })

  const wagmiPermissionsCapabilities = useWagmiAvailableCapabilities({
    capability: WALLET_CAPABILITIES.PERMISSIONS,
    method: 'wallet_grantPermissions'
  })

  // For Ethers adapter
  const [ethersAtomicBatchChains, setEthersAtomicBatchChains] = useState<Awaited<ReturnType<typeof getCapabilitySupportedChainInfo>>>([])
  const [ethersPaymasterChains, setEthersPaymasterChains] = useState<Awaited<ReturnType<typeof getCapabilitySupportedChainInfo>>>([])
  const [ethersPermissionsChains, setEthersPermissionsChains] = useState<Awaited<ReturnType<typeof getCapabilitySupportedChainInfo>>>([])

  useEffect(() => {
    if (adapter === 'ethers' && address && walletProvider && isConnected) {
      if (walletProvider instanceof UniversalProvider || walletProvider instanceof W3mFrameProvider) {
        // Get Atomic Batch capabilities
        getCapabilitySupportedChainInfo(
          WALLET_CAPABILITIES.ATOMIC_BATCH,
          walletProvider,
          address
        ).then(capabilities => setEthersAtomicBatchChains(capabilities))

        // Get Paymaster Service capabilities
        getCapabilitySupportedChainInfo(
          WALLET_CAPABILITIES.PAYMASTER_SERVICE,
          walletProvider,
          address
        ).then(capabilities => setEthersPaymasterChains(capabilities))

        // Get Permissions capabilities
        getCapabilitySupportedChainInfo(
          WALLET_CAPABILITIES.PERMISSIONS,
          walletProvider,
          address
        ).then(capabilities => setEthersPermissionsChains(capabilities))
      }
    } else {
      setEthersAtomicBatchChains([])
      setEthersPaymasterChains([])
      setEthersPermissionsChains([])
    }
  }, [adapter, address, walletProvider, isConnected])

  // Helper function to check if current chain supports capability for Ethers
  const isEthersCapabilitySupported = (supportedChains: typeof ethersAtomicBatchChains) => {
    return supportedChains.some(chain => chain.chainId === Number(chainId))
  }

  const getEthersSupportedChainsName = (supportedChains: typeof ethersAtomicBatchChains) => {
    return supportedChains.map(ci => ci.chainName).join(', ')
  }

  if (!isConnected || !address) {
    return null
  }

  const atomicBatchSupported = adapter === 'wagmi' 
    ? wagmiAtomicBatchCapabilities.supported 
    : isEthersCapabilitySupported(ethersAtomicBatchChains)
  
  const atomicBatchChainsName = adapter === 'wagmi'
    ? wagmiAtomicBatchCapabilities.supportedChainsName
    : getEthersSupportedChainsName(ethersAtomicBatchChains)

  const paymasterSupported = adapter === 'wagmi'
    ? wagmiPaymasterCapabilities.supported
    : isEthersCapabilitySupported(ethersPaymasterChains)

  const paymasterChainsName = adapter === 'wagmi'
    ? wagmiPaymasterCapabilities.supportedChainsName
    : getEthersSupportedChainsName(ethersPaymasterChains)

  const permissionsSupported = adapter === 'wagmi'
    ? wagmiPermissionsCapabilities.supported
    : isEthersCapabilitySupported(ethersPermissionsChains)

  const permissionsChainsName = adapter === 'wagmi'
    ? wagmiPermissionsCapabilities.supportedChainsName
    : getEthersSupportedChainsName(ethersPermissionsChains)

  return (
    <Box>
      <Heading size="xs" textTransform="uppercase" pb="2">
        Wallet Capabilities
      </Heading>
      <Stack spacing="2">
        <Box>
          <Text fontWeight="bold" fontSize="sm">Atomic Batch:</Text>
          <Text fontSize="sm" color={atomicBatchSupported ? 'green.500' : 'red.500'}>
            {atomicBatchSupported ? '✅ Supported' : '❌ Not Supported'}
          </Text>
          {atomicBatchChainsName && (
            <Text fontSize="xs" color="gray.500">
              Supported on: {atomicBatchChainsName}
            </Text>
          )}
          {/* Debug output */}
          <Text fontSize="xs" color="blue.500">
            Debug: {adapter} - Current Chain: {chainId} - Provider: {walletProvider?.constructor.name}
          </Text>
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="sm">Paymaster Service:</Text>
          <Text fontSize="sm" color={paymasterSupported ? 'green.500' : 'red.500'}>
            {paymasterSupported ? '✅ Supported' : '❌ Not Supported'}
          </Text>
          {paymasterChainsName && (
            <Text fontSize="xs" color="gray.500">
              Supported on: {paymasterChainsName}
            </Text>
          )}
          {/* Debug output */}
          <Text fontSize="xs" color="blue.500">
            Debug: {adapter} - Paymaster Chains: {paymasterChainsName || 'None'}
          </Text>
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="sm">Permissions:</Text>
          <Text fontSize="sm" color={permissionsSupported ? 'green.500' : 'red.500'}>
            {permissionsSupported ? '✅ Supported' : '❌ Not Supported'}
          </Text>
          {permissionsChainsName && (
            <Text fontSize="xs" color="gray.500">
              Supported on: {permissionsChainsName}
            </Text>
          )}
          {/* Debug output */}
          <Text fontSize="xs" color="blue.500">
            Debug: {adapter} - Permissions Chains: {permissionsChainsName || 'None'}
          </Text>
        </Box>
      </Stack>
    </Box>
  )
} 