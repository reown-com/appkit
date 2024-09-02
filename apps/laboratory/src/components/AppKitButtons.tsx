import { useRouter } from 'next/router'

import { useWeb3Modal as useWeb3ModalEthers } from '@web3modal/ethers/react'
import { useWeb3Modal as useWeb3ModalSolana } from '@web3modal/solana/react'
import { useWeb3Modal as useWeb3ModalEthers5 } from '@web3modal/ethers5/react'
import { useWeb3Modal as useWeb3ModalWagmi } from '@web3modal/wagmi/react'
import {
  Stack,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Box,
  StackDivider,
  Button
} from '@chakra-ui/react'

export function AppKitButtons() {
  const { pathname } = useRouter()
  const { open: openEthers } = useWeb3ModalEthers()
  const { open: openSolana } = useWeb3ModalSolana()
  const { open: openEthers5 } = useWeb3ModalEthers5()
  const { open: openWagmi } = useWeb3ModalWagmi()

  function openModalWithHook() {
    if (pathname.includes('/solana')) {
      openEthers()
    } else if (pathname.includes('/ethers5')) {
      openEthers5()
    } else if (pathname.includes('/wagmi')) {
      openWagmi()
    } else if (pathname.includes('/ethers')) {
      openSolana()
    }
  }

  return (
    <Card marginTop={10}>
      <CardHeader>
        <Heading size="md">AppKit Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Connect / Account Button
            </Heading>
            <w3m-button />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Network Button
            </Heading>
            <w3m-network-button />
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Hooks Interactions
            </Heading>
            <Button data-testid="w3m-open-hook-button" onClick={openModalWithHook}>
              Open
            </Button>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}
