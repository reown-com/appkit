export type Session = {
  status: 'pending' | 'success' | 'error'
  createdAt: string
  txid?: string
}
