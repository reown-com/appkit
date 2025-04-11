import { useMemo, useState } from 'react'

import { Keypair } from '@solana/web3.js'
import Big from 'big.js'
import { privateKeyToAccount } from 'viem/accounts'

import { ChainNamespace } from '@reown/appkit-common'

import { Box } from '../../components/Box'
import Tab from '../../components/ChainTabs'
import { IconButton } from '../../components/IconButton'
import { Text } from '../../components/Text'
import { Token } from '../../components/Token'
import { Zorb } from '../../components/Zorb'
import { BitcoinProvider } from '../../core/BitcoinProvider'
import { useBalance } from '../../hooks/useBalance'
import { AccountUtil } from '../../utils/AccountUtil'
import { HelperUtil } from '../../utils/HelperUtil'

// EVM
const { address } = privateKeyToAccount(AccountUtil.privateKeyEvm)

// Solana
const keypair = Keypair.fromSecretKey(AccountUtil.privateKeySolana)
const publicKey = keypair.publicKey

// Bitcoin
const bitcoinProvider = new BitcoinProvider()

export function Home() {
  const [copied, setCopied] = useState(false)
  const [page, setPage] = useState<ChainNamespace>('eip155')

  const account = getAccount()

  const balance = useBalance(page, account)
  // eslint-disable-next-line new-cap
  const formattedBalance = Big(balance).round(4).toString()

  function getAccount() {
    switch (page) {
      case 'eip155':
        return address
      case 'solana':
        return publicKey.toString()
      case 'bip122':
        return bitcoinProvider.getAddress()
      default:
        return ''
    }
  }

  function copyAddress(value: string) {
    setCopied(true)
    navigator.clipboard.writeText(value)
    setTimeout(() => setCopied(false), 1500)
  }

  function viewAddress() {
    switch (page) {
      case 'eip155':
        window.open(`https://etherscan.io/address/${account}`, '_blank')
        break
      case 'solana':
        window.open(`https://explorer.solana.com/address/${account}`, '_blank')
        break
      case 'bip122':
        window.open(`https://btcscan.org/address/${account}`, '_blank')
        break
    }
  }

  return (
    <Box
      height="full"
      width="full"
      display="flex"
      alignItems="center"
      flexDirection="column"
      background="black"
      color="white"
      paddingTop="12"
      paddingX="5"
    >
      <Box
        width="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap="8"
      >
        <Tab onTabClick={setPage} />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap="4"
        >
          <Zorb />
          <Text as="h1" textAlign="center" fontSize="18" color="white">
            {HelperUtil.shortenAddress(account)}
          </Text>
          <Box display="flex" alignItems="center" gap="4">
            <IconButton
              label={copied ? 'Copied' : 'Copy'}
              onClick={() => {
                copyAddress(account)
              }}
              icon={copied ? 'checkmark' : 'copy'}
            />
            <IconButton
              label="View"
              onClick={() => {
                viewAddress()
              }}
              icon="arrowRightUp"
            />
          </Box>
        </Box>

        <Token token={page} balance={formattedBalance} />
      </Box>
    </Box>
  )
}
