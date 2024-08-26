import {
  Heading,
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackDivider,
  Box,
  Text,
  Button,
  Link,
  Badge
} from '@chakra-ui/react'
import { IoArrowForward } from 'react-icons/io5'

export default function HomePage() {
  return (
    <>
      <Card marginTop={10} marginBottom={10} backgroundColor={'yellow.800'}>
        <CardHeader>
          <Heading size="md">
            AppKit <Badge>⛓️ Multichain</Badge> <Badge>🛠️ Building</Badge>
          </Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Wagmi + Solana
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    Configuration with Wagmi and Solana adapters enabled for AppKit
                  </Text>
                </Box>
                <Link href={'/library/multichain-wagmi-solana'}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </Link>
              </Stack>
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Ethers + Solana
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    Configuration with Ethers and Solana adapters enabled for AppKit
                  </Text>
                </Box>
                <Link href={'/library/multichain-ethers-solana'}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </Link>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>
      <Card marginTop={10} marginBottom={10} backgroundColor={'yellow.800'}>
        <CardHeader>
          <Heading size="md">
            AppKit <Badge>🎸 Solo</Badge> <Badge>🛠️ Building</Badge>
          </Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Wagmi
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    Configuration with only Wagmi adapters enabled for AppKit
                  </Text>
                </Box>
                <Link href={'/library/multichain-wagmi'}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </Link>
              </Stack>
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Solana
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    Configuration with only Solana adapters enabled for AppKit
                  </Text>
                </Box>
                <Link href={'/library/multichain-solana'}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </Link>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>
      <Card marginTop={10} marginBottom={10} backgroundColor={'green.800'}>
        <CardHeader>
          <Heading size="md">
            AppKit <Badge>🎸 Solo</Badge> <Badge>✅ Ready for test</Badge>
          </Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Ethers
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    Configuration with only Ethers adapter enabled for AppKit
                  </Text>
                </Box>
                <Link href={'/library/multichain-ethers'}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </Link>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>
      <Card marginTop={10} marginBottom={10} backgroundColor={'green.800'}>
        <CardHeader>
          <Heading size="md">
            AppKit <Badge>✅ Ready for test</Badge>
          </Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Basic
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    Configuration with no adapters enabled for AppKit
                  </Text>
                </Box>
                <Link href={'/library/multichain-basic'}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </Link>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}
