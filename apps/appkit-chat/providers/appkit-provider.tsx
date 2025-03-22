'use client'

import React, { type ReactNode } from 'react'

import { createAppKit } from '@reown/appkit/react'

import { appKitConfigs } from '@/lib/config'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const modal = createAppKit(appKitConfigs)

type AppKitProviderProps = {
  children: ReactNode
  cookies: string | null
}

export function AppKitProvider({ children, cookies }: AppKitProviderProps) {
  return <>{children}</>
}
