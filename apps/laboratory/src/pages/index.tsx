import { Center, Heading, Link, VStack } from '@chakra-ui/react'

export default function HomePage() {
  return (
    <Center h="80vh" gap={12}>
      <VStack gap={4}>
        <Heading>Wagmi</Heading>
        <Link href="/library/wagmi" padding={4} border={'1px solid #47a1ff'} borderRadius="xl">
          Default
        </Link>
        <Link href="/library/wagmi-siwe" padding={4} border={'1px solid #47a1ff'} borderRadius="xl">
          SIWE
        </Link>
        <Link
          href="/library/wagmi-email"
          padding={4}
          border={'1px solid #47a1ff'}
          borderRadius="xl"
        >
          Email
        </Link>
      </VStack>
      <VStack gap={4}>
        <Heading>Ethers</Heading>
        <Link href="/library/ethers" padding={4} border={'1px solid #26D962'} borderRadius="xl">
          Default
        </Link>
        <Link
          href="/library/ethers-siwe"
          padding={4}
          border={'1px solid #26D962'}
          borderRadius="xl"
        >
          SIWE
        </Link>
        <Link
          href="/library/ethers-email"
          padding={4}
          border={'1px solid #26D962'}
          borderRadius="xl"
        >
          Email
        </Link>
      </VStack>
    </Center>
  )
}
