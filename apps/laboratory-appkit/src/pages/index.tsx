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

export default function HomePage() {
  return (
    <Card marginTop={10}>
      <CardHeader>
        <Heading size="md">AppKit</Heading>
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
  )
}
