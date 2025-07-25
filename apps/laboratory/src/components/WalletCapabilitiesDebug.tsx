import { useEffect, useState } from 'react'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { UniversalProvider } from '@walletconnect/universal-provider'

import { W3mFrameProvider } from '@reown/appkit-wallet'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { useWagmiAvailableCapabilities } from '@/src/hooks/useWagmiActiveCapabilities'
import { EIP_5792_RPC_METHODS, WALLET_CAPABILITIES, getCapabilitySupportedChainInfo } from '@/src/utils/EIP5792Utils'

export function WalletCapabilitiesDebug() {
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { chainId } = useAppKitNetwork()
  const { walletProvider, walletProviderType } = useAppKitProvider('eip155')

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

  // Detect adapter type based on provider constructor name
  const detectAdapterType = () => {
    if (!walletProvider) return null
    
    const providerName = walletProvider.constructor.name
    if (providerName.includes('Wagmi') || providerName.includes('wagmi')) {
      return 'wagmi'
    }
    if (providerName.includes('Ethers') || providerName.includes('ethers')) {
      return 'ethers'
    }
    return null
  }

  const detectedAdapter = detectAdapterType()

  useEffect(() => {
    if (detectedAdapter === 'ethers' && address && walletProvider && isConnected) {
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
  }, [detectedAdapter, address, walletProvider, isConnected])

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

  const isWagmi = detectedAdapter === 'wagmi'
  const isEthers = detectedAdapter === 'ethers'

  const atomicBatchSupported = isWagmi 
    ? wagmiAtomicBatchCapabilities.supported 
    : isEthers ? isEthersCapabilitySupported(ethersAtomicBatchChains) : false
  
  const atomicBatchChainsName = isWagmi
    ? wagmiAtomicBatchCapabilities.supportedChainsName
    : isEthers ? getEthersSupportedChainsName(ethersAtomicBatchChains) : ''

  const paymasterSupported = isWagmi
    ? wagmiPaymasterCapabilities.supported
    : isEthers ? isEthersCapabilitySupported(ethersPaymasterChains) : false

  const paymasterChainsName = isWagmi
    ? wagmiPaymasterCapabilities.supportedChainsName
    : isEthers ? getEthersSupportedChainsName(ethersPaymasterChains) : ''

  const permissionsSupported = isWagmi
    ? wagmiPermissionsCapabilities.supported
    : isEthers ? isEthersCapabilitySupported(ethersPermissionsChains) : false

  const permissionsChainsName = isWagmi
    ? wagmiPermissionsCapabilities.supportedChainsName
    : isEthers ? getEthersSupportedChainsName(ethersPermissionsChains) : ''

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
            Debug: {detectedAdapter || 'unknown'} - Current Chain: {chainId} - Provider: {walletProvider?.constructor.name}
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
            Debug: {detectedAdapter || 'unknown'} - Paymaster Chains: {paymasterChainsName || 'None'}
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
            Debug: {detectedAdapter || 'unknown'} - Permissions Chains: {permissionsChainsName || 'None'}
          </Text>
        </Box>
      </Stack>
    </Box>
  )
} 