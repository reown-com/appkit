import { Box, Card, CardBody, CardHeader, Heading, Stack, StackDivider } from '@chakra-ui/react'

import { UpaSignMessageTest } from './UpaSignMessageTest'

export function UpaTests() {
  return (
    <Card data-testid="upa-test-interactions" marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Test Interactions</Heading>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Heading size="xs" textTransform="uppercase" pb="2">
              Sign Message
            </Heading>
            <UpaSignMessageTest />
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}
