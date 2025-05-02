export type Exchange = {
  id: string
  imageUrl: string
  name: string
}

export type ExchangeBuyStatus = 'UNKNOWN' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'
