<template>
  <div class="page-container">
    <Header />
    <ActionButton
      :signClient="signClient"
      :session="session"
      :account="account"
      :onSessionChange="handleSessionChange"
      :onAccountChange="handleAccountChange"
      :onNetworkChange="handleNetworkChange"
    />
    <InfoList :account="account" :network="network" :session="session" />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import type { SignClient } from '@walletconnect/sign-client'
import { onMounted, onUnmounted, ref } from 'vue'

import ActionButton from './components/ActionButton.vue'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import InfoList from './components/InfoList.vue'
import { initializeModal, initializeSignClient } from './config'

const signClient = ref<InstanceType<typeof SignClient>>()
const session = ref<any>()
const account = ref<string>()
const network = ref<string>()

onMounted(async () => {
  const client = await initializeSignClient()
  signClient.value = client
  initializeModal()
  const lastKeyIndex = client.session.getAll().length - 1
  const lastSession = client.session.getAll()[lastKeyIndex]

  if (lastSession) {
    session.value = lastSession
    account.value = lastSession.namespaces['eip155']?.accounts?.[0]?.split(':')[2]
    network.value = lastSession.namespaces['eip155']?.chains?.[0]
  }
})

onUnmounted(() => {
  if (signClient.value) {
    const handleSessionUpdate = ({ topic, params }: { topic: string; params: any }) => {
      const { namespaces } = params
      const _session = signClient.value?.session.get(topic)
      const updatedSession = { ..._session, namespaces }
      session.value = updatedSession
    }

    signClient.value?.on('session_update', handleSessionUpdate)

    return () => {
      signClient.value?.off('session_update', handleSessionUpdate)
    }
  }
  return
})

const handleSessionChange = (newSession: any) => {
  session.value = newSession
}

const handleAccountChange = (newAccount: string | undefined) => {
  account.value = newAccount
}

const handleNetworkChange = (newNetwork: string | undefined) => {
  network.value = newNetwork
}
</script>
