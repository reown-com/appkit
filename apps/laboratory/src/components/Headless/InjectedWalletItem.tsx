import { useState } from 'react'

import { Box, Button, Flex, Image, Text } from '@chakra-ui/react'

import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import { type WalletItem2 } from '@reown/appkit-controllers/react'
import '@reown/appkit-ui/wui-icon'

interface Props {
  onConnect: (wallet: WalletItem2, namespace: ChainNamespace) => void
  onSeeAll: () => void
}

const chainImagesMap = {
  eip155:
    'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/ba0ba0cd-17c6-4806-ad93-f9d174f17900/md',
  solana:
    'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/a1b58899-f671-4276-6a5e-56ca5bd59700/md',
  bip122: 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/0b4838db-0161-4ffe-022d-532bf03dba00/md'
}

export function InjectedWalletItem({ wallet, onConnect }: Props) {
  const [toggle, setToggle] = useState(false)

  const isMultiChain = wallet.connectors.length > 1
  const firstConnector = wallet.connectors[0]

  function toggleConnectors() {
    setToggle(v => !v)
  }

  const connectorChains = wallet.connectors?.map(c => c.chain)

  return (
    <Flex direction="column" gap={2}>
      <Button
        key={wallet.name}
        variant="outline"
        height="auto"
        py={3}
        px={4}
        justifyContent="flex-start"
        onClick={
          isMultiChain
            ? () => toggleConnectors()
            : () => onConnect(wallet, firstConnector?.chain as ChainNamespace)
        }
        _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}
      >
        <Flex align="center" gap={3} width="100%">
          {/* Wallet Icon */}
          {wallet.imageUrl ? (
            <Image
              src={wallet.imageUrl}
              alt={wallet.name}
              boxSize="40px"
              borderRadius="md"
              fallback={
                <Box
                  boxSize="40px"
                  bg="gray.200"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="sm" fontWeight="bold">
                    {wallet.name.charAt(0)}
                  </Text>
                </Box>
              }
            />
          ) : (
            <Box
              boxSize="40px"
              bg="gray.200"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="sm" fontWeight="bold">
                {wallet.name.charAt(0)}
              </Text>
            </Box>
          )}

          {/* Wallet Info */}
          <Flex direction="column" align="flex-start" flex={1}>
            <Text fontWeight="medium">{wallet.name}</Text>
          </Flex>

          <Flex alignItems="center">
            {connectorChains.map((chain, index) => (
              <Image
                key={chain}
                src={chainImagesMap[chain as keyof typeof chainImagesMap]}
                alt={chain}
                boxSize="20px"
                borderRadius="full"
                zIndex={connectorChains.length * 2 - index}
                marginLeft={index > 0 ? '-5px' : 0}
                border="1px solid white"
              />
            ))}
          </Flex>

          <wui-icon
            name={isMultiChain && toggle ? 'chevronTop' : 'chevronRight'}
            color="default"
          ></wui-icon>
        </Flex>
      </Button>

      {toggle && isMultiChain && (
        <Flex direction="column" gap={2} marginLeft={8}>
          {wallet.connectors?.map(c => (
            <Button
              key={c.id}
              variant="outline"
              height="auto"
              py={3}
              px={4}
              justifyContent="flex-start"
              onClick={() => onConnect(wallet, c.chain)}
            >
              {ConstantsUtil.CHAIN_NAME_MAP[c.chain]}
            </Button>
          ))}
        </Flex>
      )}
    </Flex>
  )
}
