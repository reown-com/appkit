<template>
  <div class="page-container">
    <Header />
    <ActionButton
      :provider="provider"
      :session="session"
      :account="account"
      :onSessionChange="handleSessionChange"
      :onBalanceChange="handleBalanceChange"
      :onAccountChange="handleAccountChange"
      :onNetworkChange="handleNetworkChange"
    />
    <InfoList :account="account" :network="network" :session="session" :balance="balance" />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import type { EthereumProvider } from '@walletconnect/ethereum-provider'
import { onMounted, onUnmounted, ref } from 'vue'

import ActionButton from './components/ActionButton.vue'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import InfoList from './components/InfoList.vue'
import { initializeProvider } from './config'

const provider = ref<InstanceType<typeof EthereumProvider>>()
const session = ref<any>()
const account = ref<string>()
const network = ref<string>()
const balance = ref<string>()

onMounted(async () => {
  const wcProvider = await initializeProvider()
  provider.value = wcProvider as unknown as InstanceType<typeof EthereumProvider>
  if (wcProvider?.session) session.value = wcProvider.session
  if (wcProvider?.accounts?.[0]) account.value = wcProvider.accounts[0]
  if (wcProvider?.chainId) network.value = wcProvider.chainId.toString()

  if (wcProvider) {
    wcProvider.on('chainChanged', (chainId: string) => {
      network.value = chainId
    })

    wcProvider.on('accountsChanged', (accounts: string[]) => {
      account.value = accounts[0]
    })

    wcProvider.on('connect', (newSession: any) => {
      session.value = newSession
    })
  }
})

onUnmounted(() => {
  if (provider.value) {
    provider.value.removeListener('chainChanged', (chainId: string) => {
      network.value = chainId
    })
    provider.value.removeListener('accountsChanged', (accounts: string[]) => {
      account.value = accounts[0]
    })
    provider.value.removeListener('connect', (newSession: any) => {
      session.value = newSession
    })
  }
})

const handleSessionChange = (newSession: any) => {
  session.value = newSession
}

const handleBalanceChange = (newBalance: string | undefined) => {
  balance.value = newBalance
}

const handleAccountChange = (newAccount: string | undefined) => {
  account.value = newAccount
}

const handleNetworkChange = (newNetwork: string | undefined) => {
  network.value = newNetwork
}
</script>
