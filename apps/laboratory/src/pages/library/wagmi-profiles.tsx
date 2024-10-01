import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { SiweData } from '../../components/Siwe/SiweData'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from '@reown/appkit/networks'
import {
  deleteProfile,
  getProfile,
  siweProfilesConfig,
  unlinkAccountFromProfile,
  updateMainAccount
} from '../../utils/ProfilesUtil'
import { ProfileStore } from '../../utils/ProfileStoreUtil'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Text,
  useToast
} from '@chakra-ui/react'
import { useProxy } from 'valtio/utils'
import { IoRefresh } from 'react-icons/io5'

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: ConstantsUtil.EvmNetworks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  siweConfig: siweProfilesConfig(wagmiAdapter.wagmiConfig),
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function WagmiProfiles() {
  const { profile } = useProxy(ProfileStore.state)
  const toast = useToast()

  async function fetchProfile() {
    const profileRes = await getProfile()
    ProfileStore.setProfile(profileRes?.accounts)
  }

  async function handleUnlinkAccount(accountUuid: string) {
    const { actionStatus, newMainAccountUuid } = await unlinkAccountFromProfile(accountUuid)
    if (actionStatus === 'unlinked') {
      const updatedProfile = profile
        ?.filter(({ uuid }) => uuid !== accountUuid)
        .map(account =>
          account.uuid === newMainAccountUuid ? { ...account, is_main_account: true } : account
        )
      ProfileStore.setProfile(updatedProfile)
    } else if (actionStatus === 'deleted') {
      ProfileStore.setProfile(null)
      toast({
        title: 'Profile deleted',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top'
      })
    } else {
      toast({
        title: 'Failed to unlink account',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      })
    }
  }

  async function handleUpdateMainAccount(accountUuid: string) {
    const { success } = await updateMainAccount(accountUuid)
    if (success) {
      const updatedProfile = profile?.map(({ uuid, ...rest }) => ({
        ...rest,
        uuid,
        is_main_account: uuid === accountUuid
      }))
      ProfileStore.setProfile(updatedProfile)
    }
  }

  async function handleDeleteProfile() {
    const { success } = await deleteProfile()
    if (success) {
      ProfileStore.setProfile(null)
    }
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <WagmiModalInfo />
        <SiweData />

        <Card>
          <CardHeader as={Flex} justifyContent="space-between">
            <Heading size="md">Profile</Heading>
            <HStack>
              <Button leftIcon={<IoRefresh />} onClick={fetchProfile}>
                Get Profile
              </Button>
              <Button colorScheme="red" onClick={() => handleDeleteProfile()}>
                Delete profile
              </Button>
            </HStack>
          </CardHeader>
          <CardBody as={Flex} flexDir="column" gap={4}>
            {profile?.map(({ account, is_main_account, uuid, created_at }) => {
              const [, chainId, address] = account.split(':')

              return (
                <Flex
                  flexDir="column"
                  key={account}
                  justifyContent="flex-start"
                  border="solid 2px white"
                  rounded="md"
                  padding="5px"
                >
                  <Text>
                    <strong>Chain ID:</strong> {chainId}
                  </Text>
                  <Text>
                    <strong>Address:</strong> {address}
                  </Text>
                  <Text>
                    <strong>Main account:</strong> {is_main_account.toString()}
                  </Text>
                  <Text>
                    <strong>Created At:</strong> {created_at}
                  </Text>
                  <Flex flexDir="row" gap={4}>
                    <Button colorScheme="orange" onClick={() => handleUnlinkAccount(uuid)}>
                      Unlink
                    </Button>
                    <Button onClick={() => handleUpdateMainAccount(uuid)}>Set as main</Button>
                  </Flex>
                </Flex>
              )
            })}
          </CardBody>
        </Card>

        <WagmiTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
