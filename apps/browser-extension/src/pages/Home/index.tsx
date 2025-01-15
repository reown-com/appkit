import { useMemo, useState } from 'react'

import { Keypair } from '@solana/web3.js'
import Big from 'big.js'
import { privateKeyToAccount } from 'viem/accounts'

import { Box } from '../../components/Box'
import { IconButton, IconButtonKey } from '../../components/IconButton'
import { Text } from '../../components/Text'
import { Token } from '../../components/Token'
import { Zorb } from '../../components/Zorb'
import { useBalance } from '../../hooks/useBalance'
import { AccountUtil } from '../../utils/AccountUtil'
import { HelperUtil } from '../../utils/HelperUtil'

// EVM
const { address } = privateKeyToAccount(AccountUtil.privateKeyEvm)

// Solana
const keypair = Keypair.fromSecretKey(AccountUtil.privateKeySolana)
const publicKey = keypair.publicKey

export function Home() {
  const [copied, setCopied] = useState(false)
  const [page, setPage] = useState<'ethereum' | 'solana'>('ethereum')

  const isEVM = page === 'ethereum'

  const account = isEVM ? address : publicKey.toString()

  const balance = useBalance(page ?? 'ethereum', account)
  // eslint-disable-next-line new-cap
  const formattedBalance = Big(balance).round(4).toString()

  const iconOptions = useMemo(
    () => ({
      [copied ? 'checkmark' : 'copy']: {
        label: 'Copy',
        onClick: () => {
          setCopied(true)
          navigator.clipboard.writeText(account)
          setTimeout(() => setCopied(false), 1500)
        }
      },
      switch: {
        label: 'Switch',
        onClick: () => {
          setPage(isEVM ? 'solana' : 'ethereum')
        }
      },
      arrowRightUp: {
        label: 'View',
        onClick: () => {
          window.open(
            isEVM
              ? `https://etherscan.io/address/${account}`
              : `https://explorer.solana.com/address/${account}`,
            '_blank'
          )
        }
      }
    }),
    [isEVM, copied]
  )

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
            {Object.entries(iconOptions).map(([icon, { label, onClick }]) => (
              <IconButton key={icon} label={label} onClick={onClick} icon={icon as IconButtonKey} />
            ))}
          </Box>
        </Box>

        <Token token={isEVM ? 'ethereum' : 'solana'} balance={formattedBalance} />
      </Box>
    </Box>
  )
}
