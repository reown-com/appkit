import * as React from 'react'
import {
  StackDivider,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Box,
  Stack,
  Text
} from '@chakra-ui/react'
import { useWeb3ModalState } from '@web3modal/base/react'

export function MultiChainInfo() {
  const { activeChain, selectedNetworkId } = useWeb3ModalState()

  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Chain Information</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Active chain
            </Heading>
            <Text>{activeChain}</Text>
          </Box>
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Active Network
            </Heading>
            <Text>{selectedNetworkId}</Text>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}
