import { Box, Flex, Heading } from '@chakra-ui/react'

export function AppKitWalletButtons() {
  return (
    <Box>
      <Heading size="sm" textTransform="uppercase" pb="5">
        Wallet Buttons
      </Heading>

      {/*      <w3m-wallet-button wallet="metamask" />
        <w3m-wallet-button wallet="walletConnect" />
        <w3m-wallet-button wallet="coinbase" />
        <w3m-wallet-button wallet="trust" />
        <w3m-wallet-button wallet="okx" />
        <w3m-wallet-button wallet="bitget" />
        <w3m-wallet-button wallet="binance" />
        <w3m-wallet-button wallet="uniswap" />
        <w3m-wallet-button wallet="safepal" />
        <w3m-wallet-button wallet="rainbow" />
        <w3m-wallet-button wallet="bybit" />
        <w3m-wallet-button wallet="tokenpocket" />
        <w3m-wallet-button wallet="ledger" />
        <w3m-wallet-button wallet="timeless-x" />
        <w3m-wallet-button wallet="safe" />
        <w3m-wallet-button wallet="zerion" />
        <w3m-wallet-button wallet="oneinch" />
        <w3m-wallet-button wallet="crypto-com" />
        <w3m-wallet-button wallet="imtoken" />
        <w3m-wallet-button wallet="kraken" />
        <w3m-wallet-button wallet="ronin" />
        <w3m-wallet-button wallet="robinhood" />
        <w3m-wallet-button wallet="exodus" />
        <w3m-wallet-button wallet="argent" /> */}

      {/*         <w3m-wallet-button wallet="metamask" />
        <w3m-wallet-button wallet="walletConnect" />
        <w3m-wallet-button wallet="coinbase" />
        <w3m-wallet-button wallet="trust" /> */}

      <Box display="flex" flexDirection="column" gap="4">
        <Box display="flex" flexDirection="column" gap="1">
          <Heading size="xs" textTransform="uppercase" pb="2">
            QR Code
          </Heading>

          <w3m-wallet-button wallet="walletConnect" />
        </Box>

        <Box display="flex" flexDirection="column" gap="1">
          <Heading size="xs" textTransform="uppercase" pb="2">
            Wallets
          </Heading>

          <Flex flexWrap="wrap" alignItems="center" gap="3">
            <w3m-wallet-button wallet="metamask" />
            <w3m-wallet-button wallet="coinbase" />
            <w3m-wallet-button wallet="trust" />
            <w3m-wallet-button wallet="okx" />
            <w3m-wallet-button wallet="binance" />
            <w3m-wallet-button wallet="uniswap" />
            <w3m-wallet-button wallet="rainbow" />
            <w3m-wallet-button wallet="ledger" />
            <w3m-wallet-button wallet="safe" />
            <w3m-wallet-button wallet="argent" />
            <w3m-wallet-button wallet="jupiter" />
          </Flex>
        </Box>

        <Box display="flex" flexDirection="column" gap="1">
          <Heading size="xs" textTransform="uppercase" pb="2">
            Socials
          </Heading>

          <Flex flexWrap="wrap" alignItems="center" gap="3">
            <w3m-wallet-button wallet="google" />
            <w3m-wallet-button wallet="x" />
            <w3m-wallet-button wallet="discord" />
            <w3m-wallet-button wallet="farcaster" />
            <w3m-wallet-button wallet="github" />
            <w3m-wallet-button wallet="apple" />
            <w3m-wallet-button wallet="facebook" />
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}
