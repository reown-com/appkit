import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import type { Dispatch, SetStateAction } from 'react'
import {
  mainnet,
  optimism,
  arbitrum,
  solana,
  aurora,
  avalanche,
  base,
  baseSepolia,
  binanceSmartChain,
  sepolia,
  polygon,
  gnosis,
  zkSync,
  zora,
  celo,
  solanaTestnet,
  solanaDevnet
} from '../utils/ChainsUtil'

interface Props {
  chains: any[]
  setChains: Dispatch<SetStateAction<any[]>>
  controls: ReturnType<typeof useDisclosure>
}

// -- Constants --------------------------------
const chainArray = [
  mainnet,
  arbitrum,
  polygon,
  avalanche,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora,
  sepolia,
  baseSepolia,
  solana,
  solanaTestnet,
  solanaDevnet
]

export function SelectChainsDrawer({ chains, setChains, controls }: Props) {
  const { isOpen, onClose } = controls

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Select chains to connect</DrawerHeader>
        <Text pt="2" fontSize="sm" padding={6}>
          Select which chains to connect your wallet.{' '}
        </Text>
        <DrawerBody>
          <Stack spacing={4}>
            {chainArray.map(chain => (
              <Box
                onClick={() => {
                  if (chains.find(c => c.name === chain.name)) {
                    setChains(chains.filter(c => c.name !== chain.name))
                  } else {
                    setChains([...chains, chain])
                  }
                }}
                border={'1px'}
                borderRadius={4}
                borderColor={chains.find(c => c.name === chain.name) ? 'gray.200' : 'gray.600'}
                padding={4}
              >
                {chain.name}
              </Box>
            ))}
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
