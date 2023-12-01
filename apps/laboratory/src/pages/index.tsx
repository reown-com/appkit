import { Center, Heading, Link, VStack } from '@chakra-ui/react'

export default function HomePage() {
  return (
    <Center h="80vh" gap={12}>
      <VStack gap={4}>
        <Heading>Wagmi</Heading>
        <Link href="/library/wagmi" padding={4} border={'1px solid #47a1ff'} borderRadius="xl">
          V3 with Wagmi
        </Link>
        <Link href="/library/wagmi-siwe" padding={4} border={'1px solid #47a1ff'} borderRadius="xl">
          V3 SIWE & Wagmi
        </Link>
      </VStack>
      <VStack gap={4}>
        <Heading>Ethers</Heading>
        <Link href="/library/ethers" padding={4} border={'1px solid #26D962'} borderRadius="xl">
          V3 with Ethers
        </Link>
        <Link
          href="/library/ethers-siwe"
          padding={4}
          border={'1px solid #26D962'}
          borderRadius="xl"
        >
          V3 SIWE & Ethers
        </Link>
        <Link
          as={NextLink}
          href="/library/web3js"
          padding={4}
          border={'1px solid #D70040'}
          borderRadius="xl"
        >
          V3 with Web3js
        </Link>
      </VStack>
    </Center>
  )
}
