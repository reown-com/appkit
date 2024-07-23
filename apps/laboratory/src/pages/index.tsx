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
  Link
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
                    Demo
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    All features enabled and randomly using ethers or wagmi
                  </Text>
                </Box>
                <RandomLink hrefs={['/library/wagmi-all', '/library/ethers-all']}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </RandomLink>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Heading size="xs" textTransform="uppercase">
                    Demo w/ Sample Wallets
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    All features enabled, with sample wallet links, and randomly using ethers or
                    wagmi
                  </Text>
                </Box>
                <RandomLink hrefs={['/library/wagmi-all-internal', '/library/ethers-all-internal']}>
                  <Button rightIcon={<IoArrowForward />}>Go</Button>
                </RandomLink>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>

      <Card marginTop={10}>
        <CardHeader>
          <Heading size="md">Wagmi</Heading>
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
          <Heading size="md">Solana</Heading>
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
    </>
  )
}
