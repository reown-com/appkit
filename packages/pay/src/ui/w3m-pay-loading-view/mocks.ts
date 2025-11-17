export const STEPS = [
  {
    id: 'received',
    title: 'Receiving funds',
    icon: 'dollar'
  },
  {
    id: 'processing',
    title: 'Swapping asset',
    icon: 'recycleHorizontal'
  },
  {
    id: 'sending',
    title: 'Sending asset to the recipient address',
    icon: 'send'
  }
]

export type Step = (typeof STEPS)[number]
