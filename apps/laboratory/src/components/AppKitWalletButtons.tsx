import { Button, Flex, Heading, Stack, StackDivider } from '@chakra-ui/react'
import { useAppKitWallet } from '@reown/appkit-wallet-button/react'
import type { Wallet } from '@reown/appkit-wallet-button'
import { useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { useChakraToast } from './Toast'

interface WalletButtonHooksProps {
  isSocials?: boolean
  isWalletConnect?: boolean
  wallets: Wallet[]
}

interface WalletButtonComponentsProps {
  wallets: Wallet[]
}

const socialWallets: Wallet[] = [
  'google',
  'x',
  'discord',
  'farcaster',
  'github',
  'apple',
  'facebook'
]

const popularWallets: Wallet[] = ['metamask', 'trust', 'coinbase', 'rainbow', 'jupiter']

export function AppKitWalletButtons() {
  return (
    <Stack divider={<StackDivider />} spacing="4" flexWrap="wrap">
      <Flex flexDirection="column" gap="4">
        <Heading size="xs" textTransform="uppercase">
          Wallet Buttons (Components)
        </Heading>

        <Flex display="flex" flexWrap="wrap" gap="4">
          <WalletButtonComponents wallets={['walletConnect']} />
          <WalletButtonComponents wallets={popularWallets} />
          <WalletButtonComponents wallets={socialWallets} />
        </Flex>
      </Flex>

      <Flex flexDirection="column" gap="4">
        <Heading size="xs" textTransform="uppercase">
          Wallet Buttons (Hooks)
        </Heading>

        <Flex display="flex" flexWrap="wrap" gap="4">
          <WalletButtonHooks wallets={['walletConnect']} isWalletConnect />
          <WalletButtonHooks wallets={popularWallets} />
          <WalletButtonHooks wallets={socialWallets} isSocials />
        </Flex>
      </Flex>
    </Stack>
  )
}

function WalletButtonComponents({ wallets }: WalletButtonComponentsProps) {
  return wallets.map(wallet => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    <appkit-wallet-button key={wallet} wallet={wallet} />
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
      key={wallet}
      onClick={() => {
        setPendingWallet(wallet)
        connect(wallet)
      }}
      maxW="fit-content"
      size="md"
      isLoading={isPending && pendingWallet === wallet}
      isDisabled={Boolean(caipAddress) || isWalletButtonDisabled}
      textTransform="capitalize"
    >
      {wallet}
    </Button>
  ))
}
