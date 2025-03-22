'use client'

import React, { ChangeEvent } from 'react'

import { useChat } from '@ai-sdk/react'
import { ArrowRightIcon, SquareIcon } from '@radix-ui/react-icons'
import Lottie from 'lottie-react'
import Markdown from 'markdown-to-jsx'
import Image from 'next/image'

import { useAppKitAccount } from '@reown/appkit-controllers/react'
import { useAppKit } from '@reown/appkit/react'

import { lottieAnimationData } from '@/app/constants/lottie'
import { SendParams, SwapParams, useAppKitActions } from '@/hooks/use-appkit-actions'
import { cn } from '@/lib/utils'

function getTruncateString({
  string,
  charsStart,
  charsEnd
}: {
  string: string
  charsStart: number
  charsEnd: number
}) {
  if (string.length <= charsStart + charsEnd) {
    return string
  }

  return `${string.substring(0, Math.floor(charsStart))}...${string.substring(
    string.length - Math.floor(charsEnd)
  )}`
}

export default function Chat() {
  const { open } = useAppKit()
  const { handleAppKitAction } = useAppKitActions()
  const { address } = useAppKitAccount()
  const { messages, input, handleInputChange, append, stop, status } = useChat({
    maxSteps: 10
  })
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
        'page-container flex items-start flex-row p-4 bg-background gap-4 pt-4 h-full overflow-auto'
      )}
    >
      <div className="bg-fg-primary relative h-full p-8 rounded-2xl flex flex-col items-center w-full mx-auto stretch">
        <header
          className={cn(
            'w-full flex  items-center mb-4',
            address ? 'justify-between' : 'justify-center'
          )}
        >
          <div>
            <Image src={'/reown-logo.png'} alt="Reown logo" width={150} height={40} />
          </div>
          {address ? (
            <div>
              <button
                className="w-auto bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  handleAppKitAction({
                    action: 'send',
                    sourceToken: 'OP',
                    toToken: 'USDC',
                    amount: '4.5',
                    chainId: '10'
                  })
                }}
              >
                Swap
              </button>
              <button
                className="w-auto bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  open()
                }}
              >
                {address
                  ? getTruncateString({
                      string: address,
                      charsStart: 6,
                      charsEnd: 5
                    })
                  : 'Connect'}
              </button>
            </div>
          ) : null}
        </header>

        {/* Auth */}
        {!address ? (
          <section className="w-[90%] px-6 fixed z-10 h-screen left-1/2 -translate-x-1/2 top-0 flex flex-col items-center justify-center">
            <div className="z-10 absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 pt-5 pr-5 pl-5 w-96">
              <Lottie animationData={lottieAnimationData} loop={true} />
            </div>

            <div className="marquee-header-titles backdrop-blur-sm bg-fg-primary/50 pt-48 lg:pt-24 relative z-20 flex flex-col gap-2 items-center mb-0 md:mb-12">
              <h4 className="text-5xl lg:text-6xl text-text-primary text-center mb-4">
                Chat Onchain with AppKit
              </h4>
              <p className="text-xl lg:text-3xl max-w-2xl text-text-secondary text-center mb-8">
                Get your transaction history, see balances, swap or send tokens - all onchain,
                powered by AppKit.
              </p>
              <p className="text-xl lg:text-2xl text-text-secondary text-center mb-2">
                Connect your wallet to get started.
              </p>
              <button
                className="w-auto bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  handleAppKitAction({
                    action: 'swap',
                    sourceToken: 'POL',
                    toToken: 'UNI',
                    amount: '1',
                    chainId: '137'
                  })
                }}
              >
                Swap
              </button>
              <button
                className="w-auto bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  open()
                }}
              >
                {address
                  ? getTruncateString({
                      string: address,
                      charsStart: 6,
                      charsEnd: 5
                    })
                  : 'Connect'}
              </button>
            </div>
          </section>
        ) : null}

        {/* Messages */}
        <div className="w-full max-w-2xl flex flex-col gap-4 h-full overflow-y-auto pt-16 pb-32 scroll-fade-out-yt-10 scrollbar-hide">
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                'flex w-full',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'w-auto text-left text-lg prose space-y-2',
                  message.role === 'user'
                    ? 'p-4 bg-[#202020] rounded-2xl max-w-[80%] font-mono'
                    : ''
                )}
              >
                <Markdown
                  children={message.content}
                  options={{
                    overrides: {
                      img: {
                        component: ({ src, alt }: { src: string; alt: string }) => (
                          <img src={src} alt={alt} className="w-8 h-8 bg-fg-secondary" />
                        )
                      },
                      table: {
                        component: ({ children }: { children: React.ReactNode }) => (
                          <table className="w-full border-collapse border border-[#606060]">
                            {children}
                          </table>
                        )
                      },
                      th: {
                        component: ({ children }: { children: React.ReactNode }) => (
                          <th className="p-2 border border-[#606060]">{children}</th>
                        )
                      },
                      td: {
                        component: ({ children }: { children: React.ReactNode }) => (
                          <td className="p-2 border border-[#606060] even:bg-[#232323] odd:bg-[#303030]">
                            {children}
                          </td>
                        )
                      },
                      p: {
                        component: ({ children }: { children: React.ReactNode }) => (
                          <p className="text-foreground py-2">{children}</p>
                        )
                      },
                      strong: {
                        component: ({ children }: { children: React.ReactNode }) => (
                          <strong className="bg-[#3f3f3f] text-[#b9b9b9] rounded-sm px-1">
                            {children}
                          </strong>
                        )
                      },
                      a: {
                        component: ({
                          children,
                          href
                        }: {
                          children: React.ReactNode
                          href: string
                        }) => {
                          if (href.includes('action')) {
                            const url = new URL(href)
                            const params = url.searchParams
                            return (
                              <button
                                className="w-auto bg-blue-500 text-white px-4 py-2 rounded-lg"
                                onClick={() => {
                                  const actionParams = {}
                                  params.forEach((value, key) => {
                                    // @ts-ignore
                                    actionParams[key] = value
                                  })
                                  handleAppKitAction(
                                    actionParams as unknown as SendParams | SwapParams
                                  )
                                }}
                              >
                                {children}
                              </button>
                            )
                          }
                          return (
                            <a href={href} className="text-blue-500">
                              {children}
                            </a>
                          )
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>

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
            {isStreaming ? (
              <SquareIcon className="w-6 h-6" />
            ) : (
              <ArrowRightIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
