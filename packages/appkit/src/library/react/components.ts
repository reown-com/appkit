import { createComponent } from '@lit/react'
import React from 'react'
import {
  AppKitButton,
  AppKitNetworkButton,
  AppKitConnectButton,
  AppKitAccountButton
} from '@reown/appkit-scaffold-ui'

// React wrapper for AppKitButton
export const AppKitButtonReact = createComponent({
  tagName: 'appkit-button',
  elementClass: AppKitButton,
  react: React,
  events: {
    onClick: 'click',
    onFocus: 'focus',
    onBlur: 'blur'
  }
})

// React wrapper for AppKitNetworkButton  
export const AppKitNetworkButtonReact = createComponent({
  tagName: 'appkit-network-button',
  elementClass: AppKitNetworkButton,
  react: React,
  events: {
    onClick: 'click',
    onFocus: 'focus',
    onBlur: 'blur'
  }
})

// React wrapper for AppKitConnectButton
export const AppKitConnectButtonReact = createComponent({
  tagName: 'appkit-connect-button',
  elementClass: AppKitConnectButton,
  react: React,
  events: {
    onClick: 'click',
    onFocus: 'focus',
    onBlur: 'blur'
  }
})

// React wrapper for AppKitAccountButton
export const AppKitAccountButtonReact = createComponent({
  tagName: 'appkit-account-button',
  elementClass: AppKitAccountButton,
  react: React,
  events: {
    onClick: 'click',
    onFocus: 'focus',
    onBlur: 'blur'
  }
})