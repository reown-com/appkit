import { cn } from '@/utils/functions'
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  icon?: React.ReactNode
  variant?: 'button' | 'link'
  href?: string
}

export default function Button(props: ButtonProps) {
  const { icon, value, className, variant, ...rest } = props

  if (variant === 'link') {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        className="text-[var(--navy-400)] gap-1 flex items-center hover:text-[var(--navy-300)] transition-colors hover:underline group"
      >
        {value}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 group-hover:text-[var(--navy-300)] transition-colors"
        >
          <path
            fillRule="evenodd"
            d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
            clipRule="evenodd"
          />
          <path
            className="transition-transform group-hover:translate-x-px group-hover:-translate-y-px"
            fillRule="evenodd"
            d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    )
  }

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
