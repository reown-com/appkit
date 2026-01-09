import { Button, Flex, Heading } from '@chakra-ui/react'

import { type ChainNamespace } from '@reown/appkit-common'
import { type UseAppKitWalletsReturn, useAppKitWallets } from '@reown/appkit/react'

import { InjectedWalletItem } from './InjectedWalletItem'

interface Props {
  onConnect: (wallet: UseAppKitWalletsReturn['wallets'][number], namespace?: ChainNamespace) => void
  onSeeAll: () => void
}

export function AppKitHeadlessInjectedWallets({ onConnect, onSeeAll }: Props) {
  const { wallets, connectingWallet } = useAppKitWallets()

  return (
    <Flex direction="column" gap={4} paddingTop={8}>
      <Heading size="md">Connect Wallet</Heading>

      {/* Wallet List */}
      <Flex direction="column" gap={2}>
        {wallets.map(wallet => (
          <InjectedWalletItem
            key={wallet.name}
            wallet={wallet}
            onConnect={onConnect}
            isConnecting={connectingWallet?.id === wallet.id}
          />
        ))}
      </Flex>

      {/* See All Button */}
      <Button
        variant="outline"
        size="lg"
        data-testid="see-all-button"
        onClick={onSeeAll}
        mt={2}
        borderStyle="dashed"
        _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}
      >
        See All Wallets
      </Button>
    </Flex>
  )
}
