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
import Image from 'next/image'

import { convertCaip10ToErc3770 } from '@reown/appkit-experimental/erc3770'
import { useAppKitAccount, useAppKitNetwork, useWalletInfo } from '@reown/appkit/react'

import { RelayClientInfo } from '@/src/components/RelayClientInfo'

import { EmbeddedWalletInfo } from './EmbeddedWalletInfo'

export function AppKitInfo() {
  const { caipAddress, address, embeddedWalletInfo } = useAppKitAccount()
  const { walletInfo } = useWalletInfo()
  const { chainId } = useAppKitNetwork()
  const appKitAccount = useAppKitAccount()

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
          {caipAddress ? (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                CAIP Address
              </Heading>
              <Text data-testid="w3m-caip-address">{caipAddress}</Text>
            </Box>
          ) : null}

          {erc3770Address && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Chain Specific Address (ERC-3770)
              </Heading>
              <Text data-testid="w3m-erc3770-address">{erc3770Address}</Text>
            </Box>
          )}

          {address ? (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Address
              </Heading>
              <Text data-testid="w3m-address">{address}</Text>
            </Box>
          ) : null}

          {chainId !== undefined && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Chain Id
              </Heading>
              <Text data-testid="w3m-chain-id">{chainId}</Text>
            </Box>
          )}

          {embeddedWalletInfo && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Embedded Wallet Info
              </Heading>
              <Text data-testid="w3m-embedded-wallet-info">
                {JSON.stringify(embeddedWalletInfo, null, 2)}
              </Text>
            </Box>
          )}

          {walletInfo && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Wallet Info
              </Heading>
              <Box>
                <Text fontWeight="bold" color="gray.500">
                  Type
                </Text>
                <Text data-testid="w3m-wallet-type">{walletInfo.type}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.500">
                  Name
                </Text>
                <Box display="flex" alignItems="center" gap={2}>
                  {walletInfo?.icon ? (
                    <Image
                      src={walletInfo.icon}
                      alt={walletInfo.name}
                      width={24}
                      height={24}
                      unoptimized
                    />
                  ) : null}
                  <Text data-testid="w3m-wallet-name">{walletInfo.name}</Text>
                </Box>
              </Box>
            </Box>
          )}

          {appKitAccount?.status && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Status
              </Heading>
              <Text data-testid="apkt-account-status">{appKitAccount.status}</Text>
            </Box>
          )}

          <RelayClientInfo />

          <EmbeddedWalletInfo />
        </Stack>
      </CardBody>
    </Card>
  )
}
