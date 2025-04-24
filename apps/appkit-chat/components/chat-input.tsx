import { ChangeEvent, useRef } from 'react'

import { ArrowRightIcon, SquareIcon } from '@radix-ui/react-icons'
import { ChatRequestOptions, CreateMessage, Message } from 'ai'

import { useAppKitAccount } from '@reown/appkit/react'

import { cn } from '@/lib/utils'

export default function ChatInput({
  status,
  input,
  append,
  stop,
  handleInputChange
}: {
  status: string
  input: string
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>
  stop: () => void
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => void
}) {
  const { address } = useAppKitAccount()
  const isStreaming = status === 'streaming' || status === 'submitted'

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!address) {
      alert('Please connect your wallet')
      return
    }

    append({ role: 'user', content: input }, { body: { address } })
    handleInputChange({ target: { value: '' } } as unknown as ChangeEvent<HTMLInputElement>)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return // Allow new line with Shift+Enter
      }
      e.preventDefault() // Prevent default enter behavior
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  return (
    <div
      className={cn(
        'flex items-start w-full bottom-2 max-w-2xl bg-[#363636] p-4 rounded-lg font-mono resize-none focus:outline-none',
        !address ? 'opacity-50' : ''
      )}
    >
      <textarea
        className="flex-1 w-full resize-none focus:outline-none bg-transparent"
        disabled={!address}
        value={input}
        onKeyDown={handleKeyDown}
        placeholder="Say something..."
        onChange={handleInputChange}
      />
      <button
        onClick={e =>
          isStreaming ? stop() : handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
        }
        className="bg-white rounded-full w-10 h-10 text-background flex items-center justify-center"
      >
        {isStreaming ? <SquareIcon className="w-6 h-6" /> : <ArrowRightIcon className="w-6 h-6" />}
      </button>
    </div>
  )
}
