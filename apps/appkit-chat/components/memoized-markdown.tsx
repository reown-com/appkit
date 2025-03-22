import { memo, useMemo } from 'react'

import Markdown from 'markdown-to-jsx'
import { marked } from 'marked'

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  return tokens.map(token => token.raw)
}

const MemoizedMarkdownBlock = memo(
  ({ content, options }: { content: string; options?: any }) => {
    return (
      <Markdown
        children={content}
        options={{
          ...options,
          overrides: {
            img: {
              component: ({ src, alt }: { src: string; alt: string }) => (
                <img src={src} alt={alt} className="w-8 h-8 bg-fg-secondary" />
              )
            },
            table: {
              component: ({ children }: { children: React.ReactNode }) => (
                <table className="w-full border-collapse border border-muted">{children}</table>
              )
            },
            th: {
              component: ({ children }: { children: React.ReactNode }) => (
                <th className="p-2 border border-muted">{children}</th>
              )
            },
            td: {
              component: ({ children }: { children: React.ReactNode }) => (
                <td className="p-2 border border-muted">{children}</td>
              )
            },
            a: {
              component: ({ children, href }: { children: React.ReactNode; href: string }) => (
                <a href={href} className="text-blue-500">
                  {children}
                </a>
              )
            }
          }
        }}
      ></Markdown>
    )
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false
    return true
  }
)
MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock'

export const MemoizedMarkdown = memo(
  ({ content, id, options }: { content: string; id: string; options?: any }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content])

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock content={block} options={options} key={`${id}-block_${index}`} />
    ))
  }
)
MemoizedMarkdown.displayName = 'MemoizedMarkdown'
