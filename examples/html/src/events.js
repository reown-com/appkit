/* eslint-disable no-console */
import { AccountCtrl, BlockCtrl, ClientCtrl, FeeCtrl } from '@web3modal/core'
import { connectedContainer, disconnectedContainer } from './elements'

connectedContainer.hidden = true

// Subscribe to events once client is initialized
ClientCtrl.subscribe(({ initialized }) => {
  if (initialized) {
    // Listen for account changes
    AccountCtrl.watch(account => {
      if (account.isConnected) {
        disconnectedContainer.hidden = true
        connectedContainer.hidden = false
      } else {
        disconnectedContainer.hidden = false
        connectedContainer.hidden = true
      }
    })

    // Listen for block number
    BlockCtrl.watch(block => console.log(block))

    // Listen for fee data
    FeeCtrl.watch(fee => console.log(fee))
  }
})
