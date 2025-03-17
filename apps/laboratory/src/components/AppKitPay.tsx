'use client'

import { Button, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'
import { Card } from '@chakra-ui/react'
import { parseEther } from 'viem'

import { openPay } from '@reown/appkit-pay'

export function AppKitPay() {
  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Pay Interactions</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Button
            onClick={async () => {
              await openPay({
                paymentAsset: {
                  network: 'eip155:84532',
                  recipient: '0x81D8C68Be5EcDC5f927eF020Da834AA57cc3Bd24',
                  asset: 'native',
                  amount: parseEther('0.00001'),
                  metadata: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18
                  }
                }
              })
            }}
          >
            Open Pay
          </Button>
        </Stack>
      </CardBody>
    </Card>
  )
}
