import { Center, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { NetworksButton } from '../../components/NetworksButton'
import { createWeb3Modal, defaultEthersConfig } from '@web3modal/ethers-5/react'
import { EthersConnectButton } from '../../components/EthersConnectButton'

async function initializeWeb3Modal() {
  const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
  }
  const chains = [1, 42161, 137, 43114, 56, 10, 100, 324, 7777777, 8453, 42220, 1313161554]

  const ethersConfig = await defaultEthersConfig({
    projectId,
    chains: [1],
    optionalChains: [42161, 137, 43114, 56, 10, 100, 324, 7777777, 8453, 42220, 1313161554]
  })

  createWeb3Modal({ ethersConfig, chains, projectId, enableEIP6963: true, enableAnalytics: true })
}

export default function Ethers() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function initialize() {
      await initializeWeb3Modal()
      setReady(true)
    }
    initialize()
  }, [])

  return ready ? (
    <>
      <Center paddingTop={10}>
        <Text fontSize="xl" fontWeight={700}>
          V3 with Ethers
        </Text>
      </Center>
      <Center h="65vh">
        <VStack gap={4}>
          <EthersConnectButton />
          <NetworksButton />
        </VStack>
      </Center>
    </>
  ) : null
}
