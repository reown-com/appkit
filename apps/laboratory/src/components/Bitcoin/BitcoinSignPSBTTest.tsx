import { useState } from 'react'

import { Box, Button, Checkbox, Flex, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react'

import type { BitcoinConnector } from '@reown/appkit-adapter-bitcoin'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { BitcoinUtil } from '@/src/utils/BitcoinUtil'

export function BitcoinSignPSBTTest() {
  const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122')
  const { address } = useAppKitAccount({ namespace: 'bip122' })
  const { caipNetwork } = useAppKitNetwork()
  const toast = useChakraToast()

  const [loading, setLoading] = useState(false)
  const [recipient, setRecipient] = useState<string>(address || '')
  const [amount, setAmount] = useState<string>('1500')
  const [broadcast, setBroadcast] = useState(false)

  async function onSignPSBT() {
    if (!walletProvider || !address || !caipNetwork) {
      toast({
        title: 'Error',
        description: 'No connection detected',
        type: 'error'
      })

      return
    }

    if (caipNetwork.chainNamespace !== 'bip122') {
      toast({
        title: 'Error',
        description: 'The selected chain is not bip122',
        type: 'error'
      })

      return
    }

    try {
      setLoading(true)
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

      params.broadcast = broadcast

      const signature = await walletProvider.signPSBT(params)
      toast({ title: 'PSBT Signature', description: signature.psbt, type: 'success' })
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Flex flexDirection="column" gap="2" mb="2">
        <Box display="flex" width="100%" gap="2">
          <InputGroup>
            <InputLeftAddon>Recipient</InputLeftAddon>
            <Input value={recipient} onChange={e => setRecipient(e.currentTarget.value)} />
          </InputGroup>

          <InputGroup>
            <InputLeftAddon>Amount</InputLeftAddon>
            <Input value={amount} onChange={e => setAmount(e.currentTarget.value)} type="number" />
          </InputGroup>
        </Box>

        <Checkbox
          isChecked={broadcast}
          onChange={e => setBroadcast(e.currentTarget.checked)}
          py="2"
        >
          Broadcast
        </Checkbox>
      </Flex>

      <Button data-testid="sign-psbt-button" onClick={onSignPSBT} width="auto" isLoading={loading}>
        Sign PSBT
      </Button>
    </>
  )
}
