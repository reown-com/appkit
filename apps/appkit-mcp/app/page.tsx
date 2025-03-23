'use client'

import React from 'react'

import { useChat } from '@ai-sdk/react'

import { useAppKitAccount } from '@reown/appkit/react'

import ChatHeader from '@/components/chat-header'
import ChatInput from '@/components/chat-input'
import ChatMessages from '@/components/chat-messages'
import DisconnectedSection from '@/components/disconnected-section'
import { cn } from '@/lib/utils'

export default function Page() {
  const { address } = useAppKitAccount()
  const { messages, input, handleInputChange, append, stop, status } = useChat({
    maxSteps: 10
  })

  return (
    <div className="page-container flex items-start flex-row p-4 bg-background gap-4 pt-4 h-full overflow-auto">
      <div className="bg-fg-primary relative h-full p-8 rounded-2xl flex flex-col items-center w-full mx-auto stretch">
        {address ? (
          <React.Fragment>
            <ChatHeader />
            <ChatMessages messages={messages} />
            <ChatInput
              status={status}
              input={input}
              append={append}
              stop={stop}
              handleInputChange={handleInputChange}
            />
          </React.Fragment>
        ) : (
          <DisconnectedSection />
        )}
      </div>
    </div>
  )
}
