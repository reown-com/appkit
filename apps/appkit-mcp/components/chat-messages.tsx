import { useRef } from 'react'
import { useEffect } from 'react'

import { UIMessage } from 'ai'

import Markdown from '@/components/markdown'
import { cn } from '@/lib/utils'

export default function ChatMessages({ messages }: { messages: UIMessage[] }) {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={messagesContainerRef}
      className="w-full max-w-2xl flex flex-col gap-4 h-full overflow-y-auto pt-16 pb-32 scroll-fade-out-yt-10 scrollbar-hide"
    >
      {messages.map(message => (
        <div
          key={message.id}
          className={cn('flex w-full', message.role === 'user' ? 'justify-end' : 'justify-start')}
        >
          <div
            className={cn(
              'w-auto text-left text-lg prose space-y-2',
              message.role === 'user' ? 'p-4 bg-[#202020] rounded-2xl max-w-[80%] font-mono' : ''
            )}
          >
            <Markdown content={message.content} />
          </div>
        </div>
      ))}
    </div>
  )
}
