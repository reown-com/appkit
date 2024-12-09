import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Stack,
  StackDivider
} from '@chakra-ui/react'
import { useAppKitWallet } from '@reown/appkit-wallet-button/react'
import type { Wallet } from '@reown/appkit-wallet-button'
import { Fragment, useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { useChakraToast } from './Toast'

interface AppKitWalletButtonsProps {
  wallets: Wallet[]
}

interface WalletButtonHooksProps {
  isSocials?: boolean
  isWalletConnect?: boolean
  wallets: Wallet[]
}

interface WalletButtonComponentsProps {
  wallets: Wallet[]
}

const socials: Wallet[] = ['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook']

export function AppKitWalletButtons({ wallets }: AppKitWalletButtonsProps) {
  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Wallet Buttons</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4" flexWrap="wrap">
          <Flex flexDirection="column" gap="4">
            <Heading size="xs" textTransform="uppercase">
              Components
            </Heading>

            <Flex display="flex" flexWrap="wrap" gap="4">
              <WalletButtonComponents wallets={['walletConnect']} />
              <WalletButtonComponents wallets={wallets} />
              <WalletButtonComponents wallets={socials} />
            </Flex>
          </Flex>

          <Flex flexDirection="column" gap="4">
            <Heading size="xs" textTransform="uppercase">
              Hooks Interactions
            </Heading>

            <Flex display="flex" flexWrap="wrap" gap="4">
              <WalletButtonHooks wallets={['walletConnect']} isWalletConnect />
              <WalletButtonHooks wallets={wallets} />
              <WalletButtonHooks wallets={socials} isSocials />
            </Flex>
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  )
}

function WalletButtonComponents({ wallets }: WalletButtonComponentsProps) {
  return wallets.map(wallet => (
    <Fragment key={`wallet-button-${wallet}`}>
      <appkit-wallet-button wallet={wallet} data-testid={`wallet-button-${wallet}`} />
    </Fragment>
  ))
}

function WalletButtonHooks({
  isSocials = false,
  isWalletConnect = false,
  wallets
}: WalletButtonHooksProps) {
  const [pendingWallet, setPendingWallet] = useState<Wallet>()

  const toast = useChakraToast()

  const { caipAddress } = useAppKitAccount()

  const { isReady, isPending, connect } = useAppKitWallet({
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

  const isWalletButtonDisabled = !isWalletConnect && !isSocials && !isReady

  return wallets.map(wallet => (
    <Button
      key={`wallet-button-hook-${wallet}`}
      onClick={() => {
        setPendingWallet(wallet)
        connect(wallet)
      }}
      maxW="fit-content"
      size="md"
      isLoading={isPending && pendingWallet === wallet}
      isDisabled={Boolean(caipAddress) || isWalletButtonDisabled}
      textTransform="capitalize"
      data-testid={`wallet-button-hook-${wallet}`}
    >
      {wallet}
    </Button>
  ))
}
