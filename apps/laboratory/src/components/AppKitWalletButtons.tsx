import { Fragment, useState } from 'react'

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Stack,
  StackDivider,
  Text
} from '@chakra-ui/react'

import type { ChainNamespace } from '@reown/appkit-common'
import type { Wallet } from '@reown/appkit-wallet-button'
import {
  AppKitWalletButton,
  useAppKitUpdateEmail,
  useAppKitWallet
} from '@reown/appkit-wallet-button/react'
import { type SocialProvider, useAppKitAccount } from '@reown/appkit/react'

import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

import { useChakraToast } from './Toast'

interface AppKitWalletButtonsProps {
  title?: string
  namespace?: ChainNamespace
  wallets: Wallet[]
  showActions?: boolean
}

interface WalletButtonHooksProps {
  namespace?: ChainNamespace
  wallets: Wallet[]
}

interface WalletButtonComponentsProps {
  namespace?: ChainNamespace
  wallets: Wallet[]
}

export function AppKitWalletButtons({
  title = 'Wallet Buttons',
  namespace,
  wallets,
  showActions = true
}: AppKitWalletButtonsProps) {
  const { embeddedWalletInfo, caipAddress } = useAppKitAccount()

  const isEmailConnected = caipAddress && embeddedWalletInfo?.authProvider === 'email'

  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">{title}</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4" flexWrap="wrap">
          <Flex flexDirection="column" gap="4">
            <Heading size="xs" textTransform="uppercase">
              Components
            </Heading>

            <Flex display="flex" flexWrap="wrap" gap="4">
              <WalletButtonComponents namespace={namespace} wallets={wallets} />
            </Flex>
          </Flex>

          <Flex flexDirection="column" gap="4">
            <Heading size="xs" textTransform="uppercase">
              Hooks Interactions
            </Heading>

            <Flex display="flex" flexWrap="wrap" gap="4">
              <WalletButtonHooks namespace={namespace} wallets={wallets} />
            </Flex>
          </Flex>

          {showActions && (
            <Flex flexDirection="column" gap="4">
              <Heading size="xs" textTransform="uppercase">
                Actions
              </Heading>

              {isEmailConnected ? (
                <Flex display="flex" flexWrap="wrap" gap="4">
                  <UpdateEmail />
                </Flex>
              ) : (
                <Text textAlign="left" color="neutrals400" fontSize="16">
                  No actions available
                </Text>
              )}
            </Flex>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}

function WalletButtonComponents({ namespace, wallets }: WalletButtonComponentsProps) {
  return wallets.map(wallet => {
    let key = `wallet-button-${wallet}`

    if (namespace) {
      key = `${key}-${namespace}`
    }

    return (
      <Fragment key={key}>
        <AppKitWalletButton wallet={wallet} namespace={namespace} data-testid={key} />
      </Fragment>
    )
  })
}

function WalletButtonHooks({ namespace, wallets }: WalletButtonHooksProps) {
  const [pendingWallet, setPendingWallet] = useState<Wallet>()
  const toast = useChakraToast()
  const { caipAddress } = useAppKitAccount({ namespace })

  const { isReady, isPending, connect } = useAppKitWallet({
    namespace,
    onSuccess() {
      setPendingWallet(undefined)
    },
    onError(error) {
      toast({
        title: 'Wallet Button',
        description: error.message,
        type: 'error'
      })
      setPendingWallet(undefined)
    }
  })

  return wallets.map(wallet => {
    const isSocial = ConstantsUtil.Socials.includes(wallet as SocialProvider)
    const isWalletConnect = wallet === 'walletConnect'
    const isEmail = wallet === 'email'

    const isWalletButtonDisabled = !isWalletConnect && !isSocial && !isReady && !isEmail
    const shouldCapitlize = wallet === 'okx'

    let key = `wallet-button-hook-${wallet}`

    if (namespace) {
      key = `${key}-${namespace}`
    }

    return (
      <Button
        key={key}
        onClick={() => {
          setPendingWallet(wallet)
          connect(wallet)
        }}
        maxW="fit-content"
        size="md"
        isLoading={isPending && pendingWallet === wallet}
        isDisabled={Boolean(caipAddress) || isWalletButtonDisabled}
        textTransform={shouldCapitlize ? 'uppercase' : 'capitalize'}
        data-testid={key}
      >
        {wallet}
      </Button>
    )
  })
}

function UpdateEmail() {
  const toast = useChakraToast()

  const { updateEmail, isPending } = useAppKitUpdateEmail({
    onSuccess() {
      toast({
        title: 'Update Email',
        description: 'Email updated successfully',
        type: 'success'
      })
    },
    onError(error) {
      toast({
        title: 'Update Email',
        description: error.message,
        type: 'error'
      })
    }
  })

  return (
    <Button onClick={() => updateEmail()} isLoading={isPending}>
      Update Email
    </Button>
  )
}
