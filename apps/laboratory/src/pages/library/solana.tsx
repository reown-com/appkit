import { Center, Text, VStack } from '@chakra-ui/react'
import { createWeb3Modal, defaultSolanaConfig } from '@web3modal/solana/react'

import { ThemeStore } from '../../utils/StoreUtil'
import {
  solana
} from '../../utils/ChainsUtil'
import { Web3ModalButtons } from "../../components/Web3ModalButtons";
import { ConstantsUtil } from '../../utils/ConstantsUtil'

const chains = [
  solana
]

export const solanaConfig = defaultSolanaConfig({
  chains,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  EIP6963: true
})

const modal = createWeb3Modal({
  solanaConfig,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  chains,
  enableAnalytics: false,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
})

ThemeStore.setModal(modal)

export default function Solana() {
  return (
    <>
      <Center paddingTop={10}>
        <Text fontSize="xl" fontWeight={700}>
          Solana default
        </Text>
      </Center>
      <Center h="65vh">
        <VStack gap={4}>
          <Web3ModalButtons />
        </VStack>
      </Center>
    </>
  )
}
