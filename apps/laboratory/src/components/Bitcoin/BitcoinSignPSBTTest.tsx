import { Box, Button, Input, InputGroup, InputLeftAddon, useToast } from '@chakra-ui/react'
import type { BitcoinConnector } from '@reown/appkit-adapter-bitcoin'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'
import { useState } from 'react'
import { BitcoinUtil } from '../../utils/BitcoinUtil'

export function BitcoinSignPSBTTest() {
  const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122')
  const { address } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()

  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [recipient, setRecipient] = useState<string>(address || '')
  const [amount, setAmount] = useState<string>('1500')

  async function onSignPSBT() {
    if (!walletProvider || !address || !caipNetwork) {
      toast({
        title: 'No connection detected',
        status: 'error',
        isClosable: true
      })

      return
    }

    if (caipNetwork.chainNamespace !== 'bip122') {
      toast({
        title: 'The selected chain is not bip122',
        status: 'error',
        isClosable: true
      })

      return
    }

    try {
      const utxos = await BitcoinUtil.getUTXOs(address, caipNetwork.caipNetworkId)
      const feeRate = await BitcoinUtil.getFeeRate()

      const params = BitcoinUtil.createSignPSBTParams({
        amount: Number(amount),
        feeRate,
        network: caipNetwork,
        recipientAddress: recipient,
        senderAddress: address,
        utxos
      })

      const signature = await walletProvider.signPSBT(params)
      toast({ title: 'PSBT Signature', description: signature.psbt, status: 'success' })
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Box display="flex" width="100%" gap="2" mb="2">
        <InputGroup>
          <InputLeftAddon>Recipient</InputLeftAddon>
          <Input value={recipient} onChange={e => setRecipient(e.currentTarget.value)} />
        </InputGroup>

        <InputGroup>
          <InputLeftAddon>Amount</InputLeftAddon>
          <Input value={amount} onChange={e => setAmount(e.currentTarget.value)} type="number" />
        </InputGroup>
      </Box>

      <Button data-testid="sign-psbt-button" onClick={onSignPSBT} width="auto" isLoading={loading}>
        Sign PSBT
      </Button>
    </>
  )
}
