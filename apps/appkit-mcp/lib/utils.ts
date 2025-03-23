import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTruncateString({
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
