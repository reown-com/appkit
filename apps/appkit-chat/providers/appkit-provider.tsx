'use client'

import React, { type ReactNode } from 'react'

import { createAppKit } from '@reown/appkit/react'

import { appKitConfigs } from '@/lib/config'

export const modal = createAppKit(appKitConfigs)

type AppKitProviderProps = {
  children: ReactNode
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  return <>{children}</>
}
