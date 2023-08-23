import { Center, VStack, useColorMode } from '@chakra-ui/react'
import { useWeb3ModalTheme } from '@web3modal/wagmi/react'
import { useEffect } from 'react'
import { ConnectButton } from '../components/ConnectButton'
import { NetworksButton } from '../components/NetworksButton'

export default function HomePage() {
  const { colorMode } = useColorMode()

  const { setThemeMode } = useWeb3ModalTheme()

  useEffect(() => {
    setThemeMode(colorMode)
  }, [colorMode])

  return (
    <Center h="80vh">
      <VStack gap={4}>
        <ConnectButton />
        <NetworksButton />
      </VStack>
    </Center>
  )
}
