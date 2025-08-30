import { ChainNamespace } from '@reown/appkit-common'

import { touchableStyles } from '../../css/touchableStyles'
import { Box } from '../Box'
import { Text } from '../Text'

const tokens: Record<ChainNamespace, { title: string; symbol: string; src: string }> = {
  eip155: {
    title: 'Ethereum',
    symbol: 'ETH',
    src: '/assets/images/eth.png'
  },
  solana: {
    title: 'Solana',
    symbol: 'SOL',
    src: '/assets/images/sol.png'
  },
  bip122: {
    title: 'Bitcoin',
    symbol: 'BTC',
    src: '/assets/images/btc.png'
  },
  polkadot: {
    title: 'Polkadot',
    symbol: 'DOT',
    src: '/assets/images/dot.png'
  },
  cosmos: {
    title: 'Cosmos',
    symbol: 'ATOM',
    src: '/assets/images/atom.png'
  },
  sui: {
    title: 'Sui',
    symbol: 'SUI',
    src: '/assets/images/sui.png'
  },
  stacks: {
    title: 'Stacks',
    symbol: 'STX',
    src: '/assets/images/stx.png'
  }
}

interface TokenProps {
  token: ChainNamespace
  balance: string
}

export function Token({ token, balance }: TokenProps) {
  return (
    <Box
      width="full"
      display="flex"
      alignItems="center"
      gap="2"
      background="neutrals1000"
      padding="3"
      borderRadius="16"
      transition="transform"
      cursor="pointer"
      userSelect="none"
      className={touchableStyles({ active: 'shrink', hover: 'grow' })}
    >
      <Box as="img" height="36" width="36" borderRadius="round" src={tokens[token].src} />
      <Box display="flex" flexDirection="column">
        <Text textAlign="left" color="white" fontSize="14">
          {tokens[token].title}
        </Text>
        <Text textAlign="left" color="neutrals400" fontSize="12">
          {balance} {tokens[token].symbol}
        </Text>
      </Box>
    </Box>
  )
}
