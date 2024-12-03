import { Box, Flex, Heading } from '@chakra-ui/react'
import { ConstantsUtil } from '../utils/ConstantsUtil'

export function AppKitWalletButtons() {
  const { MetaMask, Trust, Rainbow, Uniswap, Ledger } = ConstantsUtil.WalletButtons

  return (
    <Box>
      <Heading size="xs" textTransform="uppercase" pb="2">
        Wallet Buttons
      </Heading>
      <Flex alignItems="center" gap="3">
        <w3m-wallet-button walletId={MetaMask} />
        <w3m-wallet-button walletId={Trust} />
        <w3m-wallet-button walletId={Rainbow} />
        <w3m-wallet-button walletId={Uniswap} />
        <w3m-wallet-button walletId={Ledger} />
      </Flex>
    </Box>
  )
}
