import { useState } from 'react'

import { ChevronRightIcon } from '@chakra-ui/icons'
import { Badge, Box, Button, Flex, Image, Spinner, Text } from '@chakra-ui/react'

import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import { type UseAppKitWalletsReturn } from '@reown/appkit/react'

interface InjectedWalletItemProps {
  wallet: UseAppKitWalletsReturn['wallets'][number]
  onConnect: (wallet: UseAppKitWalletsReturn['wallets'][number], namespace: ChainNamespace) => void
  isConnecting: boolean
  isDisabled?: boolean
  isSelected?: boolean
}

export function InjectedWalletItem({
  wallet,
  onConnect,
  isConnecting,
  isDisabled,
  isSelected
}: InjectedWalletItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const shouldToggleNamespaceDialog = wallet.connectors.length > 1 && wallet.isInjected
  const isMultiChain = wallet.connectors.length > 1 && wallet.isInjected

  function toggleConnectors() {
    setIsExpanded(v => !v)
  }

  const connectorChains = wallet.connectors?.map(c => ({
    chain: c.chain,
    imageUrl: c.chainImageUrl
  }))

  return (
    <Flex direction="column" gap={2}>
      <Button
        key={wallet.name}
        data-testid={`wallet-button-${wallet.name}`}
        variant="outline"
        height="auto"
        py={3}
        px={4}
        justifyContent="flex-start"
        isDisabled={isDisabled}
        onClick={
          shouldToggleNamespaceDialog
            ? () => toggleConnectors()
            : () => onConnect(wallet, wallet.connectors[0]?.chain as ChainNamespace)
        }
        borderColor={isSelected ? 'blue.500' : undefined}
        borderWidth={isSelected ? '2px' : '1px'}
        bg={isSelected ? 'blue.50' : undefined}
        _hover={{
          bg: isSelected ? 'blue.100' : 'gray.50',
          _dark: { bg: isSelected ? 'blue.900' : 'gray.700' }
        }}
        _dark={{ bg: isSelected ? 'blue.900' : undefined }}
      >
        <Flex align="center" gap={3} width="100%">
          {/* Wallet Icon */}
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

          {/* Wallet Info */}
          <Flex direction="column" align="flex-start" flex={1}>
            <Text fontWeight="medium">{wallet.name}</Text>
          </Flex>

          {wallet.isInjected ? (
            <Flex gap={2} alignItems="center">
              <Flex alignItems="center">
                {connectorChains.map((chain, index) => (
                  <Image
                    key={chain.chain}
                    src={chain.imageUrl}
                    alt={chain.chain}
                    boxSize="20px"
                    borderRadius="full"
                    zIndex={connectorChains.length * 2 - index}
                    marginLeft={index > 0 ? '-5px' : 0}
                    border="1px solid white"
                  />
                ))}
              </Flex>
              <Badge bgColor="gray.100" color="gray.500">
                Installed
              </Badge>
            </Flex>
          ) : null}

          {isConnecting ? <Spinner color="gray.300" /> : <ChevronRightIcon />}
        </Flex>
      </Button>

      {isExpanded && isMultiChain && (
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
              {ConstantsUtil.CHAIN_NAME_MAP[c.chain as ChainNamespace]}
            </Button>
          ))}
        </Flex>
      )}
    </Flex>
  )
}
