import * as React from 'react'

import { cn } from '@/lib/utils'

type ElementProps = {
  children?: React.ReactNode
  className?: string
}

export function H1({ children, ...props }: ElementProps) {
  return (
    <h1
      {...props}
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        props.className
      )}
    >
      {children}
    </h1>
  )
}
export function H2({ children, ...props }: ElementProps) {
  return (
    <h2
      {...props}
      className={cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0',
        props.className
      )}
    >
      {children}
    </h2>
  )
}
export function H3({ children, ...props }: ElementProps) {
  return (
    <h3
      className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', props.className)}
      {...props}
    >
      {children}
    </h3>
  )
}
export function H4({ children, ...props }: ElementProps) {
  return (
    <h4
      className={cn('scroll-m-20 text-xl font-semibold tracking-tight', props.className)}
      {...props}
    >
      {children}
    </h4>
  )
}

export function P({ children, ...props }: ElementProps) {
  return (
    <p {...props} className={cn('leading-7 [&:not(:first-child)]:mt-6', props.className)}>
      {children}
    </p>
  )
}
export function Span({ children, ...props }: ElementProps) {
  return (
    <span className={cn('leading-7 [&:not(:first-child)]:mt-6', props.className)} {...props}>
      {children}
    </span>
  )
}

export function Blockquote({ children, ...props }: ElementProps) {
  return (
    <blockquote className={cn('mt-6 border-l-2 pl-6 italic', props.className)} {...props}>
      {children}
    </blockquote>
  )
}
export function List({ children, ...props }: ElementProps) {
  return (
    <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', props.className)} {...props}>
      {children}
    </ul>
  )
}
export function ListItem({ children, ...props }: ElementProps) {
  return <li {...props}>{children}</li>
}
export function InlineCode({ children, ...props }: ElementProps) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        props.className
      )}
      {...props}
    >
      {children}
    </code>
  )
}
export function Lead({ children, ...props }: ElementProps) {
  return <p className={cn('text-xl text-muted-foreground', props.className)}>{children}</p>
}
