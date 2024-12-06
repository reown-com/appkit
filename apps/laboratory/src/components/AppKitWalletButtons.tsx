import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react'
import { useAppKitWallet } from '@reown/appkit-wallet-button/react'
import type { Wallet } from '@reown/appkit-wallet-button'
import { useState } from 'react'

interface CustomAppKitWalletButtonProps {
  heading: string
  wallets: Wallet[]
}

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

      <Box display="flex" flexDirection="column" gap="5">
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

        <CustomAppKitWalletButton heading="Hooks (WalletConnect)" wallets={['walletConnect']} />

        <CustomAppKitWalletButton
          heading="Hooks (Wallets)"
          wallets={['walletConnect', 'metamask', 'coinbase', 'rainbow', 'safe', 'jupiter']}
        />
        <CustomAppKitWalletButton
          heading="Hooks (Wallets)"
          wallets={['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook']}
        />
      </Box>
    </Box>
  )
}

function CustomAppKitWalletButton({ heading, wallets }: CustomAppKitWalletButtonProps) {
  const [pendingWallet, setPendingWallet] = useState<Wallet>()

  const { data, isLoading, isSuccess, isError, connect } = useAppKitWallet({
    onError: err => {
      console.log('err', err.message)
    },
    onSuccess: data => {
      console.log('data', data)
    }
  })

  return (
    <Box display="flex" flexDirection="column" gap="1">
      <Heading size="xs" textTransform="uppercase" pb="2">
        {heading}
      </Heading>

      <Box display="flex" alignItems="center" columnGap={3} flexWrap="wrap" gap="4">
        {wallets.map(wallet => (
          <Button
            key={wallet}
            onClick={() => {
              setPendingWallet(wallet)
              connect(wallet)
            }}
            size="sm"
            isLoading={isLoading && pendingWallet === wallet}
            textTransform="capitalize"
          >
            {wallet}
          </Button>
        ))}
      </Box>
    </Box>
  )
}
