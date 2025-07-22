import React from 'react'

import { createComponent } from '@lit/react'

import {
  AppKitAccountButton as AppKitAccountButtonComponent,
  AppKitButton as AppKitButtonComponent,
  AppKitConnectButton as AppKitConnectButtonComponent,
  AppKitNetworkButton as AppKitNetworkButtonComponent
} from '@reown/appkit-scaffold-ui'

export const AppKitButton = createComponent({
  tagName: 'appkit-button',
  elementClass: AppKitButtonComponent,
  react: React
})

export const AppKitNetworkButton = createComponent({
  tagName: 'appkit-network-button',
  elementClass: AppKitNetworkButtonComponent,
  react: React
})

export const AppKitConnectButton = createComponent({
  tagName: 'appkit-connect-button',
  elementClass: AppKitConnectButtonComponent,
  react: React
})

export const AppKitAccountButton = createComponent({
  tagName: 'appkit-account-button',
  elementClass: AppKitAccountButtonComponent,
  react: React
})
