'use client'

import { projectId } from '@/config'
import React, { type ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}

export default ContextProvider
