'use client'

import React from 'react'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  StackDivider,
  Text,
  useDisclosure
} from '@chakra-ui/react'

import { useAppKitAccount, useDisconnect } from '@reown/appkit/react'

import { AppkitConnectDrawer } from '../../layout/AppkitConnectDrawer'
import { AccountCard } from '../AccountCard'

export default function DemoContentHeadless() {
  const currentAccount = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const controls = useDisclosure({ id: 'headless' })

  return (
    <>
      <AppkitConnectDrawer controls={controls} />

      <Card marginTop={10} marginBottom={4}>
        <CardHeader>
          <Heading size="md">AppKit Interactions</Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4" flexWrap="wrap">
            <Box>
              <Stack spacing="2" alignItems="left" flexWrap="wrap">
                <Stack pb="2">
                  <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                    Default Button
                  </Text>
                  <Text fontSize="sm">{currentAccount?.address}</Text>
                  {currentAccount?.isConnected ? (
                    <Button width="auto" onClick={() => disconnect()}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={controls.onOpen}>Connect</Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      <AccountCard account={currentAccount} />
    </>
  )
}
