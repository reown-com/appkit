import { touchableStyles } from '../../css/touchableStyles'
import { Box } from '../Box'
import { Text } from '../Text'

const tokens = {
  ethereum: {
    title: 'Ethereum',
    symbol: 'ETH',
    src: '/assets/images/eth.png'
  },
  solana: {
    title: 'Solana',
    symbol: 'SOL',
    src: '/assets/images/sol.png'
  }
}

export type TokenKey = keyof typeof tokens

interface TokenProps {
  token: TokenKey
  balance: string
}

export function Token({ token, balance }: TokenProps) {
  return (
    <Box
      width="full"
      display="flex"
      alignItems="center"
      gap="8"
      background="neutrals1000"
      borderStyle="solid"
      borderWidth="1"
      borderColor="accent020"
      padding="12"
      borderRadius="16"
      transition="transform"
      cursor="pointer"
      userSelect="none"
      className={touchableStyles({ active: 'shrink', hover: 'grow' })}
    >
      <Box as="img" height="36" width="36" borderRadius="round" src={tokens[token].src} />
      <Box display="flex" flexDirection="column">
        <Text textAlign="left" color="accent010" fontSize="14">
          {tokens[token].title}
        </Text>
        <Text textAlign="left" fontSize="12">
          {balance} {tokens[token].symbol}
        </Text>
      </Box>
    </Box>
  )
}
