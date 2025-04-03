'use client'

import { Button, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'
import { Card } from '@chakra-ui/react'

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
                  network: 'eip155:8453',
                  recipient: '0x81D8C68Be5EcDC5f927eF020Da834AA57cc3Bd24',
                  asset: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
                  amount: 20,
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
