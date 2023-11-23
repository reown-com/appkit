import { Center, Link, VStack } from '@chakra-ui/react'
import NextLink from 'next/link'

export default function HomePage() {
  return (
    <Center h="80vh">
      <VStack gap={4}>
        <Link
          as={NextLink}
          href="/library/wagmi"
          padding={4}
          border={'1px solid #47a1ff'}
          borderRadius="xl"
        >
          V3 with Wagmi
        </Link>
        <Link
          as={NextLink}
          href="/library/ethers"
          padding={4}
          border={'1px solid #26D962'}
          borderRadius="xl"
        >
          V3 with Ethers
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
