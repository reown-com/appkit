import * as React from 'react'

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
  Text
} from '@chakra-ui/react'

import { convertCaip10ToErc3770 } from '@reown/appkit-experimental/erc3770'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

import { RelayClientInfo } from '@/src/components/RelayClientInfo'

import { EmbeddedWalletInfo } from './EmbeddedWalletInfo'

export function AppKitInfo() {
  const { caipAddress, address } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  const isEIP155 = caipAddress?.startsWith('eip155:')
  const erc3770Address = React.useMemo(() => {
    if (!isEIP155 || !caipAddress) {
      return null
    }
    try {
      return convertCaip10ToErc3770(caipAddress)
    } catch (e) {
      return null
    }
  }, [caipAddress, isEIP155])

  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Account Information</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              CAIP Address
            </Heading>
            <Text data-testid="w3m-caip-address">{caipAddress}</Text>
          </Box>

          {erc3770Address && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Chain Specific Address (ERC-3770)
              </Heading>
              <Text data-testid="w3m-erc3770-address">{erc3770Address}</Text>
            </Box>
          )}

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Address
            </Heading>
            <Text data-testid="w3m-address">{address}</Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Chain Id
            </Heading>
            <Text data-testid="w3m-chain-id">{chainId}</Text>
          </Box>

          <RelayClientInfo />

          <EmbeddedWalletInfo />
        </Stack>
      </CardBody>
    </Card>
  )
}
