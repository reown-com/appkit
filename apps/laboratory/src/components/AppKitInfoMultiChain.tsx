import * as React from 'react'

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Heading,
  Stack,
  StackDivider,
  Text
} from '@chakra-ui/react'
import Image from 'next/image'

import type { ChainNamespace } from '@reown/appkit-common'
import { convertCaip10ToErc3770 } from '@reown/appkit-experimental/erc3770'
import { type UseAppKitAccountReturn, useAppKitAccount, useWalletInfo } from '@reown/appkit/react'

import { EmbeddedWalletInfo } from './EmbeddedWalletInfo'
import { RelayClientInfo } from './RelayClientInfo'

function namespaceToTitle(namespace: string | undefined) {
  if (!namespace) {
    return ''
  }

  switch (namespace) {
    case 'eip155':
      return 'EVM'
    case 'solana':
      return 'Solana'
    case 'bip122':
      return 'Bitcoin'
    default:
      return namespace
  }
}

function AccountCard({
  account,
  namespace
}: {
  account: UseAppKitAccountReturn | undefined
  namespace: ChainNamespace
}) {
  const caipAddress = account?.caipAddress

  const { embeddedWalletInfo } = useAppKitAccount({ namespace })
  const { walletInfo } = useWalletInfo(namespace)
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
    <Card data-testid={`${namespace}-account-card`}>
      <CardHeader>
        <Heading size="md">{namespaceToTitle(namespace)} Account Info</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              CAIP Address
            </Heading>
            <Text data-testid="w3m-caip-address">{account?.caipAddress || '-'}</Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Address
            </Heading>
            <Text data-testid={`w3m-address-${namespace}`}>{account?.address || '-'}</Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Chain Specific Address (ERC-3770)
            </Heading>
            <Text data-testid="w3m-erc3770-address">{erc3770Address || '-'}</Text>
          </Box>

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

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Status
            </Heading>
            <Text data-testid="apkt-account-status">{appKitAccount?.status || '-'}</Text>
          </Box>

          <RelayClientInfo />

          <EmbeddedWalletInfo />
        </Stack>
      </CardBody>
    </Card>
  )
}

export function AppKitInfoMultiChain() {
  const evmAccount = useAppKitAccount({ namespace: 'eip155' })
  const solanaAccount = useAppKitAccount({ namespace: 'solana' })
  const bitcoinAccount = useAppKitAccount({ namespace: 'bip122' })

  return (
    <Grid
      templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
      gap={4}
      marginTop={4}
      marginBottom={4}
    >
      <AccountCard account={evmAccount} namespace="eip155" />
      <AccountCard account={solanaAccount} namespace="solana" />
      <AccountCard account={bitcoinAccount} namespace="bip122" />
    </Grid>
  )
}
