import {
  StackDivider,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Box,
  Stack,
  Text
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { SIWESession } from '@web3modal/siwe'

export function SiweData() {
  const [ready, setReady] = useState(false)
  const { data, status } = useSession()
  const session = data as unknown as SIWESession

  useEffect(() => {
    setReady(true)
  }, [])

  return ready ? (
    <Card marginTop={10}>
      <CardHeader>
        <Heading size="md">SIWE Session Details</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase">
              Session Status
            </Heading>
            <Text data-testid="w3m-authentication-status" pt="2" fontSize="sm">
              {status}
            </Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase">
              Session Network
            </Heading>
            <Text pt="2" fontSize="sm">
              {`eip155:${session?.chainId}`}
            </Text>
          </Box>

          <Box>
            <Heading size="xs" textTransform="uppercase">
              Session Network Address
            </Heading>
            <Text isTruncated pt="2" fontSize="sm">
              {session?.address}
            </Text>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  ) : null
}
