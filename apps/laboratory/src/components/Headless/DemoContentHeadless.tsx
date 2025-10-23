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

export default function DemoContentHeadless({}: {}) {
  const { isConnected, address } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const controls = useDisclosure({ id: 'headless' })

  return (
    <>
      <AppkitConnectDrawer controls={controls} />

      <Card marginTop={10}>
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
                  <Text fontSize="sm">{address}</Text>
                  {isConnected ? (
                    <Button onClick={() => disconnect()}>Disconnect</Button>
                  ) : (
                    <Button onClick={controls.onOpen}>Connect</Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}
