import { Center, Text, VStack } from '@chakra-ui/react'
import { NetworksButton } from '../../components/NetworksButton'
import { EthersConnectButton } from '../../components/Ethers/EthersConnectButton'
import { useEffect, useState } from 'react'
import EthersModal from '../../components/Ethers/EthersModal'

export default function Ethers() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return ready ? (
    <>
      <EthersModal />
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
