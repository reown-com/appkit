import { PageController } from '../../controllers/PageController'
import { Box } from '../../components/Box'
import { Text } from '../../components/Text'
import { Zorb } from '../../components/Zorb'
import { privateKeyToAccount } from 'viem/accounts'
import { AccountUtil } from '../../utils/AccountUtil'
import { Keypair } from '@solana/web3.js'
import { HelperUtil } from '../../utils/HelperUtil'
import { useMemo, useState } from 'react'
import { IconButton, IconButtonIconKey } from '../../components/IconButton'
import { useSnapshot } from 'valtio'
import { Token } from '../../components/Token'
import { useBalance } from '../../hooks/useBalance'
import Big from 'big.js'

// EVM
const { address } = privateKeyToAccount(AccountUtil.privateKeyEvm)

// Solana
const keypair = Keypair.fromSecretKey(AccountUtil.privateKeySolana)
const publicKey = keypair.publicKey

export function Home() {
  const [copied, setCopied] = useState(false)
  const { page } = useSnapshot(PageController.state)

  const isEVM = page === 'ethereum'

  const account = isEVM ? address : publicKey.toString()

  const balance = useBalance(page ?? 'ethereum', account)
  // eslint-disable-next-line new-cap
  const formattedBalance = Big(balance).round(4).toString()

  const iconOptions = useMemo(
    () => ({
      [copied ? 'checkmark' : 'copy']: {
        text: 'Copy',
        onClick: () => {
          setCopied(true)
          navigator.clipboard.writeText(account)
          setTimeout(() => setCopied(false), 1500)
        }
      },
      switch: {
        text: 'Switch',
        onClick: () => {
          PageController.setPage(isEVM ? 'solana' : 'ethereum')
        }
      },
      arrowRightUp: {
        text: 'View',
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
      background="backgroundPrimary"
      paddingY="36"
      paddingX="8"
    >
      <Box
        width="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap="20"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap="12"
        >
          <Zorb />
          <Text as="h1" textAlign="center" fontSize="18" color="textPrimary">
            {HelperUtil.shortenAddress(account)}
          </Text>
          <Box display="flex" alignItems="center" gap="12">
            {Object.entries(iconOptions).map(([icon, { text, onClick }]) => (
              <IconButton
                key={icon}
                icon={icon as IconButtonIconKey}
                text={text}
                onClick={onClick}
              />
            ))}
          </Box>
        </Box>

        <Token token={isEVM ? 'ethereum' : 'solana'} balance={formattedBalance} />
      </Box>
    </Box>
  )
}