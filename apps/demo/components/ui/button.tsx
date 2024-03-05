import { cn } from '@/utils/functions'
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  icon?: React.ReactNode
}

export default function Button(props: ButtonProps) {
  const { icon, value, className, ...rest } = props

  return (
    <button
      type="button"
      className={cn(
        'group gap-1 whitespace-nowrap cursor-pointer relative inline-flex items-center pl-[18px] pr-[12px] pt-[10px] py-[10px] rounded-xl text-[var(--white)] bg-[var(--blueberry)]',
        className && className
      )}
      {...rest}
    >
      {value}
      {icon && icon}
      <div className="absolute top-0 left-0 h-full w-full bg-black opacity-0 rounded-[inherit] transition-opacity group-hover:opacity-5" />
    </button>
  )
}
