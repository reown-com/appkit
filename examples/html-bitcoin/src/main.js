import { calculateTxGas, createInput, utxoToInput } from '@asigna/core-js'
import * as bitcoin from 'bitcoinjs-lib'
import ecc from '@bitcoinerlab/secp256k1'

// Initialize ECC library for bitcoinjs-lib
bitcoin.initEccLib(ecc)

import { createAppKit } from '@reown/appkit'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { bitcoin as bitcoinMainnet, bitcoinTestnet } from '@reown/appkit/networks'


// Get projectId
export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

// Create adapter
const bitcoinAdapter = new BitcoinAdapter()

// Instantiate AppKit
const modal = createAppKit({
  adapters: [bitcoinAdapter],
  networks: [bitcoinMainnet, bitcoinTestnet],
  projectId,
  themeMode: 'light',

  metadata: {
    name: 'AppKit HTML Example',
    description: 'AppKit HTML Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

// State objects
let accountState = {}
let networkState = {}
let appKitState = {}
let themeState = { themeMode: 'light', themeVariables: {} }
let events = []
let walletInfo = {}
let bip122Provider = null

// Helper function to update theme
const updateTheme = mode => {
  document.documentElement.setAttribute('data-theme', mode)
  document.body.className = mode

  // Update logo based on theme
  const reownLogo = document.getElementById('reown-logo')
  if (reownLogo) {
    reownLogo.src = mode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'
  }
}

// Subscribe to state changes
modal.subscribeAccount(state => {
  accountState = state
  document.getElementById('accountState').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeNetwork(state => {
  networkState = state
  document.getElementById('networkState').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeState(state => {
  appKitState = state
  document.getElementById('appKitState').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeTheme(state => {
  themeState = state
  document.getElementById('themeState').textContent = JSON.stringify(state, null, 2)
  updateTheme(state.themeMode)
})

modal.subscribeEvents(state => {
  events = state
  document.getElementById('events').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeWalletInfo(state => {
  walletInfo = state
  document.getElementById('walletInfo').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeProviders(state => {
  bip122Provider = state['bip122']
})

// Button event listeners
document.getElementById('toggle-theme')?.addEventListener('click', () => {
  const newTheme = themeState.themeMode === 'dark' ? 'light' : 'dark'
  modal.setThemeMode(newTheme)
  themeState = { ...themeState, themeMode: newTheme }
  updateTheme(newTheme)
})

document.getElementById('switch-network')?.addEventListener('click', () => {
  modal.switchNetwork(bitcoin)
})

document.getElementById('open-modal')?.addEventListener('click', () => {
  modal.open()
})

document.getElementById('disconnect')?.addEventListener('click', () => {
  modal.disconnect()
})

document.getElementById('sign-message')?.addEventListener('click', async () => {
  if (!accountState.address) {
    await modal.open()
    return
  }
  signMessage()
})

document.getElementById('send-transfer')?.addEventListener('click', async () => {
  if (!accountState.address) {
    await modal.open()
    return
  }
  sendTransfer()
})

document.getElementById('sign-psbt')?.addEventListener('click', async () => {
  if (!accountState.address) {
    await modal.open()
    return
  }
  signPSBT()
})

async function signMessage() {
  if (bip122Provider && accountState.address) {
    try {
      await bip122Provider.signMessage({
        address: accountState.address,
        message: 'Hello from AppKit'
      })
    } catch (error) {
      console.error('Error signing message:', error)
    }
  }
}

async function sendTransfer() {
  if (bip122Provider && accountState.address) {
    try {
      await bip122Provider.sendTransfer({
        recipient: accountState.address,
        amount: 546
      })
    } catch (error) {
      console.error('Error signing message:', error)
    }
  }
}

async function signPSBT() {
  if (bip122Provider && accountState.address) {
    try {
      const psbt = new bitcoin.Psbt({})
      const utxosResponse = await fetch('https://mempool.space/api/address/' + accountState.address + '/utxo');
      const utxos = await utxosResponse.json();
      
      if (!utxos || utxos.length === 0) {
        console.error('No UTXOs found for address:', accountState.address);
        return;
      }
      const utxo1 =  {
        txId: utxos[0].txid,
        outputIndex: utxos[0].vout,
        satoshis: utxos[0].value,
      }
      const input = utxoToInput(utxo1, bip122Provider.multisigInfo);
      psbt.addInput(input);
      const amountToSend = 546;
      psbt.addOutput({value: amountToSend, address: 'RECEIVE_ADDRESS'});
      const feeRate = 6;
      const gas = calculateTxGas(psbt, bip122Provider.multisigInfo) * feeRate;

      psbt.addOutput({value: utxo1.satoshis - amountToSend - gas, address: accountState.address});

      const signedPsbt = await bip122Provider.signPSBT({
        psbt: psbt.toBase64(),
        signInputs: [{
          address: accountState.address,
          index: 0,
          sighashTypes: [0x01, 0x02]
        }],
        broadcast: true,
      });
    } catch (error) {
      console.error('Error signing psbt:', error)
    }
  }
}

// Set initial theme and UI state
updateTheme(themeState.themeMode)
