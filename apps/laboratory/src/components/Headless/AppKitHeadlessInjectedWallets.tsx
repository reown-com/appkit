import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react'

import { type ChainNamespace } from '@reown/appkit-common'
import { type WalletItem2, useAppKitConnect } from '@reown/appkit-controllers/react'
import '@reown/appkit-ui/wui-icon'

import { InjectedWalletItem } from './InjectedWalletItem'

interface Props {
  onConnect: (wallet: WalletItem2, namespace: ChainNamespace) => void
  onSeeAll: () => void
}

export function AppKitHeadlessInjectedWallets({ onConnect, onSeeAll }: Props) {
  const { wallets } = useAppKitConnect()
  const injectedWallets = wallets.filter(w => w.isInjected)

  return (
    <Flex direction="column" gap={4} paddingTop={8}>
      <Heading size="md">Connect Wallet</Heading>

      {/* Wallet List */}
      {injectedWallets.length === 0 ? (
        <Box p={8} textAlign="center" border="1px dashed" borderColor="gray.300" borderRadius="md">
          <Text color="gray.500">No wallets detected</Text>
          <Text fontSize="sm" color="gray.400" mt={2}>
            Install a wallet extension or check recent connections
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap={2}>
          {injectedWallets.map(wallet => (
            <InjectedWalletItem key={wallet.name} wallet={wallet} onConnect={onConnect} />
          ))}
        </Flex>
      )}

      {/* See All Button */}
      <Button
        variant="outline"
        size="lg"
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
