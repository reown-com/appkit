'use client'

import React, { type ReactNode } from 'react'

import { ThemeProvider } from 'next-themes'

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}

export default ContextProvider
