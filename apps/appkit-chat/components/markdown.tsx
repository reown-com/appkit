import MarkdownJSX from 'markdown-to-jsx'

import { SendParams, SwapParams } from '@/hooks/use-appkit-actions'
import { useAppKitActions } from '@/hooks/use-appkit-actions'

export default function Markdown({ content }: { content: string }) {
  const { handleAppKitAction } = useAppKitActions()

  return (
    <MarkdownJSX
      children={content}
      options={{
        overrides: {
          img: {
            component: ({ src, alt }: { src: string; alt: string }) => (
              <img src={src} alt={alt} className="w-8 h-8 bg-fg-secondary" />
            )
          },
          table: {
            component: ({ children }: { children: React.ReactNode }) => (
              <table className="w-full border-collapse border border-[#606060]">{children}</table>
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
              <strong className="bg-[#3f3f3f] text-[#b9b9b9] rounded-sm px-1">{children}</strong>
            )
          },
          a: {
            component: ({ children, href }: { children: React.ReactNode; href: string }) => {
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
                      handleAppKitAction(actionParams as unknown as SendParams | SwapParams)
                    }}
                  >
                    {children}
                  </button>
                )
              }
              return (
                <a href={href} className="text-primary">
                  {children}
                </a>
              )
            }
          }
        }
      }}
    />
  )
}
