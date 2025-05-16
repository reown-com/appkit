import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'transition-[border-radius,background-color] duration-300 ease',
    'font-mono'
  ),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        neutral: 'bg-background-invert text-text-invert',
        'neutral-secondary':
          'hover:bg-fg-secondary active:bg-fg-tertiary border border-border-secondary text-text-primary'
      },
      size: {
        default: 'h-[38px] px-4 py-2 rounded-md hover:rounded-[3rem]',
        sm: 'h-[38px] rounded-md px-3 text-xs rounded-sm hover:rounded-[3rem]',
        lg: 'h-[48px] rounded-md px-8 rounded-lg hover:rounded-[3rem]'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
