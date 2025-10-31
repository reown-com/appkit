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

import type { UseAppKitAccountReturn } from '@reown/appkit'
import type { ChainNamespace } from '@reown/appkit-common'
import { convertCaip10ToErc3770 } from '@reown/appkit-experimental/erc3770'
import { useAppKitAccount, useWalletInfo } from '@reown/appkit/react'

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

export function AccountCard({
  account,
  namespace
}: {
  account: UseAppKitAccountReturn | undefined
  namespace?: ChainNamespace
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
        <Heading size="md">
          {namespace ? namespaceToTitle(namespace) : 'Current'} Account Info
        </Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              CAIP Address
            </Heading>
            <Text data-testid={`w3m-caip-address${namespace ? `-${namespace}` : ''}`}>
              {account?.caipAddress || '-'}
            </Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Address
            </Heading>
            <Text data-testid={`w3m-address${namespace ? `-${namespace}` : ''}`}>
              {account?.address || '-'}
            </Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Chain Specific Address (ERC-3770)
            </Heading>
            <Text data-testid={`w3m-erc3770-address${namespace ? `-${namespace}` : ''}`}>
              {erc3770Address || '-'}
            </Text>
          </Box>

          {embeddedWalletInfo ? (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Embedded Wallet Info
              </Heading>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Email
              </Heading>
              <Text data-testid={`w3m-email${namespace ? `-${namespace}` : ''}`}>
                {embeddedWalletInfo?.user?.email}
              </Text>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Account Type
              </Heading>
              <Text data-testid={`w3m-account-type${namespace ? `-${namespace}` : ''}`}>
                {embeddedWalletInfo?.accountType === 'eoa' ? 'EOA' : 'Smart Account'}
              </Text>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Username
              </Heading>
              <Text>{embeddedWalletInfo?.user?.username}</Text>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Smart Account Status
              </Heading>
              <Text data-testid={`w3m-sa-account-status${namespace ? `-${namespace}` : ''}`}>
                {embeddedWalletInfo?.isSmartAccountDeployed ? 'Deployed' : 'Not Deployed'}
              </Text>
            </Box>
          ) : null}

          {walletInfo && (
            <Box>
              <Heading size="xs" textTransform="uppercase" pb="2">
                Wallet Info
              </Heading>
              <Box>
                <Text fontWeight="bold" color="gray.500">
                  Type
                </Text>
                <Text data-testid={`w3m-wallet-type${namespace ? `-${namespace}` : ''}`}>
                  {walletInfo.type}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.500">
                  Name
                </Text>
                <Box display="flex" alignItems="center" gap={2}>
                  {walletInfo?.icon ? (
                    <Image
                      src={walletInfo.icon.trim()}
                      alt={walletInfo.name}
                      width={24}
                      height={24}
                      unoptimized
                    />
                  ) : null}
                  <Text data-testid={`w3m-wallet-name${namespace ? `-${namespace}` : ''}`}>
                    {walletInfo.name}
                  </Text>
                </Box>
              </Box>
            </Box>
          )}

          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Status
            </Heading>
            <Text data-testid={`apkt-account-status${namespace ? `-${namespace}` : ''}`}>
              {appKitAccount?.status || '-'}
            </Text>
          </Box>

          <RelayClientInfo />
        </Stack>
      </CardBody>
    </Card>
  )
}
