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
import { wagmiSdkOptions, ethersSdkOptions, solanaSdkOptions } from '../utils/DataUtil'
import { RandomLink } from '../components/RandomLink'

export default function HomePage() {
  return (
    <>
      <Card marginTop={10}>
        <CardHeader>
          <Heading size="md">Testing</Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Testing
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    Configuration with all features enabled and randomly using ethers or wagmi
                  </Text>
                </Box>
                <RandomLink hrefs={['/library/wagmi-all', '/library/ethers-all']}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </RandomLink>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      <Card marginTop={10}>
        <CardHeader>
          <Heading size="md">
            Wagmi <Badge>New arc</Badge>
          </Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            {wagmiSdkOptions.map(option => (
              <Box key={option.link}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Heading size="xs" textTransform="uppercase">
                      {option.title}
                    </Heading>
                    <Text pt="2" fontSize="sm">
                      {option.description}
                    </Text>
                  </Box>
                  <Link href={option.link}>
                    <Button rightIcon={<IoArrowForward />}>Go</Button>
                  </Link>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardBody>
      </Card>

      <Card marginTop={10} marginBottom={10}>
        <CardHeader>
          <Heading size="md">Ethers</Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            {ethersSdkOptions.map(option => (
              <Box key={option.link}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Heading size="xs" textTransform="uppercase">
                      {option.title}
                    </Heading>
                    <Text pt="2" fontSize="sm">
                      {option.description}
                    </Text>
                  </Box>
                  <Link href={option.link}>
                    <Button rightIcon={<IoArrowForward />}>Go</Button>
                  </Link>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardBody>
      </Card>

      <Card marginTop={10} marginBottom={10}>
        <CardHeader>
          <Heading size="md">
            Solana <Badge>New arc</Badge>
          </Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            {solanaSdkOptions.map(option => (
              <Box key={option.link}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Heading size="xs" textTransform="uppercase">
                      {option.title}
                    </Heading>
                    <Text pt="2" fontSize="sm">
                      {option.description}
                    </Text>
                  </Box>
                  <Link href={option.link}>
                    <Button rightIcon={<IoArrowForward />}>Go</Button>
                  </Link>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardBody>
      </Card>

      <Card marginTop={10} marginBottom={10} backgroundColor={'blue.800'}>
        <CardHeader>
          <Heading size="md">
            AppKit <Badge>⛓️ Multichain</Badge> <Badge>✨ New</Badge>
          </Heading>
        </CardHeader>

        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Multiple adapters
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    Configuration with multiple adapters enabled for AppKit
                  </Text>
                </Box>
                <Link href={'/library/appkit-all'}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </Link>
              </Stack>
            </Box>
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
                <Link href={'/library/appkit-wagmi'}>
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
                <Link href={'/library/appkit-solana'}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </Link>
              </Stack>
            </Box>
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
                <Link href={'/library/appkit'}>
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
