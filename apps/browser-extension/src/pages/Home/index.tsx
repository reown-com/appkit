import { PageController } from '../../controllers/PageController'
import { Box } from '../../components/Box'
import { Text } from '../../components/Text'
import { Zorb } from '../../components/Zorb'
import { privateKeyToAccount } from 'viem/accounts'
import { AccountUtil } from '../../utils/AccountUtil'
import { Keypair } from '@solana/web3.js'
import { HelperUtil } from '../../utils/HelperUtil'
import { useSnapshot } from 'valtio'

// EVM
const { address } = privateKeyToAccount(AccountUtil.privateKeyEvm)

// Solana
const keypair = Keypair.fromSecretKey(AccountUtil.privateKeySolana)
const publicKey = keypair.publicKey

export function Home() {
  const { page } = useSnapshot(PageController.state)

  const isEVM = page === 'ethereum'

  const account = isEVM ? address : publicKey.toString()

  return (
    <Box
      height="full"
      width="full"
      display="flex"
      alignItems="center"
      flexDirection="column"
      background="accent100"
      paddingY="32"
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
          <Text as="h1" textAlign="center" fontSize="18" color="accent010">
            {HelperUtil.shortenAddress(account)}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
