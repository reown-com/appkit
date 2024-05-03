'use client'

import * as SwitchBase from '@radix-ui/react-switch'

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
}

export default function Switch(props: SwitchProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <span className="font-bold text-lg text-[var(--navy-200)]">{props.label}</span>
      <SwitchBase.Root
        checked={props.checked}
        onCheckedChange={props.onCheckedChange}
        className="w-10 h-6 p-[2px] rounded-full relative border bg-[var(--blueberry-litest)] border-slate-300 data-[state=checked]:bg-[var(--blueberry)] outline-none cursor-pointer"
      >
        <SwitchBase.Thumb className="block h-full aspect-square bg-white rounded-full border border-slate-300 transition-transform duration-100 translate-x-0 will-change-transform data-[state=checked]:translate-x-[calc(100%_-_2px)] shadow" />
      </SwitchBase.Root>
    </div>
  )
}
